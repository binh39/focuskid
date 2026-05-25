import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Target, Settings, Sparkles, LogOut, Trophy } from "lucide-react";
import RankIcon from "./RankIcon";
import type { User } from "../types";
import { fetchCurrentUser, getRewardProfile, getStoredUser } from "../utils/rewards";
import "../assets/navbar.css";

export default function ChildNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/child/dashboard", icon: Home, label: "My Home" },
    { path: "/child/missions", icon: Target, label: "My Missions" },
    { path: "/child/ranks", icon: Trophy, label: "My Ranks" },
    { path: "/child/settings", icon: Settings, label: "My Settings" },
  ];

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
    <nav className="fk-nav">
      <div className="fk-nav-inner">
        <div className="fk-brand">
          <div className="fk-brand-icon">
            <Sparkles className="fk-icon" />
          </div>
          <span className="fk-brand-name">FocusKid</span>
        </div>

        <div className="fk-nav-items">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={isActive ? "fk-nav-btn active" : "fk-nav-btn"}
              >
                <item.icon className="fk-icon" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="fk-user">
          <div className="fk-user-text">
            <div className="name">{user?.name || "Learner"}</div>
            <div className="rank-line" style={{ color: profile.rank.color }}>
              <RankIcon rank={profile.rank} className="rank-line-icon" />
              <span>{profile.rank.name}</span>
              <span>- {profile.xp} XP</span>
            </div>
          </div>
          <button
            type="button"
            className="fk-logout"
            onClick={() => {
              localStorage.removeItem("focuskid_user");
              navigate("/");
            }}
          >
            <LogOut className="fk-icon" /> Logout
          </button>
          <div className="fk-avatar">FK</div>
        </div>
      </div>
    </nav>
  );
}
