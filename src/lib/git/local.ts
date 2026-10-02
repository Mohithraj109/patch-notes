import { simpleGit } from 'simple-git';
import type { Commit, DateRange } from './types';

export async function fetchCommitsFromLocal(
  repoPath: string,
  range: DateRange,
  branch?: string
): Promise<Commit[]> {
  const git = simpleGit(repoPath);

  const logArgs: string[] = [
    `--after=${range.from.toISOString()}`,
    `--before=${range.to.toISOString()}`,
    '--format=%H|%s|%an|%ae|%aI',
  ];

  if (branch) logArgs.push(branch);

  const rawLog = await git.raw(['log', ...logArgs]);
  const lines = rawLog.trim().split('\n').filter(Boolean);

  const commits: Commit[] = await Promise.all(
    lines.map(async (line: string) => {
      const [hash, message, author, email, date] = line.split('|');

      let filesChanged: string[] = [];
      let additions = 0;
      let deletions = 0;
      let diff = '';

      try {
        const rawDiff = await git.show(['--stat', '--format=', hash]);
        filesChanged = rawDiff
          .split('\n')
          .filter((l: string) => l.includes('|'))
          .map((l: string) => l.split('|')[0].trim());

        const patchDiff = await git.show(['--patch', '--format=', hash]);
        diff = patchDiff.slice(0, 3000);

        for (const l of patchDiff.split('\n')) {
          if (l.startsWith('+') && !l.startsWith('+++')) additions++;
          if (l.startsWith('-') && !l.startsWith('---')) deletions++;
        }
      } catch {
        // ignore diff errors
      }

      return {
        hash: hash.trim(),
        shortHash: hash.trim().slice(0, 7),
        message: message.trim(),
        author: author.trim(),
        email: email.trim(),
        timestamp: new Date(date.trim()),
        filesChanged,
        additions,
        deletions,
        diff,
      };
    })
  );

  return commits;
}
