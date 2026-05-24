import { Award, Crown, Gem, Medal, Shield, Trophy } from "lucide-react";
import type { RewardRank, RewardRankIcon } from "../utils/rewards";

type Props = {
  rank: RewardRank;
  className?: string;
};

const icons: Record<RewardRankIcon, typeof Shield> = {
  shield: Shield,
  medal: Medal,
  trophy: Trophy,
  award: Award,
  gem: Gem,
  crown: Crown,
};

export default function RankIcon({ rank, className = "rank-icon" }: Props) {
  const Icon = icons[rank.icon] || Shield;
  return <Icon className={className} aria-hidden="true" />;
}
