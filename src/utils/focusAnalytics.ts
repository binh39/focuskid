const API_BASE = "http://localhost:4000";

export type FocusSession = {
  id: number;
  user_id?: number;
  started_at?: string;
  ended_at?: string | null;
  planned_minutes?: number;
  completed?: boolean;
  distraction_count?: number;
};

export type DistractionEvent = {
  id: number;
  user_id?: number;
  session_id?: number | null;
  detected_at?: string;
  reason?: string;
  metadata?: Record<string, unknown> | null;
};

export type DailyPauseSummary = {
  date: string;
  count: number;
};

export type FocusInsights = {
  total_sessions: number;
  completed_sessions: number;
  planned_minutes: number;
  distraction_events: number;
  recent_sessions: FocusSession[];
  daily_pauses?: DailyPauseSummary[];
  recent_events?: DistractionEvent[];
};

type CreateFocusSessionArgs = {
  user_id: number;
  planned_minutes: number;
};

type EndFocusSessionArgs = {
  id: number;
  completed: boolean;
  distraction_count: number;
};

type LogDistractionEventArgs = {
  user_id: number;
  session_id?: number | null;
  mission_id?: number | null;
  file_id?: number | null;
  reason: string;
  metadata?: Record<string, unknown> | null;
};

async function readJsonOrNull<T>(res: Response): Promise<T | null> {
  if (!res.ok) {
    return null;
  }

  return res.json() as Promise<T>;
}

export async function createFocusSession(args: CreateFocusSessionArgs): Promise<FocusSession | null> {
  const res = await fetch(`${API_BASE}/api/focus-sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });

  return readJsonOrNull<FocusSession>(res);
}

export async function endFocusSession(args: EndFocusSessionArgs): Promise<FocusSession | null> {
  const { id, completed, distraction_count } = args;
  const res = await fetch(`${API_BASE}/api/focus-sessions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      completed,
      ended_at: new Date().toISOString(),
      distraction_count,
    }),
  });

  return readJsonOrNull<FocusSession>(res);
}

export async function logDistractionEvent(args: LogDistractionEventArgs): Promise<DistractionEvent | null> {
  const res = await fetch(`${API_BASE}/api/distraction-events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });

  return readJsonOrNull<DistractionEvent>(res);
}

export async function fetchFocusInsights(userId: number): Promise<FocusInsights | null> {
  const params = new URLSearchParams({ user_id: String(userId) });
  const res = await fetch(`${API_BASE}/api/focus-insights?${params.toString()}`);

  return readJsonOrNull<FocusInsights>(res);
}
