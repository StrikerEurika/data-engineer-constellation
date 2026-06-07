import { useState } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Droplets, Wind, Gauge } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { WeatherRecord } from '@/types/weather';
import { formatToUTC7Time } from '@/utils/time';

interface AtmosphericTrendsCardProps {
  data: WeatherRecord[];
  className?: string;
}

type TabType = 'humidity' | 'wind' | 'pressure';

interface TooltipProps {
  active?: boolean;
  payload?: readonly {
    name?: string | number;
    value?: string | number | boolean | readonly (string | number)[];
    color?: string;
  }[];
  label?: string | number;
}

export function AtmosphericTrendsCard({ data, className }: AtmosphericTrendsCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('humidity');

  // Format data for Recharts
  const chartData = data.map((record, index) => {
    const timeStr = record.created_at_ts || record.created_at;
    return {
      time: timeStr ? formatToUTC7Time(timeStr) : `T-${index}`,
      humidity: record.humidity,
      cloud: record.cloud,
      windSpeed: record.wind_kph,
      gustSpeed: record.gust_kph,
      pressure: record.pressure_mb,
    };
  });

  // Dynamic Tooltip Renderers based on active tab
  const renderTooltip = ({ active, payload, label }: TooltipProps) => {
    if (!active || !payload || !payload.length) return null;

    if (activeTab === 'humidity') {
      const humidity = Number(payload[0]?.value ?? 0);
      const cloud = Number(payload[1]?.value ?? 0);
      
      let humDesc = "Dry";
      let humColor = "text-amber-400";
      if (humidity > 75) { humDesc = "Very Humid"; humColor = "text-teal-400"; }
      else if (humidity > 55) { humDesc = "Sticky/Humid"; humColor = "text-teal-300"; }
      else if (humidity > 35) { humDesc = "Comfortable"; humColor = "text-green-400"; }

      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-700/60 dark:border-white/[0.08] p-3.5 rounded-2xl shadow-xl text-white text-xs space-y-2.5">
          <p className="font-black text-slate-400">Time: {label}</p>
          <div className="space-y-1.5 font-bold">
            <div className="flex justify-between gap-6">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-400" />Humidity:</span>
              <span className="text-teal-400">{humidity}%</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400" />Cloud Cover:</span>
              <span className="text-slate-300">{cloud}%</span>
            </div>
            <div className="pt-1.5 border-t border-white/[0.06] text-[10px] font-black flex justify-between">
              <span className="text-slate-400">Air Sensation:</span>
              <span className={humColor}>{humDesc}</span>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'wind') {
      const speed = Number(payload[0]?.value ?? 0);
      const gust = Number(payload[1]?.value ?? 0);

      let windDesc = "Calm";
      let windColor = "text-green-400";
      if (speed > 25 || gust > 35) { windDesc = "Strong Winds"; windColor = "text-red-400 font-bold"; }
      else if (speed > 12 || gust > 20) { windDesc = "Moderate Breeze"; windColor = "text-cyan-400"; }
      else if (speed > 4) { windDesc = "Light Air"; windColor = "text-cyan-200"; }

      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-700/60 dark:border-white/[0.08] p-3.5 rounded-2xl shadow-xl text-white text-xs space-y-2.5">
          <p className="font-black text-slate-400">Time: {label}</p>
          <div className="space-y-1.5 font-bold">
            <div className="flex justify-between gap-6">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400" />Sustained Wind:</span>
              <span className="text-cyan-400">{speed} kph</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" />Gust Speed:</span>
              <span className="text-emerald-400">{gust} kph</span>
            </div>
            <div className="pt-1.5 border-t border-white/[0.06] text-[10px] font-black flex justify-between">
              <span className="text-slate-400">Wind Status:</span>
              <span className={windColor}>{windDesc}</span>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'pressure') {
      const pressure = Number(payload[0]?.value ?? 0);
      
      let pressureDesc = "Normal Barometer";
      let pressureColor = "text-slate-400";
      if (pressure < 1009) { pressureDesc = "Low (Unstable/Rain)"; pressureColor = "text-amber-400 font-bold"; }
      else if (pressure > 1018) { pressureDesc = "High (Dry/Fair)"; pressureColor = "text-emerald-400"; }

      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-700/60 dark:border-white/[0.08] p-3.5 rounded-2xl shadow-xl text-white text-xs space-y-2.5">
          <p className="font-black text-slate-400">Time: {label}</p>
          <div className="space-y-1.5 font-bold">
            <div className="flex justify-between gap-6">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-400" />Pressure:</span>
              <span className="text-indigo-400">{pressure} hPa</span>
            </div>
            <div className="pt-1.5 border-t border-white/[0.06] text-[10px] font-black flex justify-between">
              <span className="text-slate-400">Weather Front:</span>
              <span className={pressureColor}>{pressureDesc}</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Card glass className={cn("p-6 h-full min-h-[380px] flex flex-col justify-between transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-800", className)}>
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            {activeTab === 'humidity' && <Droplets className="w-5 h-5 text-teal-500" />}
            {activeTab === 'wind' && <Wind className="w-5 h-5 text-cyan-500" />}
            {activeTab === 'pressure' && <Gauge className="w-5 h-5 text-indigo-500" />}
            Atmospheric Dynamics
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {activeTab === 'humidity' && 'Tracks air moisture percentage relative to cloud occlusion layers.'}
            {activeTab === 'wind' && 'Compares sustained average wind velocity to sudden turbulence gusts.'}
            {activeTab === 'pressure' && 'Atmospheric pressure readings indicating local weather front movements.'}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-slate-100/80 dark:bg-slate-900/60 p-1.5 rounded-xl border border-slate-200/40 dark:border-white/[0.04] self-start sm:self-center">
          <button 
            onClick={() => setActiveTab('humidity')}
            className={cn(
              "px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center gap-1",
              activeTab === 'humidity'
                ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <Droplets className="w-3.5 h-3.5" />
            Humidity
          </button>
          <button 
            onClick={() => setActiveTab('wind')}
            className={cn(
              "px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center gap-1",
              activeTab === 'wind'
                ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <Wind className="w-3.5 h-3.5" />
            Wind
          </button>
          <button 
            onClick={() => setActiveTab('pressure')}
            className={cn(
              "px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center gap-1",
              activeTab === 'pressure'
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <Gauge className="w-3.5 h-3.5" />
            Pressure
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 min-h-[220px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'humidity' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="humidityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={6} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} domain={[0, 100]} ticks={[25, 50, 75, 100]} />
              <Tooltip content={renderTooltip} />
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
                        <span>{entry.value === 'humidity' ? 'Relative Humidity' : 'Cloud Cover'}</span>
                      </div>
                    ))}
                  </div>
                )}
              />
              <Area type="monotone" dataKey="humidity" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#humidityGrad)" />
              <Area type="monotone" dataKey="cloud" stroke="#64748b" strokeWidth={2} strokeDasharray="3 3" fillOpacity={1} fill="url(#cloudGrad)" />
            </AreaChart>
          ) : activeTab === 'wind' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="windSpeedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="gustSpeedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={6} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} domain={['auto', 'auto']} />
              <Tooltip content={renderTooltip} />
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
                        <span>{entry.value === 'windSpeed' ? 'Sustained Wind' : 'Gust Wind Speed'}</span>
                      </div>
                    ))}
                  </div>
                )}
              />
              <Area type="monotone" dataKey="windSpeed" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#windSpeedGrad)" />
              <Area type="monotone" dataKey="gustSpeed" stroke="#10b981" strokeWidth={2.5} strokeDasharray="3 3" fillOpacity={1} fill="url(#gustSpeedGrad)" />
            </AreaChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={6} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} domain={['auto', 'auto']} />
              <Tooltip content={renderTooltip} />
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
                        <span>Barometric Pressure (hPa)</span>
                      </div>
                    ))}
                  </div>
                )}
              />
              <Line type="monotone" dataKey="pressure" stroke="#6366f1" strokeWidth={3} dot={{ stroke: '#6366f1', strokeWidth: 1.5, r: 3, fill: '#fff' }} activeDot={{ r: 5, strokeWidth: 0 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
