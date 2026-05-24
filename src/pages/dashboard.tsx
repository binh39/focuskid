import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Star, Trophy, Check, Play, Zap, ChevronDown, ChevronRight } from "lucide-react";
import NavBar from "../components/NavBar";
import AssignMission from "../components/AssignMission";
import type { Mission, Subtask } from "../types";
import "../assets/dashboard.css";

export default function Dashboard() {
	const navigate = useNavigate();
	const [expandedMissionId, setExpandedMissionId] = useState<number | null>(null);
	const [expandStats, setExpandStats] = useState(false);
	const [showAssign, setShowAssign] = useState(false);

	const [missions, setMissions] = useState<Mission[]>([]);

	useEffect(() => {
		fetch("http://localhost:4000/api/missions")
			.then((r) => r.json())
			.then((data: Mission[]) => setMissions(data))
			.catch((e) => console.error(e));
	}, []);

	const handleCreateMission = (m: Mission) => {
		setMissions((prev) => [m, ...prev]);
	};

	return (
		<div className="dashboard-page">
			<NavBar />

			<main className="dashboard-container">
				<div className="dashboard-grid">
					<section className="dashboard-main">
						<div className="card level-progress-card">
							<div className="title-row">
								<h2>Level Progress</h2>
								<span className="xp">1,240 / 1,500 XP</span>
							</div>
							<div className="progress-track">
								<div className="progress-fill" />
							</div>
							<p className="subtext">260 XP to Level 13 🎯</p>
						</div>

						<div className="missions-block">
							<div className="title-row">
								<h2 className="missions-heading">Today's Missions</h2>
								<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
									<button type="button" onClick={() => setShowAssign(true)} className="link-btn">
										Assign Mission
									</button>
									<button type="button" onClick={() => navigate("/mission")} className="link-btn">
										View all missions →
									</button>
								</div>
							</div>

							<div className="mission-list">
								{missions.map((mission) => (
									<article
										className={`card mission-card ${expandedMissionId === mission.id ? "expanded" : ""}`}
										key={mission.id}
									>
										<div className="mission-header-row">
											<div className="mission-icon">{mission.icon}</div>
											<div className="mission-content">
												<div className="mission-top">
													<h3>{mission.title}</h3>
													<div className="mission-time-toggle">
														<span>{mission.time}</span>
														<button
															type="button"
															className="mission-toggle"
															onClick={() => setExpandedMissionId(expandedMissionId === mission.id ? null : mission.id)}
															aria-label={expandedMissionId === mission.id ? `Collapse ${mission.title}` : `Expand ${mission.title}`}
														>
															<ChevronRight className={`icon-sm mission-chevron ${expandedMissionId === mission.id ? "rotated" : ""}`} />
														</button>
													</div>
												</div>
												<div className="mission-progress-row">
													<div className="progress-track slim">
														<div
															className="progress-fill colored"
															style={{ width: `${mission.progress}%`, backgroundColor: mission.color }}
														/>
													</div>
													<strong>{mission.progress}%</strong>
												</div>
											</div>
										</div>

										{expandedMissionId === mission.id && (
											<div className="mission-subtasks">
												{mission.subtasks.map((subtask: Subtask) => (
													<div className="subtask-row" key={subtask.id}>
														<button type="button" className={`checkbox ${subtask.completed ? "checked" : ""}`}>
															{subtask.completed && <Check className="check-icon" />}
														</button>
														<span className={subtask.completed ? "subtask-text done" : "subtask-text"}>{subtask.title}</span>
													</div>
												))}
												<button
													type="button"
													className="start-btn"
													style={{ backgroundColor: mission.color }}
													onClick={() => navigate("/focus", { state: { mission } })}
												>
													<Play className="icon-xs" />
													<span>Start This Mission</span>
												</button>
											</div>
										)}
									</article>
								))}
							</div>
						</div>

					</section>

					<aside className="dashboard-side">
						<div className="card stats-card">
							<div className="stats-header">
								<h3>Your Stats</h3>
								<button
									type="button"
									className="stats-toggle"
									onClick={() => setExpandStats(!expandStats)}
								>
									<ChevronDown className={`icon-sm stats-chevron ${expandStats ? "rotated" : ""}`} />
								</button>
							</div>

							<div className="stat-item">
								<div className="stat-icon orange">
									<Flame className="stat-svg" />
								</div>
								<div>
									<div className="stat-value">7 Days</div>
									<div className="stat-label">Current Streak</div>
								</div>
							</div>

							{expandStats && (
								<>
									<div className="stat-item">
										<div className="stat-icon green">
											<Trophy className="stat-svg" />
										</div>
										<div>
											<div className="stat-value">12</div>
											<div className="stat-label">Badges Unlocked</div>
										</div>
									</div>

									<div className="stat-item">
										<div className="stat-icon blue">
											<Star className="stat-svg" />
										</div>
										<div>
											<div className="stat-value">342</div>
											<div className="stat-label">Stars Earned</div>
										</div>
									</div>

									<div className="stat-item">
										<div className="stat-icon sky">
											<Zap className="stat-svg" />
										</div>
										<div>
											<div className="stat-value">36</div>
											<div className="stat-label">Missions Done</div>
										</div>
									</div>
								</>
							)}
							</div>

						<div className="motivation-card">
							<div className="emoji">🎯</div>
							<h3>Keep Going!</h3>
							<p>3 more missions to unlock a special reward</p>
						</div>
					</aside>
				</div>
			</main>

			{showAssign && <AssignMission onClose={() => setShowAssign(false)} onCreate={handleCreateMission} />}
		</div>
	);
}
