import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import ChildNavBar from "../components/ChildNavBar";
import type { Mission } from "../types";
import { getMissionProgress, getNextMissionFile, getNextMissionQuiz } from "../utils/missionProgress";
import "../assets/dashboard.css";

export default function ChildDashboard() {
  const navigate = useNavigate();
  const [missions, setMissions] = useState<Mission[]>([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/missions")
      .then((r) => r.json())
      .then((data) => setMissions(data))
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="dashboard-page child-dashboard">
      <ChildNavBar />

      <main className="dashboard-container">
        <div className="dashboard-grid">
          <section className="dashboard-main">
            <div className="hero-banner child-hero">
              <div>
                <h1>Hi, ready for a mission?</h1>
                <p>Pick one task, focus for a short time, and earn your reward.</p>
              </div>
              <div className="hero-badges">
                <span>Focus</span>
                <span>Read</span>
                <span>Short sessions</span>
              </div>
            </div>
            <div className="missions-block">
              <div className="title-row">
                <h2 className="missions-heading">Your Missions</h2>
              </div>

              <div className="mission-list">
                {missions.length === 0 && <p className="subtext">No missions yet. Ask a parent to assign one.</p>}
                {missions.map((mission) => {
                  const progress = getMissionProgress(mission);
                  const nextFile = getNextMissionFile(mission);
                  const nextQuiz = getNextMissionQuiz(mission);

                  return (
                    <article className="card mission-card" key={mission.id}>
                      <div className="mission-header-row">
                        <div className="mission-icon">{mission.icon || "M"}</div>
                        <div className="mission-content">
                          <div className="mission-top">
                            <h3>{mission.title}</h3>
                            <div className="mission-time-toggle">
                              <span>{mission.time_minutes ? `${mission.time_minutes} min` : "-"}</span>
                            </div>
                          </div>
                          <div className="mission-progress-row">
                            <div className="progress-track slim">
                              <div
                                className="progress-fill colored"
                                style={{ width: `${progress.percentage}%`, backgroundColor: mission.color || "#8FB8A8" }}
                              />
                            </div>
                            <strong>{progress.percentage}%</strong>
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <button
                          className="start-btn attention"
                          onClick={() =>
                            nextFile
                              ? navigate("/child/reader", { state: { mission, file: nextFile } })
                              : navigate(nextQuiz ? "/child/reader" : "/child/focus", { state: { mission } })
                          }
                        >
                          <Play className="icon-xs" />
                          <span>Start</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <aside className="dashboard-side">
            <div className="card motivation-card">
              <div className="emoji">OK</div>
              <h3>Ready to Learn</h3>
              <p>Pick a mission and start a short focused session.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
