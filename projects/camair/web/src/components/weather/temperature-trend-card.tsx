import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Thermometer } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { WeatherRecord } from '@/types/weather';
import { formatToUTC7Time } from '@/utils/time';

interface TemperatureTrendCardProps {
  data: WeatherRecord[];
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: readonly {
    name?: string | number;
    value?: string | number | boolean | readonly (string | number)[];
    color?: string;
  }[];
  label?: string | number;
}

const TemperatureTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length >= 2) {
    const temp = Number(payload[0].value ?? 0);
    const feelsLike = Number(payload[1].value ?? 0);
    const diff = Math.round((feelsLike - temp) * 10) / 10;
    
    let diffText = "Feels the same";
    let diffColor = "text-slate-400";
    if (diff > 0) {
      diffText = `Feels ${diff}°C warmer`;
      diffColor = "text-amber-500 font-bold";
    } else if (diff < 0) {
      diffText = `Feels ${Math.abs(diff)}°C cooler`;
      diffColor = "text-sky-500 font-bold";
    }

    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-700/60 dark:border-white/[0.08] p-4 rounded-2xl shadow-xl text-white text-xs space-y-2.5">
        <p className="font-black text-slate-400">Time: {label}</p>
        <div className="space-y-1.5 font-bold">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Actual Temp:</span>
            </div>
            <span className="text-amber-400 text-sm font-black">{temp}°C</span>
          </div>
          
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
              <span>Feels Like:</span>
            </div>
            <span className="text-violet-400 text-sm font-black">{feelsLike}°C</span>
          </div>
          
          <div className="pt-2 border-t border-white/[0.06] text-[10px] font-black flex justify-between items-center">
            <span className="text-slate-400">Comfort:</span>
            <span className={diffColor}>{diffText}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function TemperatureTrendCard({ data, className }: TemperatureTrendCardProps) {
  // Format the data for the chart
  const chartData = data.map((record, index) => {
    const timeStr = record.created_at_ts || record.created_at;
    return {
      time: timeStr ? formatToUTC7Time(timeStr) : `T-${index}`,
      temp: record.temp_c,
      feelsLike: record.feelslike_c,
    };
  });

  return (
    <Card glass className={cn("p-6 h-full min-h-[380px] flex flex-col justify-between transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-800", className)}>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-amber-500" />
            Temperature & Comfort Trend
          </h3>
          <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">
            24h Profile
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
          Compares actual thermometer temperature with index-adjusted human sensation (Feels Like).
        </p>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[220px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="feelsLikeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              dy={6}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<TemperatureTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              iconSize={8}
              content={({ payload }) => (
                <div className="flex justify-center gap-6 pt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {payload?.map((entry, idx) => (
                    <div key={`legend-${idx}`} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span>{entry.value === 'temp' ? 'Actual Temp' : 'Feels Like'}</span>
                    </div>
                  ))}
                </div>
              )}
            />
            <Area 
              type="monotone" 
              dataKey="temp" 
              stroke="#f59e0b" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#tempGrad)" 
            />
            <Area 
              type="monotone" 
              dataKey="feelsLike" 
              stroke="#8b5cf6" 
              strokeWidth={2.5}
              strokeDasharray="4 4"
              fillOpacity={1} 
              fill="url(#feelsLikeGrad)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
