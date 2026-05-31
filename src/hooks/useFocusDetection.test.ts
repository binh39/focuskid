import { describe, expect, it } from "vitest";
import { DEFAULT_FOCUS_DETECTION_OPTIONS } from "./useFocusDetection";

describe("useFocusDetection defaults", () => {
  it("shows gentle reminder after 3 seconds of distraction", () => {
    expect(DEFAULT_FOCUS_DETECTION_OPTIONS.distractionSeconds).toBe(3);
  });
});
