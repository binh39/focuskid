export function canSpeakText() {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance !== "undefined"
  );
}

export function cancelSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}

export function speakText(text: string) {
  const cleanText = text.trim();
  if (!cleanText || !canSpeakText()) return false;

  cancelSpeech();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 0.92;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
  return true;
}
