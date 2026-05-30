import { describe, expect, it } from "vitest";
import { DEFAULT_MISSION_TEMPLATES, getTemplateQuizDrafts } from "./missionTemplates";

const MathTemplateKey = "basic-math";

const getMathTemplate = () => DEFAULT_MISSION_TEMPLATES.find((template) => template.key === MathTemplateKey);

describe("missionTemplates", () => {
  it("provides default templates with ready quiz content", () => {
    expect(DEFAULT_MISSION_TEMPLATES.length).toBeGreaterThanOrEqual(4);
    expect(DEFAULT_MISSION_TEMPLATES.some((template) => template.key === MathTemplateKey)).toBe(true);
    expect(DEFAULT_MISSION_TEMPLATES.every((template) => template.quizzes.length > 0)).toBe(true);
  });

  it("returns cloned quiz drafts so form edits do not mutate templates", () => {
    const template = getMathTemplate();
    expect(template).toBeDefined();

    const drafts = getTemplateQuizDrafts(template!);
    drafts[0].question = "Changed by form";

    expect(template!.quizzes[0].question).not.toBe("Changed by form");
  });
});
