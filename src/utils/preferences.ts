export type FocusPreferences = {
  focusLength: number;
  breakLength: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  focusHelperEnabled: boolean;
};

export const FOCUS_PREFERENCES_KEY = "focuskid_preferences";

export const DEFAULT_FOCUS_PREFERENCES: FocusPreferences = {
  focusLength: 15,
  breakLength: 5,
  soundEnabled: true,
  notificationsEnabled: true,
  focusHelperEnabled: true,
};

const clampMinutes = (value: unknown, min: number, max: number, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.round(parsed), min), max);
};

const normalizeBoolean = (value: unknown, fallback: boolean) =>
  typeof value === "boolean" ? value : fallback;

const normalizePreferences = (value: Partial<FocusPreferences> = {}): FocusPreferences => ({
  focusLength: clampMinutes(
    value.focusLength,
    5,
    30,
    DEFAULT_FOCUS_PREFERENCES.focusLength,
  ),
  breakLength: clampMinutes(
    value.breakLength,
    3,
    15,
    DEFAULT_FOCUS_PREFERENCES.breakLength,
  ),
  soundEnabled: normalizeBoolean(
    value.soundEnabled,
    DEFAULT_FOCUS_PREFERENCES.soundEnabled,
  ),
  notificationsEnabled: normalizeBoolean(
    value.notificationsEnabled,
    DEFAULT_FOCUS_PREFERENCES.notificationsEnabled,
  ),
  focusHelperEnabled: normalizeBoolean(
    value.focusHelperEnabled,
    DEFAULT_FOCUS_PREFERENCES.focusHelperEnabled,
  ),
});

export function loadFocusPreferences(): FocusPreferences {
  try {
    const raw = localStorage.getItem(FOCUS_PREFERENCES_KEY);
    if (!raw) return DEFAULT_FOCUS_PREFERENCES;
    return normalizePreferences(JSON.parse(raw));
  } catch {
    return DEFAULT_FOCUS_PREFERENCES;
  }
}

export function saveFocusPreferences(
  preferences: Partial<FocusPreferences>,
): FocusPreferences {
  const normalized = normalizePreferences(preferences);
  localStorage.setItem(FOCUS_PREFERENCES_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event("focuskid_preferences_updated"));
  return normalized;
}
