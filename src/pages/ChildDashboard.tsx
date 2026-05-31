import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Compass, Leaf, Play, Sparkles, Star, Target } from "lucide-react";
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
import { loadFocusPreferences } from "../utils/preferences";
import { loadCachedMissions, saveCachedMissions } from "../utils/missionCache";
import "../assets/dashboard.css";

export default function ChildDashboard() {
  const navigate = useNavigate();
  const [missions, setMissions] = useState<Mission[]>(() => loadCachedMissions(getStoredUser()?.id));
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const preferences = loadFocusPreferences();

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    if (user.role !== "child") {
      navigate("/parent/dashboard");
      return;
    }

    const syncMissions = () => {
      const latestUser = getStoredUser();
      if (!latestUser?.id || latestUser.role !== "child") return;
      fetch(`http://localhost:4000/api/missions?user_id=${latestUser.id}`)
        .then((r) => r.json())
        .then((data: Mission[]) => {
          saveCachedMissions(latestUser.id, data);
          setMissions(data);
        })
        .catch((e) => console.error(e));
    };

    const handleMissionUpdates = () => {
      const latestUser = getStoredUser();
      if (!latestUser?.id || latestUser.role !== "child") return;
      syncMissions();
    };

    syncMissions();

    fetchCurrentUser()
      .then((latestUser) => setUser(latestUser))
      .catch((e) => console.error(e));

    window.addEventListener("storage", handleMissionUpdates);
    window.addEventListener("focuskid_missions_updated", handleMissionUpdates);
    return () => {
      window.removeEventListener("storage", handleMissionUpdates);
      window.removeEventListener("focuskid_missions_updated", handleMissionUpdates);
    };
  }, [navigate, user]);

  const rewardProfile = getRewardProfile(user?.xp || 0);
  const activeMission =
    missions.find((mission) => getMissionProgress(mission).percentage < 100) ||
    missions[0] ||
    null;
  const activeProgress = activeMission ? getMissionProgress(activeMission) : null;
  const completedMissions = missions.filter(
    (mission) => getMissionProgress(mission).percentage === 100,
  ).length;
  const nextStepLabel = activeMission
    ? getMissionStartItem(activeMission).type === "quiz"
      ? "Answer a short quiz"
      : getMissionStartItem(activeMission).type === "file"
        ? "Read one calm file"
        : "Start a focus timer"
    : "Wait for a parent mission";

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
    <div className="dashboard-page child-dashboard calm-child-dashboard">
      <ChildNavBar />

      <main className="dashboard-container calm-child-container">
        <section className="calm-hero-card" aria-label="Today focus mission">
          <div className="calm-hero-copy">
            <p className="calm-eyebrow">Today's small adventure</p>
            <h1>Hi {user?.name || "there"}, let's do one gentle step.</h1>
            <p>
              Focus for {preferences.focusLength} minutes, then take a short
              reset. One step is enough to make progress.
            </p>
          </div>
          <div className="calm-rank-orb" style={{ borderColor: rewardProfile.rank.color }}>
            <RankIcon rank={rewardProfile.rank} className="calm-rank-icon" />
            <strong>{rewardProfile.rank.name}</strong>
            <span>{rewardProfile.xp} XP</span>
          </div>
        </section>

        <div className="calm-dashboard-grid">
          <section className="calm-main-mission">
            {activeMission ? (
              <article className="calm-mission-card">
                <div className="calm-mission-topline">
                  <span className="calm-pill"><Compass className="icon-xs" /> Next step</span>
                  <span>{getMissionTimeLabel(activeMission)}</span>
                </div>
                <h2>{activeMission.title}</h2>
                <p>{nextStepLabel}. Keep it slow, steady, and kind.</p>

                <div
                  className="calm-progress-track"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={activeProgress?.percentage || 0}
                  aria-label="Mission progress"
                >
                  <div
                    className="calm-progress-fill"
                    style={{ width: `${activeProgress?.percentage || 0}%` }}
                  />
                </div>
                <div className="calm-progress-meta">
                  <span>{activeProgress?.label || "0/0"} steps done</span>
                  <strong>{activeProgress?.percentage || 0}%</strong>
                </div>

                <button
                  className="calm-start-button"
                  onClick={() => startMission(activeMission)}
                >
                  <Play className="icon-sm" /> Start this small step
                </button>
              </article>
            ) : (
              <article className="calm-mission-card empty">
                <span className="calm-pill"><Leaf className="icon-xs" /> Calm start</span>
                <h2>No mission yet</h2>
                <p>Ask your parent to add one small reading mission for today.</p>
              </article>
            )}
          </section>

          <aside className="calm-support-stack">
            <div className="calm-support-card lavender">
              <Sparkles className="icon" />
              <h3>Reset plan</h3>
              <p>After focus time, take a {preferences.breakLength}-minute quiet break.</p>
            </div>
            <div className="calm-support-card mint">
              <Star className="icon" />
              <h3>Reward path</h3>
              <p>
                {rewardProfile.nextRank
                  ? `${rewardProfile.xpToNextRank} XP to ${rewardProfile.nextRank.name}`
                  : "You reached the top rank."}
              </p>
            </div>
            <div className="calm-support-card cream">
              <Target className="icon" />
              <h3>Today summary</h3>
              <p>{completedMissions}/{missions.length} missions completed.</p>
            </div>
          </aside>
        </div>

        {missions.length > 1 && (
          <section className="calm-mini-list" aria-label="Other missions">
            <div className="title-row">
              <h2>Other calm choices</h2>
              <button type="button" className="link-btn" onClick={() => navigate("/child/missions") }>
                View all
              </button>
            </div>
            <div className="mission-list">
              {missions.slice(0, 3).map((mission) => {
                const progress = getMissionProgress(mission);
                return (
                  <article className="card mission-card calm-mini-card" key={mission.id}>
                    <div className="mission-header-row">
                      <div className="mission-icon">{progress.percentage === 100 ? <Check /> : "M"}</div>
                      <div className="mission-content">
                        <div className="mission-top">
                          <h3>{mission.title}</h3>
                          <span>{progress.percentage}%</span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
