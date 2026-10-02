import { NextRequest, NextResponse } from 'next/server';
import { fetchCommitsFromGitHub } from '@/lib/git/github';
import { filterCommits } from '@/lib/processor/filter';
import { classifyCommits } from '@/lib/processor/classifier';
import { computeStats } from '@/lib/processor/stats';
import type { DateRange } from '@/lib/git/types';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { owner, repo, fromDate, toDate, branch, token: bodyToken } = body;
  const token =
    req.headers.get('x-github-token') ?? bodyToken ?? process.env.GITHUB_TOKEN;

  if (!token) {
    return NextResponse.json({ error: 'GitHub token required' }, { status: 401 });
  }

  if (!owner || !repo || !fromDate || !toDate) {
    return NextResponse.json(
      { error: 'owner, repo, fromDate, toDate are required' },
      { status: 400 }
    );
  }

  const range: DateRange = {
    from: new Date(fromDate),
    to: new Date(toDate),
    label: '',
  };

  try {
    const raw = await fetchCommitsFromGitHub(token, owner, repo, range, branch);
    const filtered = filterCommits(raw);
    const classified = classifyCommits(filtered);
    const stats = computeStats(classified);

    return NextResponse.json({
      commits: classified,
      stats,
      total: raw.length,
      filtered: filtered.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch commits';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
