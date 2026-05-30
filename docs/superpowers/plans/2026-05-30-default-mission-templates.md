# Default Mission Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add editable default mission templates with prefilled quiz content to the existing parent Assign Mission modal.

**Architecture:** Keep templates frontend-only. Create a small focused utility file for the template catalog and copy helper, import it into `AssignMission.tsx`, and add modal card styles in `dashboard.css`. Existing backend mission creation remains unchanged because it already accepts `title` and serialized `quizzes`.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, existing CSS.

---

## File Structure

- Create `src/utils/missionTemplates.ts`: owns template types, static template catalog, and a clone helper so form edits do not mutate constants.
- Create `src/utils/missionTemplates.test.ts`: verifies catalog content and clone behavior.
- Modify `src/components/AssignMission.tsx`: renders template chooser, tracks selected template, applies template title/quizzes into existing state.
- Modify `src/assets/dashboard.css`: styles template chooser/cards inside the existing modal.
- Modify `implementation-notes.html`: records decisions, tradeoffs, and change log for this feature.

---

### Task 1: Add mission template catalog

**Files:**
- Create: `src/utils/missionTemplates.ts`
- Test: `src/utils/missionTemplates.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/utils/missionTemplates.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { DEFAULT_MISSION_TEMPLATES, getTemplateQuizDrafts } from "./missionTemplates";

describe("missionTemplates", () => {
  it("provides default templates with ready quiz content", () => {
    expect(DEFAULT_MISSION_TEMPLATES.length).toBeGreaterThanOrEqual(4);
    expect(DEFAULT_MISSION_TEMPLATES.some((template) => template.key === "basic-math")).toBe(true);
    expect(DEFAULT_MISSION_TEMPLATES.every((template) => template.quizzes.length > 0)).toBe(true);
  });

  it("returns cloned quiz drafts so form edits do not mutate templates", () => {
    const template = DEFAULT_MISSION_TEMPLATES[0];
    const drafts = getTemplateQuizDrafts(template);

    drafts[0].question = "Changed by form";

    expect(template.quizzes[0].question).not.toBe("Changed by form");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npx vitest run src/utils/missionTemplates.test.ts`

Expected: FAIL because `src/utils/missionTemplates.ts` does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `src/utils/missionTemplates.ts`:

