import type { User } from "../types";

export type RewardRankIcon = "shield" | "medal" | "trophy" | "award" | "gem" | "crown";

export type RewardRank = {
  name: string;
  minXp: number;
  color: string;
  icon: RewardRankIcon;
};

export type RewardResult = {
  awarded: boolean;
  xp: number;
  reason: string;
  event_key: string;
  user?: User;
};

export const RANKS: RewardRank[] = [
  { name: "Bronze", minXp: 0, color: "#9a6a43", icon: "shield" },
  { name: "Silver", minXp: 250, color: "#7f8a96", icon: "medal" },
  { name: "Gold", minXp: 600, color: "#c9a86a", icon: "trophy" },
  { name: "Platinum", minXp: 1000, color: "#6A8F8C", icon: "award" },
  { name: "Diamond", minXp: 1500, color: "#4a90e2", icon: "gem" },
  { name: "Legendary", minXp: 2200, color: "#8b5cf6", icon: "crown" },
];

export function getRewardProfile(xp = 0) {
  const currentXp = Math.max(0, xp || 0);
  const rankIndex = RANKS.reduce((bestIndex, rank, index) => (currentXp >= rank.minXp ? index : bestIndex), 0);
  const rank = RANKS[rankIndex];
  const nextRank = RANKS[rankIndex + 1] || null;
  const rankProgress = nextRank
    ? Math.round(((currentXp - rank.minXp) / (nextRank.minXp - rank.minXp)) * 100)
    : 100;

  return {
    xp: currentXp,
    rank,
    nextRank,
    rankProgress,
    xpToNextRank: nextRank ? Math.max(0, nextRank.minXp - currentXp) : 0,
  };
}

export function getStoredUser(): User | null {
  const stored = localStorage.getItem("focuskid_user");
  return stored ? (JSON.parse(stored) as User) : null;
}

export function saveStoredUser(user: User) {
  localStorage.setItem("focuskid_user", JSON.stringify(user));
  window.dispatchEvent(new Event("focuskid_user_updated"));
}

export async function fetchCurrentUser() {
  const storedUser = getStoredUser();
  if (!storedUser?.id) return storedUser;

  const res = await fetch(`http://localhost:4000/api/users/${storedUser.id}`);
  if (!res.ok) return storedUser;

  const user = (await res.json()) as User;
  saveStoredUser(user);
  return user;
}

export async function awardXp(xp: number, reason: string, eventKey: string): Promise<RewardResult | null> {
  const user = getStoredUser();
  if (!user?.id) return null;

  const res = await fetch(`http://localhost:4000/api/users/${user.id}/rewards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ xp, reason, event_key: eventKey }),
  });
  if (!res.ok) return null;

  const reward = (await res.json()) as RewardResult;
  if (reward.user) saveStoredUser(reward.user);
  return reward;
}

export function applyRewardResult(reward?: RewardResult | null) {
  if (reward?.user) saveStoredUser(reward.user);
}
