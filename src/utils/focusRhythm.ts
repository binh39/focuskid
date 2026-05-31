import type { Mission } from "../types";
import type { FocusPreferences } from "./preferences";

export function getFocusDurationSeconds(mission: Mission | null, preferences: FocusPreferences) {
  const missionMinutes = Number(mission?.time_minutes || 0);
  const focusMinutes = missionMinutes > 0 ? missionMinutes : preferences.focusLength;
  return focusMinutes * 60;
}

export function getBreakDurationSeconds(preferences: FocusPreferences) {
  return preferences.breakLength * 60;
}
