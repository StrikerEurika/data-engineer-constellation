import { TrendingUp, Wind } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WindCardProps {
  speed: number;
  direction: string;
  directionDegrees: number;
  change: number;
  timeAgo: string;
  className?: string;
}

export function WindCard({ speed, direction, directionDegrees, change, timeAgo, className }: WindCardProps) {
  const speedMs = (speed / 3.6).toFixed(1);

  return (
    <Card glass className={cn("p-6 h-full min-h-[320px] flex flex-col justify-between transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-800", className)}>
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Wind className="w-5 h-5 text-blue-500" />
          Wind Systems
        </h3>
        <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">
          Anemometer
        </span>
      </div>

      <div className="flex items-center gap-6 my-auto py-4">
        {/* Speed display */}
        <div className="flex-1">
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{speed}</span>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">km/h</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full w-max">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{change}%</span>
            <span className="text-slate-400 dark:text-slate-500 font-medium">vs {timeAgo}</span>
          </div>
        </div>

        {/* Compass */}
        <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/30 rounded-full border border-slate-100 dark:border-white/[0.04] p-2">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border border-dashed border-slate-200 dark:border-white/10 animate-spin-slow" />
          
          {/* Compass circle */}
          <div className="absolute inset-1.5 rounded-full border border-slate-200/50 dark:border-white/[0.06] bg-white dark:bg-slate-950/40 shadow-inner" />
          
          {/* Direction markers */}
          <span className="absolute top-2.5 text-[9px] font-black text-slate-400 dark:text-slate-500">N</span>
          <span className="absolute bottom-2.5 text-[9px] font-black text-slate-400 dark:text-slate-500">S</span>
          <span className="absolute left-2.5 text-[9px] font-black text-slate-400 dark:text-slate-500">W</span>
          <span className="absolute right-2.5 text-[9px] font-black text-slate-400 dark:text-slate-500">E</span>
          
          {/* Wind direction arrow */}
          <div 
            className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out"
            style={{ transform: `rotate(${directionDegrees}deg)` }}
          >
            <div className="relative w-16 h-16 flex items-center justify-center">
              {/* Sleek Gradient Arrow */}
              <svg
                className="w-10 h-10 drop-shadow-[0_2px_4px_rgba(59,130,246,0.3)]"
                viewBox="0 0 100 100"
                style={{ transform: 'rotate(45deg)' }}
              >
                <defs>
                  <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
                <polygon points="50,10 65,40 50,33 35,40" fill="url(#arrowGrad)" />
                <line x1="50" y1="33" x2="50" y2="90" stroke="url(#arrowGrad)" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Center core */}
          <div className="absolute w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-500 flex items-center justify-center shadow">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          </div>
        </div>
      </div>

      {/* Wind details */}
      <div className="pt-4 border-t border-slate-100 dark:border-white/[0.04] grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500">Direction</p>
          <p className="text-base font-black text-slate-800 dark:text-white mt-0.5">
            {direction} <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">({directionDegrees}°)</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500">SI Velocity</p>
          <p className="text-base font-black text-slate-800 dark:text-white mt-0.5">
            {speedMs} <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">m/s</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
