import { useState } from "react";
import { Award, Calendar, ChevronDown, Clock, Target, TrendingUp, Zap } from "lucide-react";
import NavBar from "../components/NavBar";
import "../assets/progress.css";

const weeklyData = [
	{ day: "Mon", minutes: 45 },
	{ day: "Tue", minutes: 60 },
	{ day: "Wed", minutes: 30 },
	{ day: "Thu", minutes: 75 },
	{ day: "Fri", minutes: 50 },
	{ day: "Sat", minutes: 40 },
	{ day: "Sun", minutes: 55 },
];

const missionData = [
	{ name: "Math", completed: 12 },
	{ name: "Reading", completed: 8 },
	{ name: "Science", completed: 10 },
	{ name: "Writing", completed: 6 },
];

const monthlyData = [
	{ week: "Week 1", sessions: 5 },
	{ week: "Week 2", sessions: 8 },
	{ week: "Week 3", sessions: 6 },
	{ week: "Week 4", sessions: 10 },
];

function buildLinePoints(max: number): string {
	const width = 640;
	const height = 220;
	const startX = 40;
	const endX = width - 40;
	const stepX = (endX - startX) / (weeklyData.length - 1);
	const points = weeklyData
		.map((item, index) => {
			const x = startX + stepX * index;
			const y = height - (item.minutes / max) * 170 - 20;
			return `${x},${y}`;
		})
		.join(" ");
	return points;
}

export default function Progress() {
	const [showDetails, setShowDetails] = useState(false);
	const maxWeekly = Math.max(...weeklyData.map((x) => x.minutes));
	const linePoints = buildLinePoints(maxWeekly);
	const weeklyAverage = Math.round(weeklyData.reduce((sum, item) => sum + item.minutes, 0) / weeklyData.length);
	const bestDay = weeklyData.reduce((best, item) => (item.minutes > best.minutes ? item : best), weeklyData[0]);
	const topSubject = missionData.reduce((best, item) => (item.completed > best.completed ? item : best), missionData[0]);

	return (
		<div className="progress-page">
			<NavBar />

			<main className="progress-container">
				<header className="progress-header">
					<h1>Your Progress</h1>
					<p>Track your learning journey and achievements</p>
				</header>

				<section className="metric-grid">
					<article className="metric-card">
						<div className="metric-icon blue">
							<Clock className="icon" />
						</div>
						<h2>355</h2>
						<p>Total Minutes</p>
						<small>
							<TrendingUp className="icon-xs" /> 12% this week
						</small>
					</article>

					<article className="metric-card">
						<div className="metric-icon green">
							<Target className="icon" />
						</div>
						<h2>36</h2>
						<p>Missions Done</p>
						<small>
							<TrendingUp className="icon-xs" /> 8 this week
						</small>
					</article>

					<article className="metric-card">
						<div className="metric-icon orange">
							<Zap className="icon" />
						</div>
						<h2>7</h2>
						<p>Day Streak</p>
						<small>Keep it up!</small>
					</article>

					<article className="metric-card">
						<div className="metric-icon sky">
							<Award className="icon" />
						</div>
						<h2>12</h2>
						<p>Badges Earned</p>
						<small>3 new!</small>
					</article>
				</section>

				<section className="card glance-card">
					<div className="glance-header">
						<div>
							<h3>At a glance</h3>
							<p>Summary first. Open charts when you need details.</p>
						</div>
						<button type="button" className="detail-toggle-btn" onClick={() => setShowDetails(!showDetails)}>
							{showDetails ? "Hide detail" : "View detail"}
							<ChevronDown className={`icon-xs detail-chevron ${showDetails ? "rotated" : ""}`} />
						</button>
					</div>

					<div className="glance-grid">
						<div className="glance-item">
							<span>Weekly average</span>
							<strong>{weeklyAverage} min</strong>
						</div>
						<div className="glance-item">
							<span>Best day</span>
							<strong>{bestDay.day}</strong>
							<small>{bestDay.minutes} min focused</small>
						</div>
						<div className="glance-item">
							<span>Top subject</span>
							<strong>{topSubject.name}</strong>
							<small>{topSubject.completed} missions done</small>
						</div>
					</div>
				</section>

				{showDetails && <section className="main-grid">
					<article className="card line-chart-card">
						<div className="card-title-row">
							<h3>Focus Time This Week</h3>
							<div className="date-range">
								<Calendar className="icon-xs" />
								<span>Apr 7 - Apr 13, 2026</span>
							</div>
						</div>

						<div className="line-chart-wrap">
							<svg viewBox="0 0 640 220" className="line-chart" role="img" aria-label="Focus time line chart">
								<polyline points={linePoints} />
								{weeklyData.map((item, index) => {
									const x = 40 + (560 / (weeklyData.length - 1)) * index;
									const y = 220 - (item.minutes / maxWeekly) * 170 - 20;
									return <circle key={item.day} cx={x} cy={y} r="5" />;
								})}
							</svg>
							<div className="x-labels">
								{weeklyData.map((item) => (
									<span key={item.day}>{item.day}</span>
								))}
							</div>
						</div>
					</article>

					<aside className="right-panels">
						<article className="card month-card">
							<h3>This Month</h3>
							<div className="kv-list">
								<div><span>Total Sessions</span><strong>29</strong></div>
								<div><span>Avg per Day</span><strong>2.3</strong></div>
								<div><span>Best Streak</span><strong>7 days</strong></div>
								<div><span>Completion Rate</span><strong className="green">87%</strong></div>
							</div>
						</article>

						<article className="motivate-card">
							<div className="emoji">🎯</div>
							<h3>Keep Going!</h3>
							<p>3 more missions to unlock a special reward!</p>
						</article>
					</aside>
				</section>}

				{showDetails && <section className="bottom-grid">
					<article className="card bar-card">
						<h3>Missions by Subject</h3>
						<div className="bars">
							{missionData.map((item) => (
								<div className="bar-row" key={item.name}>
									<span>{item.name}</span>
									<div className="bar-track">
										<div className="bar-fill blue" style={{ width: `${(item.completed / 12) * 100}%` }} />
									</div>
									<strong>{item.completed}</strong>
								</div>
							))}
						</div>
					</article>

					<article className="card bar-card">
						<h3>Weekly Sessions</h3>
						<div className="bars">
							{monthlyData.map((item) => (
								<div className="bar-row" key={item.week}>
									<span>{item.week}</span>
									<div className="bar-track">
										<div className="bar-fill green" style={{ width: `${(item.sessions / 10) * 100}%` }} />
									</div>
									<strong>{item.sessions}</strong>
								</div>
							))}
						</div>
					</article>
				</section>}
			</main>
		</div>
	);
}
