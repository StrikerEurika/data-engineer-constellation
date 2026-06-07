import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      <input
        type="text"
        placeholder="Search province..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-100 dark:bg-[#0d1424] border border-slate-200 dark:border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition"
      />
    </div>
  );
}
