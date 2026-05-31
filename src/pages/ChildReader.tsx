import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  Leaf,
  Pause,
  Play,
  Volume2,
} from "lucide-react";
import RankIcon from "../components/RankIcon";
import FocusCameraPanel from "../components/FocusCameraPanel";
import type { Mission, MissionFile, MissionQuiz, QuizOption } from "../types";
import { getFileMinutes, getFileTimeLabel } from "../utils/missionProgress";
import {
  applyRewardResult,
  awardXp,
  getRewardProfile,
  getStoredUser,
  type RewardRank,
  type RewardResult,
} from "../utils/rewards";
import { loadFocusPreferences } from "../utils/preferences";
import { canSpeakText, speakText } from "../utils/speech";
import "../assets/reader.css";

const quizOptions = (quiz: MissionQuiz) => [
  { key: "A" as QuizOption, text: quiz.option_a },
  { key: "B" as QuizOption, text: quiz.option_b },
  { key: "C" as QuizOption, text: quiz.option_c },
  { key: "D" as QuizOption, text: quiz.option_d },
];

const playSoftCue = () => {
  try {
    const audioWindow = window as Window & {
      webkitAudioContext?: typeof AudioContext;
    };
    const AudioContextClass =
      window.AudioContext || audioWindow.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const playOscillator = (timeOffset: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, ctx.currentTime + timeOffset);
      gain.gain.setValueAtTime(0.16, ctx.currentTime + timeOffset);
      osc.start(ctx.currentTime + timeOffset);
      osc.stop(ctx.currentTime + timeOffset + 0.15);
    };

    playOscillator(0);
    playOscillator(0.25);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

export default function ChildReader() {
  const navigate = useNavigate();
  const location = useLocation();
  const state =
    (location &&
      (location.state as {
        mission?: Mission;
        file?: MissionFile;
        quiz?: MissionQuiz;
      })) ||
    {};
  const mission = state.mission || null;
  const [quizzes, setQuizzes] = useState<MissionQuiz[]>(
    () => mission?.quizzes || [],
  );

  const initialFile = state.quiz
    ? null
    : state.file ||
      mission?.files?.find((file) => !file.completed) ||
      mission?.files?.[0] ||
      null;
  const initialQuiz =
    state.quiz ||
    (!initialFile
      ? mission?.quizzes?.find((quiz) => !quiz.completed) ||
        mission?.quizzes?.[0] ||
        null
      : null);

  const [selectedFile, setSelectedFile] = useState<MissionFile | null>(
    initialFile,
  );
  const [selectedQuiz, setSelectedQuiz] = useState<MissionQuiz | null>(
    initialQuiz,
  );
  const [quizIndex, setQuizIndex] = useState(() => {
    const list = mission?.quizzes || [];
    if (!initialQuiz) return 0;
    const idx = list.findIndex((q) => q.id === initialQuiz.id);
    return idx >= 0 ? idx : 0;
  });
  const [completedFileIds, setCompletedFileIds] = useState<Set<number>>(
    () =>
      new Set(
        (mission?.files || [])
          .filter((file) => file.completed)
          .map((file) => file.id),
      ),
  );
  const timerRewardClaimedRef = useRef(Boolean(initialFile?.completed));
  const [rewardNotice, setRewardNotice] = useState<{
    xp: number;
    rank: RewardRank;
  } | null>(null);

  const totalMinutes = selectedFile ? getFileMinutes(selectedFile, mission) : 0;
  const totalSeconds = totalMinutes * 60;

  const [timeLeft, setTimeLeft] = useState(() =>
    initialFile && !initialFile.completed
      ? getFileMinutes(initialFile, mission) * 60
      : 0,
  );
  const [isRunning, setIsRunning] = useState(false);

  const [isDistractedState, setIsDistractedState] = useState(false);
  const [showDistractionPopup, setShowDistractionPopup] = useState(false);
  const [wasRunningBeforePause, setWasRunningBeforePause] = useState(false);
  const resumeButtonRef = useRef<HTMLButtonElement | null>(null);

  const progressPercent =
    totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 0;

  const handleDistractionChange = useCallback((isDistracted: boolean) => {
    const preferences = loadFocusPreferences();
    if (!preferences.notificationsEnabled) {
      setIsDistractedState(false);
      return;
    }

    setIsDistractedState((prev) => {
      if (!prev && isDistracted) {
        setShowDistractionPopup(true);
        setWasRunningBeforePause(isRunning);
        setIsRunning(false);
        if (preferences.soundEnabled) playSoftCue();
      }
      return isDistracted;
    });
  }, [isRunning]);

  useEffect(() => {
    if (showDistractionPopup) {
      resumeButtonRef.current?.focus();
    }
  }, [showDistractionPopup]);

  const fileUrl = useMemo(() => {
    if (!selectedFile?.file_path) return null;
    if (/^https?:\/\//i.test(selectedFile.file_path))
      return selectedFile.file_path;
    return `http://localhost:4000${selectedFile.file_path}`;
  }, [selectedFile]);

  const isFileCompleted = useCallback(
    (file: MissionFile | null) => {
      if (!file) return false;
      return Boolean(file.completed) || completedFileIds.has(file.id);
    },
    [completedFileIds],
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleTimer = () => {
    if (!selectedFile || isFileCompleted(selectedFile)) return;
    setIsRunning((prev) => !prev);
  };

  const showRewardNotice = useCallback((reward?: RewardResult | null) => {
    if (!reward?.awarded || !reward.user) return;

    const profile = getRewardProfile(reward.user.xp || 0);
    setRewardNotice({ xp: reward.xp, rank: profile.rank });
    window.setTimeout(() => setRewardNotice(null), 3200);
  }, []);

  const selectFile = (file: MissionFile) => {
    const nextFile = { ...file, completed: isFileCompleted(file) };
    const isCompleted = isFileCompleted(nextFile);

    setSelectedFile(nextFile);
    setSelectedQuiz(null);
    setIsRunning(false);
    setTimeLeft(isCompleted ? 0 : getFileMinutes(nextFile, mission) * 60);
    timerRewardClaimedRef.current = isCompleted;
  };

  const selectQuizAt = (index: number) => {
    if (quizzes.length === 0) return;
    const nextIndex = Math.max(0, Math.min(index, quizzes.length - 1));
    setQuizIndex(nextIndex);
    setSelectedQuiz(quizzes[nextIndex]);
    setSelectedFile(null);
    setIsRunning(false);
    setTimeLeft(0);
    timerRewardClaimedRef.current = true;
  };

  const openQuizTab = () => {
    if (quizzes.length === 0) return;
    const firstIncomplete = quizzes.findIndex((q) => !q.completed);
    selectQuizAt(firstIncomplete >= 0 ? firstIncomplete : 0);
  };

  const goPrevQuiz = () => selectQuizAt(quizIndex - 1);
  const goNextQuiz = () => selectQuizAt(quizIndex + 1);

  const completeFile = useCallback(
    async (file: MissionFile, shouldAwardXp = false) => {
      if (!mission || isFileCompleted(file)) return;
      timerRewardClaimedRef.current = true;

      try {
        const res = await fetch(
          `http://localhost:4000/api/missions/${mission.id}/files/${file.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: true }),
          },
        );
        if (!res.ok) return;

        setCompletedFileIds((prev) => {
          const next = new Set(prev);
          next.add(file.id);
          return next;
        });
        setSelectedFile((current) =>
          current?.id === file.id ? { ...current, completed: true } : current,
        );
        setIsRunning(false);
        setTimeLeft(0);

        if (shouldAwardXp) {
          const reward = await awardXp(
            30,
            "Completed file timer",
            `timer:file:${file.id}`,
          );
          showRewardNotice(reward);
        }
      } catch (e) {
        console.error(e);
      }
    },
    [isFileCompleted, mission, showRewardNotice],
  );

  const submitQuizAnswer = async (quiz: MissionQuiz, answer: QuizOption) => {
    if (!mission || quiz.completed) return;
    const user = getStoredUser();

    try {
      const res = await fetch(
        `http://localhost:4000/api/missions/${mission.id}/quizzes/${quiz.id}/answer`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answer, user_id: user?.id }),
        },
      );
      if (!res.ok) return;

      const json = (await res.json()) as {
        quiz: MissionQuiz;
        reward?: RewardResult;
      };
      setQuizzes((prev) =>
        prev.map((item) => (item.id === quiz.id ? json.quiz : item)),
      );
      setSelectedQuiz(json.quiz);
      applyRewardResult(json.reward);
      showRewardNotice(json.reward);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((current) => {
          if (current <= 1) {
            setIsRunning(false);
            return 0;
          }

          return current - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft]);

  const speechSupported = canSpeakText();

  const readCurrentInstruction = () => {
    if (selectedQuiz) {
      speakText(`Câu hỏi trắc nghiệm. ${selectedQuiz.question}`);
      return;
    }

    if (selectedFile) {
      speakText(
        "Nhiệm vụ đọc. Hãy bấm bắt đầu khi con sẵn sàng. Nếu cần nghỉ một chút thì cũng không sao.",
      );
    }
  };

  useEffect(() => {
    if (
      !selectedFile ||
      timeLeft !== 0 ||
      timerRewardClaimedRef.current ||
      isFileCompleted(selectedFile)
    )
      return;
    completeFile(selectedFile, true).catch((e) => console.error(e));
  }, [completeFile, isFileCompleted, selectedFile, timeLeft]);

  return (
    <div className="reader-page child-dashboard">
      {/* --- POPUP MẤT TẬP TRUNG --- */}
      {showDistractionPopup && (
        <div
          className="calm-pause-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="calm-pause-title"
        >
          <div className="calm-pause-card">
            <div className="calm-pause-icon">
              <Leaf size={56} />
            </div>
            <h2 id="calm-pause-title">Take a calm breath</h2>
            <p>
              The timer paused for a moment. Look back at the lesson when you
              feel ready. No rush.
            </p>

            <button
              ref={resumeButtonRef}
              className="timer-btn calm-resume-btn"
              onClick={() => {
                setShowDistractionPopup(false);
                if (!isDistractedState) {
                  setIsRunning(wasRunningBeforePause);
                }
              }}
            >
              <Play className="icon" />
              {isDistractedState ? "I will look back first" : "I'm ready"}
            </button>
          </div>
        </div>
      )}
      {/* --------------------------- */}

      {rewardNotice && (
        <div className="reward-toast">
          <RankIcon rank={rewardNotice.rank} className="reward-toast-icon" />
          <span>+{rewardNotice.xp} XP</span>
          <strong>{rewardNotice.rank.name}</strong>
        </div>
      )}
      <main className="reader-container full">
        <div className="reader-layout full">
          <section className="reader-doc full">
            <div className="reader-topbar">
              <button
                className="reader-back"
                onClick={() => navigate("/child/missions")}
              >
                <ArrowLeft className="icon" /> Back
              </button>
              <div className="reader-title">
                {selectedQuiz ? (
                  <span className="reader-quiz-titletext">Quiz</span>
                ) : (
                  <>{mission?.title || "Reading Task"}</>
                )}
              </div>
              <div className="reader-spacer" />
            </div>

            {selectedQuiz ? (
              <div className="reader-main-quiz">
                <div className="main-quiz-shell" aria-label="Quiz content">
                  <button
                    type="button"
                    className="main-quiz-side-btn left"
                    onClick={goPrevQuiz}
                    disabled={quizIndex <= 0}
                    aria-label="Previous question"
                    title="Previous"
                  >
                    <ChevronLeft className="icon" />
                  </button>

                  <div
                    className={
                      selectedQuiz.completed
                        ? "main-quiz-card completed"
                        : "main-quiz-card"
                    }
                  >
                    <div className="main-quiz-heading">
                      {selectedQuiz.completed ? (
                        <Check className="icon" />
                      ) : (
                        <HelpCircle className="icon" />
                      )}
                      <h2>{selectedQuiz.question}</h2>
                      <button
                        type="button"
                        className="quiz-read-aloud-btn"
                        onClick={() => speakText(selectedQuiz.question)}
                        disabled={!speechSupported}
                        aria-label="Read quiz question aloud"
                      >
                        <Volume2 className="icon-xs" />
                      </button>
                    </div>
                    <div className="main-quiz-options">
                      {quizOptions(selectedQuiz).map((option) => {
                        const isSelected =
                          selectedQuiz.selected_option === option.key;
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
                            ]
                              .filter(Boolean)
                              .join(" ")}
                            onClick={() =>
                              submitQuizAnswer(selectedQuiz, option.key)
                            }
                            disabled={selectedQuiz.completed}
                          >
                            <span>{option.key}</span>
                            {option.text}
                          </button>
                        );
                      })}
                    </div>
                    {selectedQuiz.selected_option && (
                      <div
                        className={
                          selectedQuiz.completed
                            ? "main-quiz-feedback correct"
                            : "main-quiz-feedback wrong"
                        }
                      >
                        {selectedQuiz.completed
                          ? "Correct. Completed."
                          : "Not correct. Try again."}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="main-quiz-side-btn right"
                    onClick={goNextQuiz}
                    disabled={quizIndex >= quizzes.length - 1}
                    aria-label="Next question"
                    title="Next"
                  >
                    <ChevronRight className="icon" />
                  </button>
                </div>
              </div>
            ) : fileUrl ? (
              <iframe
                className="reader-frame full"
                src={fileUrl}
                title="Learning material"
              />
            ) : (
              <div className="reader-empty">
                No file or quiz found. Please ask your parent to add one.
              </div>
            )}
          </section>

          <aside className="reader-timer full">
            <div className="reader-side-content">
              <FocusCameraPanel onDistractionChange={handleDistractionChange} />

              <div className="timer-card">
                <div className="timer-card-heading">
                  <h3>{selectedFile ? "File Timer" : "Quiz"}</h3>
                  <button
                    type="button"
                    className="read-aloud-btn"
                    onClick={readCurrentInstruction}
                    disabled={!speechSupported || (!selectedFile && !selectedQuiz)}
                    aria-label="Read this step aloud"
                    title={speechSupported ? "Read aloud" : "Read aloud is not supported in this browser"}
                  >
                    <Volume2 className="icon-xs" />
                    Read aloud
                  </button>
                </div>
                {selectedFile ? (
                  <>
                    {/* Thanh chạy ngược màu xanh lục (#22c55e) */}
                    <div
                      style={{
                        width: "100%",
                        height: "12px",
                        backgroundColor: "#e5e7eb",
                        borderRadius: "999px",
                        overflow: "hidden",
                        marginBottom: "16px",
                      }}
                      title={`${formatTime(timeLeft)} remaining`}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${progressPercent}%`,
                          backgroundColor: "#6A8F8C",
                          transition: "width 1s linear",
                        }}
                      />
                    </div>

                    <button
                      className="timer-btn"
                      onClick={toggleTimer}
                      disabled={isFileCompleted(selectedFile)}
                    >
                      {isRunning ? (
                        <Pause className="icon" />
                      ) : (
                        <Play className="icon" />
                      )}
                      {isRunning ? "Pause" : "Start"}
                    </button>
                    <div className="timer-meta">
                      Goal: {totalMinutes} minutes for this file
                    </div>
                  </>
                ) : (
                  <div className="timer-empty">
                    Answer the quiz correctly to complete it.
                  </div>
                )}
                {fileUrl && (
                  <div className="reader-link">
                    <a href={fileUrl} target="_blank" rel="noreferrer">
                      Open in new tab
                    </a>
                  </div>
                )}

                {quizzes.length > 0 && (
                  <button
                    type="button"
                    className={
                      selectedQuiz
                        ? "reader-file-item active reader-quiz-tab"
                        : "reader-file-item reader-quiz-tab"
                    }
                    onClick={openQuizTab}
                  >
                    <HelpCircle className="icon-xs" />
                    <span>
                      <strong>Quiz</strong>
                      <small>{quizzes.length} Questions</small>
                    </span>
                  </button>
                )}

                <div className="reader-file-list">
                  {(mission?.files || []).map((file) => (
                    <button
                      type="button"
                      key={`file-${file.id}`}
                      className={
                        selectedFile?.id === file.id
                          ? "reader-file-item active"
                          : "reader-file-item"
                      }
                      onClick={() => selectFile(file)}
                    >
                      {isFileCompleted(file) ? (
                        <Check className="icon-xs" />
                      ) : (
                        <FileText className="icon-xs" />
                      )}
                      <span>
                        <strong>{file.original_name}</strong>
                        <small>{getFileTimeLabel(file, mission)}</small>
                      </span>
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
