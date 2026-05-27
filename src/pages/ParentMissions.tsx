import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  HelpCircle,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import ParentNavBar from "../components/ParentNavBar";
import AssignMission from "../components/AssignMission";
import type { Mission, MissionFile, MissionQuiz, QuizOption } from "../types";
import {
  getFileTimeLabel,
  getMissionProgress,
  getMissionTimeLabel,
} from "../utils/missionProgress";
import "../assets/mission.css";

type MissionWithExpanded = Mission & { expanded: boolean };

type QuizDraft = {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: QuizOption;
};

type QuizField = keyof QuizDraft;

type FileDraft = {
  file: File;
  time_minutes: string;
};

const createEmptyQuiz = (): QuizDraft => ({
  question: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_option: "A",
});

const isQuizReady = (quiz: QuizDraft) =>
  quiz.question.trim() &&
  quiz.option_a.trim() &&
  quiz.option_b.trim() &&
  quiz.option_c.trim() &&
  quiz.option_d.trim();

export default function ParentMissions() {
  const [missions, setMissions] = useState<MissionWithExpanded[]>([]);
  const [showAssign, setShowAssign] = useState(false);
  const [pendingFileDrafts, setPendingFileDrafts] = useState<
    Record<number, FileDraft[]>
  >({});
  const [quizDrafts, setQuizDrafts] = useState<Record<number, QuizDraft>>({});
  const [uploadingMissionId, setUploadingMissionId] = useState<number | null>(
    null,
  );
  const [savingQuizMissionId, setSavingQuizMissionId] = useState<number | null>(
    null,
  );
  const [fileInputVersion, setFileInputVersion] = useState(0);
  const storedUser = localStorage.getItem("focuskid_user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const user_id = parsedUser.id;

  const fetchMissions = () => {
    fetch(`http://localhost:4000/api/missions?user_id=${user_id}`)
      .then((r) => r.json())
      .then((data: Mission[]) =>
        setMissions(data.map((m) => ({ ...m, expanded: false }))),
      )
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const handleCreateMission = (mission: Mission) => {
    setMissions((prev) => [{ ...mission, expanded: false }, ...prev]);
  };

  const handleFileSelection = (
    missionId: number,
    fileList: FileList | null,
  ) => {
    setPendingFileDrafts((prev) => ({
      ...prev,
      [missionId]: fileList
        ? Array.from(fileList).map((file) => ({
            file,
            time_minutes: "15",
          }))
        : [],
    }));
  };

  const handleFileDurationChange = (
    missionId: number,
    index: number,
    value: string,
  ) => {
    setPendingFileDrafts((prev) => ({
      ...prev,
      [missionId]: (prev[missionId] || []).map((draft, draftIndex) =>
        draftIndex === index ? { ...draft, time_minutes: value } : draft,
      ),
    }));
  };

  const handleQuizDraftChange = (
    missionId: number,
    field: QuizField,
    value: string,
  ) => {
    setQuizDrafts((prev) => {
      const current = prev[missionId] || createEmptyQuiz();
      return {
        ...prev,
        [missionId]: {
          ...current,
          [field]: field === "correct_option" ? (value as QuizOption) : value,
        },
      };
    });
  };

  const handleAddFiles = async (missionId: number) => {
    const fileDrafts = pendingFileDrafts[missionId] || [];
    if (fileDrafts.length === 0) return;

    setUploadingMissionId(missionId);

    try {
      const form = new FormData();
      form.append(
        "file_durations",
        JSON.stringify(
          fileDrafts.map((draft) => Number(draft.time_minutes) || 15),
        ),
      );
      fileDrafts.forEach((draft) => form.append("files", draft.file));

      const res = await fetch(
        `http://localhost:4000/api/missions/${missionId}/files`,
        {
          method: "POST",
          body: form,
        },
      );
      if (!res.ok) return;

      const json = (await res.json()) as { files: MissionFile[] };
      setMissions((prev) =>
        prev.map((mission) =>
          mission.id === missionId
            ? { ...mission, files: json.files, expanded: true }
            : mission,
        ),
      );
      setPendingFileDrafts((prev) => {
        const next = { ...prev };
        delete next[missionId];
        return next;
      });
      setFileInputVersion((version) => version + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setUploadingMissionId(null);
    }
  };

  const handleAddQuiz = async (missionId: number) => {
    const quiz = quizDrafts[missionId] || createEmptyQuiz();
    if (!isQuizReady(quiz)) return;

    setSavingQuizMissionId(missionId);

    try {
      const res = await fetch(
        `http://localhost:4000/api/missions/${missionId}/quizzes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quizzes: [quiz] }),
        },
      );
      if (!res.ok) return;

      const json = (await res.json()) as { quizzes: MissionQuiz[] };
      setMissions((prev) =>
        prev.map((mission) =>
          mission.id === missionId
            ? { ...mission, quizzes: json.quizzes, expanded: true }
            : mission,
        ),
      );
      setQuizDrafts((prev) => ({ ...prev, [missionId]: createEmptyQuiz() }));
    } catch (e) {
      console.error(e);
    } finally {
      setSavingQuizMissionId(null);
    }
  };

  const handleDeleteFile = async (missionId: number, fileId: number) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/missions/${missionId}/files/${fileId}`,
        { method: "DELETE" },
      );
      if (!res.ok) return;

      setMissions((prev) =>
        prev.map((mission) =>
          mission.id === missionId
            ? {
                ...mission,
                files: (mission.files || []).filter(
                  (file) => file.id !== fileId,
                ),
                expanded: true,
              }
            : mission,
        ),
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteQuiz = async (missionId: number, quizId: number) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/missions/${missionId}/quizzes/${quizId}`,
        { method: "DELETE" },
      );
      if (!res.ok) return;

      setMissions((prev) =>
        prev.map((mission) =>
          mission.id === missionId
            ? {
                ...mission,
                quizzes: (mission.quizzes || []).filter(
                  (quiz) => quiz.id !== quizId,
                ),
                expanded: true,
              }
            : mission,
        ),
      );
    } catch (e) {
      console.error(e);
    }
  };

  const toggleMission = (id: number) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, expanded: !m.expanded } : m)),
    );
  };

  const summary = useMemo(() => {
    const completed = missions.filter(
      (mission) => getMissionProgress(mission).percentage === 100,
    ).length;
    const inProgress = missions.filter((mission) => {
      const percentage = getMissionProgress(mission).percentage;
      return percentage > 0 && percentage < 100;
    }).length;
    const notStarted = missions.filter(
      (mission) => getMissionProgress(mission).percentage === 0,
    ).length;
    return { completed, inProgress, notStarted };
  }, [missions]);

  return (
    <div className="mission-page parent-dashboard">
      <ParentNavBar />
      <main className="mission-container">
        <div className="mission-layout">
          <section className="mission-main">
            <div className="mission-header">
              <div>
                <h1>Assigned Missions</h1>
                <p>Create, attach files, and monitor each mission.</p>
              </div>
              <button
                type="button"
                className="add-mission-btn"
                onClick={() => setShowAssign(true)}
              >
                <Plus className="icon-sm" />
                <span>Assign Mission</span>
              </button>
            </div>

            <div className="mission-cards">
              {missions.length === 0 && (
                <div className="panel tip">
                  <h3>No missions yet</h3>
                  <p>Create a mission to get started.</p>
                </div>
              )}

              {missions.map((mission, index) => {
                const progress = getMissionProgress(mission);
                const files = mission.files || [];
                const quizzes = mission.quizzes || [];
                const selectedFiles = pendingFileDrafts[mission.id] || [];
                const quizDraft = quizDrafts[mission.id] || createEmptyQuiz();
                const isUploading = uploadingMissionId === mission.id;
                const isSavingQuiz = savingQuizMissionId === mission.id;

                return (
                  <article
                    className="mission-card"
                    key={mission.id}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="mission-top-row">
                      <div className="mission-emoji">{mission.icon || "M"}</div>
                      <div className="mission-detail-block">
                        <div className="mission-title-row">
                          <div>
                            <h3>{mission.title}</h3>
                            <div className="mission-meta">
                              <span>Assigned Task</span>
                              <span>-</span>
                              <span className="clock-wrap">
                                <Clock className="icon-xs" />
                                <span>{getMissionTimeLabel(mission)}</span>
                              </span>
                            </div>
                          </div>

                          <div className="mission-actions">
                            <button
                              type="button"
                              className="icon-btn"
                              onClick={() => toggleMission(mission.id)}
                            >
                              {mission.expanded ? (
                                <ChevronUp className="icon-sm" />
                              ) : (
                                <ChevronDown className="icon-sm" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="mission-progress-row">
                          <div className="progress-track">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${progress.percentage}%`,
                                backgroundColor: mission.color || "#8FB8A8",
                              }}
                            />
                          </div>
                          <strong>{progress.label}</strong>
                        </div>

                        <div
                          className={
                            mission.expanded ? "subtasks expanded" : "subtasks"
                          }
                        >
                          <div className="mission-section">
                            <div className="mission-section-title">Files</div>
                            {files.length > 0 ? (
                              files.map((file) => (
                                <div
                                  className="subtask-row file-row"
                                  key={file.id}
                                >
                                  <span
                                    className={
                                      file.completed
                                        ? "checkbox checked static"
                                        : "checkbox static"
                                    }
                                  >
                                    {file.completed && (
                                      <Check className="check-icon" />
                                    )}
                                  </span>
                                  <FileText className="icon-xs file-icon" />
                                  <span
                                    className={
                                      file.completed
                                        ? "subtask-text done file-name"
                                        : "subtask-text file-name"
                                    }
                                  >
                                    {file.original_name}
                                    <small>
                                      {" "}
                                      {getFileTimeLabel(file, mission)}
                                    </small>
                                  </span>
                                  <button
                                    type="button"
                                    className="icon-btn danger"
                                    onClick={() =>
                                      handleDeleteFile(mission.id, file.id)
                                    }
                                    aria-label={`Remove ${file.original_name}`}
                                  >
                                    <Trash2 className="icon-xs" />
                                  </button>
                                </div>
                              ))
                            ) : (
                              <p className="empty-files">
                                No files attached yet.
                              </p>
                            )}
                          </div>

                          <div className="mission-section">
                            <div className="mission-section-title">Quizzes</div>
                            {quizzes.length > 0 ? (
                              quizzes.map((quiz) => (
                                <div
                                  className="subtask-row file-row"
                                  key={quiz.id}
                                >
                                  <span
                                    className={
                                      quiz.completed
                                        ? "checkbox checked static"
                                        : "checkbox static"
                                    }
                                  >
                                    {quiz.completed && (
                                      <Check className="check-icon" />
                                    )}
                                  </span>
                                  <HelpCircle className="icon-xs file-icon" />
                                  <span className="subtask-text file-name">
                                    {quiz.question}{" "}
                                    <small>
                                      Correct: {quiz.correct_option}
                                    </small>
                                  </span>
                                  <button
                                    type="button"
                                    className="icon-btn danger"
                                    onClick={() =>
                                      handleDeleteQuiz(mission.id, quiz.id)
                                    }
                                    aria-label={`Remove quiz ${quiz.question}`}
                                  >
                                    <Trash2 className="icon-xs" />
                                  </button>
                                </div>
                              ))
                            ) : (
                              <p className="empty-files">
                                No quizzes added yet.
                              </p>
                            )}
                          </div>

                          <div className="add-files-row">
                            <input
                              key={`${mission.id}-${fileInputVersion}`}
                              type="file"
                              multiple
                              onChange={(event) =>
                                handleFileSelection(
                                  mission.id,
                                  event.target.files,
                                )
                              }
                            />
                            <button
                              type="button"
                              className="file-upload-btn"
                              onClick={() => handleAddFiles(mission.id)}
                              disabled={
                                selectedFiles.length === 0 || isUploading
                              }
                            >
                              <Upload className="icon-xs" />
                              {isUploading ? "Uploading..." : "Add Files"}
                            </button>
                          </div>

                          {selectedFiles.length > 0 && (
                            <div className="file-draft-list inline">
                              {selectedFiles.map((draft, draftIndex) => (
                                <div
                                  className="file-draft-row"
                                  key={`${draft.file.name}-${draft.file.size}-${draft.file.lastModified}`}
                                >
                                  <span>{draft.file.name}</span>
                                  <label>
                                    Minutes
                                    <input
                                      type="number"
                                      min={1}
                                      max={240}
                                      value={draft.time_minutes}
                                      onChange={(event) =>
                                        handleFileDurationChange(
                                          mission.id,
                                          draftIndex,
                                          event.target.value,
                                        )
                                      }
                                    />
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="inline-quiz-editor">
                            <div className="mission-section-title">
                              Add Quiz
                            </div>
                            <input
                              value={quizDraft.question}
                              onChange={(event) =>
                                handleQuizDraftChange(
                                  mission.id,
                                  "question",
                                  event.target.value,
                                )
                              }
                              placeholder="Question"
                            />
                            <div className="quiz-options-editor">
                              <input
                                value={quizDraft.option_a}
                                onChange={(event) =>
                                  handleQuizDraftChange(
                                    mission.id,
                                    "option_a",
                                    event.target.value,
                                  )
                                }
                                placeholder="A"
                              />
                              <input
                                value={quizDraft.option_b}
                                onChange={(event) =>
                                  handleQuizDraftChange(
                                    mission.id,
                                    "option_b",
                                    event.target.value,
                                  )
                                }
                                placeholder="B"
                              />
                              <input
                                value={quizDraft.option_c}
                                onChange={(event) =>
                                  handleQuizDraftChange(
                                    mission.id,
                                    "option_c",
                                    event.target.value,
                                  )
                                }
                                placeholder="C"
                              />
                              <input
                                value={quizDraft.option_d}
                                onChange={(event) =>
                                  handleQuizDraftChange(
                                    mission.id,
                                    "option_d",
                                    event.target.value,
                                  )
                                }
                                placeholder="D"
                              />
                            </div>
                            <div className="inline-quiz-actions">
                              <select
                                value={quizDraft.correct_option}
                                onChange={(event) =>
                                  handleQuizDraftChange(
                                    mission.id,
                                    "correct_option",
                                    event.target.value,
                                  )
                                }
                              >
                                <option value="A">Correct: A</option>
                                <option value="B">Correct: B</option>
                                <option value="C">Correct: C</option>
                                <option value="D">Correct: D</option>
                              </select>
                              <button
                                type="button"
                                className="file-upload-btn"
                                onClick={() => handleAddQuiz(mission.id)}
                                disabled={
                                  !isQuizReady(quizDraft) || isSavingQuiz
                                }
                              >
                                <Plus className="icon-xs" />
                                {isSavingQuiz ? "Saving..." : "Add Quiz"}
                              </button>
                            </div>
                          </div>
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
              <p>
                Use files for reading practice and quizzes for answer checking.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {showAssign && (
        <AssignMission
          onClose={() => setShowAssign(false)}
          onCreate={handleCreateMission}
        />
      )}
    </div>
  );
}
