import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Sparkles, Mail, Chrome, Award, Target, Trophy } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/dashboard");
  };

  const features = [
    { icon: Target, title: "Focus Sessions", desc: "Pomodoro timer to stay on track" },
    { icon: Trophy, title: "Earn Rewards", desc: "Unlock badges and achievements" },
    { icon: Award, title: "Track Progress", desc: "See your learning journey" },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="w-full max-w-[1200px] mx-auto px-12 py-16 bg-[#819D94] rounded-[2rem] shadow-2xl overflow-hidden">
        <div className="grid grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-white">FocusKid</h1>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-3">Stay focused, earn rewards, and finish your mission!</h2>
              <p className="text-xl text-white/80">A playful learning platform designed for young learners with ADHD</p>
            </div>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{feature.title}</div>
                    <div className="text-sm text-white/70">{feature.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-3xl shadow-2xl p-10 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-[#044B37]">Welcome Back!</h2>
                <p className="text-[#819D94]">Sign in to continue your learning adventure</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleLogin}
                  className="w-full bg-white border-2 border-[#FDF9F5] hover:border-[#819D94] rounded-xl py-3 px-5 flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md"
                >
                  <Chrome className="w-5 h-5 text-[#819D94]" />
                  <span className="text-[#044B37]">Sign in with Google</span>
                </button>

                <button
                  onClick={handleLogin}
                  className="w-full bg-white border-2 border-[#FDF9F5] hover:border-[#819D94] rounded-xl py-3 px-5 flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md"
                >
                  <Mail className="w-5 h-5 text-[#819D94]" />
                  <span className="text-[#044B37]">Sign in with Email</span>
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#FDF9F5]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-[#819D94]">or</span>
                </div>
              </div>

              <button
                onClick={handleLogin}
                className="w-full bg-[#DD2203] text-white rounded-xl py-3 px-5 shadow-lg hover:bg-[#7C1419] hover:shadow-xl transition-shadow"
              >
                Start Learning
              </button>

              <div className="flex items-center justify-between text-sm pt-2">
                <button className="text-[#819D94] hover:text-[#819D94] transition-colors">
                  Forgot password?
                </button>
                <button
                  onClick={handleLogin}
                  className="text-[#819D94] hover:underline"
                >
                  Create account
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}



