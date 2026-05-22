import { getAqiInfo } from "@/utils/aqi-utils";
import { Badge } from "./AqiBadge";
import { MapPin } from "lucide-react";

// AQI Gauge Component
export function AqiGauge({
  value,
  label,
  usEpaIndex,
  gbDefraIndex,
  showIndexComparison = false,
}: {
  value: number;
  label: string;
  usEpaIndex: number;
  gbDefraIndex: number;
  showIndexComparison?: boolean;
}) {
  const aqiInfo = getAqiInfo(usEpaIndex);

  return (
    <div className="relative">
      {/* Gauge Arc */}
      <div className="relative h-40 w-full">
        <svg viewBox="0 10 200 150" className="w-full h-full">
          {/* Background Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="oklch(var(--muted))"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Colored Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#aqi-gradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="251"
            strokeDashoffset={251 - (usEpaIndex / 6) * 251}
          />
          <defs>
            <linearGradient id="aqi-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="25%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="75%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          {/* Indicator Circle */}
          <circle
            cx={20 + 160 * (usEpaIndex / 6)}
            cy={
              100 -
              Math.sqrt(6400 - Math.pow(20 + 160 * (usEpaIndex / 6) - 100, 2))
            }
            r="8"
            fill="white"
            stroke={aqiInfo.hex}
            strokeWidth="3"
          />
        </svg>
        {/* Value Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <span className="text-4xl font-bold text-slate-900 dark:text-white">
            {value}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            AQI (US EPA)
          </span>
          <div className="mt-2">
            <Badge
              variant={
                aqiInfo.label === "Good"
                  ? "good"
                  : aqiInfo.label === "Moderate"
                    ? "moderate"
                    : "sensitive"
              }
            >
              <span className="inline-block w-2 h-2 rounded-full bg-current" />
              {aqiInfo.label}
            </Badge>
          </div>
        </div>
      </div>
      {/* Location Info */}
      <div className="flex items-center gap-2 justify-center mt-4">
        <MapPin className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {label}
        </span>
      </div>
      {/* Index comparison */}
      {showIndexComparison && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              US EPA
            </span>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {usEpaIndex}
            </p>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
          <div className="text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              DEFRA
            </span>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {gbDefraIndex}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
