import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Coffee, Droplet, Wind, Smile, ArrowRight, SkipForward } from "lucide-react";

export default function BreakScreen() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [isBreakActive, setIsBreakActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBreakActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isBreakActive) {
      navigate("/dashboard");
    }
    return () => clearInterval(interval);
  }, [isBreakActive, timeLeft, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const activities = [
    { icon: Coffee, label: "Drink water", color: "#4A90E2" },
    { icon: Wind, label: "Deep breathing", color: "#6FCF97" },
    { icon: Smile, label: "Stretch your body", color: "#F2994A" },
  ];

  return (
    <div className="min-h-screen bg-[#6FCF97] flex items-center justify-center">
      <div className="w-full max-w-2xl px-12 space-y-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-center"
        >
          <div className="text-8xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-white mb-2">Great Work!</h1>
          <p className="text-xl text-white/90">Time for a quick break</p>
        </motion.div>

        {!isBreakActive ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 space-y-6"
          >
            <div className="text-center">
              <div className="text-6xl font-bold text-white mb-2">{formatTime(timeLeft)}</div>
              <div className="text-white/80">Break time ready</div>
            </div>

            <div className="space-y-3">
              <p className="text-white font-semibold text-center">Try these activities:</p>
              <div className="grid gap-3">
                {activities.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="rounded-2xl p-4 flex items-center gap-3 text-white"
                    style={{ backgroundColor: activity.color }}
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <activity.icon className="w-6 h-6" />
                    </div>
                    <span className="font-semibold">{activity.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsBreakActive(true)}
              className="w-full bg-white text-[#6FCF97] rounded-2xl py-4 px-6 shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
            >
              <span className="text-lg">Start Break</span>
              <ArrowRight className="w-6 h-6" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/dashboard")}
              className="w-full bg-white/20 backdrop-blur-sm text-white rounded-2xl py-4 px-6 hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
            >
              <SkipForward className="w-5 h-5" />
              <span>Skip Break</span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 space-y-6 text-center"
          >
            <Droplet className="w-16 h-16 text-white mx-auto animate-bounce" />
            <div>
              <div className="text-6xl font-bold text-white mb-2">{formatTime(timeLeft)}</div>
              <div className="text-white/80">Relax and recharge</div>
            </div>

            <div className="space-y-2">
              <p className="text-white text-lg">Take deep breaths</p>
              <div className="flex justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 1,
                    }}
                    className="w-3 h-3 bg-white rounded-full"
                  />
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/dashboard")}
              className="w-full bg-white text-[#6EE7B7] rounded-2xl py-4 px-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              Continue Learning
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
