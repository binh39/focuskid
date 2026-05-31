import { useState } from "react";
import {
  Bell,
  BellOff,
  Brain,
  Camera,
  CameraOff,
  HeartHandshake,
  Shield,
  TimerReset,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  loadFocusPreferences,
  saveFocusPreferences,
  type FocusPreferences,
} from "../utils/preferences";
import "../assets/settings.css";

type TogglePreference = "soundEnabled" | "notificationsEnabled" | "focusHelperEnabled";

export default function SettingsView() {
  const [preferences, setPreferences] = useState<FocusPreferences>(() =>
    loadFocusPreferences(),
  );

  const updatePreferences = (next: Partial<FocusPreferences>) => {
    setPreferences((current) => saveFocusPreferences({ ...current, ...next }));
  };

  const togglePreference = (key: TogglePreference) => {
    updatePreferences({ [key]: !preferences[key] });
  };

  return (
    <div className="settings-page calm-settings-page">
      <main className="settings-container">
        <header className="settings-header calm-settings-header">
          <p className="calm-eyebrow">Calm controls</p>
          <h1>Make focus feel easier</h1>
          <p>
            Choose short sessions, gentle reminders, and helper tools that feel
            comfortable for learning.
          </p>
        </header>

        <div className="settings-layout calm-settings-layout">
          <section className="settings-main">
            <article className="settings-card calm-panel">
              <div className="card-title calm-title-row">
                <TimerReset className="icon" />
                <div>
                  <h2>Focus rhythm</h2>
                  <p>Short, predictable blocks reduce overload.</p>
                </div>
              </div>

              <div className="range-grid calm-range-grid">
                <div className="range-block calm-range-block">
                  <label htmlFor="focus-length">Focus time</label>
                  <div className="range-row">
                    <input
                      id="focus-length"
                      type="range"
                      min="5"
                      max="30"
                      step="5"
                      value={preferences.focusLength}
                      onChange={(e) =>
                        updatePreferences({ focusLength: Number(e.target.value) })
                      }
                      className="range blue"
                    />
                    <div className="range-value">{preferences.focusLength} min</div>
                  </div>
                  <p>Recommended for ages 8-12: 10-15 minutes.</p>
                </div>

                <div className="range-block calm-range-block">
                  <label htmlFor="break-length">Reset break</label>
                  <div className="range-row">
                    <input
                      id="break-length"
                      type="range"
                      min="3"
                      max="15"
                      step="1"
                      value={preferences.breakLength}
                      onChange={(e) =>
                        updatePreferences({ breakLength: Number(e.target.value) })
                      }
                      className="range green"
                    />
                    <div className="range-value">{preferences.breakLength} min</div>
                  </div>
                  <p>A small pause helps the brain restart calmly.</p>
                </div>
              </div>
            </article>

            <article className="settings-card calm-panel">
              <div className="card-title calm-title-row">
                <Brain className="icon" />
                <div>
                  <h2>Gentle support</h2>
                  <p>Pick helpers that encourage, not pressure.</p>
                </div>
              </div>

              <div className="toggle-list calm-toggle-list">
                <button
                  type="button"
                  className="toggle-item calm-toggle-item"
                  onClick={() => togglePreference("soundEnabled")}
                  role="switch"
                  aria-checked={preferences.soundEnabled}
                >
                  <div className="toggle-info">
                    <div className="toggle-icon">
                      {preferences.soundEnabled ? <Volume2 /> : <VolumeX />}
                    </div>
                    <div>
                      <h3>Soft sounds</h3>
                      <p>Use quiet cues instead of loud alerts.</p>
                    </div>
                  </div>
                  <div className={preferences.soundEnabled ? "switch active" : "switch"}>
                    <span />
                  </div>
                </button>

                <button
                  type="button"
                  className="toggle-item calm-toggle-item"
                  onClick={() => togglePreference("notificationsEnabled")}
                  role="switch"
                  aria-checked={preferences.notificationsEnabled}
                >
                  <div className="toggle-info">
                    <div className="toggle-icon">
                      {preferences.notificationsEnabled ? <Bell /> : <BellOff />}
                    </div>
                    <div>
                      <h3>Kind reminders</h3>
                      <p>Show short prompts when attention drifts.</p>
                    </div>
                  </div>
                  <div className={preferences.notificationsEnabled ? "switch active" : "switch"}>
                    <span />
                  </div>
                </button>

                <button
                  type="button"
                  className="toggle-item calm-toggle-item"
                  onClick={() => togglePreference("focusHelperEnabled")}
                  role="switch"
                  aria-checked={preferences.focusHelperEnabled}
                >
                  <div className="toggle-info">
                    <div className="toggle-icon">
                      {preferences.focusHelperEnabled ? <Camera /> : <CameraOff />}
                    </div>
                    <div>
                      <h3>Focus helper camera</h3>
                      <p>Ask before using camera and keep video local.</p>
                    </div>
                  </div>
                  <div className={preferences.focusHelperEnabled ? "switch active" : "switch"}>
                    <span />
                  </div>
                </button>
              </div>
            </article>
          </section>

          <aside className="settings-side calm-settings-side">
            <div className="settings-card calm-side-card">
              <div className="card-title calm-title-row">
                <HeartHandshake className="icon" />
                <div>
                  <h2>Your calm plan</h2>
                  <p>What the next learning session will feel like.</p>
                </div>
              </div>
              <div className="summary-list calm-summary-list">
                <div>
                  <span>Focus</span>
                  <strong>{preferences.focusLength} min</strong>
                </div>
                <div>
                  <span>Break</span>
                  <strong>{preferences.breakLength} min</strong>
                </div>
                <div>
                  <span>Sounds</span>
                  <strong>{preferences.soundEnabled ? "Soft" : "Off"}</strong>
                </div>
                <div>
                  <span>Camera helper</span>
                  <strong>{preferences.focusHelperEnabled ? "Ask first" : "Off"}</strong>
                </div>
              </div>
            </div>

            <div className="settings-card calm-safety-card">
              <div className="card-title calm-title-row">
                <Shield className="icon" />
                <div>
                  <h2>Safety note</h2>
                  <p>
                    Focus helper video is only used during the session. The app
                    should feel supportive, never like a punishment.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
