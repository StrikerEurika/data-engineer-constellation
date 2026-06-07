import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { Download, MoreVertical, CloudRain } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { RainChanceData } from '@/types/weather';

interface RainChanceCardProps {
  data: RainChanceData[];
  className?: string;
}
interface RainChanceTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const RainChanceTooltip = ({ active, payload, label }: RainChanceTooltipProps) => {
  if (active && payload && payload.length) {
    const chance = payload[0].value;
    let statusText = "Sunny / Clear";
    let statusColor = "text-yellow-400";
    if (chance > 10 && chance <= 30) { statusText = "Cloudy / Overcast"; statusColor = "text-slate-400"; }
    else if (chance > 30 && chance <= 60) { statusText = "Patchy Rain"; statusColor = "text-blue-300"; }
    else if (chance > 60 && chance <= 80) { statusText = "Moderate Rain"; statusColor = "text-blue-400"; }
    else if (chance > 80) { statusText = "Heavy Storm"; statusColor = "text-indigo-400"; }

    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-700/60 dark:border-white/[0.08] p-3.5 rounded-2xl shadow-xl text-white text-xs space-y-2.5">
        <p className="font-black text-slate-400">Time: {label}</p>
        <div className="space-y-1.5 font-bold">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Rain Chance: <span className="text-blue-400">{chance}%</span></span>
          </div>
          <p className="text-[10px] pl-4 font-black">Forecast: <span className={statusColor}>{statusText}</span></p>
        </div>
      </div>
    );
  }
  return null;
};

export function RainChanceCard({ data, className }: RainChanceCardProps) {
  return (
    <Card glass className={cn("p-6 h-full min-h-[380px] flex flex-col justify-between transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-800", className)}>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-blue-500" />
            Chance of Rain
          </h3>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-all">
              <Download className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-all">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
          Cloudy: 0-30% &bull; Rain: 60-80% &bull; Storm: 80-100%
        </p>
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-[180px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={16} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="activeRainGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.3}/>
              </linearGradient>
              <linearGradient id="inactiveRainGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#bfdbfe" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              dy={6}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              domain={[0, 100]}
              ticks={[25, 50, 75, 100]}
            />
            <Tooltip content={<RainChanceTooltip />} cursor={{ fill: 'rgba(59,130,246,0.03)' }} />
            <Bar dataKey="chance" radius={[6, 6, 0, 0]}>
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === 0 ? 'url(#activeRainGrad)' : 'url(#inactiveRainGrad)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
