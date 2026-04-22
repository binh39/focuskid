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

  const handleSave = () => {
    navigate("/dashboard");
  };

  const handleReset = () => {
    setFocusLength(25);
    setBreakLength(5);
    setSoundEnabled(true);
    setNotificationsEnabled(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <NavBar />
      <div className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#044B37]">Settings</h1>
          <p className="text-[#819D94] mt-1">Customize your learning experience</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-[#FDF9F5]"
            >
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-[#819D94]" />
                <h2 className="text-xl font-bold text-[#044B37]">Session Preferences</h2>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#044B37] mb-3">Focus Session Length</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="5"
                      value={focusLength}
                      onChange={(e) => setFocusLength(Number(e.target.value))}
                      className="flex-1 h-2 bg-[#FDF9F5] rounded-full appearance-none cursor-pointer accent-[#819D94]"
                    />
                    <div className="w-20 h-12 bg-[#FDF9F5] rounded-xl flex items-center justify-center border border-[#FDF9F5]">
                      <span className="font-bold text-[#044B37]">{focusLength} min</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#819D94] mt-2">Recommended: 25 minutes</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#044B37] mb-3">Break Length</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="5"
                      max="15"
                      step="5"
                      value={breakLength}
                      onChange={(e) => setBreakLength(Number(e.target.value))}
                      className="flex-1 h-2 bg-[#FDF9F5] rounded-full appearance-none cursor-pointer accent-[#819D94]"
                    />
                    <div className="w-20 h-12 bg-[#FDF9F5] rounded-xl flex items-center justify-center border border-[#FDF9F5]">
                      <span className="font-bold text-[#044B37]">{breakLength} min</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#819D94] mt-2">Recommended: 5 minutes</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-[#FDF9F5]"
            >
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5 text-[#819D94]" />
                <h2 className="text-xl font-bold text-[#044B37]">Notifications & Sound</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-[#FDF9F5] transition-colors">
                  <div className="flex items-center gap-3">
                    {soundEnabled ? (
                      <div className="w-10 h-10 bg-[#819D94]/15 rounded-xl flex items-center justify-center">
                        <Volume2 className="w-5 h-5 text-[#819D94]" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-[#FDF9F5] rounded-xl flex items-center justify-center">
                        <VolumeX className="w-5 h-5 text-[#819D94]" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-[#044B37]">Sound Effects</div>
                      <div className="text-sm text-[#819D94]">Play sounds during sessions</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      soundEnabled ? "bg-[#819D94]" : "bg-[#FDF9F5]"
                    }`}
                  >
                    <motion.div
                      animate={{ x: soundEnabled ? 24 : 4 }}
                      className="w-6 h-6 bg-white rounded-full mt-1 shadow-sm"
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-[#FDF9F5] transition-colors">
                  <div className="flex items-center gap-3">
                    {notificationsEnabled ? (
                      <div className="w-10 h-10 bg-[#819D94]/20 rounded-xl flex items-center justify-center">
                        <Bell className="w-5 h-5 text-[#819D94]" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-[#FDF9F5] rounded-xl flex items-center justify-center">
                        <BellOff className="w-5 h-5 text-[#819D94]" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-[#044B37]">Reminder Notifications</div>
                      <div className="text-sm text-[#819D94]">Get reminders to stay focused</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={`w-14 h-8 rounded-full transition-colors ${
                      notificationsEnabled ? "bg-[#819D94]" : "bg-[#FDF9F5]"
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

          </div>

          <div className="col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-[#FDF9F5]"
            >
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-[#819D94]" />
                <h3 className="font-bold text-[#044B37]">Current Settings</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#819D94]">Focus Duration</span>
                  <span className="font-semibold text-[#044B37]">{focusLength} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#819D94]">Break Duration</span>
                  <span className="font-semibold text-[#044B37]">{breakLength} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#819D94]">Sound</span>
                  <span className={`font-semibold ${soundEnabled ? "text-[#819D94]" : "text-[#819D94]"}`}>
                    {soundEnabled ? "On" : "Off"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#819D94]">Notifications</span>
                  <span className={`font-semibold ${notificationsEnabled ? "text-[#819D94]" : "text-[#819D94]"}`}>
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
                className="w-full bg-[#819D94] text-white rounded-xl py-4 px-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                <span className="font-semibold">Save Changes</span>
              </button>

              <button
                onClick={handleReset}
                className="w-full bg-white border-2 border-[#FDF9F5] text-[#819D94] rounded-xl py-4 px-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="font-semibold">Reset to Default</span>
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-[#819D94] rounded-2xl p-5 shadow-md text-white text-center"
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



