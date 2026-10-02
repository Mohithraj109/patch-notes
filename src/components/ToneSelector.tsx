'use client';

import type { Tone } from '@/lib/ai/prompts';

const TONES: Array<{ value: Tone; label: string; desc: string }> = [
  { value: 'human',     label: 'HUMAN',     desc: 'Warm, friendly, for your users' },
  { value: 'technical', label: 'TECHNICAL', desc: 'Precise, for developers' },
  { value: 'executive', label: 'EXECUTIVE', desc: 'High-level, for leadership' },
  { value: 'casual',    label: 'CASUAL',    desc: 'Relaxed, like a Slack message' },
  { value: 'marketing', label: 'MARKETING', desc: 'Enthusiastic, for announcements' },
  { value: 'changelog', label: 'CHANGELOG', desc: 'Classic Added/Fixed/Changed format' },
];

interface Props {
  tone: Tone;
  onChange: (t: Tone) => void;
}

export default function ToneSelector({ tone, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-1">
      {TONES.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          title={t.desc}
          className={`border text-[10px] py-2 px-2 text-left transition-colors ${
            tone === t.value
              ? 'border-[#c8f135] text-[#c8f135] bg-[#c8f135]/5'
              : 'border-[#2a2a2a] text-[#555] hover:border-[#3a3a3a] hover:text-[#888]'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
