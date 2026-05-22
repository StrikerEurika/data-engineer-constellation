import { TrendingUp } from 'lucide-react';

interface WindCardProps {
  speed: number;
  direction: string;
  directionDegrees: number;
  change: number;
  timeAgo: string;
}

export function WindCard({ speed, direction, directionDegrees, change, timeAgo }: WindCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-lg dark:shadow-slate-900/50 transition-colors">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Wind speed</h3>
      
      <div className="flex items-center gap-6">
        {/* Speed display */}
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold text-slate-800 dark:text-white">{speed}</span>
            <span className="text-slate-500 dark:text-slate-400">km/h</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-500 text-sm">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{change}%</span>
            <span className="text-slate-400 dark:text-slate-500 ml-1">VS {timeAgo}</span>
          </div>
        </div>

        {/* Compass */}
        <div className="relative w-32 h-32">
          {/* Compass circle */}
          <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-700" />
          
          {/* Direction markers */}
          <span className="absolute top-1 left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-600 dark:text-slate-400">N</span>
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-600 dark:text-slate-400">S</span>
          <span className="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-600 dark:text-slate-400">W</span>
          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-600 dark:text-slate-400">E</span>
          
          {/* Wind direction arrow */}
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: `rotate(${directionDegrees}deg)` }}
          >
            <div className="relative w-20 h-20">
              {/* Arrow */}
              <svg
                className="w-full h-full"
                viewBox="0 0 100 100"
                style={{ transform: 'rotate(45deg)' }}
              >
                <polygon points="50,15 60,45 50,40 40,45" fill="#3b82f6" />
                <line x1="50" y1="45" x2="50" y2="80" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
          </div>
        </div>
      </div>

      {/* Wind details */}
      <div className="mt-4 flex items-center gap-4">
        <div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{direction}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">m/s</p>
        </div>
      </div>
    </div>
  );
}
