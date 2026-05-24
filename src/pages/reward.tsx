import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { ArrowRight, Sparkles, Trophy } from "lucide-react";
import RankIcon from "../components/RankIcon";
import type { User } from "../types";
import { fetchCurrentUser, getRewardProfile, getStoredUser } from "../utils/rewards";
import "../assets/reward.css";

export default function Reward() {
	const navigate = useNavigate();
	const [user, setUser] = useState<User | null>(() => getStoredUser());
	const profile = getRewardProfile(user?.xp || 0);

	useEffect(() => {
		fetchCurrentUser()
			.then((latestUser) => setUser(latestUser))
			.catch((e) => console.error(e));

		const duration = 3000;
		const end = Date.now() + duration;

		const frame = () => {
			confetti({
				particleCount: 2,
				angle: 60,
				spread: 55,
				origin: { x: 0 },
				colors: ["#6A8F8C", "#8FB8A8", "#C9A86A", "#8AA3C9"],
			});
			confetti({
				particleCount: 2,
				angle: 120,
				spread: 55,
				origin: { x: 1 },
				colors: ["#6A8F8C", "#8FB8A8", "#C9A86A", "#8AA3C9"],
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
					<div className="trophy-emoji">
						<Trophy className="reward-trophy-icon" />
					</div>
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
						Your XP and rank progress have been updated.
					</motion.p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.8 }}
					className="reward-card"
				>
					<div className="reward-section">
						<h2 className="reward-section-title">Current Rewards</h2>
						<div className="rank-showcase" style={{ borderColor: profile.rank.color }}>
							<div className="rank-showcase-icon" style={{ backgroundColor: profile.rank.color }}>
								<RankIcon rank={profile.rank} className="rank-showcase-svg" />
							</div>
							<div className="rank-name" style={{ color: profile.rank.color }}>{profile.rank.name}</div>
							<div className="rank-progress-track">
								<div
									className="rank-progress-fill"
									style={{ width: `${profile.rankProgress}%`, backgroundColor: profile.rank.color }}
								/>
							</div>
							<div className="rank-next">
								{profile.nextRank ? `${profile.xpToNextRank} XP to ${profile.nextRank.name}` : "Top rank reached"}
							</div>
						</div>
						<div className="reward-grid">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 1, type: "spring" }}
								className="reward-item"
							>
								<div className="reward-icon orange" style={{ backgroundColor: profile.rank.color }}>
									<RankIcon rank={profile.rank} className="icon" />
								</div>
								<div className="reward-value">{profile.rank.name}</div>
								<div className="reward-label">Current Rank</div>
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
								<div className="reward-value">{profile.xp}</div>
								<div className="reward-label">Total XP</div>
							</motion.div>

							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 1.2, type: "spring" }}
								className="reward-item"
							>
								<div className="reward-icon green" style={{ backgroundColor: profile.nextRank?.color || profile.rank.color }}>
									{profile.nextRank ? <RankIcon rank={profile.nextRank} className="icon" /> : <Trophy className="icon" />}
								</div>
								<div className="reward-value">{profile.nextRank ? profile.nextRank.name : "Top"}</div>
								<div className="reward-label">Next Rank</div>
							</motion.div>
						</div>
					</div>

					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1.4 }}
						className="badge-unlock"
					>
						<div className="badge-emoji" style={{ color: profile.rank.color }}>
							<RankIcon rank={profile.rank} className="badge-rank-icon" />
						</div>
						<div className="badge-name">{profile.rank.name} Rank</div>
						<div className="badge-desc">
							{profile.nextRank ? `${profile.xpToNextRank} XP to ${profile.nextRank.name}` : "Top rank reached"}
						</div>
					</motion.div>

					<div className="button-group">
						<motion.button
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 1.6 }}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							onClick={() => navigate("/child/dashboard")}
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
							onClick={() => navigate("/child/progress")}
							className="reward-btn secondary"
						>
							View Progress
						</motion.button>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
