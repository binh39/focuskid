import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type FocusStatus = "Focused" | "Looking away" | "Face not detected" | "Eyes closed";

type PermissionState = "unknown" | "granted" | "denied";

export interface FocusDetectionOptions {
  fps: number;
  distractionSeconds: number;
  stabilityMs: number;
  yawThresholdRad: number;
  pitchThresholdRad: number;
  eyeClosedThreshold: number;
  wasmBaseUrl: string;
  modelAssetUrl: string;
}

const defaultOptions: FocusDetectionOptions = {
  fps: 12,
  distractionSeconds: 10,
  stabilityMs: 800,
  yawThresholdRad: 0.42, // ~24 degrees
  pitchThresholdRad: 0.42, // ~24 degrees
  eyeClosedThreshold: 0.6,
  wasmBaseUrl: "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm",
  modelAssetUrl:
    "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
};

type InternalCondition = "focused" | "looking_away" | "no_face" | "eyes_closed";

type FaceLandmarkerResult = {
  faceLandmarks?: unknown[];
  facialTransformationMatrixes?: Array<{ data?: ArrayLike<number> }>;
  faceBlendshapes?: Array<{
    categories?: Array<{
      categoryName?: string;
      displayName?: string;
      score: number;
    }>;
  }>;
};

type FaceLandmarkerInstance = {
  detectForVideo: (
    video: HTMLVideoElement,
    timestampMs: number,
  ) => FaceLandmarkerResult;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getRotationFrom4x4(matrix: ArrayLike<number>) {
  // MediaPipe returns a 4x4 matrix (row-major) with rotation + translation.
  // We extract the top-left 3x3 rotation part.
  const r00 = matrix[0];
  const r10 = matrix[4];
  const r20 = matrix[8];
  const r21 = matrix[9];
  const r22 = matrix[10];

  // Convert rotation matrix to Euler angles (approx). Assumes R = Rz * Ry * Rx.
  const pitch = Math.asin(-clamp(r20, -1, 1));
  const yaw = Math.atan2(r10, r00);
  const roll = Math.atan2(r21, r22);

  return { yaw, pitch, roll };
}

function pickBlendshapeScore(
  categories: Array<{ categoryName?: string; displayName?: string; score: number }> | undefined,
  name: string,
) {
  if (!categories) return 0;
  const lower = name.toLowerCase();
  const match = categories.find((cat) =>
    (cat.categoryName || cat.displayName || "").toLowerCase() === lower,
  );
  if (match) return match.score;

  // some builds use e.g. "eyeBlinkLeft" / "eyeBlinkRight" exactly; keep a fallback contains check
  const contains = categories.find((cat) =>
    (cat.categoryName || cat.displayName || "").toLowerCase().includes(lower),
  );
  return contains ? contains.score : 0;
}

function scoreFromSignals(args: {
  hasFace: boolean;
  yawRad: number;
  pitchRad: number;
  blinkAvg: number;
  yawThresholdRad: number;
  pitchThresholdRad: number;
}) {
  const { hasFace, yawRad, pitchRad, blinkAvg, yawThresholdRad, pitchThresholdRad } = args;
  if (!hasFace) return 0;

  const yawPenalty = clamp(Math.abs(yawRad) / yawThresholdRad, 0, 1) * 55;
  const pitchPenalty = clamp(Math.abs(pitchRad) / pitchThresholdRad, 0, 1) * 20;

  // blinkAvg: 0..1 (rough). Penalize when blink is high for long.
  const blinkPenalty = clamp((blinkAvg - 0.2) / 0.5, 0, 1) * 60;

  const score = 100 - yawPenalty - pitchPenalty - blinkPenalty;
  return Math.round(clamp(score, 0, 100));
}

export function useFocusDetection(partialOptions?: Partial<FocusDetectionOptions>) {
  const options = useMemo(() => ({ ...defaultOptions, ...(partialOptions || {}) }), [partialOptions]);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastProcessMsRef = useRef<number>(0);

  const faceLandmarkerRef = useRef<FaceLandmarkerInstance | null>(null);
  const visionResolverRef = useRef<Awaited<
    ReturnType<typeof import("@mediapipe/tasks-vision").FilesetResolver.forVisionTasks>
  > | null>(null);

  const [permission, setPermission] = useState<PermissionState>("unknown");
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const [status, setStatus] = useState<FocusStatus>("Face not detected");
  const [score, setScore] = useState(0);
  const [reminder, setReminder] = useState<string | null>(null);

  const stableConditionRef = useRef<InternalCondition>("no_face");
  const candidateConditionRef = useRef<InternalCondition>("no_face");
  const candidateSinceRef = useRef<number>(0);
  const distractedSinceRef = useRef<number | null>(null);

  const yawEmaRef = useRef(0);
  const pitchEmaRef = useRef(0);
  const blinkEmaRef = useRef(0);

  const isSupported = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = null;
    }

    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch {
        // ignore
      }
    }

    setIsRunning(false);
    lastProcessMsRef.current = 0;
  }, []);

  const start = useCallback(async () => {
    // Make start idempotent (stop previous stream/loop if any).
    stop();

    if (!isSupported) {
      setError("Your browser does not support camera access.");
      return;
    }

    setError(null);
    setReminder(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setPermission("granted");

      const video = videoRef.current;
      if (!video) {
        setError("Camera preview is not ready.");
        return;
      }

      video.srcObject = stream;
      await video.play();

      // Lazy-load MediaPipe only when starting.
      const vision = await import("@mediapipe/tasks-vision");
      const { FaceLandmarker, FilesetResolver } = vision;

      if (!visionResolverRef.current) {
        visionResolverRef.current = await FilesetResolver.forVisionTasks(options.wasmBaseUrl);
      }

      if (!faceLandmarkerRef.current) {
        faceLandmarkerRef.current = (await FaceLandmarker.createFromOptions(
          visionResolverRef.current,
          {
            baseOptions: {
              modelAssetPath: options.modelAssetUrl,
            },
            runningMode: "VIDEO",
            numFaces: 1,
            outputFaceBlendshapes: true,
            outputFacialTransformationMatrixes: true,
          },
        )) as FaceLandmarkerInstance;
      }

      // reset smoothing
      yawEmaRef.current = 0;
      pitchEmaRef.current = 0;
      blinkEmaRef.current = 0;
      lastProcessMsRef.current = 0;
      candidateConditionRef.current = "no_face";
      stableConditionRef.current = "no_face";
      candidateSinceRef.current = performance.now();
      distractedSinceRef.current = null;

      setIsRunning(true);

      const frameIntervalMs = 1000 / clamp(options.fps, 5, 30);

      const tick = () => {
        rafRef.current = requestAnimationFrame(tick);
        const now = performance.now();
        if (!videoRef.current || videoRef.current.readyState < 2) return;
        if (now - lastProcessMsRef.current < frameIntervalMs) return;
        lastProcessMsRef.current = now;

        try {
          const landmarker = faceLandmarkerRef.current;
          if (!landmarker) return;

          const result = landmarker.detectForVideo(videoRef.current, now);
          const hasFace = Boolean(result?.faceLandmarks?.length);

          let yaw = yawEmaRef.current;
          let pitch = pitchEmaRef.current;
          let blinkAvg = blinkEmaRef.current;

          if (hasFace) {
            const mat = result.facialTransformationMatrixes?.[0]?.data as ArrayLike<number> | undefined;
            if (mat && mat.length >= 16) {
              const rot = getRotationFrom4x4(mat);
              const alpha = 0.3;
              yaw = yaw + alpha * (rot.yaw - yaw);
              pitch = pitch + alpha * (rot.pitch - pitch);
            }

            const categories = result.faceBlendshapes?.[0]?.categories as
              | Array<{ categoryName?: string; displayName?: string; score: number }>
              | undefined;

            const left = pickBlendshapeScore(categories, "eyeBlinkLeft");
            const right = pickBlendshapeScore(categories, "eyeBlinkRight");
            const rawBlink = (left + right) / 2;
            blinkAvg = blinkAvg + 0.35 * (rawBlink - blinkAvg);
          } else {
            // decay signals when face missing
            yaw *= 0.9;
            pitch *= 0.9;
            blinkAvg *= 0.9;
          }

          yawEmaRef.current = yaw;
          pitchEmaRef.current = pitch;
          blinkEmaRef.current = blinkAvg;

          const eyesClosedNow = hasFace && blinkAvg >= options.eyeClosedThreshold;
          const lookingAwayNow =
            hasFace &&
            (Math.abs(yaw) >= options.yawThresholdRad || Math.abs(pitch) >= options.pitchThresholdRad);

          let candidate: InternalCondition = "focused";
          if (!hasFace) candidate = "no_face";
          else if (eyesClosedNow) candidate = "eyes_closed";
          else if (lookingAwayNow) candidate = "looking_away";

          // Stability smoothing: require the same candidate for options.stabilityMs
          if (candidate !== candidateConditionRef.current) {
            candidateConditionRef.current = candidate;
            candidateSinceRef.current = now;
          }

          if (now - candidateSinceRef.current >= options.stabilityMs) {
            stableConditionRef.current = candidateConditionRef.current;
          }

          const stable = stableConditionRef.current;
          const nextScore = scoreFromSignals({
            hasFace,
            yawRad: yaw,
            pitchRad: pitch,
            blinkAvg,
            yawThresholdRad: options.yawThresholdRad,
            pitchThresholdRad: options.pitchThresholdRad,
          });

          let nextStatus: FocusStatus = "Focused";
          if (stable === "no_face") nextStatus = "Face not detected";
          if (stable === "looking_away") nextStatus = "Looking away";
          if (stable === "eyes_closed") nextStatus = "Eyes closed";

          if (stable === "focused") {
            distractedSinceRef.current = null;
            setReminder(null);
          } else {
            if (distractedSinceRef.current == null) distractedSinceRef.current = now;
            const distractedMs = now - distractedSinceRef.current;
            if (distractedMs >= options.distractionSeconds * 1000) {
              const msg =
                stable === "no_face"
                  ? "I can’t see you. Please sit in front of the camera."
                  : stable === "eyes_closed"
                    ? "Let’s keep eyes open and continue learning."
                    : "Let’s look back at the lesson.";
              setReminder(msg);
            } else {
              setReminder(null);
            }
          }

          setStatus(nextStatus);
          setScore(nextScore);
        } catch (e) {
          console.error(e);
          setError("Focus detection failed to run.");
        }
      };

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    } catch (e) {
      const err = e as Error & { name?: string };
      if (err?.name === "NotAllowedError") {
        setPermission("denied");
        setError("Camera permission was denied. Please allow access to enable focus monitoring.");
      } else if (err?.name === "NotFoundError") {
        setError("No camera device was found.");
      } else {
        setError("Unable to start the camera.");
      }
      setIsRunning(false);
    }
  }, [isSupported, options, stop]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return {
    isSupported,
    permission,
    error,
    isRunning,
    status,
    score,
    reminder,
    videoRef,
    start,
    stop,
  };
}
