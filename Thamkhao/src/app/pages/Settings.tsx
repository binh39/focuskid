import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Volume2, VolumeX, Bell, BellOff, Save, RotateCcw, User, Shield, Palette } from "lucide-react";
import NavBar from "../components/NavBar";

export default function Settings() {
  const navigate = useNavigate();
  const [focusLength, setFocusLength] = useState(25);
  const [breakLength, setBreakLength] = useState(5);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [accentColor, setAccentColor] = useState("blue");

  const accentColors = [
    { name: "blue", color: "#4A90E2", label: "Primary Blue" },
    { name: "green", color: "#6FCF97", label: "Success Green" },
    { name: "orange", color: "#F2994A", label: "Accent Orange" },
    { name: "purple", color: "#8AB4F8", label: "Light Blue" },
  ];

  const handleSave = () => {
    navigate("/dashboard");
  };

  const handleReset = () => {
    setFocusLength(25);
    setBreakLength(5);
    setSoundEnabled(true);
    setNotificationsEnabled(true);
    setAccentColor("blue");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <NavBar />
      <div className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1F2937]">Settings</h1>
          <p className="text-[#6B7280] mt-1">Customize your learning experience</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-md"
            >
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-[#4A90E2]" />
                <h2 className="text-xl font-bold text-[#1F2937]">Session Preferences</h2>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-3">Focus Session Length</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="5"
                      value={focusLength}
                      onChange={(e) => setFocusLength(Number(e.target.value))}
                      className="flex-1 h-2 bg-[#E5E7EB] rounded-full appearance-none cursor-pointer accent-[#4A90E2]"
                    />
                    <div className="w-20 h-12 bg-[#F8FAFC] rounded-xl flex items-center justify-center border border-[#E5E7EB]">
                      <span className="font-bold text-[#1F2937]">{focusLength} min</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-2">Recommended: 25 minutes</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-3">Break Length</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="5"
                      max="15"
                      step="5"
                      value={breakLength}
                      onChange={(e) => setBreakLength(Number(e.target.value))}
                      className="flex-1 h-2 bg-[#E5E7EB] rounded-full appearance-none cursor-pointer accent-[#6FCF97]"
                    />
                    <div className="w-20 h-12 bg-[#F8FAFC] rounded-xl flex items-center justify-center border border-[#E5E7EB]">
                      <span className="font-bold text-[#1F2937]">{breakLength} min</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-2">Recommended: 5 minutes</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-md"
            >
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5 text-[#4A90E2]" />
                <h2 className="text-xl font-bold text-[#1F2937]">Notifications & Sound</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-[#F8FAFC] transition-colors">
                  <div className="flex items-center gap-3">
                    {soundEnabled ? (
                      <div className="w-10 h-10 bg-[#4A90E2] rounded-xl flex items-center justify-center">
                        <Volume2 className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-[#E5E7EB] rounded-xl flex items-center justify-center">
                        <VolumeX className="w-5 h-5 text-[#6B7280]" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-[#1F2937]">Sound Effects</div>
                      <div className="text-sm text-[#6B7280]">Play sounds during sessions</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      soundEnabled ? "bg-[#4A90E2]" : "bg-[#D1D5DB]"
                    }`}
                  >
                    <motion.div
                      animate={{ x: soundEnabled ? 24 : 4 }}
                      className="w-6 h-6 bg-white rounded-full mt-1 shadow-sm"
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-[#F8FAFC] transition-colors">
                  <div className="flex items-center gap-3">
                    {notificationsEnabled ? (
                      <div className="w-10 h-10 bg-[#4A90E2] rounded-xl flex items-center justify-center">
                        <Bell className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-[#E5E7EB] rounded-xl flex items-center justify-center">
                        <BellOff className="w-5 h-5 text-[#6B7280]" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-[#1F2937]">Reminder Notifications</div>
                      <div className="text-sm text-[#6B7280]">Get reminders to stay focused</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      notificationsEnabled ? "bg-[#4A90E2]" : "bg-[#D1D5DB]"
                    }`}
                  >
                    <motion.div
                      animate={{ x: notificationsEnabled ? 24 : 4 }}
                      className="w-6 h-6 bg-white rounded-full mt-1 shadow-sm"
                    />
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-md"
            >
              <div className="flex items-center gap-3 mb-6">
                <Palette className="w-5 h-5 text-[#4A90E2]" />
                <h2 className="text-xl font-bold text-[#1F2937]">Theme Accent Color</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {accentColors.map((option) => (
                  <button
                    key={option.name}
                    onClick={() => setAccentColor(option.name)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      accentColor === option.name
                        ? "border-[#1F2937] bg-[#F8FAFC] shadow-sm"
                        : "border-[#E5E7EB] hover:border-[#D1D5DB]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl shadow-sm"
                        style={{ backgroundColor: option.color }}
                      ></div>
                      <span className="font-semibold text-[#1F2937]">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl p-5 shadow-md"
            >
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-[#4A90E2]" />
                <h3 className="font-bold text-[#1F2937]">Current Settings</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">Focus Duration</span>
                  <span className="font-semibold text-[#1F2937]">{focusLength} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">Break Duration</span>
                  <span className="font-semibold text-[#1F2937]">{breakLength} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">Sound</span>
                  <span className={`font-semibold ${soundEnabled ? "text-[#6FCF97]" : "text-[#6B7280]"}`}>
                    {soundEnabled ? "On" : "Off"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">Notifications</span>
                  <span className={`font-semibold ${notificationsEnabled ? "text-[#6FCF97]" : "text-[#6B7280]"}`}>
                    {notificationsEnabled ? "On" : "Off"}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <button
                onClick={handleSave}
                className="w-full bg-[#4A90E2] text-white rounded-xl py-4 px-5 shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                <span className="font-semibold">Save Changes</span>
              </button>

              <button
                onClick={handleReset}
                className="w-full bg-white border-2 border-[#E5E7EB] text-[#6B7280] rounded-xl py-4 px-5 shadow-md hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="font-semibold">Reset to Default</span>
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-[#6FCF97] rounded-2xl p-5 shadow-md text-white text-center"
            >
              <div className="text-3xl mb-2">💡</div>
              <h3 className="font-bold mb-1">Tip</h3>
              <p className="text-sm text-white/90">Regular breaks help maintain focus and reduce fatigue</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
