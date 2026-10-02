'use client';

import type { ClassifiedCommit, ChangeCategory, ImpactLevel } from '@/lib/git/types';
import { format } from 'date-fns';

const CATEGORY_COLORS: Record<ChangeCategory, string> = {
  feature:     'text-[#c8f135] border-[#c8f135]/30',
  fix:         'text-orange-400 border-orange-400/30',
  improvement: 'text-blue-400 border-blue-400/30',
  refactor:    'text-purple-400 border-purple-400/30',
  performance: 'text-cyan-400 border-cyan-400/30',
  security:    'text-red-400 border-red-400/30',
  maintenance: 'text-[#555] border-[#2a2a2a]',
  docs:        'text-[#555] border-[#2a2a2a]',
  test:        'text-[#555] border-[#2a2a2a]',
  ignore:      'text-[#333] border-[#222]',
};

const IMPACT_BARS: Record<ImpactLevel, { filled: number; color: string }> = {
  high:   { filled: 3, color: 'bg-[#c8f135]' },
  medium: { filled: 2, color: 'bg-orange-400' },
  low:    { filled: 1, color: 'bg-[#444]' },
  ignore: { filled: 0, color: 'bg-[#222]' },
};

interface Props {
  commits: ClassifiedCommit[];
}

export default function CommitPreview({ commits }: Props) {
  if (commits.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-[#444] text-xs">
        No commits in this range
      </div>
    );
  }

  // Group by area for display
  const grouped = new Map<string, ClassifiedCommit[]>();
  for (const c of commits) {
    if (!grouped.has(c.area)) grouped.set(c.area, []);
    grouped.get(c.area)!.push(c);
  }

  return (
    <div className="divide-y divide-[#1a1a1a]">
      {Array.from(grouped.entries()).map(([area, areaCommits]) => (
        <div key={area} className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <p className="text-[#c8f135] text-xs font-bold tracking-widest uppercase">
              {area}
            </p>
            <span className="text-[#333] text-xs">{areaCommits.length} commits</span>
          </div>
          <div className="space-y-2">
            {areaCommits.map((commit) => {
              const bar = IMPACT_BARS[commit.impact];
              const color = CATEGORY_COLORS[commit.category];
              return (
                <div
                  key={commit.hash}
                  className="flex items-start gap-3 group"
                >
                  {/* Impact bar */}
                  <div className="flex gap-[2px] mt-[3px] shrink-0">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`w-[3px] h-[12px] rounded-sm ${
                          i < bar.filled ? bar.color : 'bg-[#1e1e1e]'
                        }`}
                      />
                    ))}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`border text-[9px] px-1.5 py-0.5 uppercase shrink-0 ${color}`}>
                        {commit.category}
                      </span>
                      {commit.isConventional && (
                        <span className="border border-[#1e1e1e] text-[9px] px-1.5 py-0.5 text-[#333] uppercase shrink-0">
                          CC
                        </span>
                      )}
                      <code className="text-[#444] text-[10px] shrink-0">
                        {commit.shortHash}
                      </code>
                      <span className="text-[#555] text-[10px] shrink-0">
                        {format(new Date(commit.timestamp), 'MMM d')}
                      </span>
                    </div>
                    <p className="text-[#e8e8e8] text-xs mt-1 truncate">
                      {commit.message}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[#444] text-[10px]">{commit.author}</span>
                      {commit.filesChanged.length > 0 && (
                        <span className="text-[#333] text-[10px]">
                          {commit.filesChanged.length} file{commit.filesChanged.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {(commit.additions > 0 || commit.deletions > 0) && (
                        <span className="text-[#333] text-[10px]">
                          <span className="text-green-600">+{commit.additions}</span>
                          {' '}
                          <span className="text-red-800">-{commit.deletions}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
