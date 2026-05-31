import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mission } from "../types";
import { loadCachedMissions, saveCachedMissions, upsertCachedMission } from "./missionCache";

const createMemoryStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    removeItem: (key: string) => {
      values.delete(key);
    },
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
};

const sampleMission = { id: 7, title: "Read a story" } as Mission;
const updatedMission = { id: 7, title: "Read a calm story" } as Mission;
const extraMission = { id: 8, title: "Answer a quiz" } as Mission;

describe("mission cache", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createMemoryStorage());
  });

  it("loads cached missions for a user", () => {
    saveCachedMissions(12, [sampleMission]);

    expect(loadCachedMissions(12)).toEqual([sampleMission]);
  });

  it("updates a cached mission in place when ids match", () => {
    saveCachedMissions(12, [sampleMission, extraMission]);

    upsertCachedMission(12, updatedMission);

    expect(loadCachedMissions(12)).toEqual([updatedMission, extraMission]);
  });

  it("appends a cached mission when it is new", () => {
    saveCachedMissions(12, [sampleMission]);

    upsertCachedMission(12, extraMission);

    expect(loadCachedMissions(12)).toEqual([sampleMission, extraMission]);
  });

  it("returns an empty array when cache is malformed", () => {
    localStorage.setItem("focuskid_missions_cache:12", "{");

    expect(loadCachedMissions(12)).toEqual([]);
    expect(localStorage.getItem("focuskid_missions_cache:12")).toBeNull();
  });

  it("ignores missing user ids", () => {
    expect(loadCachedMissions(null)).toEqual([]);
    expect(loadCachedMissions(undefined)).toEqual([]);

    saveCachedMissions(null, [sampleMission]);
    saveCachedMissions(undefined, [sampleMission]);

    expect(localStorage.getItem("focuskid_missions_cache:null")).toBeNull();
  });
});
