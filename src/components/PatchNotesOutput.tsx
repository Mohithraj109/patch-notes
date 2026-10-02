'use client';

import { useState } from 'react';
import type { CommitStats } from '@/lib/processor/stats';

interface Props {
  text: string;
  isStreaming: boolean;
  weekLabel: string;
  period: string;
  repo: string;
  stats: CommitStats | null;
}

export default function PatchNotesOutput({
  text,
  isStreaming,
  weekLabel,
  period,
  repo,
  stats,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'rendered' | 'raw'>('rendered');

  const handleCopy = () => {
    const fullText = `${weekLabel} — ${period}\n${repo ? `Repository: ${repo}\n` : ''}\n${text}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const fullText = `PATCH NOTES\n${'═'.repeat(40)}\n\n${weekLabel} — ${period}\n${repo ? `Repository: ${repo}\n` : ''}\n${'─'.repeat(40)}\n\n${text}`;
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patch-notes-${weekLabel.toLowerCase().replace(' ', '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Parse sections for rendered view
  const sections = parseNotes(text);

  return (
    <div className="max-w-3xl mx-auto w-full">
      {/* Header bar */}
      <div className="border border-[#2a2a2a] border-b-0 px-5 py-3 flex items-center justify-between bg-[#0f0f0f]">
        <div className="flex items-center gap-3 text-xs text-[#555]">
          <span className="text-[#c8f135] font-bold">PATCH NOTES</span>
          <span>━</span>
          <span>{weekLabel}</span>
          <span className="text-[#333]">{period}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFormat(format === 'rendered' ? 'raw' : 'rendered')}
            className="text-[#444] text-[10px] hover:text-[#888] transition-colors px-2 py-1 border border-[#1e1e1e] hover:border-[#2a2a2a]"
          >
            {format === 'rendered' ? 'RAW' : 'RENDERED'}
          </button>
          <button
            onClick={handleDownload}
            disabled={isStreaming || !text}
            className="text-[#444] text-[10px] hover:text-[#888] transition-colors px-2 py-1 border border-[#1e1e1e] hover:border-[#2a2a2a] disabled:opacity-30"
          >
            ↓ TXT
          </button>
          <button
            onClick={handleCopy}
            disabled={isStreaming || !text}
            className="text-[10px] px-2 py-1 border transition-colors disabled:opacity-30 border-[#1e1e1e] hover:border-[#2a2a2a] text-[#444] hover:text-[#888]"
          >
            {copied ? '✓ COPIED' : 'COPY'}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="border border-[#2a2a2a] border-b-0 px-5 py-2.5 flex items-center gap-6 text-[10px] text-[#555] overflow-x-auto bg-[#0c0c0c]">
          <span>{stats.total} COMMITS</span>
          {stats.byCategory.feature != null && (
            <span className="text-[#c8f135]">{stats.byCategory.feature} FEATURES</span>
          )}
          {stats.byCategory.fix != null && (
            <span className="text-orange-400">{stats.byCategory.fix} FIXES</span>
          )}
          {stats.byCategory.refactor != null && (
            <span className="text-purple-400">{stats.byCategory.refactor} REFACTORS</span>
          )}
          {stats.byCategory.security != null && (
            <span className="text-red-400">{stats.byCategory.security} SECURITY</span>
          )}
          <span className="ml-auto text-[#333]">
            +{stats.additions} / -{stats.deletions} lines
          </span>
        </div>
      )}

      {/* Authors bar */}
      {stats && Object.keys(stats.byAuthor).length > 0 && (
        <div className="border border-[#2a2a2a] border-b-0 px-5 py-2 flex items-center gap-4 text-[10px] text-[#444] overflow-x-auto bg-[#0c0c0c]">
          <span className="text-[#333] shrink-0">AUTHORS</span>
          {Object.entries(stats.byAuthor)
            .sort(([, a], [, b]) => b - a)
            .map(([author, count]) => (
              <span key={author} className="shrink-0">
                <span className="text-[#555]">{author}</span>
                <span className="text-[#333] ml-1">{count}</span>
              </span>
            ))}
        </div>
      )}

      {/* Main content */}
      <div className="border border-[#2a2a2a] bg-[#0d0d0d] min-h-64">
        {!text && isStreaming && (
          <div className="p-8 flex items-center gap-2 text-xs text-[#555]">
            <span className="animate-pulse">▸</span>
            <span>Generating patch notes...</span>
          </div>
        )}

        {!text && !isStreaming && (
          <div className="p-8 text-xs text-[#333]">
            Output will appear here.
          </div>
        )}

        {text && format === 'raw' && (
          <pre className="p-6 text-xs text-[#888] whitespace-pre-wrap leading-relaxed font-mono">
            {text}
            {isStreaming && <span className="cursor-blink" />}
          </pre>
        )}

        {text && format === 'rendered' && (
          <div className="p-6 space-y-6">
            {sections.map((section, i) => (
              <div key={i}>
                <p className="text-[#c8f135] text-xs font-bold tracking-widest uppercase mb-2">
                  {section.heading}
                </p>
                <p className="text-[#aaa] text-sm leading-relaxed">
                  {section.body}
                </p>
              </div>
            ))}
            {isStreaming && (
              <span className="text-[#c8f135] animate-pulse text-xs">▋</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function parseNotes(text: string): Array<{ heading: string; body: string }> {
  if (!text.trim()) return [];

  const lines = text.split('\n');
  const sections: Array<{ heading: string; body: string }> = [];
  let current: { heading: string; body: string } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect section headings: short lines without sentence punctuation at end
    // typically < 40 chars, not ending in period/comma
    const isHeading =
      trimmed.length < 50 &&
      !trimmed.endsWith('.') &&
      !trimmed.endsWith(',') &&
      !trimmed.startsWith('-') &&
      !trimmed.startsWith('•') &&
      /^[A-Z]/.test(trimmed) &&
      !trimmed.includes('  ');

    if (isHeading && current === null) {
      current = { heading: trimmed, body: '' };
    } else if (isHeading && current !== null && current.body.length > 0) {
      sections.push(current);
      current = { heading: trimmed, body: '' };
    } else if (current !== null) {
      current.body += (current.body ? ' ' : '') + trimmed;
    } else {
      // Pre-heading text — treat as intro
      if (sections.length === 0) {
        current = { heading: 'Overview', body: trimmed };
      }
    }
  }

  if (current && current.body) sections.push(current);
  return sections;
}
