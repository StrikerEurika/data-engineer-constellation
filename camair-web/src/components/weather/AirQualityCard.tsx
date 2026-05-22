import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Download, MoreVertical } from 'lucide-react';
import type { AirQualityData } from '@/types/weather';

interface AirQualityCardProps {
  data: AirQualityData[];
}

const COLORS = {
  clean: '#3b82f6',    // blue
  average: '#94a3b8',  // slate
  harmful: '#ef4444',  // red
};

export function AirQualityCard({ data }: AirQualityCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-lg dark:shadow-slate-900/50 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Air quality index</h3>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Clean air</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Average quality</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Harmful level</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-all">
            <Download className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-all">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={12}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              domain={[0, 50]}
              ticks={[10, 20, 30, 40, 50]}
            />
            <Bar dataKey="clean" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? '#3b82f6' : '#bfdbfe'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
