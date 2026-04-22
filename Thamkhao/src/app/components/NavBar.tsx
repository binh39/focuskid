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
    <nav className="bg-white border-b border-[#E2E8F0] sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4A90E2] rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#1F2937]">FocusKid</span>
          </div>

          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#5B9FED] to-[#A78BFA] text-white shadow-md"
                      : "text-[#64748B] hover:bg-[#F8FAFE] hover:text-[#2D3748]"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-semibold text-[#1F2937]">Alex</div>
              <div className="text-sm text-[#6B7280]">Level 12</div>
            </div>
            <div className="w-12 h-12 bg-[#F2994A] rounded-full flex items-center justify-center text-2xl shadow-md">
              😊
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
