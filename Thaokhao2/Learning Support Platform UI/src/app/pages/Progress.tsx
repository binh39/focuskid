import { useState } from "react";
import { motion } from "motion/react";
import { TrendingUp, Clock, Target, Award, Calendar, Zap, ChevronDown, BarChart3, LineChart as LineChartIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip } from "recharts";
import NavBar from "../components/NavBar";

export default function Progress() {
  const [showDetails, setShowDetails] = useState(false);

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

  const weeklyAverage = Math.round(weeklyData.reduce((sum, item) => sum + item.minutes, 0) / weeklyData.length);
  const bestDay = weeklyData.reduce((best, item) => (item.minutes > best.minutes ? item : best), weeklyData[0]);
  const topSubject = missionData.reduce((best, item) => (item.completed > best.completed ? item : best), missionData[0]);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <NavBar />
      <div className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-medium text-[#044B37]">Your Progress</h1>
          <p className="text-[#819D94] mt-1">Track your learning journey and achievements</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-xl p-5 shadow-sm border border-[#FDF9F5]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 bg-[#819D94]/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#819D94]" />
              </div>
            </div>
            <div className="text-3xl font-medium text-[#044B37]">355</div>
            <div className="text-sm text-[#819D94] mt-1">Total Minutes</div>
            <div className="text-xs text-[#819D94] mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              12% this week
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-5 shadow-sm border border-[#FDF9F5]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 bg-[#819D94]/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-[#819D94]" />
              </div>
            </div>
            <div className="text-3xl font-medium text-[#044B37]">36</div>
            <div className="text-sm text-[#819D94] mt-1">Missions Done</div>
            <div className="text-xs text-[#819D94] mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              8 this week
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl p-5 shadow-sm border border-[#FDF9F5]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 bg-[#DD2203]/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#DD2203]" />
              </div>
            </div>
            <div className="text-3xl font-medium text-[#044B37]">7</div>
            <div className="text-sm text-[#819D94] mt-1">Day Streak</div>
            <div className="text-xs text-[#819D94] mt-2">Keep it up!</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-5 shadow-sm border border-[#FDF9F5]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 bg-[#819D94]/20 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-[#819D94]" />
              </div>
            </div>
            <div className="text-3xl font-medium text-[#044B37]">12</div>
            <div className="text-sm text-[#819D94] mt-1">Badges Earned</div>
            <div className="text-xs text-[#819D94] mt-2">3 new!</div>
          </motion.div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="col-span-12 bg-white rounded-xl p-6 shadow-sm border border-[#FDF9F5]"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-medium text-[#044B37]">At a glance</h2>
                <p className="text-sm text-[#819D94] mt-1">
                  Summary first. Open the detailed charts only when you need them.
                </p>
              </div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#FDF9F5] bg-[#FDF9F5] px-4 py-2 text-sm font-medium text-[#044B37] transition-colors hover:border-[#819D94]/40 hover:bg-white"
              >
                {showDetails ? "Hide details" : "View details"}
                <ChevronDown className={`w-4 h-4 transition-transform ${showDetails ? "rotate-180" : ""}`} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-[#FDF9F5] bg-[#FDF9F5] p-4">
                <div className="text-sm text-[#819D94]">Weekly average</div>
                <div className="mt-1 text-2xl font-medium text-[#044B37]">{weeklyAverage} min</div>
              </div>
              <div className="rounded-xl border border-[#FDF9F5] bg-[#FDF9F5] p-4">
                <div className="text-sm text-[#819D94]">Best day</div>
                <div className="mt-1 text-2xl font-medium text-[#044B37]">{bestDay.day}</div>
                <div className="text-sm text-[#819D94]">{bestDay.minutes} min focused</div>
              </div>
              <div className="rounded-xl border border-[#FDF9F5] bg-[#FDF9F5] p-4">
                <div className="text-sm text-[#819D94]">Top subject</div>
                <div className="mt-1 text-2xl font-medium text-[#044B37]">{topSubject.name}</div>
                <div className="text-sm text-[#819D94]">{topSubject.completed} missions completed</div>
              </div>
            </div>

            {!showDetails ? (
              <div className="mt-5 rounded-xl border border-dashed border-[#FDF9F5] bg-[#FDF9F5] p-5 text-sm text-[#819D94]">
                <div className="flex items-center gap-2 font-medium text-[#044B37]">
                  <BarChart3 className="w-4 h-4 text-[#819D94]" />
                  Charts are hidden for now
                </div>
                <p className="mt-2">
                  Click View details to reveal the weekly focus line chart, subject breakdown, and weekly sessions chart.
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-6 grid grid-cols-12 gap-6"
              >
                <div className="col-span-12 lg:col-span-8 bg-[#FDF9F5] rounded-xl p-5 border border-[#FDF9F5]">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-medium text-[#044B37]">Focus Time This Week</h3>
                      <p className="text-sm text-[#819D94] mt-1">Apr 7 - Apr 13, 2026</p>
                    </div>
                    <LineChartIcon className="w-5 h-5 text-[#819D94]" />
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#FDF9F5" />
                      <XAxis
                        dataKey="day"
                        tick={{ fill: "#819D94", fontSize: 13 }}
                        axisLine={{ stroke: "#FDF9F5" }}
                      />
                      <YAxis
                        tick={{ fill: "#819D94", fontSize: 13 }}
                        axisLine={{ stroke: "#FDF9F5" }}
                        label={{ value: "Minutes", angle: -90, position: "insideLeft", fill: "#819D94" }}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: "white", border: "1px solid #FDF9F5", borderRadius: "8px" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="minutes"
                        stroke="#819D94"
                        strokeWidth={2.5}
                        dot={{ fill: "#819D94", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="col-span-12 lg:col-span-4 space-y-6">
                  <div className="bg-[#FDF9F5] rounded-xl p-5 border border-[#FDF9F5]">
                    <h3 className="font-medium text-[#044B37] mb-4">This Month</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#819D94]">Total Sessions</span>
                        <span className="font-medium text-[#044B37]">29</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#819D94]">Avg per Day</span>
                        <span className="font-medium text-[#044B37]">2.3</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#819D94]">Best Streak</span>
                        <span className="font-medium text-[#044B37]">7 days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#819D94]">Completion Rate</span>
                        <span className="font-medium text-[#819D94]">87%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-[#819D94]/16 to-[#B57677]/20 rounded-xl p-5 border border-[#B57677]/30 ring-2 ring-white text-center">
                    <div className="text-3xl mb-2 opacity-80">🎯</div>
                    <h3 className="font-medium text-[#044B37] mb-1">Keep Going!</h3>
                    <p className="text-sm text-[#819D94]">3 more missions to unlock a special reward!</p>
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-6 bg-[#FDF9F5] rounded-xl p-5 border border-[#FDF9F5]">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-medium text-[#044B37]">Missions by Subject</h3>
                    <BarChart3 className="w-5 h-5 text-[#819D94]" />
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={missionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#FDF9F5" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#819D94", fontSize: 13 }}
                        axisLine={{ stroke: "#FDF9F5" }}
                      />
                      <YAxis
                        tick={{ fill: "#819D94", fontSize: 13 }}
                        axisLine={{ stroke: "#FDF9F5" }}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: "white", border: "1px solid #FDF9F5", borderRadius: "8px" }}
                      />
                      <Bar dataKey="completed" fill="#819D94" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="col-span-12 lg:col-span-6 bg-[#FDF9F5] rounded-xl p-5 border border-[#FDF9F5]">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-medium text-[#044B37]">Weekly Sessions</h3>
                    <ChevronDown className="w-5 h-5 text-[#819D94] rotate-[-90deg]" />
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#FDF9F5" />
                      <XAxis
                        dataKey="week"
                        tick={{ fill: "#819D94", fontSize: 13 }}
                        axisLine={{ stroke: "#FDF9F5" }}
                      />
                      <YAxis
                        tick={{ fill: "#819D94", fontSize: 13 }}
                        axisLine={{ stroke: "#FDF9F5" }}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: "white", border: "1px solid #FDF9F5", borderRadius: "8px" }}
                      />
                      <Bar dataKey="sessions" fill="#819D94" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}



