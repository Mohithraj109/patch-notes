import type { ClassifiedCommit, CommitGroup, ImpactLevel } from '../git/types';

type GroupWithImpact = CommitGroup & { impact: ImpactLevel };

const IMPACT_ORDER: Record<ImpactLevel, number> = {
  high: 0,
  medium: 1,
  low: 2,
  ignore: 3,
};

export function groupByArea(commits: ClassifiedCommit[]): CommitGroup[] {
  const grouped = new Map<string, ClassifiedCommit[]>();

  for (const commit of commits) {
    if (!grouped.has(commit.area)) grouped.set(commit.area, []);
    grouped.get(commit.area)!.push(commit);
  }

  const groups: GroupWithImpact[] = Array.from(grouped.entries()).map(
    ([area, areaCommits]) => {
      const topImpact = areaCommits.reduce<ImpactLevel>(
        (best, c) =>
          IMPACT_ORDER[c.impact] < IMPACT_ORDER[best] ? c.impact : best,
        areaCommits[0].impact
      );

      return {
        category: area,
        label: area.charAt(0).toUpperCase() + area.slice(1),
        commits: areaCommits,
        summary: areaCommits.map((c) => c.message),
        impact: topImpact,
      };
    }
  );

  return groups.sort(
    (a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact]
  );
}

export function buildContextPayload(
  groups: CommitGroup[],
  meta: { project: string; period: string; authors: string[] }
) {
  return {
    project: meta.project,
    period: meta.period,
    authors: meta.authors,
    totalCommits: groups.reduce((n, g) => n + g.commits.length, 0),
    changes: groups.map((g) => ({
      area: g.label,
      changes: g.summary,
    })),
  };
}
