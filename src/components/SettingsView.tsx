import { useState } from "react";
import { Volume2, VolumeX, Bell, BellOff, User, Shield } from "lucide-react";
import "../assets/settings.css";

export default function SettingsView() {
  const [focusLength, setFocusLength] = useState(25);
  const [breakLength, setBreakLength] = useState(5);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <div className="settings-page">
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
                <button type="button" className="toggle-item" onClick={() => setSoundEnabled(!soundEnabled)}>
                  <div className="toggle-info">
                    <div className="toggle-icon">{soundEnabled ? <Volume2 /> : <VolumeX />}</div>
                    <div>
                      <h3>Sound Effects</h3>
                      <p>Play sounds when sessions end</p>
                    </div>
                  </div>
                  <div className={soundEnabled ? "switch on" : "switch"}>
                    <span />
                  </div>
                </button>

                <button type="button" className="toggle-item" onClick={() => setNotificationsEnabled(!notificationsEnabled)}>
                  <div className="toggle-info">
                    <div className="toggle-icon">{notificationsEnabled ? <Bell /> : <BellOff />}</div>
                    <div>
                      <h3>Notifications</h3>
                      <p>Remind you when focus breaks start</p>
                    </div>
                  </div>
                  <div className={notificationsEnabled ? "switch on" : "switch"}>
                    <span />
                  </div>
                </button>
              </div>
            </article>
          </section>

          <aside className="settings-side">
            <div className="settings-card">
              <div className="card-title">
                <Shield className="icon" />
                <h2>Account Safety</h2>
              </div>
              <p>Protect your learning data and privacy.</p>
              <button type="button" className="primary-btn">Review Safety</button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
