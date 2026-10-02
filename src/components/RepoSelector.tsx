'use client';

import { useState, useEffect } from 'react';
import type { RepoInfo } from '@/lib/git/types';

interface Props {
  token: string;
  selected: RepoInfo | null;
  onSelect: (repo: RepoInfo) => void;
}

export default function RepoSelector({ token, selected, onSelect }: Props) {
  const [repos, setRepos] = useState<RepoInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError('');
    fetch('/api/repos', {
      headers: { 'x-github-token': token },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setRepos(data.repos ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = repos.filter((r) =>
    r.fullName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={loading || !token}
        className="w-full bg-[#111] border border-[#2a2a2a] px-3 py-2 text-xs text-left flex items-center justify-between hover:border-[#3a3a3a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <span className={selected ? 'text-[#e8e8e8]' : 'text-[#444]'}>
          {loading
            ? 'Loading repos...'
            : selected
            ? selected.fullName
            : !token
            ? 'Enter token first'
            : 'Select repository'}
        </span>
        <span className="text-[#555]">▾</span>
      </button>

      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}

      {open && repos.length > 0 && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#111] border border-[#2a2a2a] shadow-xl max-h-64 overflow-hidden flex flex-col">
          <div className="border-b border-[#2a2a2a] p-2">
            <input
              autoFocus
              type="text"
              placeholder="Search repos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-[#e8e8e8] placeholder:text-[#444] focus:outline-none"
            />
          </div>
          <div className="overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-[#555] text-xs p-3">No repos found</p>
            ) : (
              filtered.map((repo) => (
                <button
                  key={repo.fullName}
                  type="button"
                  onClick={() => {
                    onSelect(repo);
                    setOpen(false);
                    setQuery('');
                  }}
                  className={`w-full text-left px-3 py-2.5 text-xs hover:bg-[#1a1a1a] transition-colors flex items-center justify-between group ${
                    selected?.fullName === repo.fullName ? 'text-[#c8f135]' : 'text-[#e8e8e8]'
                  }`}
                >
                  <span>{repo.fullName}</span>
                  <span className="text-[#444] group-hover:text-[#555]">
                    {repo.isPrivate ? '🔒' : '◎'}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {open && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
