import { useEffect, useMemo, useState } from "react";
import { Check, Clock, Target, Trophy } from "lucide-react";
import RankIcon from "./RankIcon";
import type { Mission, User } from "../types";
import { getMissionProgress } from "../utils/missionProgress";
import {
  fetchCurrentUser,
  getRewardProfile,
  getStoredUser,
} from "../utils/rewards";
import "../assets/progress.css";

type ProgressViewProps = {
  audience: "parent" | "child";
};

function getTrackedMinutes(mission: Mission) {
  const fileMinutes = (mission.files || []).reduce(
    (sum, file) => sum + Number(file.time_minutes || 0),
    0,
  );
  if (fileMinutes > 0) return fileMinutes;
  return Number(mission.time_minutes || 0);
}

export default function ProgressView({ audience }: ProgressViewProps) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const showRank = audience === "child";
  const storedUser = localStorage.getItem("focuskid_user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const user_id = parsedUser.id;

  useEffect(() => {
    fetch(`http://localhost:4000/api/missions?user_id=${user_id}`)
      .then((r) => r.json())
      .then((data) => setMissions(data))
      .catch((e) => console.error(e));

    if (showRank) {
      fetchCurrentUser()
        .then((latestUser) => setUser(latestUser))
        .catch((e) => console.error(e));
    }
  }, [showRank]);

  const missionStats = useMemo(
    () =>
      missions.reduce(
        (totals, mission) => {
          const progress = getMissionProgress(mission);
          return {
            totalMissions: totals.totalMissions + 1,
            completedMissions:
              totals.completedMissions +
              (progress.total > 0 && progress.completed >= progress.total
                ? 1
                : 0),
            completedItems: totals.completedItems + progress.completed,
            totalItems: totals.totalItems + progress.total,
            plannedMinutes: totals.plannedMinutes + getTrackedMinutes(mission),
          };
        },
        {
          totalMissions: 0,
          completedMissions: 0,
          completedItems: 0,
          totalItems: 0,
          plannedMinutes: 0,
        },
      ),
    [missions],
  );

  const rewardProfile = getRewardProfile(user?.xp || 0);
  const completionRate =
    missionStats.totalItems === 0
      ? 0
      : Math.round(
          (missionStats.completedItems / missionStats.totalItems) * 100,
        );
  const remainingItems = Math.max(
    0,
    missionStats.totalItems - missionStats.completedItems,
  );
  const openMissions = Math.max(
    0,
    missionStats.totalMissions - missionStats.completedMissions,
  );

  return (
    <div className="progress-page">
      <main className="progress-container">
        <header className="progress-header">
          <h1>{showRank ? "Your Progress" : "Child Progress"}</h1>
          <p>
            {showRank
              ? "Track your learning journey and achievements"
              : "Track assigned missions from saved data"}
          </p>
        </header>

        <section className="metric-grid">
          <article className="metric-card">
            <div className="metric-icon blue">
              <Target className="icon" />
            </div>
            <h2>{missionStats.totalMissions}</h2>
            <p>Total Missions</p>
            <small>
              <Target className="icon-xs" /> {openMissions} open
            </small>
          </article>

          <article className="metric-card">
            <div className="metric-icon green">
              <Check className="icon" />
            </div>
            <h2>{missionStats.completedItems}</h2>
            <p>Tasks Completed</p>
            <small>
              <Check className="icon-xs" /> {completionRate}% complete
            </small>
          </article>

          {showRank ? (
            <article className="metric-card">
              <div
                className="metric-icon orange"
                style={{ backgroundColor: rewardProfile.rank.color }}
              >
                <RankIcon rank={rewardProfile.rank} className="icon" />
              </div>
              <h2>{rewardProfile.rank.name}</h2>
              <p>Current Rank</p>
              <small>
                <Trophy className="icon-xs" /> {rewardProfile.xp} XP
              </small>
            </article>
          ) : (
            <article className="metric-card">
              <div className="metric-icon orange">
                <Clock className="icon" />
              </div>
              <h2>{missionStats.plannedMinutes}</h2>
              <p>Planned Minutes</p>
              <small>
                <Clock className="icon-xs" /> From assigned files
              </small>
            </article>
          )}
        </section>

        {showRank && (
          <section className="progress-chart">
            <header className="section-header">
              <h2>Rank Progress</h2>
              <span>
                {rewardProfile.nextRank
                  ? `${rewardProfile.xpToNextRank} XP to ${rewardProfile.nextRank.name}`
                  : "Top rank reached"}
              </span>
            </header>
            <div className="progress-track">
              <div
                className="bar-fill blue"
                style={{
                  width: `${rewardProfile.rankProgress}%`,
                  backgroundColor: rewardProfile.rank.color,
                }}
              />
            </div>
          </section>
        )}

        <section className="progress-chart">
          <header className="section-header">
            <h2>Mission Completion</h2>
            <span>
              {missionStats.completedItems}/{missionStats.totalItems} tasks
            </span>
          </header>
          <div className="progress-track">
            <div
              className="bar-fill green"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </section>

        <section className="progress-grid">
          <div className="panel">
            <h2>Mission Status</h2>
            <div className="panel-list">
              <div className="panel-row">
                <span>Assigned</span>
                <strong>{missionStats.totalMissions}</strong>
              </div>
              <div className="panel-row">
                <span>Done</span>
                <strong>{missionStats.completedMissions}</strong>
              </div>
              <div className="panel-row">
                <span>Open</span>
                <strong>{openMissions}</strong>
              </div>
            </div>
          </div>

          <div className="panel">
            <h2>Learning Items</h2>
            <div className="panel-list">
              <div className="panel-row">
                <span>Completed</span>
                <strong>{missionStats.completedItems}</strong>
              </div>
              <div className="panel-row">
                <span>Remaining</span>
                <strong>{remainingItems}</strong>
              </div>
              <div className="panel-row">
                <span>Planned Minutes</span>
                <strong>{missionStats.plannedMinutes}</strong>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
