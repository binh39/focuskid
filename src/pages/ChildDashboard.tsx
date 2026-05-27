import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronDown, Play, Star, Target, Trophy } from "lucide-react";
import ChildNavBar from "../components/ChildNavBar";
import RankIcon from "../components/RankIcon";
import type { Mission, User } from "../types";
import {
  getMissionProgress,
  getMissionStartItem,
  getMissionTimeLabel,
} from "../utils/missionProgress";
import {
  fetchCurrentUser,
  getRewardProfile,
  getStoredUser,
} from "../utils/rewards";
import "../assets/dashboard.css";

export default function ChildDashboard() {
  const navigate = useNavigate();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [expandStats, setExpandStats] = useState(false);
  const storedUser = localStorage.getItem("focuskid_user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const user_id = parsedUser.id;

  useEffect(() => {
    fetch(`http://localhost:4000/api/missions?user_id=${user_id}`)
      .then((r) => r.json())
      .then((data) => setMissions(data))
      .catch((e) => console.error(e));

    fetchCurrentUser()
      .then((latestUser) => setUser(latestUser))
      .catch((e) => console.error(e));
  }, []);

  const recentMissions = missions.slice(0, 3);
  const rewardProfile = getRewardProfile(user?.xp || 0);
  const missionStats = missions.reduce(
    (totals, mission) => {
      const progress = getMissionProgress(mission);
      return {
        totalMissions: totals.totalMissions + 1,
        completedMissions:
          totals.completedMissions +
          (progress.total > 0 && progress.completed >= progress.total ? 1 : 0),
        completedItems: totals.completedItems + progress.completed,
        totalItems: totals.totalItems + progress.total,
      };
    },
    {
      totalMissions: 0,
      completedMissions: 0,
      completedItems: 0,
      totalItems: 0,
    },
  );

  const startMission = (mission: Mission) => {
    const startItem = getMissionStartItem(mission);

    if (startItem.type === "file") {
      navigate("/child/reader", { state: { mission, file: startItem.file } });
      return;
    }

    if (startItem.type === "quiz") {
      navigate("/child/reader", { state: { mission, quiz: startItem.quiz } });
      return;
    }

    navigate("/child/focus", { state: { mission } });
  };

  return (
    <div className="dashboard-page child-dashboard">
      <ChildNavBar />

      <main className="dashboard-container">
        <div className="dashboard-grid">
          <section className="dashboard-main">
            <div className="hero-banner child-hero">
              <div>
                <h1>Hi, ready for a mission?</h1>
                <p>
                  Pick one task, focus for a short time, and earn your reward.
                </p>
              </div>
              <div className="hero-badges">
                <span
                  className="rank-badge"
                  style={{ color: rewardProfile.rank.color }}
                >
                  <RankIcon
                    rank={rewardProfile.rank}
                    className="rank-badge-icon"
                  />
                  {rewardProfile.rank.name}
                </span>
                <span>{rewardProfile.xp} XP</span>
              </div>
            </div>
            <div className="card level-progress-card">
              <div className="title-row">
                <h2>Reward Progress</h2>
                <span className="xp">{rewardProfile.xp} XP</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${rewardProfile.rankProgress}%`,
                    backgroundColor: rewardProfile.rank.color,
                  }}
                />
              </div>
              <p className="subtext">
                {rewardProfile.nextRank
                  ? `${rewardProfile.xpToNextRank} XP to ${rewardProfile.nextRank.name}`
                  : "Top rank reached"}
              </p>
            </div>
            <div className="missions-block">
              <div className="title-row">
                <h2 className="missions-heading">Your Missions</h2>
                {missions.length > 3 && (
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => navigate("/child/missions")}
                  >
                    View all
                  </button>
                )}
              </div>

              <div className="mission-list">
                {missions.length === 0 && (
                  <p className="subtext">
                    No missions yet. Ask a parent to assign one.
                  </p>
                )}
                {recentMissions.map((mission) => {
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
                      <div style={{ marginTop: 12 }}>
                        <button
                          className="start-btn attention"
                          onClick={() => startMission(mission)}
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
            <div className="card stats-card">
              <div className="stats-header">
                <h3>Your Stats</h3>
                <button
                  type="button"
                  className="stats-toggle"
                  onClick={() => setExpandStats(!expandStats)}
                >
                  <ChevronDown
                    className={`icon-sm stats-chevron ${expandStats ? "rotated" : ""}`}
                  />
                </button>
              </div>

              <div className="stat-item">
                <div className="stat-icon blue">
                  <Star className="stat-svg" />
                </div>
                <div>
                  <div className="stat-value">{rewardProfile.xp}</div>
                  <div className="stat-label">XP Earned</div>
                </div>
              </div>

              {expandStats && (
                <>
                  <div className="stat-item">
                    <div className="stat-icon green">
                      <Target className="stat-svg" />
                    </div>
                    <div>
                      <div className="stat-value">
                        {missionStats.totalMissions}
                      </div>
                      <div className="stat-label">Missions Assigned</div>
                    </div>
                  </div>

                  <div className="stat-item">
                    <div className="stat-icon orange">
                      <Check className="stat-svg" />
                    </div>
                    <div>
                      <div className="stat-value">
                        {missionStats.completedItems}/{missionStats.totalItems}
                      </div>
                      <div className="stat-label">Tasks Completed</div>
                    </div>
                  </div>

                  <div className="stat-item">
                    <div className="stat-icon sky">
                      <Trophy className="stat-svg" />
                    </div>
                    <div>
                      <div className="stat-value">
                        {missionStats.completedMissions}
                      </div>
                      <div className="stat-label">Missions Done</div>
                    </div>
                  </div>
                </>
              )}
            </div>

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
