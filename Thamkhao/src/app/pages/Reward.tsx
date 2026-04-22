import { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { Star, Trophy, Sparkles, ArrowRight } from "lucide-react";

export default function Reward() {
  const navigate = useNavigate();

  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#4A90E2", "#6FCF97", "#F2994A", "#8AB4F8"],
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#4A90E2", "#6FCF97", "#F2994A", "#8AB4F8"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="min-h-screen bg-[#F2994A] flex items-center justify-center">
      <div className="w-full max-w-2xl px-12 space-y-10">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 150, delay: 0.2 }}
          className="text-center"
        >
          <div className="text-9xl mb-4">🏆</div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl font-bold text-white mb-2"
          >
            Amazing Job!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-white/90"
          >
            You completed your focus session!
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 space-y-6"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-6">You Earned:</h2>
            <div className="grid grid-cols-3 gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
                className="bg-white rounded-2xl p-4 text-center"
              >
                <div className="w-12 h-12 bg-[#F2994A] rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-[#1F2937]">+25</div>
                <div className="text-xs text-[#6B7280]">Stars</div>
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.1, type: "spring" }}
                className="bg-white rounded-2xl p-4 text-center"
              >
                <div className="w-12 h-12 bg-[#4A90E2] rounded-full flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-[#1F2937]">+50</div>
                <div className="text-xs text-[#6B7280]">XP</div>
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2, type: "spring" }}
                className="bg-white rounded-2xl p-4 text-center"
              >
                <div className="w-12 h-12 bg-[#6FCF97] rounded-full flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-[#1F2937]">NEW</div>
                <div className="text-xs text-[#6B7280]">Badge</div>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="bg-white/30 rounded-2xl p-4 text-center"
          >
            <div className="text-4xl mb-2">🎖️</div>
            <div className="text-white font-semibold">Focus Champion Badge Unlocked!</div>
            <div className="text-white/80 text-sm">Complete 5 focus sessions</div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/dashboard")}
            className="w-full bg-white text-[#F2994A] rounded-2xl py-4 px-6 shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
          >
            <span className="text-lg font-semibold">Continue</span>
            <ArrowRight className="w-6 h-6" />
          </motion.button>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/dashboard")}
            className="w-full bg-white/20 backdrop-blur-sm text-white rounded-2xl py-3 px-6 hover:bg-white/30 transition-colors font-medium"
          >
            Back to Dashboard
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
