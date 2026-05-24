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

export function getFileMinutes(file: MissionFile | null | undefined, mission?: Mission | null) {
  const fileMinutes = Number(file?.time_minutes || 0);
  if (fileMinutes > 0) return fileMinutes;

  const missionMinutes = Number(mission?.time_minutes || 0);
  if (missionMinutes > 0) return missionMinutes;

  const parsedMissionTime = parseInt(String(mission?.time ?? "").replace(/[^0-9]/g, ""), 10);
  return parsedMissionTime > 0 ? parsedMissionTime : 15;
}

export function getFileTimeLabel(file: MissionFile | null | undefined, mission?: Mission | null) {
  return `${getFileMinutes(file, mission)} min`;
}

export function getMissionTimeLabel(mission: Mission) {
  const files = mission.files || [];
  if (files.length === 1) return getFileTimeLabel(files[0], mission);
  if (files.length > 1) {
    const totalMinutes = files.reduce((sum, file) => sum + getFileMinutes(file, mission), 0);
    return `${files.length} files - ${totalMinutes} min total`;
  }

  if (mission.time_minutes) return `${mission.time_minutes} min`;
  return mission.time || "No file time";
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
