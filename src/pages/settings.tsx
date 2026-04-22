import { useState } from "react";
import {
	Volume2,
	VolumeX,
	Bell,
	BellOff,
	User,
	Shield,
} from "lucide-react";
import NavBar from "../components/NavBar";
import "../assets/settings.css";

export default function Settings() {
	const [focusLength, setFocusLength] = useState(25);
	const [breakLength, setBreakLength] = useState(5);
	const [soundEnabled, setSoundEnabled] = useState(true);
	const [notificationsEnabled, setNotificationsEnabled] = useState(true);

	return (
		<div className="settings-page">
			<NavBar />

			<main className="settings-container">
				<header className="settings-header">
					<h1>Settings</h1>
					<p>Customize your learning experience</p>
				</header>

				<div className="settings-layout">
					<section className="settings-main">
						<article className="settings-card">
							<div className="card-title">
								<User className="icon" />
								<h2>Session Preferences</h2>
							</div>

							<div className="range-grid">
								<div className="range-block">
									<label>Focus Session Length</label>
									<div className="range-row">
										<input
											type="range"
											min="5"
											max="60"
											step="5"
											value={focusLength}
											onChange={(e) => setFocusLength(Number(e.target.value))}
											className="range blue"
										/>
										<div className="range-value">{focusLength} min</div>
									</div>
									<p>Recommended: 25 minutes</p>
								</div>

								<div className="range-block">
									<label>Break Length</label>
									<div className="range-row">
										<input
											type="range"
											min="5"
											max="15"
											step="5"
											value={breakLength}
											onChange={(e) => setBreakLength(Number(e.target.value))}
											className="range green"
										/>
										<div className="range-value">{breakLength} min</div>
									</div>
									<p>Recommended: 5 minutes</p>
								</div>
							</div>
						</article>

						<article className="settings-card">
							<div className="card-title">
								<Bell className="icon" />
								<h2>Notifications & Sound</h2>
							</div>

							<div className="toggle-list">
								<div className="toggle-row">
									<div className="toggle-left">
										<div className={soundEnabled ? "toggle-icon enabled" : "toggle-icon"}>
											{soundEnabled ? <Volume2 className="icon-sm" /> : <VolumeX className="icon-sm" />}
										</div>
										<div>
											<div className="toggle-title">Sound Effects</div>
											<div className="toggle-desc">Play sounds during sessions</div>
										</div>
									</div>

									<button
										type="button"
										onClick={() => setSoundEnabled((v) => !v)}
										className={soundEnabled ? "switch active" : "switch"}
									>
										<span />
									</button>
								</div>

								<div className="toggle-row">
									<div className="toggle-left">
										<div className={notificationsEnabled ? "toggle-icon enabled" : "toggle-icon"}>
											{notificationsEnabled ? <Bell className="icon-sm" /> : <BellOff className="icon-sm" />}
										</div>
										<div>
											<div className="toggle-title">Reminder Notifications</div>
											<div className="toggle-desc">Get reminders to stay focused</div>
										</div>
									</div>

									<button
										type="button"
										onClick={() => setNotificationsEnabled((v) => !v)}
										className={notificationsEnabled ? "switch active" : "switch"}
									>
										<span />
									</button>
								</div>
							</div>
						</article>

					</section>

					<aside className="settings-side">
						<article className="side-card">
							<div className="card-title small">
								<Shield className="icon" />
								<h3>Current Settings</h3>
							</div>
							<div className="summary-list">
								<div><span>Focus Duration</span><strong>{focusLength} min</strong></div>
								<div><span>Break Duration</span><strong>{breakLength} min</strong></div>
								<div>
									<span>Sound</span>
									<strong className={soundEnabled ? "ok" : "muted"}>{soundEnabled ? "On" : "Off"}</strong>
								</div>
								<div>
									<span>Notifications</span>
									<strong className={notificationsEnabled ? "ok" : "muted"}>
										{notificationsEnabled ? "On" : "Off"}
									</strong>
								</div>
							</div>
						</article>

						<article className="tip-card">
							<div className="emoji">💡</div>
							<h3>Tip</h3>
							<p>Regular breaks help maintain focus and reduce fatigue</p>
						</article>
					</aside>
				</div>
			</main>
		</div>
	);
}
