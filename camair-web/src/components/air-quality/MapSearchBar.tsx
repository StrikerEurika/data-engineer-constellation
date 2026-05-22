import { MapPin } from "lucide-react";

interface MapSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function MapSearchBar({ value, onChange }: MapSearchBarProps) {
  return (
    <div className="absolute right-4 top-4 z-50 flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 min-w-70">
      <MapPin className="w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none"
        placeholder="Search province..."
      />
    </div>
  );
}
