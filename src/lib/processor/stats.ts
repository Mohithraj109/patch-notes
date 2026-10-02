import type { ClassifiedCommit, ChangeCategory, ImpactLevel } from '../git/types';

export type CommitStats = {
  total: number;
  byCategory: Partial<Record<ChangeCategory, number>>;
  byAuthor: Record<string, number>;
  byImpact: Partial<Record<ImpactLevel, number>>;
  filesChanged: number;
  additions: number;
  deletions: number;
  topAreas: string[];
};

export function computeStats(commits: ClassifiedCommit[]): CommitStats {
  const byCategory: Partial<Record<ChangeCategory, number>> = {};
  const byAuthor: Record<string, number> = {};
  const byImpact: Partial<Record<ImpactLevel, number>> = {};
  const areaCount: Record<string, number> = {};
  let filesChanged = 0;
  let additions = 0;
  let deletions = 0;

  for (const c of commits) {
    byCategory[c.category] = (byCategory[c.category] ?? 0) + 1;
    byAuthor[c.author] = (byAuthor[c.author] ?? 0) + 1;
    byImpact[c.impact] = (byImpact[c.impact] ?? 0) + 1;
    areaCount[c.area] = (areaCount[c.area] ?? 0) + 1;
    filesChanged += c.filesChanged.length;
    additions += c.additions;
    deletions += c.deletions;
  }

  const topAreas = Object.entries(areaCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([area]) => area);

  return {
    total: commits.length,
    byCategory,
    byAuthor,
    byImpact,
    filesChanged,
    additions,
    deletions,
    topAreas,
  };
}
