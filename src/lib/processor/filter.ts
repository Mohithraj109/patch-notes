import type { Commit } from '../git/types';

const TRIVIAL_PATTERNS = [
  /^(fix\s+)?typo/i,
  /^(remove|delete)\s+(console|debug|log)/i,
  /^whitespace/i,
  /^formatting/i,
  /^lint/i,
  /^prettier/i,
  /^merge (branch|pull request)/i,
  /^wip$/i,
  /^temp$/i,
  /^test\s*$/i,
  /^update readme/i,
];

const TINY_THRESHOLD = { maxAdditions: 3, maxDeletions: 3 };

export function isTrivial(commit: Commit): boolean {
  const msg = commit.message.toLowerCase().trim();
  for (const pattern of TRIVIAL_PATTERNS) {
    if (pattern.test(msg)) return true;
  }
  if (
    commit.additions <= TINY_THRESHOLD.maxAdditions &&
    commit.deletions <= TINY_THRESHOLD.maxDeletions &&
    msg.length < 10
  ) {
    return true;
  }
  return false;
}

export function deduplicateCommits(commits: Commit[]): Commit[] {
  const seen = new Map<string, Commit>();
  for (const commit of commits) {
    const key = commit.message.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seen.has(key)) seen.set(key, commit);
  }
  return Array.from(seen.values());
}

export function filterCommits(
  commits: Commit[],
  options?: { removeTrivial?: boolean; deduplicate?: boolean }
): Commit[] {
  const { removeTrivial = true, deduplicate = true } = options ?? {};
  let result = [...commits];
  if (removeTrivial) result = result.filter((c) => !isTrivial(c));
  if (deduplicate) result = deduplicateCommits(result);
  return result;
}
