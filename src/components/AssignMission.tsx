import { useState } from "react";
import type { Mission, QuizOption } from "../types";

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
  const [time, setTime] = useState("15");
  const [quizzes, setQuizzes] = useState<QuizDraft[]>([createEmptyQuiz()]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();
      form.append("title", title || "New Mission");
      form.append("time_minutes", String(time));

      const storedUser = localStorage.getItem("focuskid_user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      form.append("parent_id", parsedUser?.id ? String(parsedUser.id) : "1");

      form.append("quizzes", JSON.stringify(quizzes.filter(isQuizReady)));
      files.forEach((file) => form.append("files", file));

      const res = await fetch("http://localhost:4000/api/missions", { method: "POST", body: form });
      const json = (await res.json()) as Mission;
      onCreate(json);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <header className="modal-header">
          <h3>Assign New Mission</h3>
          <button type="button" className="close" onClick={onClose}>x</button>
        </header>

        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Math Practice" />
          </label>

          <label>
            Duration (minutes)
            <input type="number" min={1} value={time} onChange={(e) => setTime(e.target.value)} />
          </label>

          <label>
            Attach reading files
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files ? Array.from(e.target.files) : [])}
            />
          </label>

          {files.length > 0 && (
            <div className="selected-files">
              {files.map((file) => (
                <span key={`${file.name}-${file.size}`}>{file.name}</span>
              ))}
            </div>
          )}

          <div className="quiz-builder">
            <div className="quiz-builder-head">
              <strong>Quiz</strong>
              <button type="button" className="text-action-btn" onClick={addQuiz}>Add Quiz</button>
            </div>

            {quizzes.map((quiz, index) => (
              <div className="quiz-editor" key={index}>
                <div className="quiz-editor-title">
                  <span>Question {index + 1}</span>
                  <button type="button" className="text-action-btn danger" onClick={() => removeQuiz(index)}>Remove</button>
                </div>
                <label>
                  Question
                  <input
                    value={quiz.question}
                    onChange={(e) => updateQuiz(index, "question", e.target.value)}
                    placeholder="What is 2 + 2?"
                  />
                </label>
                <div className="quiz-options-editor">
                  <label>
                    A
                    <input value={quiz.option_a} onChange={(e) => updateQuiz(index, "option_a", e.target.value)} />
                  </label>
                  <label>
                    B
                    <input value={quiz.option_b} onChange={(e) => updateQuiz(index, "option_b", e.target.value)} />
                  </label>
                  <label>
                    C
                    <input value={quiz.option_c} onChange={(e) => updateQuiz(index, "option_c", e.target.value)} />
                  </label>
                  <label>
                    D
                    <input value={quiz.option_d} onChange={(e) => updateQuiz(index, "option_d", e.target.value)} />
                  </label>
                </div>
                <label>
                  Correct answer
                  <select value={quiz.correct_option} onChange={(e) => updateQuiz(index, "correct_option", e.target.value)}>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </label>
              </div>
            ))}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn primary" disabled={loading}>{loading ? "Creating..." : "Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