```ts
import type { QuizOption } from "../types";

export type MissionTemplateQuiz = {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: QuizOption;
};

export type MissionTemplate = {
  key: string;
  title: string;
  description: string;
  minutesLabel: string;
  accent: string;
  quizzes: MissionTemplateQuiz[];
};

export const DEFAULT_MISSION_TEMPLATES: MissionTemplate[] = [
  {
    key: "basic-math",
    title: "Toán nhanh 10 phút",
    description: "Cộng trừ nhẹ để khởi động não bộ.",
    minutesLabel: "10 phút · 3 câu",
    accent: "#8fb8a8",
    quizzes: [
      { question: "5 + 3 bằng bao nhiêu?", option_a: "6", option_b: "7", option_c: "8", option_d: "9", correct_option: "C" },
      { question: "12 - 4 bằng bao nhiêu?", option_a: "6", option_b: "8", option_c: "10", option_d: "12", correct_option: "B" },
      { question: "Số nào lớn nhất?", option_a: "14", option_b: "9", option_c: "11", option_d: "7", correct_option: "A" },
    ],
  },
  {
    key: "reading-check",
    title: "Đọc hiểu ngắn",
    description: "Luyện tìm ý chính và chi tiết trong đoạn đọc.",
    minutesLabel: "15 phút · 2 câu",
    accent: "#c9a86a",
    quizzes: [
      { question: "Khi đọc một đoạn văn, con nên tìm điều gì trước?", option_a: "Ý chính", option_b: "Màu chữ", option_c: "Số trang", option_d: "Tên bút", correct_option: "A" },
      { question: "Chi tiết trong bài đọc giúp con làm gì?", option_a: "Đoán ngẫu nhiên", option_b: "Hiểu rõ ý chính hơn", option_c: "Bỏ qua câu hỏi", option_d: "Đọc nhanh mà không hiểu", correct_option: "B" },
    ],
  },
  {
    key: "fun-science",
    title: "Khoa học vui",
    description: "Câu hỏi kiến thức cơ bản, dễ chọn và ít áp lực.",
    minutesLabel: "12 phút · 3 câu",
    accent: "#9aa7d9",
    quizzes: [
      { question: "Cây cần gì để phát triển?", option_a: "Ánh sáng và nước", option_b: "Đá khô", option_c: "Bóng tối hoàn toàn", option_d: "Không khí bẩn", correct_option: "A" },
      { question: "Nước chuyển thành đá khi nào?", option_a: "Khi rất nóng", option_b: "Khi bị đóng băng", option_c: "Khi có nhiều muối", option_d: "Khi có ánh nắng", correct_option: "B" },
      { question: "Con người dùng bộ phận nào để nghe?", option_a: "Mắt", option_b: "Tay", option_c: "Tai", option_d: "Mũi", correct_option: "C" },
    ],
  },
  {
    key: "gentle-review",
    title: "Ôn tập nhẹ cuối ngày",
    description: "Một đề hỗn hợp ngắn để kết thúc ngày học bình tĩnh.",
    minutesLabel: "10 phút · 3 câu",
    accent: "#d99a8b",
    quizzes: [
      { question: "Nếu gặp câu khó, con nên làm gì?", option_a: "Bỏ cuộc ngay", option_b: "Hít thở và thử từng bước", option_c: "Đóng bài học", option_d: "Chọn đại thật nhanh", correct_option: "B" },
      { question: "7 + 2 bằng bao nhiêu?", option_a: "8", option_b: "9", option_c: "10", option_d: "11", correct_option: "B" },
      { question: "Hoàn thành một nhiệm vụ nhỏ giúp con cảm thấy thế nào?", option_a: "Tự tin hơn", option_b: "Không học được gì", option_c: "Luôn bị phạt", option_d: "Phải làm lại từ đầu", correct_option: "A" },
    ],
  },
];

export function getTemplateQuizDrafts(template: MissionTemplate) {
  return template.quizzes.map((quiz) => ({ ...quiz }));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npx vitest run src/utils/missionTemplates.test.ts`

Expected: PASS.

---

### Task 2: Integrate templates into Assign Mission modal

**Files:**
- Modify: `src/components/AssignMission.tsx`

- [ ] **Step 1: Import catalog and add selected template state**

Add:

```ts
import { DEFAULT_MISSION_TEMPLATES, getTemplateQuizDrafts, type MissionTemplate } from "../utils/missionTemplates";
```

Inside the component state block add:

```ts
const [selectedTemplateKey, setSelectedTemplateKey] = useState<string | null>(null);
```

- [ ] **Step 2: Add applyTemplate handler**

Before `handleSubmit`, add:

```ts
const applyTemplate = (template: MissionTemplate) => {
  setSelectedTemplateKey(template.key);
  setTitle(template.title);
  setQuizzes(getTemplateQuizDrafts(template));
};
```

- [ ] **Step 3: Render template chooser above Title field**

Inside the form, before the Title label, render:

```tsx
<section className="mission-template-picker" aria-labelledby="mission-template-title">
  <div className="mission-template-heading">
    <div>
      <h4 id="mission-template-title">Chọn đề mẫu</h4>
      <p>Chọn nhanh một nhiệm vụ có quiz sẵn, rồi chỉnh sửa trước khi tạo.</p>
    </div>
    <span>{DEFAULT_MISSION_TEMPLATES.length} mẫu</span>
  </div>
  <div className="mission-template-grid">
    {DEFAULT_MISSION_TEMPLATES.map((template) => (
      <button
        type="button"
        className={`mission-template-card${selectedTemplateKey === template.key ? " selected" : ""}`}
        key={template.key}
        onClick={() => applyTemplate(template)}
        style={{ borderColor: selectedTemplateKey === template.key ? template.accent : undefined }}
      >
        <span className="mission-template-dot" style={{ backgroundColor: template.accent }} />
        <strong>{template.title}</strong>
        <small>{template.minutesLabel}</small>
        <p>{template.description}</p>
      </button>
    ))}
  </div>
</section>
```

