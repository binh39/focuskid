import type { Mission } from "../types";

const MISSION_CACHE_PREFIX = "focuskid_missions_cache";

type MissionCachePayload = {
  missions: Mission[];
  savedAt: number;
};

const getCacheKey = (userId: number) => `${MISSION_CACHE_PREFIX}:${userId}`;

const isMissionArray = (value: unknown): value is Mission[] => Array.isArray(value);

export function loadCachedMissions(userId: number | null | undefined): Mission[] {
  if (!userId) return [];

  try {
    const raw = localStorage.getItem(getCacheKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<MissionCachePayload>;
    return isMissionArray(parsed.missions) ? parsed.missions : [];
  } catch {
    localStorage.removeItem(getCacheKey(userId));
    return [];
  }
}

export function saveCachedMissions(userId: number | null | undefined, missions: Mission[]) {
  if (!userId) return;

  localStorage.setItem(
    getCacheKey(userId),
    JSON.stringify({ missions, savedAt: Date.now() } satisfies MissionCachePayload),
  );
}

export function upsertCachedMission(userId: number | null | undefined, mission: Mission) {
  if (!userId) return;

  const current = loadCachedMissions(userId);
  const next = current.some((item) => item.id === mission.id)
    ? current.map((item) => (item.id === mission.id ? mission : item))
    : [...current, mission];

  saveCachedMissions(userId, next);
}
