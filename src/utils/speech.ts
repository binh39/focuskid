export type SpeechLanguage = "vi-VN" | "en-US";

const VIETNAMESE_ACCENT_PATTERN = /[ăâđêôơưáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;

const VIETNAMESE_WORD_PATTERN =
  /\b(con|cau|câu|hoi|hỏi|bai|bài|hoc|học|hay|hãy|nhin|nhìn|lai|lại|dap|đáp|an|án|dung|đúng|tiep|tiếp|tuc|tục|nhe|nhé|toan|toán|doc|đọc|hieu|hiểu)\b/i;

const TTS_ENDPOINT = "http://localhost:4000/api/tts";

let currentBackendAudio: HTMLAudioElement | null = null;
let currentBackendAudioUrl: string | null = null;
let speechSessionId = 0;

function stopBackendAudio() {
  if (currentBackendAudio) {
    currentBackendAudio.pause();
    currentBackendAudio.currentTime = 0;
  }

  if (currentBackendAudioUrl) {
    URL.revokeObjectURL(currentBackendAudioUrl);
  }

  currentBackendAudio = null;
  currentBackendAudioUrl = null;
}

function stopBrowserSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}

function stopActiveSpeech() {
  stopBackendAudio();
  stopBrowserSpeech();
}

function isCurrentSpeech(sessionId: number) {
  return sessionId === speechSessionId;
}

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
  speechSessionId += 1;
  stopActiveSpeech();
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

function speakWithBrowser(text: string, language: SpeechLanguage, sessionId: number) {
  if (!canSpeakText() || !isCurrentSpeech(sessionId)) return false;

  const voice = pickVoice(language);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = language === "vi-VN" ? 0.9 : 0.92;
  utterance.pitch = 1;
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
  return true;
}

async function speakWithBackend(text: string, language: SpeechLanguage, sessionId: number) {
  if (typeof fetch === "undefined" || typeof Audio === "undefined" || typeof URL === "undefined") return false;

  try {
    const response = await fetch(TTS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language }),
    });
    if (!response.ok || !isCurrentSpeech(sessionId)) return false;

    const audioUrl = URL.createObjectURL(await response.blob());
    if (!isCurrentSpeech(sessionId)) {
      URL.revokeObjectURL(audioUrl);
      return false;
    }

    const audio = new Audio(audioUrl);
    currentBackendAudio = audio;
    currentBackendAudioUrl = audioUrl;
    audio.addEventListener(
      "ended",
      () => {
        if (currentBackendAudio !== audio) return;
        stopBackendAudio();
      },
      { once: true },
    );
    await audio.play();
    return true;
  } catch (error) {
    console.error("Backend TTS failed", error);
    return false;
  }
}

export async function speakText(text: string) {
  const cleanText = text.trim();
  if (!cleanText) return false;

  const sessionId = speechSessionId + 1;
  speechSessionId = sessionId;
  stopActiveSpeech();

  const language: SpeechLanguage = "en-US";
  if (await speakWithBackend(cleanText, language, sessionId)) return true;
  return speakWithBrowser(cleanText, language, sessionId);
}
