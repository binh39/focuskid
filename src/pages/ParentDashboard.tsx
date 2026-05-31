import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ParentNavBar from "../components/ParentNavBar";
import AssignMission from "../components/AssignMission";
import type { Mission } from "../types";
import {
  getMissionProgress,
  getMissionTimeLabel,
} from "../utils/missionProgress";
import { fetchFocusInsights, type FocusInsights } from "../utils/focusAnalytics";
import { getStoredUser } from "../utils/rewards";
import "../assets/dashboard.css";

const formatInsightDate = (date: string) => {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [showAssign, setShowAssign] = useState(false);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [focusInsights, setFocusInsights] = useState<FocusInsights | null>(null);
  const [user] = useState(() => getStoredUser());

  const loadMissions = useCallback(() => {
    if (!user?.id) return;
    fetch(`http://localhost:4000/api/missions?user_id=${user.id}`)
      .then((r) => r.json())
      .then((data) => setMissions(data))
      .catch((e) => console.error(e));
  }, [user]);

  const refreshFocusInsights = useCallback(() => {
    if (!user?.id) return;
    fetchFocusInsights(user.id)
      .then((data) => setFocusInsights(data))
      .catch((e) => console.error(e));
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    if (user.role !== "parent") {
      navigate("/child/dashboard");
      return;
    }

    loadMissions();
    refreshFocusInsights();
  }, [loadMissions, navigate, refreshFocusInsights, user]);

  useEffect(() => {
    const handleUpdates = () => {
      loadMissions();
      refreshFocusInsights();
    };
    window.addEventListener("storage", handleUpdates);
    window.addEventListener("focuskid_missions_updated", handleUpdates);
    return () => {
      window.removeEventListener("storage", handleUpdates);
      window.removeEventListener("focuskid_missions_updated", handleUpdates);
    };
  }, [loadMissions, refreshFocusInsights]);

  const handleCreateMission = () => {
    loadMissions();
  };

  return (
    <div className="dashboard-page parent-dashboard">
      <ParentNavBar />

      <main className="dashboard-container">
        <div className="dashboard-grid">
          <section className="dashboard-main">
            <div className="hero-banner parent-hero">
              <div>
                <h1>Parent Control Center</h1>
                <p>
                  Create missions, attach learning files, and guide your child
                  with short steps.
                </p>
              </div>
              <button
                type="button"
                className="hero-btn"
                onClick={() => setShowAssign(true)}
              >
                Assign a New Mission
              </button>
            </div>

            <div className="missions-block">
              <div className="title-row">
                <h2 className="missions-heading">Assign Missions</h2>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => setShowAssign(true)}
                    className="link-btn"
                  >
                    Assign Mission
                  </button>
                </div>
              </div>

              <div className="mission-list">
                {missions.length === 0 && (
                  <p className="subtext">No missions assigned yet.</p>
                )}
                {missions.map((mission) => {
                  const progress = getMissionProgress(mission);

                  return (
                    <article className="card mission-card" key={mission.id}>
                      <div className="mission-header-row">
                        <div className="mission-icon">
                          {mission.icon || "M"}
                        </div>
                        <div className="mission-content">
                          <div className="mission-top">
                            <h3>{mission.title}</h3>
                            <div className="mission-time-toggle">
                              <span>{getMissionTimeLabel(mission)}</span>
                            </div>
                          </div>
                          <div className="mission-progress-row">
                            <div className="progress-track slim">
                              <div
                                className="progress-fill colored"
                                style={{
                                  width: `${progress.percentage}%`,
                                  backgroundColor: mission.color || "#8FB8A8",
                                }}
                              />
                            </div>
                            <strong>{progress.percentage}%</strong>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <aside className="dashboard-side">
            <div className="card stats-card focus-insights-recent">
              <div className="stats-header">
                <h3>Focus insights</h3>
              </div>
              <div>
                <p className="stat-value">{focusInsights?.distraction_events ?? 0}</p>
                <p className="stat-label">calm support pauses</p>
              </div>
              <div className="focus-insights-breakdown">
                <h4>Recent sessions</h4>
                {focusInsights?.recent_sessions?.length ? (
                  focusInsights.recent_sessions.map((session) => (
                    <div className="focus-session-row" key={session.id}>
                      <span>{session.completed ? "Completed focus" : "Focus practice"}</span>
                      <small>
                        {session.started_at
                          ? new Date(session.started_at).toLocaleString()
                          : "Recently"}
                      </small>
                    </div>
                  ))
                ) : (
                  <p className="subtext">No focus sessions recorded yet.</p>
                )}
              </div>
              <div className="focus-insights-breakdown">
                <h4>Soft pauses by day</h4>
                {focusInsights?.daily_pauses?.length ? (
                  focusInsights.daily_pauses.map((day) => (
                    <div className="focus-session-row" key={day.date}>
                      <span>{formatInsightDate(day.date)}</span>
                      <small>{day.count} calm support pause{day.count === 1 ? "" : "s"}</small>
                    </div>
                  ))
                ) : (
                  <p className="subtext">No soft pauses recorded yet.</p>
                )}
              </div>
              <div className="focus-insights-breakdown">
                <h4>Recent support moments</h4>
                {focusInsights?.recent_events?.length ? (
                  focusInsights.recent_events.map((event) => {
                    const createdAt =
                      "created_at" in event && typeof event.created_at === "string"
                        ? event.created_at
                        : "";

                    return (
                      <div className="focus-session-row" key={event.id}>
                        <span>{event.reason === "attention_drift" ? "Gentle focus cue" : event.reason}</span>
                        <small>{createdAt ? new Date(createdAt).toLocaleString() : "Just now"}</small>
                      </div>
                    );
                  })
                ) : (
                  <p className="subtext">No support moments yet.</p>
                )}
              </div>
            </div>

            <div className="motivation-card">
              <div className="emoji">OK</div>
              <h3>Keep Going!</h3>
              <p>Assign missions for your child and track progress.</p>
            </div>
          </aside>
        </div>
      </main>

      {showAssign && (
        <AssignMission
          onClose={() => setShowAssign(false)}
          onCreate={handleCreateMission}
        />
      )}
    </div>
  );
}
