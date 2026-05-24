import type { Mission, MissionFile, MissionQuiz } from "../types";

export type MissionStartItem =
  | { type: "file"; file: MissionFile }
  | { type: "quiz"; quiz: MissionQuiz }
  | { type: "focus" };

export function getMissionProgress(mission: Mission) {
  const files = mission.files || [];
  const quizzes = mission.quizzes || [];
  const trackedItems = files.length + quizzes.length;
  const total = trackedItems > 0 ? trackedItems : mission.subtasks?.length || 0;
  const completed = trackedItems > 0
    ? files.filter((file) => Boolean(file.completed)).length + quizzes.filter((quiz) => Boolean(quiz.completed)).length
    : mission.subtasks?.filter((subtask) => Boolean(subtask.completed)).length || 0;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    completed,
    total,
    percentage,
    label: total === 0 ? "0/0" : `${completed}/${total}`,
  };
}

export function getNextMissionFile(mission: Mission): MissionFile | null {
  const files = mission.files || [];
  return files.find((file) => !file.completed) || null;
}

export function getNextMissionQuiz(mission: Mission): MissionQuiz | null {
  const quizzes = mission.quizzes || [];
  return quizzes.find((quiz) => !quiz.completed) || null;
}

export function getMissionStartItem(mission: Mission): MissionStartItem {
  const nextFile = getNextMissionFile(mission);
  if (nextFile) return { type: "file", file: nextFile };

  const nextQuiz = getNextMissionQuiz(mission);
  if (nextQuiz) return { type: "quiz", quiz: nextQuiz };

  const firstFile = mission.files?.[0];
  if (firstFile) return { type: "file", file: firstFile };

  const firstQuiz = mission.quizzes?.[0];
  if (firstQuiz) return { type: "quiz", quiz: firstQuiz };

  return { type: "focus" };
}
