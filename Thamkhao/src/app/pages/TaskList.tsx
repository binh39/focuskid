import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronUp, Plus, Check, Play, Edit, Trash2, Clock } from "lucide-react";
import NavBar from "../components/NavBar";

interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

interface Mission {
  id: number;
  title: string;
  icon: string;
  color: string;
  subtasks: Subtask[];
  expanded: boolean;
  time: string;
  category: string;
}

export default function TaskList() {
  const navigate = useNavigate();
  const [missions, setMissions] = useState<Mission[]>([
    {
      id: 1,
      title: "Math Practice",
      icon: "📐",
      color: "#4A90E2",
      category: "Mathematics",
      time: "20 min",
      expanded: false,
      subtasks: [
        { id: 1, title: "Complete multiplication tables", completed: true },
        { id: 2, title: "Solve word problems (5 questions)", completed: true },
        { id: 3, title: "Practice fractions exercises", completed: false },
      ],
    },
    {
      id: 2,
      title: "Reading Time",
      icon: "📚",
      color: "#6FCF97",
      category: "Language Arts",
      time: "15 min",
      expanded: false,
      subtasks: [
        { id: 1, title: "Read Chapter 3", completed: false },
        { id: 2, title: "Write 3 vocabulary words", completed: false },
        { id: 3, title: "Answer comprehension questions", completed: false },
      ],
    },
    {
      id: 3,
      title: "Science Quiz",
      icon: "🔬",
      color: "#F2994A",
      category: "Science",
      time: "10 min",
      expanded: false,
      subtasks: [
        { id: 1, title: "Study plant parts diagram", completed: true },
        { id: 2, title: "Complete quiz on photosynthesis", completed: true },
        { id: 3, title: "Watch educational video", completed: true },
        { id: 4, title: "Review notes", completed: false },
      ],
    },
    {
      id: 4,
      title: "Writing Assignment",
      icon: "✏️",
      color: "#8AB4F8",
      category: "Language Arts",
      time: "25 min",
      expanded: false,
      subtasks: [
        { id: 1, title: "Brainstorm ideas", completed: false },
        { id: 2, title: "Write first draft", completed: false },
        { id: 3, title: "Proofread and edit", completed: false },
      ],
    },
  ]);

  const toggleMission = (id: number) => {
    setMissions(missions.map(m =>
      m.id === id ? { ...m, expanded: !m.expanded } : m
    ));
  };

  const toggleSubtask = (missionId: number, subtaskId: number) => {
    setMissions(missions.map(m =>
      m.id === missionId
        ? {
            ...m,
            subtasks: m.subtasks.map(s =>
              s.id === subtaskId ? { ...s, completed: !s.completed } : s
            ),
          }
        : m
    ));
  };

  const getCompletionCount = (mission: Mission) => {
    const completed = mission.subtasks.filter(s => s.completed).length;
    return `${completed}/${mission.subtasks.length}`;
  };

  const getCompletionPercentage = (mission: Mission) => {
    const completed = mission.subtasks.filter(s => s.completed).length;
    return (completed / mission.subtasks.length) * 100;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <NavBar />
      <div className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#1F2937]">My Missions</h1>
                <p className="text-[#6B7280] mt-1">Manage and track your learning tasks</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#4A90E2] text-white rounded-xl px-5 py-3 shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add Mission</span>
              </motion.button>
            </div>

            <div className="space-y-3">
              {missions.map((mission, index) => (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-md overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{mission.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-[#1F2937] text-lg">{mission.title}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-[#6B7280]">{mission.category}</span>
                              <span className="text-sm text-[#6B7280]">•</span>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#6B7280]" />
                                <span className="text-sm text-[#6B7280]">{mission.time}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="w-8 h-8 rounded-lg hover:bg-[#F8FAFC] flex items-center justify-center transition-colors">
                              <Edit className="w-4 h-4 text-[#6B7280]" />
                            </button>
                            <button className="w-8 h-8 rounded-lg hover:bg-[#FEE2E2] flex items-center justify-center transition-colors">
                              <Trash2 className="w-4 h-4 text-[#EF4444]" />
                            </button>
                            <button
                              onClick={() => toggleMission(mission.id)}
                              className="w-8 h-8 rounded-lg hover:bg-[#F8FAFC] flex items-center justify-center transition-colors"
                            >
                              {mission.expanded ? (
                                <ChevronUp className="w-5 h-5 text-[#6B7280]" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-[#6B7280]" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-1 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${getCompletionPercentage(mission)}%`, backgroundColor: mission.color }}
                            />
                          </div>
                          <span className="text-sm font-medium text-[#6B7280] min-w-[3rem]">{getCompletionCount(mission)}</span>
                        </div>

                        <AnimatePresence>
                          {mission.expanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-2 pt-3 border-t border-[#E5E7EB]"
                            >
                              {mission.subtasks.map((subtask) => (
                                <div
                                  key={subtask.id}
                                  className="flex items-center gap-3 py-1"
                                >
                                  <button
                                    onClick={() => toggleSubtask(mission.id, subtask.id)}
                                    className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                                      subtask.completed
                                        ? "bg-[#6FCF97] border-[#6FCF97]"
                                        : "border-[#D1D5DB] hover:border-[#4A90E2]"
                                    }`}
                                  >
                                    {subtask.completed && <Check className="w-3 h-3 text-white" />}
                                  </button>
                                  <span
                                    className={`flex-1 text-sm ${
                                      subtask.completed ? "text-[#6B7280] line-through" : "text-[#1F2937]"
                                    }`}
                                  >
                                    {subtask.title}
                                  </span>
                                </div>
                              ))}

                              <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => navigate("/focus")}
                                className="w-full text-white rounded-xl py-3 mt-3 shadow-md hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                                style={{ backgroundColor: mission.color }}
                              >
                                <Play className="w-4 h-4" />
                                <span className="font-medium">Start This Mission</span>
                              </motion.button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5 shadow-md"
            >
              <h3 className="font-bold text-[#1F2937] mb-4">Mission Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280]">Total Missions</span>
                  <span className="font-bold text-[#1F2937]">{missions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280]">Completed</span>
                  <span className="font-bold text-[#6FCF97]">
                    {missions.filter(m => getCompletionPercentage(m) === 100).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280]">In Progress</span>
                  <span className="font-bold text-[#4A90E2]">
                    {missions.filter(m => getCompletionPercentage(m) > 0 && getCompletionPercentage(m) < 100).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280]">Not Started</span>
                  <span className="font-bold text-[#F2994A]">
                    {missions.filter(m => getCompletionPercentage(m) === 0).length}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#4A90E2] rounded-2xl p-5 shadow-md text-white"
            >
              <h3 className="font-bold mb-2">Quick Tip 💡</h3>
              <p className="text-sm text-white/90">
                Break large tasks into smaller steps to make them easier to complete and track your progress better!
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-5 shadow-md"
            >
              <h3 className="font-bold text-[#1F2937] mb-4">Categories</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8FAFC] transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#4A90E2]"></div>
                    <span className="text-sm text-[#1F2937]">Mathematics</span>
                  </div>
                  <span className="text-sm font-medium text-[#6B7280]">1</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8FAFC] transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#6FCF97]"></div>
                    <span className="text-sm text-[#1F2937]">Language Arts</span>
                  </div>
                  <span className="text-sm font-medium text-[#6B7280]">2</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8FAFC] transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#F2994A]"></div>
                    <span className="text-sm text-[#1F2937]">Science</span>
                  </div>
                  <span className="text-sm font-medium text-[#6B7280]">1</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
