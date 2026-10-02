import simpleGit from 'simple-git';
import type { Commit, DateRange } from './types';

export async function fetchCommitsFromLocal(
  repoPath: string,
  range: DateRange,
  branch?: string
): Promise<Commit[]> {
  const git = simpleGit(repoPath);

  const log = await git.log({
    from: range.from.toISOString(),
    to: range.to.toISOString(),
    '--': true,
    ...(branch ? { [branch]: null } : {}),
  });

  const commits: Commit[] = await Promise.all(
    log.all.map(async (c) => {
      let filesChanged: string[] = [];
      let additions = 0;
      let deletions = 0;
      let diff = '';

      try {
        const rawDiff = await git.show([
          '--stat',
          '--format=',
          c.hash,
        ]);
        // Parse stat lines
        const lines = rawDiff.split('\n').filter(Boolean);
        filesChanged = lines
          .filter((l) => l.includes('|'))
          .map((l) => l.split('|')[0].trim());

        // Get actual diff (truncated)
        const patchDiff = await git.show(['--patch', '--format=', c.hash]);
        diff = patchDiff.slice(0, 3000);

        // Count +/-
        for (const line of patchDiff.split('\n')) {
          if (line.startsWith('+') && !line.startsWith('+++')) additions++;
          if (line.startsWith('-') && !line.startsWith('---')) deletions++;
        }
      } catch {
        // ignore
      }

      return {
        hash: c.hash,
        shortHash: c.hash.slice(0, 7),
        message: c.message,
        author: c.author_name,
        email: c.author_email,
        timestamp: new Date(c.date),
        filesChanged,
        additions,
        deletions,
        diff,
      };
    })
  );

  return commits;
}
