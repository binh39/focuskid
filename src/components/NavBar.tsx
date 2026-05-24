import { useNavigate, useLocation } from "react-router-dom";
import { Home, Target, TrendingUp, Settings, Sparkles } from "lucide-react";
import "../assets/navbar.css";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/mission", icon: Target, label: "Missions" },
    { path: "/progress", icon: TrendingUp, label: "Progress" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  if (location.pathname === "/") {
    return null;
  }

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
            <div className="name">Alex</div>
            <div className="level">Rank Đồng</div>
          </div>
          <div className="fk-avatar">😊</div>
        </div>
      </div>
    </nav>
  );
}
