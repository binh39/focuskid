import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Star, Trophy, Target, Clock, Zap, ChevronDown, ChevronRight } from "lucide-react";
import NavBar from "../components/NavBar";
import { useState } from "react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [expandedMission, setExpandedMission] = useState<number | null>(null);
  const [showAllStats, setShowAllStats] = useState(false);

  const missions = [
    { id: 1, title: "Math Practice", icon: "📐", progress: 60, color: "#044B37", time: "20 min", description: "Complete multiplication and fractions" },
    { id: 2, title: "Reading Time", icon: "📚", progress: 30, color: "#819D94", time: "15 min", description: "Read Chapter 3 and vocabulary" },
    { id: 3, title: "Science Quiz", icon: "🔬", progress: 80, color: "#B57677", time: "10 min", description: "Photosynthesis and plant parts" },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <NavBar />
      <div className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-[#FDF9F5]"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-medium text-[#044B37]">Level Progress</h2>
                <span className="text-sm text-[#819D94]">1,240 / 1,500 XP</span>
              </div>
              <div className="h-2.5 bg-[#B57677]/22 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "83%" }}
                  transition={{ delay: 0.3, duration: 1 }}
                  className="h-full bg-[#819D94] rounded-full"
                />
              </div>
              <p className="text-sm text-[#819D94] mt-2">260 XP to Level 13</p>
            </motion.div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-medium text-[#044B37]">Today's Missions</h2>
                <button
                  onClick={() => navigate("/tasks")}
                  className="text-sm text-[#819D94] hover:text-[#044B37] transition-colors"
                >
                  View all →
                </button>
              </div>

              <div className="space-y-3">
                {missions.map((mission, index) => (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="bg-white rounded-xl p-5 shadow-sm border border-[#FDF9F5] hover:border-[#819D94]/35 transition-all cursor-pointer"
                    onClick={() => setExpandedMission(expandedMission === mission.id ? null : mission.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl opacity-80">{mission.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-[#044B37]">{mission.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#819D94]">{mission.time}</span>
                            <motion.div
                              animate={{ rotate: expandedMission === mission.id ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="w-4 h-4 text-[#819D94]" />
                            </motion.div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-[#819D94]/25 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${mission.progress}%` }}
                              transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: mission.color }}
                            />
                          </div>
                          <span className="text-sm text-[#819D94] min-w-[3rem] text-right">{mission.progress}%</span>
                        </div>
                        <AnimatePresence>
                          {expandedMission === mission.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0, marginTop: 0 }}
                              animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                              exit={{ height: 0, opacity: 0, marginTop: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <p className="text-sm text-[#819D94] mb-3 pt-3 border-t border-[#FDF9F5]">
                                {mission.description}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate("/focus");
                                }}
                                className="w-full bg-[#DD2203] hover:bg-[#7C1419] text-white rounded-lg py-2 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                              >
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-medium">Start Focus</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate("/tasks")}
                className="bg-white border border-[#FDF9F5] text-[#044B37] rounded-xl py-4 px-6 shadow-sm hover:shadow-md hover:border-[#819D94]/70 transition-all flex items-center justify-center gap-3"
              >
                <Target className="w-5 h-5" />
                <span className="font-medium">View All Tasks</span>
              </motion.button>
            </div>
          </div>

          <div className="col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-5 shadow-sm border border-[#FDF9F5]"
            >
              <button
                onClick={() => setShowAllStats(!showAllStats)}
                className="w-full flex items-center justify-between mb-4 text-left"
              >
                <h3 className="font-medium text-[#044B37]">Your Stats</h3>
                <motion.div
                  animate={{ rotate: showAllStats ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-[#819D94]" />
                </motion.div>
              </button>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-[#DD2203]/15 rounded-lg flex items-center justify-center">
                    <Flame className="w-5 h-5 text-[#DD2203]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xl font-medium text-[#044B37]">7 Days</div>
                    <div className="text-sm text-[#819D94]">Current Streak</div>
                  </div>
                </div>

                <AnimatePresence>
                  {showAllStats && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-[#819D94]/15 rounded-lg flex items-center justify-center">
                          <Star className="w-5 h-5 text-[#819D94]" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xl font-medium text-[#044B37]">342</div>
                          <div className="text-sm text-[#819D94]">Stars Earned</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-[#FDF9F5]/40 rounded-lg flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-[#819D94]" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xl font-medium text-[#044B37]">12</div>
                          <div className="text-sm text-[#819D94]">Badges Unlocked</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-[#DD2203]/15 rounded-lg flex items-center justify-center">
                          <Zap className="w-5 h-5 text-[#DD2203]" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xl font-medium text-[#044B37]">36</div>
                          <div className="text-sm text-[#819D94]">Missions Done</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-[#F4ECE3] to-[#E8DDD2] rounded-xl p-5 border border-[#D0BCAA] ring-2 ring-white text-center"
            >
              <div className="text-3xl mb-2 opacity-80">🎯</div>
              <h3 className="font-medium text-[#044B37] mb-1">Keep Going!</h3>
              <p className="text-sm text-[#819D94]">3 more missions to unlock a special reward</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}



