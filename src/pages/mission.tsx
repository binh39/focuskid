import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	ChevronDown,
	ChevronUp,
	Plus,
	Check,
	Play,
	Edit,
	Trash2,
	Clock,
} from "lucide-react";
import NavBar from "../components/NavBar";
import type { Mission } from "../types";
import "../assets/mission.css";

export default function Mission() {
	const navigate = useNavigate();
	const [missions, setMissions] = useState<(Mission & { expanded: boolean })[]>([]);

	useEffect(() => {
		fetch("http://localhost:4000/api/missions")
			.then((r) => r.json())
			.then((data: Mission[]) =>
				setMissions(data.map((m) => ({ ...m, expanded: false }))),
			)
			.catch((e) => console.error(e));
	}, []);

	const toggleMission = (id: number) => {
		setMissions((prev) => prev.map((m) => (m.id === id ? { ...m, expanded: !m.expanded } : m)));
	};

	const toggleSubtask = (missionId: number, subtaskId: number) => {
		setMissions((prev) =>
			prev.map((m) =>
				m.id === missionId
					? {
							...m,
							subtasks: m.subtasks.map((s) =>
								s.id === subtaskId ? { ...s, completed: !s.completed } : s,
							),
						}
					: m,
			),
		);
	};

	const getCompletionCount = (mission: Mission) => {
		const total = mission.subtasks?.length || 0;
		const completed = mission.subtasks?.filter((s) => s.completed).length || 0;
		return total === 0 ? "0/0" : `${completed}/${total}`;
	};

	const getCompletionPercentage = (mission: Mission) => {
		const total = mission.subtasks?.length || 0;
		const completed = mission.subtasks?.filter((s) => s.completed).length || 0;
		return total === 0 ? 0 : (completed / total) * 100;
	};

	const summary = useMemo(() => {
		const completed = missions.filter((m) => getCompletionPercentage(m) === 100).length;
		const inProgress = missions.filter((m) => {
			const p = getCompletionPercentage(m);
			return p > 0 && p < 100;
		}).length;
		const notStarted = missions.filter((m) => getCompletionPercentage(m) === 0).length;
		return { completed, inProgress, notStarted };
	}, [missions]);

	return (
		<div className="mission-page">
			<NavBar />
			<main className="mission-container">
				<div className="mission-layout">
					<section className="mission-main">
						<div className="mission-header">
							<div>
								<h1>My Missions</h1>
								<p>Manage and track your learning tasks</p>
							</div>
							<button type="button" className="add-mission-btn" onClick={() => navigate("/parent")}
								aria-label="Go to parent dashboard to assign missions">
								<Plus className="icon-sm" />
								<span>Go to Parent Dashboard</span>
							</button>
						</div>

						<div className="mission-cards">
							{missions.length === 0 && (
								<div className="panel tip">
									<h3>No missions yet</h3>
									<p>Please ask a parent to assign a mission first.</p>
								</div>
							)}
							{missions.map((mission, index) => (
								<article className="mission-card" key={mission.id} style={{ animationDelay: `${index * 0.05}s` }}>
									<div className="mission-top-row">
										<div className="mission-emoji">{mission.icon || "📝"}</div>
										<div className="mission-detail-block">
											<div className="mission-title-row">
												<div>
													<h3>{mission.title}</h3>
													<div className="mission-meta">
														<span>Assigned Task</span>
														<span>•</span>
														<span className="clock-wrap">
															<Clock className="icon-xs" />
															<span>{mission.time_minutes ? `${mission.time_minutes} min` : mission.time}</span>
														</span>
													</div>
												</div>

												<div className="mission-actions">
													<button type="button" className="icon-btn">
														<Edit className="icon-xs" />
													</button>
													<button type="button" className="icon-btn danger">
														<Trash2 className="icon-xs" />
													</button>
													<button type="button" className="icon-btn" onClick={() => toggleMission(mission.id)}>
														{mission.expanded ? <ChevronUp className="icon-sm" /> : <ChevronDown className="icon-sm" />}
													</button>
												</div>
											</div>

											<div className="mission-progress-row">
												<div className="progress-track">
													<div
														className="progress-fill"
														style={{ width: `${getCompletionPercentage(mission)}%`, backgroundColor: mission.color }}
													/>
												</div>
												<strong>{getCompletionCount(mission)}</strong>
											</div>

											<div className={mission.expanded ? "subtasks expanded" : "subtasks"}>
												{mission.subtasks.map((subtask) => (
													<div className="subtask-row" key={subtask.id}>
														<button
															type="button"
															onClick={() => toggleSubtask(mission.id, subtask.id)}
															className={subtask.completed ? "checkbox checked" : "checkbox"}
														>
															{subtask.completed && <Check className="check-icon" />}
														</button>
														<span className={subtask.completed ? "subtask-text done" : "subtask-text"}>{subtask.title}</span>
													</div>
												))}

												<button
													type="button"
													className="start-btn"
													style={{ backgroundColor: mission.color || "#8FB8A8" }}
													onClick={() => navigate("/focus", { state: { mission } })}
												>
													<Play className="icon-xs" />
													<span>Start This Mission</span>
												</button>
											</div>
										</div>
									</div>
								</article>
							))}
						</div>
					</section>

					<aside className="mission-side">
						<div className="panel">
							<h3>Mission Summary</h3>
							<div className="summary-list">
								<div className="summary-row">
									<span>Total Missions</span>
									<strong>{missions.length}</strong>
								</div>
								<div className="summary-row">
									<span>Completed</span>
									<strong className="green">{summary.completed}</strong>
								</div>
								<div className="summary-row">
									<span>In Progress</span>
									<strong className="blue">{summary.inProgress}</strong>
								</div>
								<div className="summary-row">
									<span>Not Started</span>
									<strong className="orange">{summary.notStarted}</strong>
								</div>
							</div>
						</div>

						<div className="panel tip">
							<h3>Quick Tip 💡</h3>
							<p>
								Break large tasks into smaller steps to make them easier to complete and track your progress better!
							</p>
						</div>
					</aside>
				</div>
			</main>
		</div>
	);
}
