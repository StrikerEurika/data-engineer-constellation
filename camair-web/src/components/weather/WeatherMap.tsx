import { Plus, Minus, Target } from 'lucide-react';

export function WeatherMap() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 h-full shadow-lg dark:shadow-slate-900/50 transition-colors">
      <div className="relative h-[200px] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700">
        {/* Map placeholder - using a gradient to simulate weather radar */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200 dark:from-slate-600 dark:via-slate-500 dark:to-slate-600">
          {/* Simulated weather patterns */}
          <div className="absolute top-4 left-8 w-24 h-16 bg-green-400/30 dark:bg-green-500/20 rounded-full blur-xl" />
          <div className="absolute top-12 right-12 w-32 h-20 bg-blue-400/30 dark:bg-blue-500/20 rounded-full blur-xl" />
          <div className="absolute bottom-8 left-1/3 w-28 h-14 bg-yellow-400/20 dark:bg-yellow-500/10 rounded-full blur-xl" />
          
          {/* Map grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748b" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Map controls */}
        <div className="absolute right-3 bottom-3 flex flex-col gap-2">
          <button className="w-8 h-8 rounded-full bg-white dark:bg-slate-600 shadow-md flex items-center justify-center text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-500 transition-all">
            <Plus className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-full bg-white dark:bg-slate-600 shadow-md flex items-center justify-center text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-500 transition-all">
            <Minus className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-full bg-white dark:bg-slate-600 shadow-md flex items-center justify-center text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-500 transition-all">
            <Target className="w-4 h-4" />
          </button>
        </div>

        {/* Location indicator */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg text-xs text-slate-600 dark:text-slate-300 font-medium">
          Weather Radar
        </div>
      </div>
    </div>
  );
}
