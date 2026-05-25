import { useEffect, useState } from "react";
import ParentNavBar from "../components/ParentNavBar";
import AssignMission from "../components/AssignMission";
import type { Mission } from "../types";
import { getMissionProgress, getMissionTimeLabel } from "../utils/missionProgress";
import "../assets/dashboard.css";

export default function ParentDashboard() {
  const [showAssign, setShowAssign] = useState(false);
  const [missions, setMissions] = useState<Mission[]>([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/missions")
      .then((r) => r.json())
      .then((data) => setMissions(data))
      .catch((e) => console.error(e));
  }, []);

  const handleCreateMission = (mission: Mission) => {
    setMissions((prev) => [mission, ...prev]);
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
                <p>Create missions, attach learning files, and guide your child with short steps.</p>
              </div>
              <button type="button" className="hero-btn" onClick={() => setShowAssign(true)}>
                Assign a New Mission
              </button>
            </div>

            <div className="missions-block">
              <div className="title-row">
                <h2 className="missions-heading">Assign Missions</h2>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <button type="button" onClick={() => setShowAssign(true)} className="link-btn">
                    Assign Mission
                  </button>
                </div>
              </div>

              <div className="mission-list">
                {missions.length === 0 && <p className="subtext">No missions assigned yet.</p>}
                {missions.map((mission) => {
                  const progress = getMissionProgress(mission);

                  return (
                    <article className="card mission-card" key={mission.id}>
                      <div className="mission-header-row">
                        <div className="mission-icon">{mission.icon || "M"}</div>
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
                                style={{ width: `${progress.percentage}%`, backgroundColor: mission.color || "#8FB8A8" }}
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
            <div className="motivation-card">
              <div className="emoji">OK</div>
              <h3>Keep Going!</h3>
              <p>Assign missions for your child and track progress.</p>
            </div>
          </aside>
        </div>
      </main>

      {showAssign && <AssignMission onClose={() => setShowAssign(false)} onCreate={handleCreateMission} />}
    </div>
  );
}
