export type UserRole = "parent" | "child";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  xp?: number;
};

export type Subtask = {
  id: number;
  title: string;
  completed: boolean;
};

export type MissionFile = {
  id: number;
  mission_id: number;
  file_path: string;
  original_name: string;
  time_minutes?: number | null;
  completed: boolean;
};

export type QuizOption = "A" | "B" | "C" | "D";

export type MissionQuiz = {
  id: number;
  mission_id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: QuizOption;
  selected_option?: QuizOption | null;
  completed: boolean;
};

export type Mission = {
  id: number;
  title: string;
  icon?: string;
  progress?: number;
  color?: string;
  time?: string;
  time_minutes?: number;
  file_path?: string | null;
  parent_id?: number | null;
  subtasks: Subtask[];
  files?: MissionFile[];
  quizzes?: MissionQuiz[];
};
