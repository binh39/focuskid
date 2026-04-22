import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Pause, Play, SkipForward, ArrowLeft } from "lucide-react";

export default function FocusTimer() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<"Focus" | "Break">("Focus");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (sessionType === "Focus") {
        navigate("/break");
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, sessionType, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const finishSession = () => {
    navigate("/reward");
  };

  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <div className="min-h-screen bg-[#4A90E2] flex items-center justify-center">
      <div className="w-full max-w-2xl px-12 space-y-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full">
            <span className="text-white font-semibold">{sessionType} Time</span>
          </div>
          <div className="w-12 h-12"></div>
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-3xl text-white/90 mb-3">Math Practice</h2>
          <p className="text-lg text-white/70">Stay focused and do your best!</p>
        </motion.div>

        <div className="relative max-w-md mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 400 400">
            <circle
              cx="200"
              cy="200"
              r="180"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="12"
            />
            <motion.circle
              cx="200"
              cy="200"
              r="180"
              fill="none"
              stroke="white"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 180}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 180 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 180 * (1 - progress / 100) }}
              transition={{ duration: 0.5 }}
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl font-bold text-white mb-3">{formatTime(timeLeft)}</div>
              <div className="text-xl text-white/70">minutes remaining</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTimer}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-shadow"
          >
            {isRunning ? (
              <Pause className="w-10 h-10 text-[#5B9FED]" />
            ) : (
              <Play className="w-10 h-10 text-[#5B9FED] ml-1" />
            )}
          </motion.button>
        </div>

        <div className="flex items-center justify-center gap-4 max-w-xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={finishSession}
            className="flex-1 bg-white/20 backdrop-blur-sm text-white rounded-xl py-4 px-6 hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
          >
            <SkipForward className="w-5 h-5" />
            <span className="font-medium">Finish Session</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/dashboard")}
            className="flex-1 bg-white/20 backdrop-blur-sm text-white rounded-xl py-4 px-6 hover:bg-white/30 transition-colors font-medium"
          >
            Go Back
          </motion.button>
        </div>
      </div>
    </div>
  );
}
