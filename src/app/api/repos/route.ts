import { NextRequest, NextResponse } from 'next/server';
import { listRepositories } from '@/lib/git/github';

export async function GET(req: NextRequest) {
  const token =
    req.headers.get('x-github-token') ?? process.env.GITHUB_TOKEN;

  if (!token) {
    return NextResponse.json({ error: 'GitHub token required' }, { status: 401 });
  }

  try {
    const repos = await listRepositories(token);
    return NextResponse.json({ repos });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch repositories';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
