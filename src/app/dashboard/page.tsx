'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { formatDateRange, getCurrentWeekRange, getWeekLabel } from '@/lib/utils';
import type { ClassifiedCommit, RepoInfo } from '@/lib/git/types';
import type { CommitStats } from '@/lib/processor/stats';
import type { Tone } from '@/lib/ai/prompts';
import RepoSelector from '@/components/RepoSelector';
import DateRangePicker from '@/components/DateRangePicker';
import CommitPreview from '@/components/CommitPreview';
import ToneSelector from '@/components/ToneSelector';
import PatchNotesOutput from '@/components/PatchNotesOutput';
import WeeklyDigest from '@/components/WeeklyDigest';

type Step = 'setup' | 'commits' | 'generate' | 'output';

export default function DashboardPage() {
  const defaultRange = getCurrentWeekRange();

  // Config
  const [githubToken, setGithubToken] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<RepoInfo | null>(null);
  const [fromDate, setFromDate] = useState(defaultRange.from.toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(defaultRange.to.toISOString().slice(0, 10));
  const [tone, setTone] = useState<Tone>('human');
  const [includeAuthors, setIncludeAuthors] = useState(true);

  // Data
  const [commits, setCommits] = useState<ClassifiedCommit[]>([]);
  const [stats, setStats] = useState<CommitStats | null>(null);
  const [totalRaw, setTotalRaw] = useState(0);
  const [patchNotes, setPatchNotes] = useState('');
  const [step, setStep] = useState<Step>('setup');

  // Loading states
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Error
  const [error, setError] = useState('');

  const token = githubToken || process.env.NEXT_PUBLIC_GITHUB_TOKEN || '';

  const fetchCommits = useCallback(async () => {
    if (!selectedRepo) { setError('Please select a repository'); return; }
    setError('');
    setLoadingCommits(true);
    try {
      const res = await fetch('/api/commits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-github-token': token } : {}),
        },
        body: JSON.stringify({
          owner: selectedRepo.owner,
          repo: selectedRepo.name,
          fromDate,
          toDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCommits(data.commits);
      setStats(data.stats);
      setTotalRaw(data.total);
      setStep('commits');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch commits');
    } finally {
      setLoadingCommits(false);
    }
  }, [selectedRepo, fromDate, toDate, token]);

  const generateNotes = useCallback(async () => {
    if (!commits.length) { setError('No commits to generate from'); return; }
    setError('');
    setGenerating(true);
    setPatchNotes('');
    setStep('output');

    const period = formatDateRange(new Date(fromDate), new Date(toDate));
    const project = selectedRepo?.name ?? 'Project';

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commits, project, period, tone, includeAuthors }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('Stream not available');

      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setPatchNotes(text);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed');
      setStep('commits');
    } finally {
      setGenerating(false);
    }
  }, [commits, fromDate, toDate, selectedRepo, tone, includeAuthors]);

  const saveReport = useCallback(async () => {
    if (!patchNotes || !selectedRepo || !stats) return;
    setSaving(true);
    try {
      const period = formatDateRange(new Date(fromDate), new Date(toDate));
      const weekLabel = getWeekLabel(new Date(fromDate));
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: selectedRepo.owner,
          repoName: selectedRepo.name,
          repoUrl: selectedRepo.url,
          repoDescription: selectedRepo.description,
          weekLabel,
          period,
          fromDate,
          toDate,
          tone,
          patchNotes,
          rawCommits: commits,
          stats,
        }),
      });
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }, [patchNotes, selectedRepo, stats, fromDate, toDate, tone, commits]);

  const period = formatDateRange(new Date(fromDate), new Date(toDate));
  const weekLabel = getWeekLabel(new Date(fromDate));

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      {/* Nav */}
      <header className="border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a] z-10">
        <Link href="/" className="text-[#c8f135] text-xs font-bold tracking-widest uppercase hover:text-[#a4c82a] transition-colors">
          ▸ PATCH NOTES
        </Link>
        <div className="flex items-center gap-3 text-xs text-[#555]">
          {step === 'setup' && <span>01 / SETUP</span>}
          {step === 'commits' && <span>02 / COMMITS</span>}
          {(step === 'generate' || step === 'output') && <span>03 / OUTPUT</span>}
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* LEFT SIDEBAR — Config */}
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-[#2a2a2a] p-6 space-y-6 shrink-0">
          <div>
            <p className="text-[#555] text-xs tracking-widest uppercase mb-4">CONFIGURATION</p>

            {/* Token */}
            <div className="space-y-2 mb-5">
              <label className="text-xs text-[#888]">GITHUB TOKEN</label>
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxx"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="w-full bg-[#111] border border-[#2a2a2a] px-3 py-2 text-xs text-[#e8e8e8] placeholder:text-[#444] focus:outline-none focus:border-[#c8f135] transition-colors"
              />
              <p className="text-[#444] text-xs">
                Needs <code className="text-[#666]">repo</code> scope.{' '}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#c8f135] hover:underline"
                >
                  Get token →
                </a>
              </p>
            </div>

            {/* Repo selector */}
            <div className="space-y-2 mb-5">
              <label className="text-xs text-[#888]">REPOSITORY</label>
              <RepoSelector
                token={token}
                onSelect={setSelectedRepo}
                selected={selectedRepo}
              />
            </div>

            {/* Date range */}
            <div className="space-y-2 mb-5">
              <label className="text-xs text-[#888]">DATE RANGE</label>
              <DateRangePicker
                fromDate={fromDate}
                toDate={toDate}
                onFromChange={setFromDate}
                onToChange={setToDate}
              />
            </div>

            {/* Tone */}
            <div className="space-y-2 mb-5">
              <label className="text-xs text-[#888]">WRITING TONE</label>
              <ToneSelector tone={tone} onChange={setTone} />
            </div>

            {/* Include authors */}
            <label className="flex items-center gap-2 cursor-pointer mb-6">
              <input
                type="checkbox"
                checked={includeAuthors}
                onChange={(e) => setIncludeAuthors(e.target.checked)}
                className="accent-[#c8f135]"
              />
              <span className="text-xs text-[#888]">Include author names</span>
            </label>

            {/* Fetch button */}
            <button
              onClick={fetchCommits}
              disabled={loadingCommits || !selectedRepo}
              className="w-full bg-[#c8f135] text-black text-xs font-bold py-3 hover:bg-[#a4c82a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loadingCommits ? 'FETCHING...' : 'FETCH COMMITS →'}
            </button>
          </div>

          {/* Stats summary */}
          {stats && (
            <div className="border border-[#2a2a2a] p-4 space-y-3">
              <p className="text-[#555] text-xs tracking-widest uppercase">DIGEST</p>
              <WeeklyDigest
                stats={stats}
                weekLabel={weekLabel}
                period={period}
                totalRaw={totalRaw}
                filteredCount={commits.length}
              />
            </div>
          )}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Error banner */}
          {error && (
            <div className="border-b border-red-900/50 bg-red-950/20 px-6 py-3 text-xs text-red-400">
              ✗ {error}
            </div>
          )}

          {step === 'setup' && (
            <div className="flex-1 flex items-center justify-center p-12 text-center">
              <div>
                <p className="text-[#c8f135] text-xs tracking-widest uppercase mb-4">
                  ▸ READY
                </p>
                <h2 className="text-xl font-bold mb-3">Configure and fetch commits</h2>
                <p className="text-[#555] text-sm">
                  Select a repository, set a date range, and click{' '}
                  <span className="text-[#888]">FETCH COMMITS</span> to begin.
                </p>
              </div>
            </div>
          )}

          {step === 'commits' && (
            <div className="flex-1 flex flex-col">
              {/* Toolbar */}
              <div className="border-b border-[#2a2a2a] px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-[#555]">
                  <span>{commits.length} COMMITS</span>
                  {totalRaw > commits.length && (
                    <span className="text-[#444]">({totalRaw - commits.length} filtered)</span>
                  )}
                </div>
                <button
                  onClick={generateNotes}
                  disabled={generating || commits.length === 0}
                  className="bg-[#c8f135] text-black text-xs font-bold px-6 py-2 hover:bg-[#a4c82a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {generating ? 'GENERATING...' : 'GENERATE PATCH NOTES →'}
                </button>
              </div>
              {/* Commit list */}
              <div className="flex-1 overflow-y-auto">
                <CommitPreview commits={commits} />
              </div>
            </div>
          )}

          {step === 'output' && (
            <div className="flex-1 flex flex-col">
              {/* Toolbar */}
              <div className="border-b border-[#2a2a2a] px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-[#555]">
                  <span>{weekLabel}</span>
                  <span className="text-[#444]">{period}</span>
                  <span className="text-[#444] uppercase">TONE: {tone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStep('commits')}
                    className="border border-[#2a2a2a] text-[#888] text-xs px-4 py-2 hover:border-[#3a3a3a] hover:text-[#e8e8e8] transition-colors"
                  >
                    ← BACK
                  </button>
                  <button
                    onClick={generateNotes}
                    disabled={generating}
                    className="border border-[#2a2a2a] text-[#888] text-xs px-4 py-2 hover:border-[#3a3a3a] hover:text-[#e8e8e8] disabled:opacity-40 transition-colors"
                  >
                    REGENERATE
                  </button>
                  <button
                    onClick={saveReport}
                    disabled={saving || generating || !patchNotes}
                    className="border border-[#2a2a2a] text-[#888] text-xs px-4 py-2 hover:border-[#3a3a3a] hover:text-[#e8e8e8] disabled:opacity-40 transition-colors"
                  >
                    {saving ? 'SAVING...' : 'SAVE'}
                  </button>
                </div>
              </div>
              {/* Output */}
              <div className="flex-1 overflow-y-auto p-6">
                <PatchNotesOutput
                  text={patchNotes}
                  isStreaming={generating}
                  weekLabel={weekLabel}
                  period={period}
                  repo={selectedRepo?.fullName ?? ''}
                  stats={stats}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
