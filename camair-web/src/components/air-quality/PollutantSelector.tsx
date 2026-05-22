import { Droplets, Cloud, Wind, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import type { PollutantType } from "@/types/air-quality.types";
import { POLLUTANT_CONFIG } from "@/config/pollutant.config";

const ICON_MAP: Record<PollutantType, React.ReactNode> = {
  pm2_5: <Droplets className="w-3 h-3" />,
  pm10: <Droplets className="w-3 h-3" />,
  o3: <Cloud className="w-3 h-3" />,
  no2: <Wind className="w-3 h-3" />,
  so2: <Cloud className="w-3 h-3" />,
  co: <Wind className="w-3 h-3" />,
};

type LayerOption = PollutantType | "none";

const LAYER_OPTIONS: { key: LayerOption; label: string; icon: React.ReactNode }[] = [
  { key: "none", label: "Plain", icon: <Map className="w-3 h-3" /> },
  ...(["pm2_5", "pm10", "o3", "no2"] as PollutantType[]).map((p) => ({
    key: p,
    label: POLLUTANT_CONFIG[p].name,
    icon: ICON_MAP[p],
  })),
];

interface PollutantSelectorProps {
  selected: LayerOption;
  onSelect: (pollutant: LayerOption) => void;
}

export function PollutantSelector({ selected, onSelect }: PollutantSelectorProps) {
  return (
    <div className="absolute left-4 bottom-4 z-50 flex gap-2">
      {LAYER_OPTIONS.map((opt) => (
        <Button
          key={opt.key}
          onClick={() => onSelect(opt.key)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5",
            selected === opt.key
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700",
          )}
        >
          {opt.icon}
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
