import { useFocusDetection } from "../hooks/useFocusDetection";

export default function FocusCameraPanel() {
  const {
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
  } = useFocusDetection();

  const statusClass = status === "Focused" ? "focused" : "distracted";

  return (
    <div className="timer-card focus-card" aria-label="Focus monitoring camera">
      <div className="focus-head">
        <h3>Focus Camera</h3>
        <button
          type="button"
          className={isRunning ? "timer-btn focus-btn stop" : "timer-btn focus-btn"}
          onClick={isRunning ? stop : start}
          disabled={!isSupported}
        >
          {isRunning ? "Stop" : "Start"}
        </button>
      </div>

      {!isSupported ? (
        <div className="timer-empty">Your browser does not support camera access.</div>
      ) : (
        <>
          <div className="focus-preview" data-running={isRunning ? "true" : "false"}>
            <video ref={videoRef} className="focus-video" playsInline muted />
            {!isRunning && <div className="focus-overlay">Press Start to enable the camera.</div>}
          </div>

          <div className="focus-metrics">
            <div className="focus-metric">
              <span className="focus-label">Status</span>
              <span className={`focus-pill ${statusClass}`} title={status}>{status}</span>
            </div>
            <div className="focus-metric">
              <span className="focus-label">Focus score</span>
              <span className="focus-score">{score}</span>
            </div>
          </div>

          {permission === "denied" && (
            <div className="focus-hint">
              Camera permission is off. Please allow access in your browser settings, then press Start.
            </div>
          )}

          {error && <div className="focus-hint">{error}</div>}

          {reminder && <div className="focus-reminder">{reminder}</div>}

        </>
      )}
    </div>
  );
}
