import { categories } from "@/lib/categories";

export type PickStatus = "pending" | "correct" | "incorrect" | "unanswered";

export interface ScoredCategory {
  categoryId: string;
  categoryName: string;
  pick?: string;
  winner?: string;
  status: PickStatus;
}

export interface ScoreSummary {
  score: number;
  resolvedCount: number;
  remainingCount: number;
  answeredCount: number;
  totalCount: number;
}

export function scoreSubmission(
  picks: Record<string, string>,
  winners: Record<string, string> | undefined
) {
  const winnerMap = winners ?? {};

  const categoriesWithStatus: ScoredCategory[] = categories.map((category) => {
    const pick = picks[category.id];
    const winner = winnerMap[category.id];

    if (!pick) {
      return {
        categoryId: category.id,
        categoryName: category.name,
        status: "unanswered",
        winner,
      };
    }

    if (!winner) {
      return {
        categoryId: category.id,
        categoryName: category.name,
        pick,
        status: "pending",
      };
    }

    return {
      categoryId: category.id,
      categoryName: category.name,
      pick,
      winner,
      status: pick === winner ? "correct" : "incorrect",
    };
  });

  const summary: ScoreSummary = categoriesWithStatus.reduce(
    (acc, category) => {
      if (category.pick) {
        acc.answeredCount += 1;
      }
      if (category.status === "correct") {
        acc.score += 1;
        acc.resolvedCount += 1;
      } else if (category.status === "incorrect") {
        acc.resolvedCount += 1;
      }
      return acc;
    },
    {
      score: 0,
      resolvedCount: 0,
      remainingCount: 0,
      answeredCount: 0,
      totalCount: categories.length,
    }
  );

  summary.remainingCount = summary.totalCount - summary.resolvedCount;

  return {
    categories: categoriesWithStatus,
    summary,
  };
}
