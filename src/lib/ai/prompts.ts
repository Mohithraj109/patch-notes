export type Tone = 'human' | 'technical' | 'executive' | 'casual' | 'marketing' | 'changelog';

const TONE_INSTRUCTIONS: Record<Tone, string> = {
  human: 'Write in warm, friendly language. Focus on what changed for the user. Avoid jargon. Use "we" where natural.',
  technical: 'Write precise technical release notes. Include specifics about what was changed. Use technical terminology.',
  executive: 'Write concise executive-level notes. Focus on business impact and high-level outcomes. Keep it brief.',
  casual: 'Write in a relaxed, conversational tone. Keep it friendly and approachable, like talking to a teammate.',
  marketing: 'Write enthusiastically about new capabilities. Emphasize user benefits and value. Make it compelling.',
  changelog: 'Write in classic changelog format. Use action verbs (Added, Fixed, Changed, Removed). Be terse and direct.',
};

export function buildPatchNotesPrompt(payload: {
  project: string;
  period: string;
  authors: string[];
  changes: Array<{ area: string; changes: string[] }>;
  tone: Tone;
  includeAuthors?: boolean;
}): string {
  const toneInstruction = TONE_INSTRUCTIONS[payload.tone];
  const changesText = payload.changes
    .map((g) => `${g.area}:\n${g.changes.map((c) => `  - ${c}`).join('\n')}`)
    .join('\n\n');

  return `You are generating professional release notes for "${payload.project}".

Time period: ${payload.period}
${payload.includeAuthors && payload.authors.length ? `Contributors: ${payload.authors.join(', ')}` : ''}

Tone instruction: ${toneInstruction}

The following engineering changes occurred this period:

${changesText}

Rules:
1. Do NOT invent functionality not listed above.
2. Do NOT exaggerate the impact of changes.
3. Group related changes under clear headings that match the area names.
4. Each section heading on its own line, followed by the description.
5. Keep each section to 2-4 sentences.
6. Refactor/maintenance items go under a "Maintenance" section at the end.
7. Output ONLY the patch notes — no preamble, no meta-commentary.
8. Use plain text. No markdown bullets or symbols.

Generate the patch notes now:`;
}

export function buildSingleLineSummaryPrompt(commitMessage: string, diff?: string): string {
  return `Summarize this code change in one clear, non-technical sentence.

Commit: ${commitMessage}
${diff ? `\nDiff:\n${diff.slice(0, 1000)}` : ''}

Respond with only the summary sentence.`;
}
