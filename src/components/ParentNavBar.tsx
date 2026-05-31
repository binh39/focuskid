import { useNavigate, useLocation } from "react-router-dom";
import { Home, Target, TrendingUp, Settings, Sparkles, LogOut } from "lucide-react";
import { clearStoredUser, getStoredUser } from "../utils/rewards";
import "../assets/navbar.css";

export default function ParentNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/parent/dashboard", icon: Home, label: "Dashboard" },
    { path: "/parent/missions", icon: Target, label: "Assignments" },
    { path: "/parent/progress", icon: TrendingUp, label: "Progress" },
    { path: "/parent/settings", icon: Settings, label: "Settings" },
  ];

  const user = getStoredUser();

  return (
    <nav className="fk-nav">
      <div className="fk-nav-inner">
        <div className="fk-brand">
          <div className="fk-brand-icon">
            <Sparkles className="fk-icon" />
          </div>
          <span className="fk-brand-name">FocusKid Parent</span>
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
            <div className="name">{user?.name || "Parent"}</div>
            <div className="level">Role: Parent</div>
          </div>
          <button
            type="button"
            className="fk-logout"
            onClick={() => {
              clearStoredUser();
              navigate("/");
            }}
          >
            <LogOut className="fk-icon" /> Logout
          </button>
          <div className="fk-avatar">P</div>
        </div>
      </div>
    </nav>
  );
}
