import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Download, MoreVertical } from 'lucide-react';
import type { RainChanceData } from '@/types/weather';

interface RainChanceCardProps {
  data: RainChanceData[];
}

export function RainChanceCard({ data }: RainChanceCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-lg dark:shadow-slate-900/50 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Chance Of Rain</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cloudy: 0-30% &nbsp; Rain: 60-80% &nbsp; Heavy rain: 80-100%
          </p>
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
          <BarChart data={data} barSize={16}>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              dy={8}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              domain={[0, 80]}
              ticks={[20, 40, 60, 80]}
            />
            <Bar dataKey="chance" radius={[6, 6, 0, 0]}>
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
