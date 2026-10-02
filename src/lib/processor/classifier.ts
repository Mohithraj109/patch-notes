import type { Commit, ClassifiedCommit, ChangeCategory, ImpactLevel } from '../git/types';

const CONVENTIONAL_PREFIXES: Record<string, ChangeCategory> = {
  feat: 'feature',
  fix: 'fix',
  docs: 'docs',
  refactor: 'refactor',
  perf: 'performance',
  test: 'test',
  chore: 'maintenance',
  build: 'maintenance',
  ci: 'maintenance',
  style: 'maintenance',
  revert: 'fix',
};

const KEYWORD_CATEGORY_MAP: Array<{ pattern: RegExp; category: ChangeCategory }> = [
  { pattern: /\b(add|added|new|create|implement|introduce)\b/i, category: 'feature' },
  { pattern: /\b(fix|fixed|bug|issue|error|crash|broken|resolve)\b/i, category: 'fix' },
  { pattern: /\b(improve|better|enhance|upgrade|update)\b/i, category: 'improvement' },
  { pattern: /\b(refactor|cleanup|clean up|restructure|reorganize)\b/i, category: 'refactor' },
  { pattern: /\b(perf|performance|speed|fast|optimize|cache)\b/i, category: 'performance' },
  { pattern: /\b(security|auth|secure|vulnerability|xss|csrf)\b/i, category: 'security' },
  { pattern: /\b(test|spec|coverage|unit|integration|e2e)\b/i, category: 'test' },
  { pattern: /\b(docs|documentation|readme|comment|jsdoc)\b/i, category: 'docs' },
  { pattern: /\b(dependency|dependencies|package|npm|yarn)\b/i, category: 'maintenance' },
  { pattern: /\b(remove|delete|deprecate)\b/i, category: 'maintenance' },
];

const AREA_PATTERNS: Array<{ pattern: RegExp; area: string }> = [
  { pattern: /\b(auth|login|logout|signin|signup|password|oauth|jwt|session|token)\b/i, area: 'authentication' },
  { pattern: /\b(dashboard|analytics|metrics|stats|chart|graph|widget)\b/i, area: 'dashboard' },
  { pattern: /\b(nav|navigation|menu|header|footer|sidebar|breadcrumb)\b/i, area: 'navigation' },
  { pattern: /\b(api|endpoint|route|request|response|fetch|http|rest|graphql)\b/i, area: 'api' },
  { pattern: /\b(db|database|sql|query|migration|schema|model|orm|prisma)\b/i, area: 'database' },
  { pattern: /\b(ui|ux|design|style|css|component|layout|responsive|mobile)\b/i, area: 'ui' },
  { pattern: /\b(user|profile|account|settings|preference|notification)\b/i, area: 'user' },
  { pattern: /\b(payment|billing|subscription|invoice|stripe|checkout)\b/i, area: 'payments' },
  { pattern: /\b(search|filter|sort|pagination)\b/i, area: 'search' },
  { pattern: /\b(file|upload|download|media|image|storage|s3)\b/i, area: 'files' },
  { pattern: /\b(email|smtp|notification|alert|push|webhook)\b/i, area: 'notifications' },
  { pattern: /\b(deploy|ci|cd|build|docker|k8s|kubernetes|infra)\b/i, area: 'infrastructure' },
];

const IMPACT_RULES: Record<ChangeCategory, ImpactLevel> = {
  feature: 'high',
  fix: 'high',
  security: 'high',
  improvement: 'medium',
  performance: 'medium',
  refactor: 'low',
  maintenance: 'low',
  docs: 'low',
  test: 'low',
  ignore: 'ignore',
};

function parseConventional(message: string) {
  const match = message.match(/^(\w+)(\(([^)]+)\))?(!)?:\s*(.+)/);
  if (!match) return null;
  return { prefix: match[1].toLowerCase(), scope: match[3], description: match[5] };
}

function detectArea(message: string, filesChanged: string[]): string {
  const text = [message, ...filesChanged].join(' ');
  for (const { pattern, area } of AREA_PATTERNS) {
    if (pattern.test(text)) return area;
  }
  // Fallback: derive from file paths
  const paths = filesChanged.map((f) => f.toLowerCase());
  if (paths.some((p) => p.includes('/auth'))) return 'authentication';
  if (paths.some((p) => p.includes('/dashboard'))) return 'dashboard';
  if (paths.some((p) => p.includes('/api'))) return 'api';
  if (paths.some((p) => p.includes('/components') || p.includes('/pages') || p.includes('/app'))) return 'ui';
  return 'general';
}

export function classifyCommit(commit: Commit): ClassifiedCommit {
  const conventional = parseConventional(commit.message);
  let category: ChangeCategory = 'maintenance';
  let isConventional = false;

  if (conventional && CONVENTIONAL_PREFIXES[conventional.prefix]) {
    category = CONVENTIONAL_PREFIXES[conventional.prefix];
    isConventional = true;
  } else {
    for (const { pattern, category: cat } of KEYWORD_CATEGORY_MAP) {
      if (pattern.test(commit.message)) {
        category = cat;
        break;
      }
    }
  }

  const area = detectArea(
    conventional?.scope ?? commit.message,
    commit.filesChanged
  );

  return {
    ...commit,
    category,
    impact: IMPACT_RULES[category],
    area,
    isConventional,
  };
}

export function classifyCommits(commits: Commit[]): ClassifiedCommit[] {
  return commits.map(classifyCommit);
}