- [ ] **Step 4: Run TypeScript build**

Run: `rtk npm run build`

Expected: PASS or unrelated pre-existing failures only.

---

### Task 3: Style template chooser and update implementation notes

**Files:**
- Modify: `src/assets/dashboard.css`
- Modify: `implementation-notes.html`

- [ ] **Step 1: Add CSS**

Append before the mobile `@media (max-width: 760px)` near modal styles:

```css
.mission-template-picker {
  display: grid;
  gap: 10px;
  border: 1px solid #dce9e6;
  border-radius: 14px;
  background: #f6fbf9;
  padding: 12px;
}

.mission-template-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.mission-template-heading h4 {
  margin: 0;
  color: #173f3a;
  font-size: 16px;
}

.mission-template-heading p {
  margin: 4px 0 0;
  color: #5d7771;
  font-size: 13px;
  line-height: 1.4;
}

.mission-template-heading span {
  border-radius: 999px;
  background: #ffffff;
  color: #315f55;
  font-size: 12px;
  font-weight: 900;
  padding: 5px 8px;
  white-space: nowrap;
}

.mission-template-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.mission-template-card {
  position: relative;
  display: grid;
  gap: 5px;
  min-height: 120px;
  border: 2px solid transparent;
  border-radius: 14px;
  background: #ffffff;
  color: #173f3a;
  text-align: left;
  padding: 12px;
  cursor: pointer;
  box-shadow: 0 8px 16px rgba(47, 111, 104, 0.08);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.mission-template-card:hover,
.mission-template-card:focus-visible {
  transform: translateY(-1px);
  box-shadow: 0 12px 22px rgba(47, 111, 104, 0.14);
  outline: none;
}

.mission-template-card.selected {
  background: #fbfdfc;
}

.mission-template-dot {
  width: 20px;
  height: 6px;
  border-radius: 999px;
}

.mission-template-card strong {
  font-size: 14px;
}

.mission-template-card small {
  color: #4f8178;
  font-size: 12px;
  font-weight: 900;
}

.mission-template-card p {
  margin: 0;
  color: #5d7771;
  font-size: 12px;
  line-height: 1.35;
}
```

Also add inside the existing mobile media block:

```css
.mission-template-grid {
  grid-template-columns: 1fr;
}
```

- [ ] **Step 2: Update `implementation-notes.html`**

Add a new section before `</body>`:

```html
<section>
  <h2>Default mission templates</h2>
  <ul>
    <li><strong>Decision:</strong> implemented templates as frontend-only editable presets so parents can review and adjust quiz content before creating a mission.</li>
    <li><strong>Change from plan/code:</strong> kept file uploads manual; templates only prefill the title and quiz builder because files are child/class-specific.</li>
    <li><strong>Tradeoff:</strong> static templates are fast and reliable for demo use, but they require code changes to add more templates later.</li>
    <li><strong>Change log:</strong> <code>src/utils/missionTemplates.ts</code> adds the default template catalog; <code>src/components/AssignMission.tsx</code> adds the chooser and apply behavior; <code>src/assets/dashboard.css</code> styles the template cards.</li>
  </ul>
</section>
```

- [ ] **Step 3: Run focused tests and build**

Run:

```bash
rtk npx vitest run src/utils/missionTemplates.test.ts
rtk npm run build
```

Expected: template test passes; build passes or reports only unrelated pre-existing issues.
