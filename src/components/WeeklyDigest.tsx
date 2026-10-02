'use client';

import type { CommitStats } from '@/lib/processor/stats';

interface Props {
  stats: CommitStats;
  weekLabel: string;
  period: string;
  totalRaw: number;
  filteredCount: number;
}

export default function WeeklyDigest({
  stats,
  weekLabel,
  period,
  totalRaw,
  filteredCount,
}: Props) {
  const rows = [
    { label: 'WEEK', value: weekLabel },
    { label: 'PERIOD', value: period },
    { label: 'COMMITS', value: String(filteredCount) },
    { label: 'FILTERED', value: String(totalRaw - filteredCount) },
  ];

  const categoryRows = Object.entries(stats.byCategory)
    .filter(([, v]) => v && v > 0)
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0));

  return (
    <div className="space-y-3 text-xs font-mono">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between">
          <span className="text-[#444]">{row.label}</span>
          <span className="text-[#888]">{row.value}</span>
        </div>
      ))}

      {categoryRows.length > 0 && (
        <>
          <div className="border-t border-[#1e1e1e] pt-3 space-y-2">
            {categoryRows.map(([cat, count]) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-[#333] uppercase text-[10px]">{cat}</span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-[2px]">
                    {Array.from({ length: Math.min(count ?? 0, 8) }).map((_, i) => (
                      <div
                        key={i}
                        className="w-[6px] h-[6px] bg-[#2a2a2a] rounded-sm"
                        style={{
                          backgroundColor: i < (count ?? 0) ? getCategoryColor(cat) : undefined,
                        }}
                      />
                    ))}
                    {(count ?? 0) > 8 && (
                      <span className="text-[#333] text-[9px] ml-1">+{(count ?? 0) - 8}</span>
                    )}
                  </div>
                  <span className="text-[#555] text-[10px]">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Author breakdown */}
      {Object.keys(stats.byAuthor).length > 0 && (
        <div className="border-t border-[#1e1e1e] pt-3 space-y-1.5">
          <p className="text-[#333] text-[10px] uppercase">AUTHORS</p>
          {Object.entries(stats.byAuthor)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([author, count]) => (
              <div key={author} className="flex items-center justify-between">
                <span className="text-[#444] text-[10px] truncate max-w-[100px]">{author}</span>
                <span className="text-[#333] text-[10px]">{count} commits</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function getCategoryColor(cat: string): string {
  const colors: Record<string, string> = {
    feature:     '#c8f135',
    fix:         '#f97316',
    improvement: '#60a5fa',
    refactor:    '#a78bfa',
    performance: '#22d3ee',
    security:    '#f87171',
    maintenance: '#444',
    docs:        '#444',
    test:        '#444',
  };
  return colors[cat] ?? '#2a2a2a';
}
