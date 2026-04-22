import { useNavigate, useLocation } from "react-router";
import { Home, Target, TrendingUp, Settings, Sparkles } from "lucide-react";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/tasks", icon: Target, label: "Missions" },
    { path: "/progress", icon: TrendingUp, label: "Progress" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  if (location.pathname === "/" || location.pathname === "/focus" || location.pathname === "/break" || location.pathname === "/reward") {
    return null;
  }

  return (
    <nav className="bg-white border-b border-[#B3B1B2] sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#527578]/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#527578]" />
            </div>
            <span className="text-2xl font-medium text-[#47423F]">FocusKid</span>
          </div>

          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-[#527578] text-white shadow-sm"
                      : "text-[#84978F] hover:bg-[#FFFFFF] hover:text-[#47423F]"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-medium text-[#47423F]">Alex</div>
              <div className="text-sm text-[#84978F]">Level 12</div>
            </div>
            <div className="w-11 h-11 bg-[#ADA692]/30 rounded-full flex items-center justify-center text-xl border border-[#ADA692]/20">
              😊
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
