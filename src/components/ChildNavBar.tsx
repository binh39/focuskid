import { useNavigate, useLocation } from "react-router-dom";
import { Home, Target, Settings, Sparkles, LogOut } from "lucide-react";
import type { User } from "../types";
import "../assets/navbar.css";

export default function ChildNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/child/dashboard", icon: Home, label: "My Home" },
    { path: "/child/missions", icon: Target, label: "My Missions" },
    { path: "/child/settings", icon: Settings, label: "My Settings" },
  ];

  const stored = localStorage.getItem("focuskid_user");
  const user = stored ? (JSON.parse(stored) as User) : null;

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
            <div className="level">Role: Child</div>
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
          <div className="fk-avatar">🧒</div>
        </div>
      </div>
    </nav>
  );
}
