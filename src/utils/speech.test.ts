import { beforeEach, describe, expect, it, vi } from "vitest";
import { cancelSpeech, canSpeakText, detectSpeechLanguage, speakText } from "./speech";

class FakeUtterance {
  text: string;
  rate = 1;
  pitch = 1;
  lang = "";
  voice: SpeechSynthesisVoice | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

const createVoice = (name: string, lang: string) => ({ name, lang }) as SpeechSynthesisVoice;

describe("speech utility", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("reports unsupported when SpeechSynthesis is missing", () => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("speechSynthesis", undefined);
    vi.stubGlobal("SpeechSynthesisUtterance", undefined);

    expect(canSpeakText()).toBe(false);
  });

  it("detects Vietnamese text from accented letters and Vietnamese words", () => {
    expect(detectSpeechLanguage("Câu hỏi trắc nghiệm. Con hãy chọn đáp án đúng.")).toBe("vi-VN");
    expect(detectSpeechLanguage("Hay nhin lai bai hoc va tiep tuc nhe.")).toBe("vi-VN");
  });

  it("detects English text when there are no Vietnamese signals", () => {
    expect(detectSpeechLanguage("Take a calm breath and look back at the lesson.")).toBe("en-US");
  });

  it("speaks Vietnamese text with a Vietnamese voice when available", () => {
    const speak = vi.fn();
    const cancel = vi.fn();
    const vietnameseVoice = createVoice("Microsoft An", "vi-VN");
    const englishVoice = createVoice("Microsoft Jenny", "en-US");

    vi.stubGlobal("window", {
      speechSynthesis: { speak, cancel, getVoices: () => [englishVoice, vietnameseVoice] },
      SpeechSynthesisUtterance: FakeUtterance,
    });
    vi.stubGlobal("speechSynthesis", { speak, cancel, getVoices: () => [englishVoice, vietnameseVoice] });
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);

    expect(speakText("Con hãy nhìn lại bài học nhé.")).toBe(true);
    expect(cancel).toHaveBeenCalledOnce();
    expect(speak).toHaveBeenCalledOnce();
    expect(speak.mock.calls[0][0]).toMatchObject({
      text: "Con hãy nhìn lại bài học nhé.",
      lang: "vi-VN",
      rate: 0.9,
      pitch: 1,
      voice: vietnameseVoice,
    });
  });

  it("speaks English text with an English voice when available", () => {
    const speak = vi.fn();
    const cancel = vi.fn();
    const vietnameseVoice = createVoice("Microsoft An", "vi-VN");
    const englishVoice = createVoice("Microsoft Jenny", "en-US");

    vi.stubGlobal("window", {
      speechSynthesis: { speak, cancel, getVoices: () => [vietnameseVoice, englishVoice] },
      SpeechSynthesisUtterance: FakeUtterance,
    });
    vi.stubGlobal("speechSynthesis", { speak, cancel, getVoices: () => [vietnameseVoice, englishVoice] });
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);

    expect(speakText("Take a calm breath")).toBe(true);
    expect(speak.mock.calls[0][0]).toMatchObject({
      text: "Take a calm breath",
      lang: "en-US",
      rate: 0.92,
      pitch: 1,
      voice: englishVoice,
    });
  });

  it("cancels current speech safely", () => {
    const cancel = vi.fn();
    vi.stubGlobal("window", { speechSynthesis: { cancel } });
    vi.stubGlobal("speechSynthesis", { cancel });

    cancelSpeech();

    expect(cancel).toHaveBeenCalledOnce();
  });
});
