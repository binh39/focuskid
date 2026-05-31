export type SpeechLanguage = "vi-VN" | "en-US";

const VIETNAMESE_ACCENT_PATTERN = /[ăâđêôơưáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;

const VIETNAMESE_WORD_PATTERN =
  /\b(con|cau|câu|hoi|hỏi|bai|bài|hoc|học|hay|hãy|nhin|nhìn|lai|lại|dap|đáp|an|án|dung|đúng|tiep|tiếp|tuc|tục|nhe|nhé|toan|toán|doc|đọc|hieu|hiểu)\b/i;

export function canSpeakText() {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance !== "undefined"
  );
}

export function detectSpeechLanguage(text: string): SpeechLanguage {
  return VIETNAMESE_ACCENT_PATTERN.test(text) || VIETNAMESE_WORD_PATTERN.test(text) ? "vi-VN" : "en-US";
}

export function cancelSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}

function getVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  return window.speechSynthesis.getVoices?.() || [];
}

function pickVoice(language: SpeechLanguage) {
  const voices = getVoices();
  const primary = language.split("-")[0].toLowerCase();
  return (
    voices.find((voice) => voice.lang.toLowerCase() === language.toLowerCase()) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith(primary)) ||
    null
  );
}

export function speakText(text: string) {
  const cleanText = text.trim();
  if (!cleanText || !canSpeakText()) return false;

  const language = detectSpeechLanguage(cleanText);
  const voice = pickVoice(language);

  cancelSpeech();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = language;
  utterance.rate = language === "vi-VN" ? 0.9 : 0.92;
  utterance.pitch = 1;
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
  return true;
}
