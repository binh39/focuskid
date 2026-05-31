import { useState } from "react";
import type { Mission, QuizOption } from "../types";
import { DEFAULT_MISSION_TEMPLATES, getTemplateQuizDrafts, type MissionTemplate } from "../utils/missionTemplates";
import { getStoredUser } from "../utils/rewards";

type Props = {
  onClose: () => void;
  onCreate: (mission: Mission) => void;
};

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

export default function AssignMission({ onClose, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [quizzes, setQuizzes] = useState<QuizDraft[]>([createEmptyQuiz()]);
  const [fileDrafts, setFileDrafts] = useState<FileDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string | null>(null);

  const applyTemplate = (template: MissionTemplate) => {
    setSelectedTemplateKey(template.key);
    setTitle(template.title);
    setQuizzes(getTemplateQuizDrafts(template));
  };

  const updateQuiz = (index: number, field: QuizField, value: string) => {
    setQuizzes((prev) =>
      prev.map((quiz, quizIndex) =>
        quizIndex === index ? { ...quiz, [field]: field === "correct_option" ? (value as QuizOption) : value } : quiz,
      ),
    );
  };

  const addQuiz = () => {
    setQuizzes((prev) => [...prev, createEmptyQuiz()]);
  };

  const removeQuiz = (index: number) => {
    setQuizzes((prev) => (prev.length === 1 ? [createEmptyQuiz()] : prev.filter((_, quizIndex) => quizIndex !== index)));
  };

  const handleFileSelection = (fileList: FileList | null) => {
    setFileDrafts(
      fileList
        ? Array.from(fileList).map((file) => ({
            file,
            time_minutes: "15",
          }))
        : [],
    );
  };

  const updateFileDuration = (index: number, value: string) => {
    setFileDrafts((prev) =>
      prev.map((draft, draftIndex) => (draftIndex === index ? { ...draft, time_minutes: value } : draft)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const user = getStoredUser();
    if (!user?.id || user.role !== "parent") {
      setError("Please sign in as a parent before assigning missions.");
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append("title", title || "New Mission");
      form.append("parent_id", String(user.id));
      form.append("quizzes", JSON.stringify(quizzes.filter(isQuizReady)));
      form.append("file_durations", JSON.stringify(fileDrafts.map((draft) => Number(draft.time_minutes) || 15)));
      fileDrafts.forEach((draft) => form.append("files", draft.file));

      const res = await fetch("http://localhost:4000/api/missions", { method: "POST", body: form });
      const json = (await res.json().catch(() => null)) as (Mission & { error?: string }) | null;
      if (!res.ok || !json?.id) {
        setError(json?.error || "Mission could not be created. Please try again.");
        return;
      }

      onCreate(json);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Mission could not be created. Please check the server and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <header className="modal-header">
          <h3>Assign New Mission</h3>
          <button type="button" className="close" onClick={onClose}>
            x
          </button>
        </header>

        <form onSubmit={handleSubmit} className="modal-form">
          <section className="mission-template-picker" aria-labelledby="mission-template-title">
            <div className="mission-template-heading">
              <div>
                <h4 id="mission-template-title">Chọn đề mẫu</h4>
                <p>Chọn nhanh một nhiệm vụ có quiz sẵn, rồi chỉnh sửa trước khi tạo.</p>
              </div>
              <span>{DEFAULT_MISSION_TEMPLATES.length} mẫu</span>
            </div>
            <div className="mission-template-grid">
              {DEFAULT_MISSION_TEMPLATES.map((template) => (
                <button
                  type="button"
                  className={`mission-template-card${selectedTemplateKey === template.key ? " selected" : ""}`}
                  key={template.key}
                  onClick={() => applyTemplate(template)}
                  style={{ borderColor: selectedTemplateKey === template.key ? template.accent : undefined }}
                >
                  <span className="mission-template-dot" style={{ backgroundColor: template.accent }} />
                  <strong>{template.title}</strong>
                  <small>{template.minutesLabel}</small>
                  <p>{template.description}</p>
                </button>
              ))}
            </div>
          </section>

          <label>
            Title
            <input name="mission_title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Math Practice" />
          </label>

          <label>
            Attach reading files
            <input name="mission_files" type="file" multiple onChange={(e) => handleFileSelection(e.target.files)} />
          </label>

          {fileDrafts.length > 0 && (
            <div className="file-draft-list">
              {fileDrafts.map((draft, index) => (
                <div className="file-draft-row" key={`${draft.file.name}-${draft.file.size}-${draft.file.lastModified}`}>
                  <span>{draft.file.name}</span>
                  <label>
                    Minutes
                    <input
                      type="number"
                      min={1}
                      max={240}
                      name={`file_minutes_${index}`}
                      value={draft.time_minutes}
                      onChange={(e) => updateFileDuration(index, e.target.value)}
                    />
                  </label>
                </div>
              ))}
            </div>
          )}

          <div className="quiz-builder">
            <div className="quiz-builder-head">
              <strong>Quiz</strong>
              <button type="button" className="text-action-btn" onClick={addQuiz}>
                Add Quiz
              </button>
            </div>

            {quizzes.map((quiz, index) => (
              <div className="quiz-editor" key={index}>
                <div className="quiz-editor-title">
                  <span>Question {index + 1}</span>
                  <button type="button" className="text-action-btn danger" onClick={() => removeQuiz(index)}>
                    Remove
                  </button>
                </div>
                <label>
                  Question
                  <input
                    name={`quiz_${index}_question`}
                    value={quiz.question}
                    onChange={(e) => updateQuiz(index, "question", e.target.value)}
                    placeholder="What is 2 + 2?"
                  />
                </label>
                <div className="quiz-options-editor">
                  <label>
                    A
                    <input name={`quiz_${index}_option_a`} value={quiz.option_a} onChange={(e) => updateQuiz(index, "option_a", e.target.value)} />
                  </label>
                  <label>
                    B
                    <input name={`quiz_${index}_option_b`} value={quiz.option_b} onChange={(e) => updateQuiz(index, "option_b", e.target.value)} />
                  </label>
                  <label>
                    C
                    <input name={`quiz_${index}_option_c`} value={quiz.option_c} onChange={(e) => updateQuiz(index, "option_c", e.target.value)} />
                  </label>
                  <label>
                    D
                    <input name={`quiz_${index}_option_d`} value={quiz.option_d} onChange={(e) => updateQuiz(index, "option_d", e.target.value)} />
                  </label>
                </div>
                <label>
                  Correct answer
                  <select name={`quiz_${index}_correct_option`} value={quiz.correct_option} onChange={(e) => updateQuiz(index, "correct_option", e.target.value)}>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </label>
              </div>
            ))}
          </div>

          {error && <div className="error-text">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
