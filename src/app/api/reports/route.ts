import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const repoFullName = searchParams.get('repo');

  try {
    const reports = await prisma.report.findMany({
      where: repoFullName
        ? { repository: { fullName: repoFullName } }
        : undefined,
      include: { repository: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return NextResponse.json({ reports });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch reports';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    owner,
    repoName,
    repoUrl,
    repoDescription,
    weekLabel,
    period,
    fromDate,
    toDate,
    tone,
    patchNotes,
    rawCommits,
    stats,
  } = body;

  try {
    // Upsert repository
    const repository = await prisma.repository.upsert({
      where: { fullName: `${owner}/${repoName}` },
      create: {
        owner,
        name: repoName,
        fullName: `${owner}/${repoName}`,
        description: repoDescription ?? null,
        url: repoUrl ?? '',
        defaultBranch: 'main',
      },
      update: { description: repoDescription ?? undefined },
    });

    const report = await prisma.report.create({
      data: {
        repositoryId: repository.id,
        weekLabel,
        period,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        tone: tone ?? 'human',
        patchNotes,
        rawCommits: JSON.stringify(rawCommits),
        stats: JSON.stringify(stats),
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save report';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
