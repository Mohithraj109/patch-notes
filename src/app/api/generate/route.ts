import { NextRequest, NextResponse } from 'next/server';
import { groupByArea } from '@/lib/processor/grouper';
import { streamPatchNotes } from '@/lib/ai/gemini';
import type { ClassifiedCommit } from '@/lib/git/types';
import type { Tone } from '@/lib/ai/prompts';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    commits,
    project,
    period,
    tone = 'human',
    includeAuthors = true,
  }: {
    commits: ClassifiedCommit[];
    project: string;
    period: string;
    tone: Tone;
    includeAuthors: boolean;
  } = body;

  if (!commits || !project || !period) {
    return NextResponse.json(
      { error: 'commits, project, and period are required' },
      { status: 400 }
    );
  }

  if (commits.length === 0) {
    return NextResponse.json(
      { error: 'No commits to generate notes from' },
      { status: 400 }
    );
  }

  try {
    const groups = groupByArea(commits);
    const authors = [...new Set(commits.map((c) => c.author))];
    const stream = await streamPatchNotes({
      project,
      period,
      authors,
      groups,
      tone,
      includeAuthors,
    });

    return new Response(stream as unknown as ReadableStream<Uint8Array>, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
