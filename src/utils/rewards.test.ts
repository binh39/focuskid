import { describe, expect, it } from "vitest";
import { getEarnedBadges } from "./rewards";

describe("reward badges", () => {
  it("always starts with a warm starter badge", () => {
    expect(getEarnedBadges(0)).toEqual([
      expect.objectContaining({ key: "focus-starter", name: "Focus Starter" }),
    ]);
  });

  it("unlocks calm reader and quiz star without punitive streak loss", () => {
    const badges = getEarnedBadges(320).map((badge) => badge.key);

    expect(badges).toContain("focus-starter");
    expect(badges).toContain("calm-reader");
    expect(badges).toContain("quiz-star");
    expect(badges).not.toContain("lost-streak");
  });
});
