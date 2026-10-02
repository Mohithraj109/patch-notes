export type Commit = {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  email: string;
  timestamp: Date;
  filesChanged: string[];
  additions: number;
  deletions: number;
  diff?: string;
  branch?: string;
};

export type CommitGroup = {
  category: string;
  label: string;
  commits: Commit[];
  summary: string[];
};

export type ChangeCategory =
  | 'feature'
  | 'fix'
  | 'improvement'
  | 'refactor'
  | 'performance'
  | 'security'
  | 'maintenance'
  | 'docs'
  | 'test'
  | 'ignore';

export type ImpactLevel = 'high' | 'medium' | 'low' | 'ignore';

export type ClassifiedCommit = Commit & {
  category: ChangeCategory;
  impact: ImpactLevel;
  area: string;
  isConventional: boolean;
};

export type DateRange = {
  from: Date;
  to: Date;
  label: string;
};

export type RepoInfo = {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  defaultBranch: string;
  isPrivate: boolean;
  url: string;
};
