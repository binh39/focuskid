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
      color: "#044B37",
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
      color: "#819D94",
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
      color: "#B57677",
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
      color: "#819D94",
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
    <div className="min-h-screen bg-[#FAFAFA]">
      <NavBar />
      <div className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-medium text-[#044B37]">My Missions</h1>
                <p className="text-[#819D94] mt-1">Manage and track your learning tasks</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#819D94] text-white rounded-xl px-5 py-3 shadow-sm hover:shadow-md transition-all flex items-center gap-2"
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
                  className="bg-white rounded-xl shadow-sm border border-[#FDF9F5] overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl opacity-80">{mission.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-[#044B37] text-lg">{mission.title}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-[#819D94]">{mission.category}</span>
                              <span className="text-sm text-[#819D94]">•</span>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#819D94]" />
                                <span className="text-sm text-[#819D94]">{mission.time}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="w-8 h-8 rounded-lg hover:bg-[#FDF9F5] flex items-center justify-center transition-colors">
                              <Edit className="w-4 h-4 text-[#819D94]" />
                            </button>
                            <button className="w-8 h-8 rounded-lg hover:bg-[#044B37]/10 flex items-center justify-center transition-colors">
                              <Trash2 className="w-4 h-4 text-[#044B37]" />
                            </button>
                            <button
                              onClick={() => toggleMission(mission.id)}
                              className="w-8 h-8 rounded-lg hover:bg-[#FDF9F5] flex items-center justify-center transition-colors"
                            >
                              {mission.expanded ? (
                                <ChevronUp className="w-5 h-5 text-[#819D94]" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-[#819D94]" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-1 h-1.5 bg-[#819D94]/25 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${getCompletionPercentage(mission)}%`, backgroundColor: mission.color }}
                            />
                          </div>
                          <span className="text-sm text-[#819D94] min-w-[3rem] text-right">{getCompletionCount(mission)}</span>
                        </div>

                        <AnimatePresence>
                          {mission.expanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-2 pt-3 border-t border-[#FDF9F5]"
                            >
                              {mission.subtasks.map((subtask) => (
                                <div
                                  key={subtask.id}
                                  className="flex items-center gap-3 py-1"
                                >
                                  <button
                                    onClick={() => toggleSubtask(mission.id, subtask.id)}
                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                      subtask.completed
                                        ? "bg-[#819D94] border-[#819D94]"
                                        : "border-[#FDF9F5] hover:border-[#819D94]"
                                    }`}
                                  >
                                    {subtask.completed && <Check className="w-3 h-3 text-white" />}
                                  </button>
                                  <span
                                    className={`flex-1 text-sm ${
                                      subtask.completed ? "text-[#819D94] line-through" : "text-[#044B37]"
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
                                className="w-full bg-[#DD2203] hover:bg-[#7C1419] text-white rounded-lg py-3 mt-3 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
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
              className="bg-white rounded-xl p-5 shadow-sm border border-[#FDF9F5]"
            >
              <h3 className="font-medium text-[#044B37] mb-4">Mission Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#819D94]">Total Missions</span>
                  <span className="font-medium text-[#044B37]">{missions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#819D94]">Completed</span>
                  <span className="font-medium text-[#819D94]">
                    {missions.filter(m => getCompletionPercentage(m) === 100).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#819D94]">In Progress</span>
                  <span className="font-medium text-[#819D94]">
                    {missions.filter(m => getCompletionPercentage(m) > 0 && getCompletionPercentage(m) < 100).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#819D94]">Not Started</span>
                  <span className="font-medium text-[#B57677]">
                    {missions.filter(m => getCompletionPercentage(m) === 0).length}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-[#819D94]/15 to-[#819D94]/15 rounded-xl p-5 border border-[#819D94]/20"
            >
              <h3 className="font-medium text-[#044B37] mb-2">Quick Tip</h3>
              <p className="text-sm text-[#819D94]">
                Break large tasks into smaller steps to make them easier to complete and track your progress better!
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-5 shadow-sm border border-[#FDF9F5]"
            >
              <h3 className="font-medium text-[#044B37] mb-4">Categories</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#FDF9F5] transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#044B37]"></div>
                    <span className="text-sm text-[#044B37]">Mathematics</span>
                  </div>
                  <span className="text-sm text-[#819D94]">1</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#FDF9F5] transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#819D94]"></div>
                    <span className="text-sm text-[#044B37]">Language Arts</span>
                  </div>
                  <span className="text-sm text-[#819D94]">2</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#FDF9F5] transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#B57677]"></div>
                    <span className="text-sm text-[#044B37]">Science</span>
                  </div>
                  <span className="text-sm text-[#819D94]">1</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}



