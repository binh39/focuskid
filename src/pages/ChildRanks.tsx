import { useEffect, useState } from "react";
import { Check, Lock, Sparkles } from "lucide-react";
import ChildNavBar from "../components/ChildNavBar";
import RankIcon from "../components/RankIcon";
import type { User } from "../types";
import { fetchCurrentUser, getRewardProfile, getStoredUser, RANKS } from "../utils/rewards";
import "../assets/ranks.css";

export default function ChildRanks() {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const profile = getRewardProfile(user?.xp || 0);

  useEffect(() => {
    fetchCurrentUser()
      .then((latestUser) => setUser(latestUser))
      .catch((e) => console.error(e));

    const syncUser = () => setUser(getStoredUser());
    window.addEventListener("focuskid_user_updated", syncUser);
    return () => window.removeEventListener("focuskid_user_updated", syncUser);
  }, []);

  return (
    <div className="child-dashboard rank-page">
      <ChildNavBar />

      <main className="rank-container">
        <header className="rank-header">
          <div>
            <p className="rank-eyebrow">Ranks</p>
            <h1>My Rank Ladder</h1>
            <p>Earn XP by finishing reading missions and quiz answers.</p>
          </div>

          <div className="rank-current-panel" style={{ borderColor: profile.rank.color }}>
            <div className="rank-current-icon" style={{ backgroundColor: profile.rank.color }}>
              <RankIcon rank={profile.rank} className="rank-current-svg" />
            </div>
            <span>Current Rank</span>
            <strong style={{ color: profile.rank.color }}>{profile.rank.name}</strong>
            <small>{profile.xp} XP</small>
          </div>
        </header>

        <section className="rank-next-panel">
          <div>
            <h2>Next Milestone</h2>
            <p>
              {profile.nextRank
                ? `${profile.xpToNextRank} XP to reach ${profile.nextRank.name}`
                : "Top rank reached"}
            </p>
          </div>
          <div className="rank-next-progress">
            <div className="rank-next-track">
              <div
                className="rank-next-fill"
                style={{ width: `${profile.rankProgress}%`, backgroundColor: profile.rank.color }}
              />
            </div>
            <span>{profile.rankProgress}%</span>
          </div>
        </section>

        <section className="rank-list" aria-label="All ranks">
          {RANKS.map((rank, index) => {
            const isCurrent = rank.name === profile.rank.name;
            const isUnlocked = profile.xp >= rank.minXp;
            const nextRank = RANKS[index + 1] || null;
            const rankProgress = isCurrent
              ? profile.rankProgress
              : isUnlocked
                ? 100
                : 0;

            return (
              <article
                className={`rank-card ${isCurrent ? "current" : ""} ${isUnlocked ? "unlocked" : "locked"}`}
                key={rank.name}
                style={isCurrent ? { borderColor: rank.color } : undefined}
              >
                <div className="rank-card-icon" style={{ backgroundColor: rank.color }}>
                  <RankIcon rank={rank} className="rank-card-svg" />
                </div>

                <div className="rank-card-body">
                  <div className="rank-card-head">
                    <div>
                      <h2>{rank.name}</h2>
                      <p>
                        Starts at {rank.minXp} XP
                        {nextRank ? ` - next rank at ${nextRank.minXp} XP` : ""}
                      </p>
                    </div>
                    <span className={isCurrent ? "rank-status current" : isUnlocked ? "rank-status unlocked" : "rank-status locked"}>
                      {isCurrent ? (
                        <>
                          <Sparkles className="rank-status-icon" /> Current
                        </>
                      ) : isUnlocked ? (
                        <>
                          <Check className="rank-status-icon" /> Unlocked
                        </>
                      ) : (
                        <>
                          <Lock className="rank-status-icon" /> {rank.minXp - profile.xp} XP needed
                        </>
                      )}
                    </span>
                  </div>

                  <div className="rank-card-track">
                    <div className="rank-card-fill" style={{ width: `${rankProgress}%`, backgroundColor: rank.color }} />
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
