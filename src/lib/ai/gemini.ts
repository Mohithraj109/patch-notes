import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Tone } from './prompts';
import { buildPatchNotesPrompt } from './prompts';
import type { CommitGroup } from '../git/types';
import { buildContextPayload } from '../processor/grouper';

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is not set');
    client = new GoogleGenerativeAI(apiKey);
  }
  return client;
}

export async function generatePatchNotes(options: {
  project: string;
  period: string;
  authors: string[];
  groups: CommitGroup[];
  tone: Tone;
  includeAuthors?: boolean;
}): Promise<string> {
  const ai = getClient();
  const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const payload = buildContextPayload(options.groups, {
    project: options.project,
    period: options.period,
    authors: options.authors,
  });

  const prompt = buildPatchNotesPrompt({
    ...payload,
    tone: options.tone,
    includeAuthors: options.includeAuthors,
  });

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

export async function streamPatchNotes(options: {
  project: string;
  period: string;
  authors: string[];
  groups: CommitGroup[];
  tone: Tone;
  includeAuthors?: boolean;
}): Promise<ReadableStream<string>> {
  const ai = getClient();
  const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const payload = buildContextPayload(options.groups, {
    project: options.project,
    period: options.period,
    authors: options.authors,
  });

  const prompt = buildPatchNotesPrompt({
    ...payload,
    tone: options.tone,
    includeAuthors: options.includeAuthors,
  });

  const result = await model.generateContentStream(prompt);

  return new ReadableStream<string>({
    async start(controller) {
      for await (const chunk of result.stream) {
        controller.enqueue(chunk.text());
      }
      controller.close();
    },
  });
}
