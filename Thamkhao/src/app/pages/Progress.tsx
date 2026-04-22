import { motion } from "motion/react";
import { TrendingUp, Clock, Target, Award, Calendar, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip } from "recharts";
import NavBar from "../components/NavBar";

export default function Progress() {
  const weeklyData = [
    { day: "Mon", minutes: 45 },
    { day: "Tue", minutes: 60 },
    { day: "Wed", minutes: 30 },
    { day: "Thu", minutes: 75 },
    { day: "Fri", minutes: 50 },
    { day: "Sat", minutes: 40 },
    { day: "Sun", minutes: 55 },
  ];

  const missionData = [
    { name: "Math", completed: 12 },
    { name: "Reading", completed: 8 },
    { name: "Science", completed: 10 },
    { name: "Writing", completed: 6 },
  ];

  const monthlyData = [
    { week: "Week 1", sessions: 5 },
    { week: "Week 2", sessions: 8 },
    { week: "Week 3", sessions: 6 },
    { week: "Week 4", sessions: 10 },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <NavBar />
      <div className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1F2937]">Your Progress</h1>
          <p className="text-[#6B7280] mt-1">Track your learning journey and achievements</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl p-5 shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-[#4A90E2] rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#1F2937]">355</div>
            <div className="text-sm text-[#6B7280] mt-1">Total Minutes</div>
            <div className="text-xs text-[#6FCF97] mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              12% this week
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-[#6FCF97] rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#1F2937]">36</div>
            <div className="text-sm text-[#6B7280] mt-1">Missions Done</div>
            <div className="text-xs text-[#6FCF97] mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              8 this week
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl p-5 shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-[#F2994A] rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#1F2937]">7</div>
            <div className="text-sm text-[#6B7280] mt-1">Day Streak</div>
            <div className="text-xs text-[#6FCF97] mt-2">Keep it up!</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-5 shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-[#8AB4F8] rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#1F2937]">12</div>
            <div className="text-sm text-[#6B7280] mt-1">Badges Earned</div>
            <div className="text-xs text-[#6FCF97] mt-2">3 new!</div>
          </motion.div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="col-span-8 bg-white rounded-2xl p-6 shadow-md"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-[#1F2937]">Focus Time This Week</h2>
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Calendar className="w-4 h-4" />
                Apr 7 - Apr 13, 2026
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#6B7280", fontSize: 13 }}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <YAxis
                  tick={{ fill: "#6B7280", fontSize: 13 }}
                  axisLine={{ stroke: "#E5E7EB" }}
                  label={{ value: "Minutes", angle: -90, position: "insideLeft", fill: "#6B7280" }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "white", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  stroke="#4A90E2"
                  strokeWidth={3}
                  dot={{ fill: "#4A90E2", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-4 space-y-4"
          >
            <div className="bg-white rounded-2xl p-5 shadow-md">
              <h3 className="font-bold text-[#1F2937] mb-4">This Month</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">Total Sessions</span>
                  <span className="font-bold text-[#1F2937]">29</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">Avg per Day</span>
                  <span className="font-bold text-[#1F2937]">2.3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">Best Streak</span>
                  <span className="font-bold text-[#1F2937]">7 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">Completion Rate</span>
                  <span className="font-bold text-[#6FCF97]">87%</span>
                </div>
              </div>
            </div>

            <div className="bg-[#6FCF97] rounded-2xl p-5 shadow-md text-white">
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="font-bold mb-1">Keep Going!</h3>
              <p className="text-sm text-white/90">3 more missions to unlock a special reward!</p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-12 gap-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="col-span-6 bg-white rounded-2xl p-6 shadow-md"
          >
            <h2 className="text-xl font-bold text-[#1F2937] mb-5">Missions by Subject</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={missionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#6B7280", fontSize: 13 }}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <YAxis
                  tick={{ fill: "#6B7280", fontSize: 13 }}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "white", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                />
                <Bar dataKey="completed" fill="#4A90E2" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="col-span-6 bg-white rounded-2xl p-6 shadow-md"
          >
            <h2 className="text-xl font-bold text-[#1F2937] mb-5">Weekly Sessions</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="week"
                  tick={{ fill: "#6B7280", fontSize: 13 }}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <YAxis
                  tick={{ fill: "#6B7280", fontSize: 13 }}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "white", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                />
                <Bar dataKey="sessions" fill="#6FCF97" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
