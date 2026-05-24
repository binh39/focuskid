import { useState } from "react";
import { Award, Calendar, ChevronDown, Clock, Target, TrendingUp, Zap } from "lucide-react";
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

export default function ProgressView() {
  const [showDetails, setShowDetails] = useState(false);
  const maxWeekly = Math.max(...weeklyData.map((x) => x.minutes));
  const linePoints = buildLinePoints(maxWeekly);
  const weeklyAverage = Math.round(weeklyData.reduce((sum, item) => sum + item.minutes, 0) / weeklyData.length);
  const bestDay = weeklyData.reduce((best, item) => (item.minutes > best.minutes ? item : best), weeklyData[0]);
  const topSubject = missionData.reduce((best, item) => (item.completed > best.completed ? item : best), missionData[0]);

  return (
    <div className="progress-page">
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
            <p>Sessions Done</p>
            <small>
              <Zap className="icon-xs" /> 4 new today
            </small>
          </article>

          <article className="metric-card">
            <div className="metric-icon orange">
              <Award className="icon" />
            </div>
            <h2>18</h2>
            <p>Badges Earned</p>
            <small>
              <Calendar className="icon-xs" /> 3 this month
            </small>
          </article>
        </section>

        <section className="progress-chart">
          <header className="section-header">
            <h2>Weekly Focus Trend</h2>
            <button type="button" onClick={() => setShowDetails(!showDetails)}>
              Details <ChevronDown className={showDetails ? "icon-sm rotated" : "icon-sm"} />
            </button>
          </header>

          <div className="chart-wrap">
            <svg viewBox="0 0 640 220" className="chart-svg">
              <polyline points={linePoints} className="trend-line" />
            </svg>
            <div className="chart-labels">
              {weeklyData.map((item) => (
                <div key={item.day}>{item.day}</div>
              ))}
            </div>
          </div>

          {showDetails && (
            <div className="details-grid">
              <div>
                <h3>{weeklyAverage} min</h3>
                <p>Weekly Average</p>
              </div>
              <div>
                <h3>{bestDay.day}</h3>
                <p>Best Day</p>
              </div>
              <div>
                <h3>{topSubject.name}</h3>
                <p>Top Subject</p>
              </div>
            </div>
          )}
        </section>

        <section className="progress-grid">
          <div className="panel">
            <h2>Mission Breakdown</h2>
            <div className="panel-list">
              {missionData.map((item) => (
                <div className="panel-row" key={item.name}>
                  <span>{item.name}</span>
                  <strong>{item.completed}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h2>Monthly Sessions</h2>
            <div className="panel-list">
              {monthlyData.map((item) => (
                <div className="panel-row" key={item.week}>
                  <span>{item.week}</span>
                  <strong>{item.sessions}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
