# FocusKid Priority 2 HCI Code Design

Date: 2026-05-29
Project: FocusKid
Scope: Finish the code-oriented Priority 2 items that best support the HCI assignment before writing the report.

## Decision

Use Approach B: prioritize features that make the product demo stronger for the HCI assignment and ADHD support case.

Included:

1. Distraction event log.
2. Focus session history.
3. Parent analytics from distraction/session metadata.
4. Browser SpeechSynthesis text-to-speech.
5. Lightweight badges/streak-style rewards.

Explicitly excluded for this phase:

- Multi-child management / child selector.

## Product Goal

FocusKid should demonstrate an ADHD-aware learning support flow, not a surveillance product. The child experience should stay calm, opt-in, and low-pressure. The parent experience should explain learning patterns through lightweight metadata, so parents can support the child without storing video or shaming distraction.

This phase strengthens the assignment requirements around multimodal interaction, adaptive interaction, and data analytics while keeping the UI/UX aligned with children with ADHD.

## UX Principles

- Do not auto-enable the camera.
- Do not store camera images, video, or face data.
- Store only metadata needed for analytics: user, mission, file, reason, session, timestamps, counts.
- Use supportive language: "soft pause", "calm session", "focus support".
- Avoid blame words in child-facing UI: "failed", "bad", "warning", "distracted".
- Keep each screen focused on one primary action.
- Parent analytics should help parents understand and support, not monitor or punish.

## Architecture

### Backend

The Express server exposes metadata-only analytics endpoints backed by Supabase REST:

- `POST /api/focus-sessions`: create a reading/focus session.
- `PATCH /api/focus-sessions/:id`: end/update a session with completion state and distraction count.
- `POST /api/distraction-events`: create a distraction event log entry.
- `GET /api/focus-insights?user_id=...`: return parent/child insight summary.

The Supabase schema contains:

- `focus_sessions` for session history.
- `distraction_events` for metadata-only attention drift events.

The user has not run the latest SQL in Supabase yet, so verification against the real backend depends on running the schema first.

### Frontend

Existing analytics client:

- `src/utils/focusAnalytics.ts` wraps all analytics API calls.
- `src/utils/focusAnalytics.test.ts` covers payload shape and no-video metadata behavior.

Child Reader:

- Starts a focus session when the file timer starts.
- Logs a distraction event only when the focus helper reports a new attention drift state.
- Ends the focus session on completion, file switch, quiz switch, or page exit.
- Continues to fail softly if analytics API calls fail.

Parent Dashboard:

- Shows a Focus Insights card with session totals, completion count, planned minutes, soft pauses, and recent sessions.
- Should be improved with a small daily or mission-level breakdown if the backend can provide it without a large refactor.

TTS:

- Use browser `window.speechSynthesis` only.
- Add read-aloud buttons where they directly reduce reading burden:
  - quiz question read aloud,
  - optional short instruction read aloud in Reader.
- No new backend or paid API.

Badges / streaks:

- Keep this lightweight and non-punitive.
- Reuse existing XP/reward concepts where possible.
- Show positive badges such as First Mission, Calm Reader, Quiz Star, or Focus Starter.
- Do not add a punitive streak-loss mechanic.

## Data Flow

1. Child opens a mission file.
2. Child starts the timer.
3. Frontend calls `createFocusSession` and stores the returned session id in memory.
4. Focus helper remains opt-in and runs only after child consent.
5. When the helper detects attention drift, Child Reader:
   - increments the local distraction counter,
   - calls `logDistractionEvent`,
   - pauses the timer,
   - shows a calm pause dialog.
6. When the child resumes or finishes, no camera data is stored.
7. On file completion or exit, frontend calls `endFocusSession` with completion state and distraction count.
8. Parent Dashboard fetches `focus-insights` and displays metadata-only summaries.

## Error Handling

- Analytics failures must not block reading, quiz answering, or mission completion.
- Frontend analytics calls may return `null` on non-OK responses.
- Child Reader should catch and log analytics errors without showing alarming child-facing errors.
- Parent Dashboard should show zero/empty states if insights cannot load.
- Backend should validate required ids and clamp numeric fields such as planned minutes and distraction count.

## Testing and Verification

Minimum verification for this phase:

1. Run frontend unit tests for `focusAnalytics`.
2. Type/build check if available.
3. After the user runs Supabase SQL:
   - start API server,
   - create a focus session,
   - log a distraction event,
   - end the focus session,
   - verify Parent Dashboard shows updated insight numbers.
4. Browser smoke test:
   - Child Reader timer starts,
   - focus helper remains opt-in,
   - pause dialog uses calm language,
   - quiz TTS reads the question,
   - parent insights render without storing video.

## Implementation Order

1. Update implementation notes for Priority 2 scope and tradeoffs.
2. Tighten analytics edge cases in Child Reader and Parent Dashboard.
3. Add parent insight breakdown if simple enough to support demo value.
4. Add SpeechSynthesis read-aloud controls.
5. Add lightweight badge/streak display using existing reward data where possible.
6. Run available tests.
7. Ask user to run Supabase SQL, then verify app behavior against the real database.

## Scope Guardrails

- Do not implement multi-child management in this phase.
- Do not introduce a new state management library.
- Do not add a TTS backend.
- Do not store camera/video/image data.
- Do not refactor unrelated mission/upload/auth code unless required by Priority 2 verification.
