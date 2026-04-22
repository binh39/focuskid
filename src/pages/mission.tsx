import { useMemo, useState } from "react";
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
import "../assets/mission.css";

type Subtask = {
	id: number;
	title: string;
	completed: boolean;
};

type MissionItem = {
	id: number;
	title: string;
	icon: string;
	color: string;
	category: string;
	time: string;
	expanded: boolean;
	subtasks: Subtask[];
};

export default function Mission() {
	const navigate = useNavigate();
	const [missions, setMissions] = useState<MissionItem[]>([
		{
			id: 1,
			title: "Math Practice",
			icon: "📐",
			color: "#4A90E2",
			category: "Mathematics",
			time: "20 min",
			expanded: false,
			subtasks: [
				{ id: 1, title: "Complete multiplication tables", completed: true },
				{ id: 2, title: "Solve word problems (5 questions)", completed: true },
				{ id: 3, title: "Practice fractions exercises", completed: false },
			],
		},
		{
			id: 2,
			title: "Reading Time",
			icon: "📚",
			color: "#6FCF97",
			category: "Language Arts",
			time: "15 min",
			expanded: false,
			subtasks: [
				{ id: 1, title: "Read Chapter 3", completed: false },
				{ id: 2, title: "Write 3 vocabulary words", completed: false },
				{ id: 3, title: "Answer comprehension questions", completed: false },
			],
		},
		{
			id: 3,
			title: "Science Quiz",
			icon: "🔬",
			color: "#F2994A",
			category: "Science",
			time: "10 min",
			expanded: false,
			subtasks: [
				{ id: 1, title: "Study plant parts diagram", completed: true },
				{ id: 2, title: "Complete quiz on photosynthesis", completed: true },
				{ id: 3, title: "Watch educational video", completed: true },
				{ id: 4, title: "Review notes", completed: false },
			],
		},
		{
			id: 4,
			title: "Writing Assignment",
			icon: "✏️",
			color: "#8AB4F8",
			category: "Language Arts",
			time: "25 min",
			expanded: false,
			subtasks: [
				{ id: 1, title: "Brainstorm ideas", completed: false },
				{ id: 2, title: "Write first draft", completed: false },
				{ id: 3, title: "Proofread and edit", completed: false },
			],
		},
	]);

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

	const getCompletionCount = (mission: MissionItem) => {
		const completed = mission.subtasks.filter((s) => s.completed).length;
		return `${completed}/${mission.subtasks.length}`;
	};

	const getCompletionPercentage = (mission: MissionItem) => {
		const completed = mission.subtasks.filter((s) => s.completed).length;
		return (completed / mission.subtasks.length) * 100;
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
							<button type="button" className="add-mission-btn">
								<Plus className="icon-sm" />
								<span>Add Mission</span>
							</button>
						</div>

						<div className="mission-cards">
							{missions.map((mission, index) => (
								<article className="mission-card" key={mission.id} style={{ animationDelay: `${index * 0.05}s` }}>
									<div className="mission-top-row">
										<div className="mission-emoji">{mission.icon}</div>
										<div className="mission-detail-block">
											<div className="mission-title-row">
												<div>
													<h3>{mission.title}</h3>
													<div className="mission-meta">
														<span>{mission.category}</span>
														<span>•</span>
														<span className="clock-wrap">
															<Clock className="icon-xs" />
															<span>{mission.time}</span>
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
													style={{ backgroundColor: mission.color }}
													onClick={() => navigate("/focus")}
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

						<div className="panel">
							<h3>Categories</h3>
							<div className="categories">
								<div className="cat-row">
									<div>
										<span className="dot math" />
										<span>Mathematics</span>
									</div>
									<strong>1</strong>
								</div>
								<div className="cat-row">
									<div>
										<span className="dot language" />
										<span>Language Arts</span>
									</div>
									<strong>2</strong>
								</div>
								<div className="cat-row">
									<div>
										<span className="dot science" />
										<span>Science</span>
									</div>
									<strong>1</strong>
								</div>
							</div>
						</div>
					</aside>
				</div>
			</main>
		</div>
	);
}
