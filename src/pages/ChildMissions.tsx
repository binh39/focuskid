import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronDown, ChevronUp, Clock, FileText, HelpCircle, Play } from "lucide-react";
import ChildNavBar from "../components/ChildNavBar";
import type { Mission, MissionFile } from "../types";
import { getFileTimeLabel, getMissionProgress, getMissionStartItem, getMissionTimeLabel } from "../utils/missionProgress";
import { applyRewardResult, awardXp, getStoredUser } from "../utils/rewards";
import { loadCachedMissions, saveCachedMissions } from "../utils/missionCache";
import "../assets/mission.css";

type MissionWithExpanded = Mission & { expanded: boolean };

export default function ChildMissions() {
  const navigate = useNavigate();
  const [user] = useState(() => getStoredUser());
  const [missions, setMissions] = useState<MissionWithExpanded[]>(() =>
    loadCachedMissions(user?.id).map((m) => ({ ...m, expanded: false })),
  );

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    if (user.role !== "child") {
      navigate("/parent/dashboard");
      return;
    }

    fetch(`http://localhost:4000/api/missions?user_id=${user.id}`)
      .then((r) => r.json())
      .then((data: Mission[]) => {
        saveCachedMissions(user.id, data);
        setMissions(data.map((m) => ({ ...m, expanded: false })));
      })
      .catch((e) => console.error(e));
  }, [navigate, user]);

  const toggleMission = (id: number) => {
    setMissions((prev) => prev.map((m) => (m.id === id ? { ...m, expanded: !m.expanded } : m)));
  };

  const toggleFileComplete = async (missionId: number, file: MissionFile) => {
    const completed = !file.completed;

    try {
      const res = await fetch(`http://localhost:4000/api/missions/${missionId}/files/${file.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      if (!res.ok) return;

      setMissions((prev) =>
        prev.map((mission) =>
          mission.id === missionId
            ? {
                ...mission,
                files: (mission.files || []).map((item) => (item.id === file.id ? { ...item, completed } : item)),
              }
            : mission,
        ),
      );

      if (completed) {
        const reward = await awardXp(30, "Completed file", `file:${file.id}`);
        applyRewardResult(reward);
      }
      window.dispatchEvent(new Event("focuskid_missions_updated"));
    } catch (e) {
      console.error(e);
    }
  };

  const openFile = (mission: Mission, file: MissionFile) => {
    navigate("/child/reader", { state: { mission, file } });
  };

  const startMission = (mission: Mission) => {
    const startItem = getMissionStartItem(mission);

    if (startItem.type === "file") {
      navigate("/child/reader", { state: { mission, file: startItem.file } });
      return;
    }

    if (startItem.type === "quiz") {
      navigate("/child/reader", { state: { mission, quiz: startItem.quiz } });
      return;
    }

    navigate("/child/focus", { state: { mission } });
  };

  const summary = useMemo(() => {
    const completed = missions.filter((mission) => getMissionProgress(mission).percentage === 100).length;
    const inProgress = missions.filter((mission) => {
      const percentage = getMissionProgress(mission).percentage;
      return percentage > 0 && percentage < 100;
    }).length;
    const notStarted = missions.filter((mission) => getMissionProgress(mission).percentage === 0).length;
    return { completed, inProgress, notStarted };
  }, [missions]);

  return (
    <div className="mission-page child-dashboard">
      <ChildNavBar />
      <main className="mission-container">
        <div className="mission-layout">
          <section className="mission-main">
            <div className="mission-header">
              <div>
                <h1>My Missions</h1>
                <p>Choose one mission and focus for a short time.</p>
              </div>
            </div>

            <div className="mission-cards">
              {missions.length === 0 && (
                <div className="panel tip">
                  <h3>No missions yet</h3>
                  <p>Ask your parent to assign a mission.</p>
                </div>
              )}

              {missions.map((mission, index) => {
                const progress = getMissionProgress(mission);
                const files = mission.files || [];
                const quizzes = mission.quizzes || [];
                const quizDone = quizzes.length > 0 && quizzes.every((quiz) => Boolean(quiz.completed));

                return (
                  <article className="mission-card" key={mission.id} style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="mission-top-row">
                      <div className="mission-emoji">{mission.icon || "M"}</div>
                      <div className="mission-detail-block">
                        <div className="mission-title-row">
                          <div>
                            <h3>{mission.title}</h3>
                            <div className="mission-meta">
                              <span>Mission</span>
                              <span>-</span>
                              <span className="clock-wrap">
                                <Clock className="icon-xs" />
                                <span>{getMissionTimeLabel(mission)}</span>
                              </span>
                            </div>
                          </div>

                          <div className="mission-actions">
                            <button type="button" className="icon-btn" onClick={() => toggleMission(mission.id)}>
                              {mission.expanded ? <ChevronUp className="icon-sm" /> : <ChevronDown className="icon-sm" />}
                            </button>
                          </div>
                        </div>

                        <div className="mission-progress-row">
                          <div className="progress-track">
                            <div
                              className="progress-fill"
                              style={{ width: `${progress.percentage}%`, backgroundColor: mission.color || "#8FB8A8" }}
                            />
                          </div>
                          <strong>{progress.label}</strong>
                        </div>

                        <div className={mission.expanded ? "subtasks expanded" : "subtasks"}>
                          {files.length > 0 && (
                            <div className="mission-section">
                              <div className="mission-section-title">Reading files</div>
                              {files.map((file) => (
                                <div className="subtask-row file-row" key={`file-${file.id}`}>
                                  <button
                                    type="button"
                                    onClick={() => toggleFileComplete(mission.id, file)}
                                    className={file.completed ? "checkbox checked" : "checkbox"}
                                    aria-label={file.completed ? "Mark file incomplete" : "Mark file complete"}
                                  >
                                    {file.completed && <Check className="check-icon" />}
                                  </button>
                                  <FileText className="icon-xs file-icon" />
                                  <button
                                    type="button"
                                    className={file.completed ? "file-name-btn done" : "file-name-btn"}
                                    onClick={() => openFile(mission, file)}
                                  >
                                    {file.original_name}
                                    <small> {getFileTimeLabel(file, mission)}</small>
                                  </button>
                                  <button type="button" className="file-action-btn" onClick={() => openFile(mission, file)}>
                                    Read
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {quizzes.length > 0 && (
                            <div className="mission-section">
                              <div className="mission-section-title">Quiz</div>
                              <div className="subtask-row file-row">
                                <span className={quizDone ? "checkbox checked static" : "checkbox static"}>
                                  {quizDone && <Check className="check-icon" />}
                                </span>
                                <HelpCircle className="icon-xs file-icon" />
                                <span className={quizDone ? "subtask-text done file-name" : "subtask-text file-name"}>
                                  Quizz - {quizzes.length} Questions
                                </span>
                                <button
                                  type="button"
                                  className="file-action-btn"
                                  onClick={() =>
                                    navigate("/child/reader", {
                                      state: { mission, quiz: quizzes.find((q) => !q.completed) || quizzes[0] },
                                    })
                                  }
                                >
                                  Start
                                </button>
                              </div>
                            </div>
                          )}

                          {files.length === 0 && quizzes.length === 0 && <p className="empty-files">No files or quizzes attached yet.</p>}

                          <button
                            type="button"
                            className="start-btn attention"
                            onClick={() => startMission(mission)}
                          >
                            <Play className="icon-xs" />
                            <span>Start This Mission</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
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
              <h3>Quick Tip</h3>
              <p>Read the file carefully, then choose the best answer.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
