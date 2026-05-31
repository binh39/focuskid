import { describe, expect, it } from "vitest";
import type { Mission } from "../types";
import { DEFAULT_FOCUS_PREFERENCES } from "./preferences";
import { getFocusDurationSeconds, getBreakDurationSeconds } from "./focusRhythm";

const mission = {
  time_minutes: 20,
} as Mission;

describe("focus rhythm helpers", () => {
  it("prefers the mission duration when one is assigned", () => {
    expect(getFocusDurationSeconds(mission, DEFAULT_FOCUS_PREFERENCES)).toBe(20 * 60);
  });

  it("falls back to the saved focus preference when no mission duration exists", () => {
    expect(getFocusDurationSeconds(null, { ...DEFAULT_FOCUS_PREFERENCES, focusLength: 15 })).toBe(15 * 60);
  });

  it("uses the saved break preference for the break timer", () => {
    expect(getBreakDurationSeconds({ ...DEFAULT_FOCUS_PREFERENCES, breakLength: 7 })).toBe(7 * 60);
  });
});
