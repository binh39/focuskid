import type { QuizOption } from "../types";

export type MissionTemplateQuiz = {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: QuizOption;
};

export type MissionTemplate = {
  key: string;
  title: string;
  description: string;
  minutesLabel: string;
  accent: string;
  quizzes: MissionTemplateQuiz[];
};

export const DEFAULT_MISSION_TEMPLATES: MissionTemplate[] = [
  {
    key: "basic-math",
    title: "Toán nhanh 10 phút",
    description: "Cộng trừ nhẹ để khởi động não bộ.",
    minutesLabel: "10 phút · 3 câu",
    accent: "#8fb8a8",
    quizzes: [
      { question: "5 + 3 bằng bao nhiêu?", option_a: "6", option_b: "7", option_c: "8", option_d: "9", correct_option: "C" },
      { question: "12 - 4 bằng bao nhiêu?", option_a: "6", option_b: "8", option_c: "10", option_d: "12", correct_option: "B" },
      { question: "Số nào lớn nhất?", option_a: "14", option_b: "9", option_c: "11", option_d: "7", correct_option: "A" },
    ],
  },
  {
    key: "reading-check",
    title: "Đọc hiểu ngắn",
    description: "Luyện tìm ý chính và chi tiết trong đoạn đọc.",
    minutesLabel: "15 phút · 2 câu",
    accent: "#c9a86a",
    quizzes: [
      { question: "Khi đọc một đoạn văn, con nên tìm điều gì trước?", option_a: "Ý chính", option_b: "Màu chữ", option_c: "Số trang", option_d: "Tên bút", correct_option: "A" },
      { question: "Chi tiết trong bài đọc giúp con làm gì?", option_a: "Đoán ngẫu nhiên", option_b: "Hiểu rõ ý chính hơn", option_c: "Bỏ qua câu hỏi", option_d: "Đọc nhanh mà không hiểu", correct_option: "B" },
    ],
  },
  {
    key: "fun-science",
    title: "Khoa học vui",
    description: "Câu hỏi kiến thức cơ bản, dễ chọn và ít áp lực.",
    minutesLabel: "12 phút · 3 câu",
    accent: "#9aa7d9",
    quizzes: [
      { question: "Cây cần gì để phát triển?", option_a: "Ánh sáng và nước", option_b: "Đá khô", option_c: "Bóng tối hoàn toàn", option_d: "Không khí bẩn", correct_option: "A" },
      { question: "Nước chuyển thành đá khi nào?", option_a: "Khi rất nóng", option_b: "Khi bị đóng băng", option_c: "Khi có nhiều muối", option_d: "Khi có ánh nắng", correct_option: "B" },
      { question: "Con người dùng bộ phận nào để nghe?", option_a: "Mắt", option_b: "Tay", option_c: "Tai", option_d: "Mũi", correct_option: "C" },
    ],
  },
  {
    key: "gentle-review",
    title: "Ôn tập nhẹ cuối ngày",
    description: "Một đề hỗn hợp ngắn để kết thúc ngày học bình tĩnh.",
    minutesLabel: "10 phút · 3 câu",
    accent: "#d99a8b",
    quizzes: [
      { question: "Nếu gặp câu khó, con nên làm gì?", option_a: "Bỏ cuộc ngay", option_b: "Hít thở và thử từng bước", option_c: "Đóng bài học", option_d: "Chọn đại thật nhanh", correct_option: "B" },
      { question: "7 + 2 bằng bao nhiêu?", option_a: "8", option_b: "9", option_c: "10", option_d: "11", correct_option: "B" },
      { question: "Hoàn thành một nhiệm vụ nhỏ giúp con cảm thấy thế nào?", option_a: "Tự tin hơn", option_b: "Không học được gì", option_c: "Luôn bị phạt", option_d: "Phải làm lại từ đầu", correct_option: "A" },
    ],
  },
];

export function getTemplateQuizDrafts(template: MissionTemplate) {
  return template.quizzes.map((quiz) => ({ ...quiz }));
}
