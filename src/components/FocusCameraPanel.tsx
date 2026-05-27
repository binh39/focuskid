import { useEffect, useRef } from "react";
import { useFocusDetection } from "../hooks/useFocusDetection";

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

  // TỰ ĐỘNG BẬT CAMERA KHI VÀO TRANG
  const hasStarted = useRef(false);
  useEffect(() => {
    if (isSupported && !hasStarted.current) {
      hasStarted.current = true;
      start();
    }
  }, [start, isSupported]);

  // Báo trạng thái mất tập trung ra component cha
  useEffect(() => {
    if (onDistractionChange) {
      onDistractionChange(!!reminder);
    }
  }, [reminder, onDistractionChange]);

  return (
    <div className="timer-card focus-card" aria-label="Focus monitoring camera">
      <div className="focus-head">
        <h3>Focus Camera</h3>
      </div>

      {!isSupported ? (
        <div className="timer-empty">
          Your browser does not support camera access.
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
                Đang khởi động camera theo dõi...
              </div>
            )}
          </div>

          {permission === "denied" && (
            <div className="focus-hint">
              Camera permission is off. Please allow access in your browser
              settings to enable focus monitoring.
            </div>
          )}

          {error && <div className="focus-hint">{error}</div>}

          {reminder && <div className="focus-reminder">{reminder}</div>}
        </>
      )}
    </div>
  );
}
