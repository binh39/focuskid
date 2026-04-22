import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Flame, Star, Trophy, Target, Clock, Award, Zap } from "lucide-react";
import NavBar from "../components/NavBar";

export default function Dashboard() {
  const navigate = useNavigate();

  const missions = [
    { id: 1, title: "Math Practice", icon: "📐", progress: 60, color: "#4A90E2", time: "20 min" },
    { id: 2, title: "Reading Time", icon: "📚", progress: 30, color: "#6FCF97", time: "15 min" },
    { id: 3, title: "Science Quiz", icon: "🔬", progress: 80, color: "#F2994A", time: "10 min" },
  ];

  const recentBadges = [
    { emoji: "🎖️", name: "Focus Champion" },
    { emoji: "⭐", name: "7 Day Streak" },
    { emoji: "🏆", name: "Math Master" },
    { emoji: "📚", name: "Book Worm" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <NavBar />
      <div className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-md"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-[#1F2937]">Level Progress</h2>
                <span className="text-sm font-medium text-[#4A90E2]">1,240 / 1,500 XP</span>
              </div>
              <div className="h-3 bg-[#E5E7EB] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "83%" }}
                  transition={{ delay: 0.3, duration: 1 }}
                  className="h-full bg-[#4A90E2] rounded-full"
                />
              </div>
              <p className="text-sm text-[#6B7280] mt-2">260 XP to Level 13 🎯</p>
            </motion.div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-[#1F2937]">Today's Missions</h2>
                <button
                  onClick={() => navigate("/tasks")}
                  className="text-sm text-[#4A90E2] hover:underline font-medium"
                >
                  View all missions →
                </button>
              </div>

              <div className="space-y-3">
                {missions.map((mission, index) => (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate("/tasks")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{mission.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-[#1F2937]">{mission.title}</h3>
                          <span className="text-sm text-[#6B7280]">{mission.time}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${mission.progress}%`, backgroundColor: mission.color }}
                            />
                          </div>
                          <span className="text-sm font-medium text-[#6B7280] min-w-[3rem]">{mission.progress}%</span>
                        </div>
                      </div>
                      <Target className="w-5 h-5 text-[#6B7280]" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/focus")}
                className="bg-[#4A90E2] text-white rounded-2xl py-5 px-6 shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-3"
              >
                <Clock className="w-6 h-6" />
                <span className="text-lg font-semibold">Start Focus Session</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/tasks")}
                className="bg-white border-2 border-[#4A90E2] text-[#4A90E2] rounded-2xl py-5 px-6 shadow-md hover:shadow-lg transition-shadow flex items-center justify-center gap-3"
              >
                <Target className="w-6 h-6" />
                <span className="text-lg font-semibold">View All Tasks</span>
              </motion.button>
            </div>
          </div>

          <div className="col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-5 shadow-md"
            >
              <h3 className="font-semibold text-[#1F2937] mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#F2994A] rounded-xl flex items-center justify-center">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-[#1F2937]">7 Days</div>
                    <div className="text-sm text-[#6B7280]">Current Streak</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#4A90E2] rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-[#1F2937]">342</div>
                    <div className="text-sm text-[#6B7280]">Stars Earned</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#6FCF97] rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-[#1F2937]">12</div>
                    <div className="text-sm text-[#6B7280]">Badges Unlocked</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#8AB4F8] rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-[#1F2937]">36</div>
                    <div className="text-sm text-[#6B7280]">Missions Done</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-5 shadow-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#1F2937]">Recent Badges</h3>
                <Award className="w-5 h-5 text-[#F2994A]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {recentBadges.map((badge, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="bg-[#F8FAFC] rounded-xl p-3 text-center border border-[#E5E7EB]"
                  >
                    <div className="text-3xl mb-1">{badge.emoji}</div>
                    <div className="text-xs font-medium text-[#1F2937]">{badge.name}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#6FCF97] rounded-2xl p-5 shadow-md text-center"
            >
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="font-bold text-white mb-1">Keep Going!</h3>
              <p className="text-sm text-white/90">3 more missions to unlock a special reward</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
