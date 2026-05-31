import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Play, Pause, SkipForward, Check } from "lucide-react";
import type { Mission, Subtask } from "../types";
import { awardXp } from "../utils/rewards";
import { loadFocusPreferences } from "../utils/preferences";
import { getBreakDurationSeconds, getFocusDurationSeconds } from "../utils/focusRhythm";
import "../assets/focus.css";

export default function Focus() {
	const navigate = useNavigate();
	const location = useLocation();
	const state = (location && (location.state as { mission?: Mission })) || {};
	const mission = state.mission || null;
	const preferences = loadFocusPreferences();
	const focusDuration = getFocusDurationSeconds(mission, preferences);
	const breakDuration = getBreakDurationSeconds(preferences);
	const [timeLeft, setTimeLeft] = useState(() => focusDuration);
	const [isRunning, setIsRunning] = useState(false);
	const [sessionType, setSessionType] = useState<"Focus" | "Break">("Focus");
	const [subtasks, setSubtasks] = useState<Subtask[]>(() =>
		mission?.subtasks ? mission.subtasks.map((s) => ({ ...s })) : [],
	);
	const [showCongrats, setShowCongrats] = useState(false);
	const timerRewardClaimedRef = useRef(false);
	const timerRewardEventKeyRef = useRef<string | null>(null);

	useEffect(() => {
		let interval: ReturnType<typeof setInterval> | undefined;
		if (isRunning) {
			interval = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						setIsRunning(false);
						if (sessionType === "Focus") {
							setSessionType("Break");
							return breakDuration;
						}
						navigate("/child/reward");
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		}
		return () => {
			if (interval) clearInterval(interval);
		};
	}, [breakDuration, isRunning, navigate, sessionType]);

	useEffect(() => {
		if (sessionType !== "Break" || timerRewardClaimedRef.current) return;

		timerRewardClaimedRef.current = true;
		if (!timerRewardEventKeyRef.current) {
			timerRewardEventKeyRef.current = `timer:focus:${mission?.id || "free"}:${Date.now()}`;
		}

		awardXp(30, "Completed focus timer", timerRewardEventKeyRef.current).catch((e) => console.error(e));
	}, [mission?.id, sessionType]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	};

	const toggleTimer = () => {
		setIsRunning((prev) => !prev);
	};

	const finishSession = () => {
		const allDone = subtasks.length > 0 && subtasks.every((s) => s.completed);
		if (allDone) {
			setShowCongrats(true);
			setTimeout(() => navigate("/child/reward"), 1200);
			return;
		}
		navigate("/child/reward");
	};

	const toggleSubtask = (id: number) => {
		setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)));
	};

	const currentDuration = sessionType === "Focus" ? focusDuration : breakDuration;
	const progress = currentDuration > 0 ? ((currentDuration - timeLeft) / currentDuration) * 100 : 0;
	const circumference = 2 * Math.PI * 180;
	const strokeDashoffset = circumference * (1 - progress / 100);

	return (
		<div className="focus-page">
			<div className="focus-container">
				<header className="focus-header">
					<button className="back-btn" onClick={() => navigate("/child/dashboard")}>
						<ArrowLeft className="icon" />
					</button>
					<div className="session-badge">
						<span>{sessionType} Time</span>
					</div>
					<div style={{ width: "48px" }} />
				</header>

				<div className="focus-content">
					<div className="focus-intro">
						<h2>{mission?.title || "Math Practice"}</h2>
						<p>{mission ? "Let's finish this mission step by step!" : "Stay focused and do your best!"}</p>
					</div>

					<div className="timer-circle">
						<svg viewBox="0 0 400 400" className="progress-svg">
							<circle cx="200" cy="200" r="180" className="progress-bg" />
							<circle
								cx="200"
								cy="200"
								r="180"
								className="progress-fill"
								style={{
									strokeDashoffset,
									strokeDasharray: circumference,
								}}
							/>
						</svg>
						<div className="timer-display">
							<div className="timer-value">{formatTime(timeLeft)}</div>
							<div className="timer-label">minutes remaining</div>
						</div>
					</div>

					<div className="control-buttons">
						<button
							className={`play-btn ${isRunning ? "paused" : "playing"}`}
							onClick={toggleTimer}
						>
							{isRunning ? <Pause className="icon-large" /> : <Play className="icon-large" />}
						</button>
					</div>

					<div className="action-buttons">
						<button className="action-btn finish-btn" onClick={finishSession}>
							<SkipForward className="icon-sm" />
							<span>Finish Session</span>
						</button>
						<button className="action-btn back-btn-alt" onClick={() => navigate("/child/dashboard")}>
							<span>Go Back</span>
						</button>
					</div>

					{subtasks.length > 0 && (
						<div className="subtasks-panel">
							<h4>Steps</h4>
							{subtasks.map((s) => (
								<div key={s.id} className="child-subtask-row">
									<button className={`checkbox ${s.completed ? "checked" : ""}`} onClick={() => toggleSubtask(s.id)}>
										{s.completed && <Check className="check-icon" />}
									</button>
									<span className={s.completed ? "subtask-text done" : "subtask-text"}>{s.title}</span>
								</div>
							))}
						</div>
					)}

					{showCongrats && <div className="congrats-banner">Great job! 🎉</div>}
				</div>
			</div>
		</div>
	);
}
