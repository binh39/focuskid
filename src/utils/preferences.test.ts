import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_FOCUS_PREFERENCES,
  loadFocusPreferences,
  saveFocusPreferences,
} from "./preferences";

const createMemoryStorage = () => {
  const values = new Map<string, string>();
  return {
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, value),
  };
};

describe("focus preferences", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createMemoryStorage());
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
  });

  it("returns ADHD-friendly defaults when nothing has been saved", () => {
    expect(loadFocusPreferences()).toEqual(DEFAULT_FOCUS_PREFERENCES);
  });

  it("clamps saved session lengths to child-safe ranges", () => {
    localStorage.setItem(
      "focuskid_preferences",
      JSON.stringify({ focusLength: 90, breakLength: 1 }),
    );

    expect(loadFocusPreferences()).toMatchObject({
      focusLength: 30,
      breakLength: 3,
    });
  });

  it("falls back to defaults for malformed boolean values", () => {
    localStorage.setItem(
      "focuskid_preferences",
      JSON.stringify({ soundEnabled: "false", focusHelperEnabled: 0 }),
    );

    expect(loadFocusPreferences()).toMatchObject({
      soundEnabled: true,
      focusHelperEnabled: true,
    });
  });

  it("persists preferences for future screens", () => {
    const preferences = saveFocusPreferences({
      focusLength: 15,
      breakLength: 5,
      soundEnabled: false,
      notificationsEnabled: true,
      focusHelperEnabled: false,
    });

    expect(preferences.focusLength).toBe(15);
    expect(loadFocusPreferences()).toEqual(preferences);
  });
});
