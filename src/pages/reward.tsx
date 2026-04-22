import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { Star, Trophy, Sparkles, ArrowRight } from "lucide-react";
import "../assets/reward.css";

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
		<div className="reward-page">
			<div className="reward-container">
				<motion.div
					initial={{ scale: 0, rotate: -180 }}
					animate={{ scale: 1, rotate: 0 }}
					transition={{ type: "spring", stiffness: 150, delay: 0.2 }}
					className="reward-hero"
				>
					<div className="trophy-emoji">🏆</div>
					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
						className="reward-title"
					>
						Amazing Job!
					</motion.h1>
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.6 }}
						className="reward-subtitle"
					>
						You completed your focus session!
					</motion.p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.8 }}
					className="reward-card"
				>
					<div className="reward-section">
						<h2 className="reward-section-title">You Earned:</h2>
						<div className="reward-grid">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 1, type: "spring" }}
								className="reward-item"
							>
								<div className="reward-icon orange">
									<Star className="icon" />
								</div>
								<div className="reward-value">+25</div>
								<div className="reward-label">Stars</div>
							</motion.div>

							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 1.1, type: "spring" }}
								className="reward-item"
							>
								<div className="reward-icon blue">
									<Sparkles className="icon" />
								</div>
								<div className="reward-value">+50</div>
								<div className="reward-label">XP</div>
							</motion.div>

							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 1.2, type: "spring" }}
								className="reward-item"
							>
								<div className="reward-icon green">
									<Trophy className="icon" />
								</div>
								<div className="reward-value">NEW</div>
								<div className="reward-label">Badge</div>
							</motion.div>
						</div>
					</div>

					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1.4 }}
						className="badge-unlock"
					>
						<div className="badge-emoji">🎖️</div>
						<div className="badge-name">Focus Champion Badge Unlocked!</div>
						<div className="badge-desc">Complete 5 focus sessions</div>
					</motion.div>

					<div className="button-group">
						<motion.button
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 1.6 }}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							onClick={() => navigate("/dashboard")}
							className="reward-btn primary"
						>
							<span>Continue</span>
							<ArrowRight className="icon-sm" />
						</motion.button>

						<motion.button
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 1.7 }}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							onClick={() => navigate("/dashboard")}
							className="reward-btn secondary"
						>
							Back to Dashboard
						</motion.button>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
