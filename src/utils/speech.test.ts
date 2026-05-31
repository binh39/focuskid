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

  it("defaults to English speech when reading aloud", async () => {
    const speak = vi.fn();
    const cancel = vi.fn();
    const englishVoice = createVoice("Microsoft Jenny", "en-US");
    const vietnameseVoice = createVoice("Microsoft An", "vi-VN");

    vi.stubGlobal("window", {
      speechSynthesis: { speak, cancel, getVoices: () => [vietnameseVoice, englishVoice] },
      SpeechSynthesisUtterance: FakeUtterance,
    });
    vi.stubGlobal("speechSynthesis", { speak, cancel, getVoices: () => [vietnameseVoice, englishVoice] });
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: false })));

    await expect(speakText("Câu hỏi trắc nghiệm. Con hãy chọn đáp án đúng.")).resolves.toBe(true);

    expect(speak.mock.calls[0][0]).toMatchObject({
      text: "Câu hỏi trắc nghiệm. Con hãy chọn đáp án đúng.",
      lang: "en-US",
      rate: 0.92,
      pitch: 1,
      voice: englishVoice,
    });
  });

  it("plays ElevenLabs audio before falling back to browser speech", async () => {
    const play = vi.fn(() => Promise.resolve());
    const addEventListener = vi.fn();
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        blob: () => Promise.resolve(new Blob(["audio"], { type: "audio/mpeg" })),
      }),
    );
    const createObjectURL = vi.fn(() => "blob:tts");
    const revokeObjectURL = vi.fn();
    const Audio = vi.fn(function Audio() {
      return { addEventListener, currentTime: 0, pause: vi.fn(), play };
    });

    vi.stubGlobal("fetch", fetch);
    vi.stubGlobal("Audio", Audio);
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
    vi.stubGlobal("window", {
      speechSynthesis: { speak: vi.fn(), cancel: vi.fn(), getVoices: () => [] },
      SpeechSynthesisUtterance: FakeUtterance,
    });
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);

    await expect(speakText("Con hãy đọc tiếp nhé.")).resolves.toBe(true);

    expect(fetch).toHaveBeenCalledWith("http://localhost:4000/api/tts", expect.objectContaining({ method: "POST" }));
    expect(Audio).toHaveBeenCalledWith("blob:tts");
    expect(play).toHaveBeenCalledOnce();
    expect(revokeObjectURL).not.toHaveBeenCalledWith("blob:tts");
  });

  it("falls back to browser speech when ElevenLabs audio is unavailable", async () => {
    const speak = vi.fn();
    const cancel = vi.fn();
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: false })));
    vi.stubGlobal("window", {
      speechSynthesis: { speak, cancel, getVoices: () => [] },
      SpeechSynthesisUtterance: FakeUtterance,
    });
    vi.stubGlobal("speechSynthesis", { speak, cancel, getVoices: () => [] });
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);

    await expect(speakText("Con hãy đọc tiếp nhé.")).resolves.toBe(true);

    expect(cancel).toHaveBeenCalledTimes(1);
    expect(speak).toHaveBeenCalledOnce();
  });

  it("cancels current speech safely", () => {
    const cancel = vi.fn();
    vi.stubGlobal("window", { speechSynthesis: { cancel } });
    vi.stubGlobal("speechSynthesis", { cancel });

    cancelSpeech();

    expect(cancel).toHaveBeenCalledOnce();
  });

  it("stops active ElevenLabs audio when speech is canceled", async () => {
    const play = vi.fn(() => Promise.resolve());
    const pause = vi.fn();
    const audio = { addEventListener: vi.fn(), currentTime: 12, pause, play };
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        blob: () => Promise.resolve(new Blob(["audio"], { type: "audio/mpeg" })),
      }),
    );
    const createObjectURL = vi.fn(() => "blob:tts");
    const revokeObjectURL = vi.fn();
    const Audio = vi.fn(function Audio() {
      return audio;
    });

    vi.stubGlobal("fetch", fetch);
    vi.stubGlobal("Audio", Audio);
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
    vi.stubGlobal("window", {
      speechSynthesis: { speak: vi.fn(), cancel: vi.fn(), getVoices: () => [] },
      SpeechSynthesisUtterance: FakeUtterance,
    });
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);

    await speakText("Con hãy đọc tiếp nhé.");
    cancelSpeech();

    expect(pause).toHaveBeenCalledOnce();
    expect(audio.currentTime).toBe(0);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:tts");
  });
});
