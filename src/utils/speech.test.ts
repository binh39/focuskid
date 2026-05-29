import { beforeEach, describe, expect, it, vi } from "vitest";
import { cancelSpeech, canSpeakText, speakText } from "./speech";

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

  it("speaks text when browser speech synthesis is available", () => {
    const speak = vi.fn();
    const cancel = vi.fn();
    class FakeUtterance {
      text: string;
      rate = 1;
      pitch = 1;
      constructor(text: string) {
        this.text = text;
      }
    }

    vi.stubGlobal("window", { speechSynthesis: { speak, cancel }, SpeechSynthesisUtterance: FakeUtterance });
    vi.stubGlobal("speechSynthesis", { speak, cancel });
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);

    expect(speakText("Take a calm breath")).toBe(true);
    expect(cancel).toHaveBeenCalledOnce();
    expect(speak).toHaveBeenCalledOnce();
    expect(speak.mock.calls[0][0]).toMatchObject({ text: "Take a calm breath", rate: 0.92, pitch: 1 });
  });

  it("cancels current speech safely", () => {
    const cancel = vi.fn();
    vi.stubGlobal("window", { speechSynthesis: { cancel } });
    vi.stubGlobal("speechSynthesis", { cancel });

    cancelSpeech();

    expect(cancel).toHaveBeenCalledOnce();
  });
});
