import { Octokit } from '@octokit/rest';
import type { Commit, RepoInfo, DateRange } from './types';

export function createGitHubClient(token: string) {
  return new Octokit({ auth: token });
}

export async function listRepositories(token: string): Promise<RepoInfo[]> {
  const octokit = createGitHubClient(token);
  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: 'updated',
    per_page: 50,
    affiliation: 'owner,collaborator',
  });

  return data.map((repo) => ({
    owner: repo.owner.login,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description ?? null,
    defaultBranch: repo.default_branch,
    isPrivate: repo.private,
    url: repo.html_url,
  }));
}

export async function fetchCommitsFromGitHub(
  token: string,
  owner: string,
  repo: string,
  range: DateRange,
  branch?: string
): Promise<Commit[]> {
  const octokit = createGitHubClient(token);

  const { data: commitsData } = await octokit.repos.listCommits({
    owner,
    repo,
    sha: branch,
    since: range.from.toISOString(),
    until: range.to.toISOString(),
    per_page: 100,
  });

  const commits: Commit[] = await Promise.all(
    commitsData.map(async (c) => {
      let additions = 0;
      let deletions = 0;
      let filesChanged: string[] = [];
      let diff = '';

      try {
        const { data: detail } = await octokit.repos.getCommit({
          owner,
          repo,
          ref: c.sha,
        });
        additions = detail.stats?.additions ?? 0;
        deletions = detail.stats?.deletions ?? 0;
        filesChanged = (detail.files ?? []).map((f) => f.filename);
        diff = (detail.files ?? [])
          .map((f) => `${f.status} ${f.filename}\n${(f.patch ?? '').slice(0, 500)}`)
          .join('\n---\n')
          .slice(0, 3000);
      } catch {
        // commit detail unavailable
      }

      return {
        hash: c.sha,
        shortHash: c.sha.slice(0, 7),
        message: c.commit.message.split('\n')[0],
        author: c.commit.author?.name ?? 'Unknown',
        email: c.commit.author?.email ?? '',
        timestamp: new Date(c.commit.author?.date ?? Date.now()),
        filesChanged,
        additions,
        deletions,
        diff,
      };
    })
  );

  return commits;
}
