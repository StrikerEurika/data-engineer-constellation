import { TrendingUp, Wind } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WindCardProps {
  speed: number;
  direction: string;
  directionDegrees: number;
  change: number;
  timeAgo: string;
  gustSpeed?: number;
  className?: string;
}

const getBeaufortScale = (kph: number) => {
  if (kph < 2) return { label: "Calm", desc: "Smoke rises vertically", color: "text-slate-500 bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-800/60" };
  if (kph <= 5) return { label: "Light Air", desc: "Smoke drift shows direction", color: "text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20" };
  if (kph <= 11) return { label: "Light Breeze", desc: "Face feels wind; leaves rustle", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
  if (kph <= 19) return { label: "Gentle Breeze", desc: "Twigs and leaves sway constantly", color: "text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20" };
  if (kph <= 28) return { label: "Moderate Breeze", desc: "Raises dust and loose paper", color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20" };
  if (kph <= 38) return { label: "Fresh Breeze", desc: "Small trees begin to sway", color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20" };
  if (kph <= 49) return { label: "Strong Breeze", desc: "Umbrellas difficult to hold", color: "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20" };
  return { label: "Gale / Storm", desc: "Difficult to walk against wind", color: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20" };
};

export function WindCard({ speed, direction, directionDegrees, change, timeAgo, gustSpeed, className }: WindCardProps) {
  const speedMs = (speed / 3.6).toFixed(1);
  const beaufort = getBeaufortScale(speed);

  return (
    <Card glass className={cn("p-6 h-full min-h-[320px] flex flex-col justify-between transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-800 relative overflow-hidden", className)}>
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow-custom {
          animation: spin-slow 25s infinite linear;
        }
        @keyframes wind-particle-drift {
          0% {
            transform: translateY(40px) scale(0.5);
            opacity: 0;
          }
          15% {
            opacity: 0.55;
          }
          85% {
            opacity: 0.55;
          }
          100% {
            transform: translateY(-40px) scale(1.1);
            opacity: 0;
          }
        }
        .animate-wind-particle-1 {
          animation: wind-particle-drift 2s infinite linear;
        }
        .animate-wind-particle-2 {
          animation: wind-particle-drift 2.5s infinite linear;
          animation-delay: 0.6s;
        }
        .animate-wind-particle-3 {
          animation: wind-particle-drift 1.8s infinite linear;
          animation-delay: 1.2s;
        }
      `}</style>

      {/* Decorative wind flow path background */}
      <svg className="w-24 h-12 text-blue-500/5 dark:text-blue-400/5 absolute right-2 top-10 pointer-events-none select-none" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M 0,10 Q 25,-2 50,10 T 100,10" strokeLinecap="round" />
        <path d="M 5,20 Q 30,8 55,20 T 100,20" strokeLinecap="round" />
      </svg>

      {/* Title */}
      <div className="flex items-center justify-between z-10">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Wind className="w-5 h-5 text-blue-500" />
          Wind Systems
        </h3>
        <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">
          Anemometer
        </span>
      </div>

      <div className="flex items-center gap-6 my-auto py-4 z-10">
        {/* Speed display */}
        <div className="flex-1 space-y-2.5">
          <div className="space-y-0.5">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{speed}</span>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">km/h</span>
            </div>
            
            <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold">
              <TrendingUp className="w-3 h-3" />
              <span>+{change}%</span>
              <span className="text-slate-400 dark:text-slate-500 font-medium">vs {timeAgo}</span>
            </div>
          </div>

          {/* Beaufort Rating Badge */}
          <div className={cn("flex flex-col gap-0.5 px-3 py-1.5 rounded-xl border text-[10px] w-max max-w-[140px] font-sans shadow-sm", beaufort.color)}>
            <span className="font-extrabold uppercase tracking-wider">{beaufort.label}</span>
            <span className="opacity-80 font-medium truncate" title={beaufort.desc}>{beaufort.desc}</span>
          </div>
        </div>

        {/* Compass */}
        <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/30 rounded-full border border-slate-100 dark:border-white/[0.04] p-2 shadow-inner">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border border-dashed border-slate-200 dark:border-white/10 animate-spin-slow-custom" />
          
          {/* Compass circle */}
          <div className="absolute inset-1.5 rounded-full border border-slate-200/50 dark:border-white/[0.06] bg-white dark:bg-slate-950/40 shadow-inner" />
          
          {/* Direction markers */}
          <span className="absolute top-2.5 text-[9px] font-black text-slate-400 dark:text-slate-500">N</span>
          <span className="absolute bottom-2.5 text-[9px] font-black text-slate-400 dark:text-slate-500">S</span>
          <span className="absolute left-2.5 text-[9px] font-black text-slate-400 dark:text-slate-500">W</span>
          <span className="absolute right-2.5 text-[9px] font-black text-slate-400 dark:text-slate-500">E</span>

          {/* Wind particle flow */}
          <div 
            className="absolute inset-2 overflow-hidden rounded-full pointer-events-none"
            style={{ transform: `rotate(${directionDegrees}deg)` }}
          >
            <div className="absolute left-[30%] w-1 h-1 rounded-full bg-blue-500/40 dark:bg-blue-400/40 animate-wind-particle-1" />
            <div className="absolute left-[50%] w-1.5 h-1.5 rounded-full bg-blue-500/30 dark:bg-blue-400/30 animate-wind-particle-2" />
            <div className="absolute left-[70%] w-1 h-1 rounded-full bg-blue-500/40 dark:bg-blue-400/40 animate-wind-particle-3" />
          </div>
          
          {/* Wind direction arrow */}
          <div 
            className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out"
            style={{ transform: `rotate(${directionDegrees}deg)` }}
          >
            <div className="relative w-16 h-16 flex items-center justify-center">
              {/* Sleek Gradient Arrow */}
              <svg
                className="w-10 h-10 drop-shadow-[0_2px_4px_rgba(59,130,246,0.35)]"
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
      <div className="pt-4 border-t border-slate-100 dark:border-white/[0.04] grid grid-cols-3 gap-2 z-10">
        <div>
          <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500">Direction</p>
          <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5 truncate">
            {direction} <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">({directionDegrees}°)</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500">Wind Gusts</p>
          <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5 truncate">
            {gustSpeed ?? (speed * 1.25).toFixed(1)} <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">km/h</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500">SI Velocity</p>
          <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5 truncate">
            {speedMs} <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">m/s</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
