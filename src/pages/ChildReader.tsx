import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, FileText, HelpCircle, Pause, Play } from "lucide-react";
import type { Mission, MissionFile, MissionQuiz, QuizOption } from "../types";
import "../assets/reader.css";

const quizOptions = (quiz: MissionQuiz) => [
  { key: "A" as QuizOption, text: quiz.option_a },
  { key: "B" as QuizOption, text: quiz.option_b },
  { key: "C" as QuizOption, text: quiz.option_c },
  { key: "D" as QuizOption, text: quiz.option_d },
];

export default function ChildReader() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location && (location.state as { mission?: Mission; file?: MissionFile; quiz?: MissionQuiz })) || {};
  const mission = state.mission || null;
  const [quizzes, setQuizzes] = useState<MissionQuiz[]>(() => mission?.quizzes || []);

  const initialFile = state.quiz
    ? null
    : state.file || mission?.files?.find((file) => !file.completed) || mission?.files?.[0] || null;
  const initialQuiz = state.quiz || (!initialFile ? mission?.quizzes?.find((quiz) => !quiz.completed) || mission?.quizzes?.[0] || null : null);

  const [selectedFile, setSelectedFile] = useState<MissionFile | null>(initialFile);
  const [selectedQuiz, setSelectedQuiz] = useState<MissionQuiz | null>(initialQuiz);
  const [completedFileIds, setCompletedFileIds] = useState<Set<number>>(
    () => new Set((mission?.files || []).filter((file) => file.completed).map((file) => file.id)),
  );

  const totalMinutes = mission?.time_minutes
    ? mission.time_minutes
    : parseInt(String(mission?.time ?? "").replace(/[^0-9]/g, "")) || 10;

  const totalSeconds = totalMinutes * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);

  const fileUrl = useMemo(() => {
    if (!selectedFile?.file_path) return null;
    return `http://localhost:4000${selectedFile.file_path}`;
  }, [selectedFile]);

  const isFileCompleted = (file: MissionFile | null) => {
    if (!file) return false;
    return Boolean(file.completed) || completedFileIds.has(file.id);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const selectFile = (file: MissionFile) => {
    setSelectedFile({ ...file, completed: isFileCompleted(file) });
    setSelectedQuiz(null);
  };

  const selectQuiz = (quiz: MissionQuiz) => {
    setSelectedQuiz(quiz);
    setSelectedFile(null);
  };

  const markSelectedFileComplete = async () => {
    if (!mission || !selectedFile || isFileCompleted(selectedFile)) return;

    try {
      const res = await fetch(`http://localhost:4000/api/missions/${mission.id}/files/${selectedFile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });
      if (!res.ok) return;

      setCompletedFileIds((prev) => {
        const next = new Set(prev);
        next.add(selectedFile.id);
        return next;
      });
      setSelectedFile((current) => (current ? { ...current, completed: true } : current));
    } catch (e) {
      console.error(e);
    }
  };

  const submitQuizAnswer = async (quiz: MissionQuiz, answer: QuizOption) => {
    if (!mission || quiz.completed) return;

    try {
      const res = await fetch(`http://localhost:4000/api/missions/${mission.id}/quizzes/${quiz.id}/answer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });
      if (!res.ok) return;

      const json = (await res.json()) as { quiz: MissionQuiz };
      setQuizzes((prev) => prev.map((item) => (item.id === quiz.id ? json.quiz : item)));
      setSelectedQuiz(json.quiz);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft]);

  return (
    <div className="reader-page child-dashboard">
      <main className="reader-container full">
        <div className="reader-layout full">
          <section className="reader-doc full">
            <div className="reader-topbar">
              <button className="reader-back" onClick={() => navigate("/child/missions")}>
                <ArrowLeft className="icon" /> Back
              </button>
              <div className="reader-title">{selectedQuiz?.question || mission?.title || "Reading Task"}</div>
              <div className="reader-spacer" />
            </div>

            {selectedQuiz ? (
              <div className="reader-main-quiz">
                <div className={selectedQuiz.completed ? "main-quiz-card completed" : "main-quiz-card"}>
                  <div className="main-quiz-heading">
                    {selectedQuiz.completed ? <Check className="icon" /> : <HelpCircle className="icon" />}
                    <h2>{selectedQuiz.question}</h2>
                  </div>
                  <div className="main-quiz-options">
                    {quizOptions(selectedQuiz).map((option) => {
                      const isSelected = selectedQuiz.selected_option === option.key;
                      const isCorrect = selectedQuiz.completed && isSelected;
                      const isWrong = !selectedQuiz.completed && isSelected;

                      return (
                        <button
                          type="button"
                          key={option.key}
                          className={[
                            "main-quiz-option",
                            isSelected ? "selected" : "",
                            isCorrect ? "correct" : "",
                            isWrong ? "wrong" : "",
                          ].filter(Boolean).join(" ")}
                          onClick={() => submitQuizAnswer(selectedQuiz, option.key)}
                          disabled={selectedQuiz.completed}
                        >
                          <span>{option.key}</span>
                          {option.text}
                        </button>
                      );
                    })}
                  </div>
                  {selectedQuiz.selected_option && (
                    <div className={selectedQuiz.completed ? "main-quiz-feedback correct" : "main-quiz-feedback wrong"}>
                      {selectedQuiz.completed ? "Correct. Completed." : "Not correct. Try again."}
                    </div>
                  )}
                </div>
              </div>
            ) : fileUrl ? (
              <iframe className="reader-frame full" src={fileUrl} title="Learning material" />
            ) : (
              <div className="reader-empty">
                No file or quiz found. Please ask your parent to add one.
              </div>
            )}
          </section>

          <aside className="reader-timer full">
            <div className="reader-side-content">
              <div className="timer-card">
                <h3>Timer</h3>
                <div className="timer-small">{formatTime(timeLeft)} remaining</div>
                <button className="timer-btn" onClick={toggleTimer}>
                  {isRunning ? <Pause className="icon" /> : <Play className="icon" />}
                  {isRunning ? "Pause" : "Start"}
                </button>
                {selectedFile && (
                  <button
                    className="timer-btn complete"
                    onClick={markSelectedFileComplete}
                    disabled={isFileCompleted(selectedFile)}
                  >
                    <Check className="icon" />
                    {isFileCompleted(selectedFile) ? "File Completed" : "Mark File Complete"}
                  </button>
                )}
                <div className="timer-meta">Goal: {totalMinutes} minutes</div>
                {fileUrl && (
                  <div className="reader-link">
                    <a href={fileUrl} target="_blank" rel="noreferrer">Open in new tab</a>
                  </div>
                )}

                <div className="reader-file-list">
                  {(mission?.files || []).map((file) => (
                    <button
                      type="button"
                      key={`file-${file.id}`}
                      className={selectedFile?.id === file.id ? "reader-file-item active" : "reader-file-item"}
                      onClick={() => selectFile(file)}
                    >
                      {isFileCompleted(file) ? <Check className="icon-xs" /> : <FileText className="icon-xs" />}
                      <span>{file.original_name}</span>
                    </button>
                  ))}

                  {quizzes.map((quiz) => (
                    <button
                      type="button"
                      key={`quiz-${quiz.id}`}
                      className={selectedQuiz?.id === quiz.id ? "reader-file-item active" : "reader-file-item"}
                      onClick={() => selectQuiz(quiz)}
                    >
                      {quiz.completed ? <Check className="icon-xs" /> : <HelpCircle className="icon-xs" />}
                      <span>{quiz.question}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
