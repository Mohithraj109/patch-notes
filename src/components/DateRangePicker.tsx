'use client';

interface Props {
  fromDate: string;
  toDate: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}

const PRESETS = [
  { label: 'THIS WEEK', getDates: () => {
    const now = new Date();
    const day = now.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return [monday.toISOString().slice(0, 10), sunday.toISOString().slice(0, 10)];
  }},
  { label: 'LAST WEEK', getDates: () => {
    const now = new Date();
    const day = now.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    const thisMonday = new Date(now);
    thisMonday.setDate(now.getDate() + diff);
    const monday = new Date(thisMonday);
    monday.setDate(thisMonday.getDate() - 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return [monday.toISOString().slice(0, 10), sunday.toISOString().slice(0, 10)];
  }},
  { label: 'LAST 30D', getDates: () => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 30);
    return [from.toISOString().slice(0, 10), to.toISOString().slice(0, 10)];
  }},
];

export default function DateRangePicker({ fromDate, toDate, onFromChange, onToChange }: Props) {
  return (
    <div className="space-y-2">
      {/* Quick presets */}
      <div className="flex gap-1">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              const [from, to] = preset.getDates();
              onFromChange(from);
              onToChange(to);
            }}
            className="flex-1 border border-[#2a2a2a] text-[#555] text-[10px] py-1 hover:border-[#3a3a3a] hover:text-[#888] transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Date inputs */}
      <div className="flex gap-2 items-center">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => onFromChange(e.target.value)}
          className="flex-1 bg-[#111] border border-[#2a2a2a] px-3 py-2 text-xs text-[#e8e8e8] focus:outline-none focus:border-[#c8f135] transition-colors [color-scheme:dark]"
        />
        <span className="text-[#444] text-xs">→</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => onToChange(e.target.value)}
          className="flex-1 bg-[#111] border border-[#2a2a2a] px-3 py-2 text-xs text-[#e8e8e8] focus:outline-none focus:border-[#c8f135] transition-colors [color-scheme:dark]"
        />
      </div>
    </div>
  );
}
