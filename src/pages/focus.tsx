import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, SkipForward } from "lucide-react";
import "../assets/focus.css";

export default function Focus() {
	const navigate = useNavigate();
	const [timeLeft, setTimeLeft] = useState(25 * 60);
	const [isRunning, setIsRunning] = useState(false);
	const [sessionType, setSessionType] = useState<"Focus" | "Break">("Focus");

	useEffect(() => {
		let interval: ReturnType<typeof setInterval>;
		if (isRunning && timeLeft > 0) {
			interval = setInterval(() => {
				setTimeLeft((prev) => prev - 1);
			}, 1000);
		} else if (timeLeft === 0 && isRunning) {
			setIsRunning(false);
			if (sessionType === "Focus") {
				setSessionType("Break");
				setTimeLeft(5 * 60);
			} else {
				navigate("/reward");
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

	const progress = ((sessionType === "Focus" ? 25 * 60 : 5 * 60) - timeLeft) / (sessionType === "Focus" ? 25 * 60 : 5 * 60) * 100;
	const circumference = 2 * Math.PI * 180;
	const strokeDashoffset = circumference * (1 - progress / 100);

	return (
		<div className="focus-page">
			<div className="focus-container">
				<header className="focus-header">
					<button className="back-btn" onClick={() => navigate("/dashboard")}>
						<ArrowLeft className="icon" />
					</button>
					<div className="session-badge">
						<span>{sessionType} Time</span>
					</div>
					<div style={{ width: "48px" }} />
				</header>

				<div className="focus-content">
					<div className="focus-intro">
						<h2>Math Practice</h2>
						<p>Stay focused and do your best!</p>
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
									strokeDashoffset: strokeDashoffset,
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
							{isRunning ? (
								<Pause className="icon-large" />
							) : (
								<Play className="icon-large" />
							)}
						</button>
					</div>

					<div className="action-buttons">
						<button className="action-btn finish-btn" onClick={finishSession}>
							<SkipForward className="icon-sm" />
							<span>Finish Session</span>
						</button>
						<button className="action-btn back-btn-alt" onClick={() => navigate("/dashboard")}>
							<span>Go Back</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
