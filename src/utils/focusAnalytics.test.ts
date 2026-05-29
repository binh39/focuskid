import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createFocusSession,
  endFocusSession,
  fetchFocusInsights,
  logDistractionEvent,
} from "./focusAnalytics";

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

describe("focusAnalytics", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-29T10:00:00.000Z"));
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("creates a focus session", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(await jsonResponse({ id: 1, user_id: 9, planned_minutes: 15 }));

    const session = await createFocusSession({ user_id: 9, planned_minutes: 15 });

    expect(fetch).toHaveBeenCalledWith("http://localhost:4000/api/focus-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: 9, planned_minutes: 15 }),
    });
    expect(session).toEqual({ id: 1, user_id: 9, planned_minutes: 15 });
  });

  it("ends a focus session with completion metadata", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      await jsonResponse({ id: 2, completed: true, distraction_count: 1 }),
    );

    const session = await endFocusSession({ id: 2, completed: true, distraction_count: 1 });

    expect(fetch).toHaveBeenCalledWith("http://localhost:4000/api/focus-sessions/2", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        completed: true,
        ended_at: "2026-05-29T10:00:00.000Z",
        distraction_count: 1,
      }),
    });
    expect(session).toEqual({ id: 2, completed: true, distraction_count: 1 });
  });

  it("logs a distraction event", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      await jsonResponse({ id: 3, reason: "attention_drift", metadata: { source: "camera" } }),
    );

    const event = await logDistractionEvent({
      user_id: 9,
      session_id: 2,
      reason: "attention_drift",
      metadata: { source: "camera" },
    });

    expect(fetch).toHaveBeenCalledWith("http://localhost:4000/api/distraction-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: 9,
        session_id: 2,
        reason: "attention_drift",
        metadata: { source: "camera" },
      }),
    });
    expect(event).toEqual({ id: 3, reason: "attention_drift", metadata: { source: "camera" } });
  });

  it("fetches focus insights", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      await jsonResponse({
        total_sessions: 1,
        completed_sessions: 1,
        planned_minutes: 15,
        distraction_events: 2,
        recent_sessions: [{ id: 10, distraction_count: 2 }],
      }),
    );

    const insights = await fetchFocusInsights(9);

    expect(fetch).toHaveBeenCalledWith("http://localhost:4000/api/focus-insights?user_id=9");
    expect(insights).toEqual({
      total_sessions: 1,
      completed_sessions: 1,
      planned_minutes: 15,
      distraction_events: 2,
      recent_sessions: [{ id: 10, distraction_count: 2 }],
    });
  });

  it("keeps focus insight breakdown metadata from the API", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      await jsonResponse({
        total_sessions: 1,
        completed_sessions: 1,
        planned_minutes: 15,
        distraction_events: 2,
        recent_sessions: [{ id: 10, distraction_count: 2 }],
        daily_pauses: [{ date: "2026-05-29", count: 2 }],
        recent_events: [{ id: 8, reason: "attention_drift" }],
      }),
    );

    const insights = await fetchFocusInsights(9);

    expect(insights?.daily_pauses).toEqual([{ date: "2026-05-29", count: 2 }]);
    expect(insights?.recent_events).toEqual([{ id: 8, reason: "attention_drift" }]);
  });

  it("returns null when the API rejects a request", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(await jsonResponse({ error: "Nope" }, { status: 500 }));

    await expect(fetchFocusInsights(9)).resolves.toBeNull();
  });
});
