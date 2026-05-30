# Default Mission Templates Design

## Goal

Give parents a small set of ready-made mission templates inside the existing Assign Mission flow. A parent can choose a template, review the pre-filled title and quiz questions, edit anything, then create the mission normally.

## Scope

In scope:

- Add frontend-only default mission templates.
- Include some templates with ready-made quiz content.
- Let selecting a template pre-fill the existing mission title and quiz builder.
- Keep file uploads manual and optional.
- Style the template chooser to match the current calm parent dashboard/modal UI.
- Update `implementation-notes.html` during implementation.

Out of scope:

- Backend template storage.
- Creating missions with one click without review.
- Template categories, search, or child personalization.
- Attaching default files.

## Recommended Approach

Use a static template catalog in the frontend and integrate it into `AssignMission.tsx`.

A small utility or constant will define templates such as:

- Basic Math Practice: simple addition/subtraction quiz questions.
- Reading Check: comprehension-style questions.
- Fun Science: basic science quiz questions.
- Gentle Daily Review: mixed easy questions for a low-pressure session.

Each template contains:

- `key`
- `title`
- short description
- suggested minutes label or helper text
- quiz drafts compatible with the existing quiz form fields

## User Flow

1. Parent opens Assign Mission.
2. The modal shows a "Choose a mission template" section above the title field.
3. Parent clicks a template card.
4. The form updates:
   - title becomes the template title
   - quiz list becomes the template quiz questions
   - existing selected files are left unchanged
5. Parent can edit title, add/remove/edit quiz questions, attach files, and create the mission.
6. The existing `POST /api/missions` flow saves the mission and quizzes.

## Architecture

### Frontend

- `src/components/AssignMission.tsx`
  - Import or define the default mission template catalog.
  - Add template selection state if needed for active styling.
  - Add `applyTemplate(template)` to set title and quizzes.
  - Render template cards before the title field.

- `src/assets/dashboard.css`
  - Add styles for template grid/cards inside the modal.
  - Keep styles compact and consistent with existing rounded cards and pastel colors.

### Backend

No backend changes are required. The existing mission creation endpoint already accepts `quizzes` from the form payload.

## Data Flow

Template catalog -> parent clicks template -> React state updates in `AssignMission` -> parent reviews/edits -> existing FormData submission sends `title`, `quizzes`, files, and durations -> backend stores mission and quizzes.

## Error Handling

- Template selection is local and should not fail.
- If a template has no quiz, keep the current empty quiz behavior.
- If mission creation fails, keep the current console error behavior; no new backend error handling is added in this small change.

## Testing and Verification

Manual verification:

- Open parent dashboard.
- Open Assign Mission modal.
- Select each template and confirm title/quiz fields update.
- Edit a prefilled quiz and create a mission.
- Confirm created mission appears in the parent mission list.

Automated verification if existing test setup permits:

- Add/adjust a lightweight utility test if the template catalog is moved into a utility file.
- Run the existing frontend tests/build.

## Decisions

- Templates are frontend-only to keep the change small and avoid schema/API changes.
- Selecting a template fills the editable form instead of creating immediately, reducing accidental mission creation.
- Default files are not included because learning files depend on the child/class content.
