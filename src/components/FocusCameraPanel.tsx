import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, HeartHandshake } from "lucide-react";
import { useFocusDetection } from "../hooks/useFocusDetection";
import { loadFocusPreferences } from "../utils/preferences";

type FocusCameraPanelProps = {
  onDistractionChange?: (isDistracted: boolean) => void;
};

export default function FocusCameraPanel({
  onDistractionChange,
}: FocusCameraPanelProps) {
  const {
    isSupported,
    permission,
    error,
    isRunning,
    reminder,
    videoRef,
    start,
    stop,
  } = useFocusDetection();
  const [helperEnabled, setHelperEnabled] = useState(
    () => loadFocusPreferences().focusHelperEnabled,
  );
  const [helperRequested, setHelperRequested] = useState(false);
  const requestTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  const clearRequestTimeout = () => {
    if (requestTimeoutRef.current) {
      window.clearTimeout(requestTimeoutRef.current);
      requestTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    const syncPreferences = () => {
      const nextEnabled = loadFocusPreferences().focusHelperEnabled;
      setHelperEnabled(nextEnabled);
      if (!nextEnabled) {
        setHelperRequested(false);
        stop();
        onDistractionChange?.(false);
      }
    };

    window.addEventListener("focuskid_preferences_updated", syncPreferences);
    return () =>
      window.removeEventListener("focuskid_preferences_updated", syncPreferences);
  }, [onDistractionChange, stop]);

  useEffect(() => {
    if (onDistractionChange) {
      onDistractionChange(helperEnabled && !!reminder);
    }
  }, [helperEnabled, reminder, onDistractionChange]);

  useEffect(() => {
    if (isRunning || error || permission === "denied") {
      clearRequestTimeout();
    }
  }, [error, isRunning, permission]);

  useEffect(() => () => clearRequestTimeout(), []);

  const startHelper = () => {
    setHelperRequested(true);
    clearRequestTimeout();
    requestTimeoutRef.current = window.setTimeout(() => {
      setHelperRequested(false);
    }, 8000);
    start().catch(() => setHelperRequested(false));
  };

  const stopHelper = () => {
    clearRequestTimeout();
    setHelperRequested(false);
    stop();
    onDistractionChange?.(false);
  };

  if (!helperEnabled) {
    return (
      <div className="timer-card focus-card calm-focus-card" aria-label="Focus helper disabled">
        <div className="focus-head">
          <h3>Focus helper is off</h3>
          <CameraOff className="icon-sm" />
        </div>
        <div className="timer-empty">
          You can turn it on in Settings whenever camera support feels helpful.
        </div>
      </div>
    );
  }

  return (
    <div className="timer-card focus-card calm-focus-card" aria-label="Optional focus helper camera">
      <div className="focus-head">
        <h3>Focus helper</h3>
        {isRunning ? (
          <button type="button" className="focus-btn stop" onClick={stopHelper}>
            Stop
          </button>
        ) : null}
      </div>

      {!isSupported ? (
        <div className="timer-empty">
          Your browser does not support camera access.
        </div>
      ) : !helperRequested && !isRunning ? (
        <div className="calm-camera-consent">
          <HeartHandshake className="calm-camera-icon" />
          <h4>Want a gentle focus helper?</h4>
          <p>
            Camera stays local and only helps pause the timer when attention
            drifts. If the browser does not show a permission prompt, try
            reloading the page or checking camera permissions.
          </p>
          <button type="button" className="focus-btn" onClick={startHelper}>
            <Camera className="icon-xs" /> Start helper
          </button>
        </div>
      ) : (
        <>
          <div
            className="focus-preview"
            data-running={isRunning ? "true" : "false"}
          >
            <video ref={videoRef} className="focus-video" playsInline muted />
            {!isRunning && (
              <div className="focus-overlay">
                Getting the helper ready... If this stays here, allow camera
                permission or try again.
              </div>
            )}
          </div>

          {permission === "denied" && (
            <div className="focus-hint">
              Camera permission is off. You can allow it in browser settings or
              continue without the helper.
              <button type="button" className="focus-btn" onClick={stopHelper}>
                Try later
              </button>
            </div>
          )}

          {error && (
            <div className="focus-hint">
              {error}
              <button type="button" className="focus-btn" onClick={stopHelper}>
                Try again later
              </button>
            </div>
          )}

          {reminder && <div className="focus-reminder">{reminder}</div>}
        </>
      )}
    </div>
  );
}
