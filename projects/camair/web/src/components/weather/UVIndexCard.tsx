import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Download, MoreVertical } from 'lucide-react';
import type { UVIndexData } from '@/types/weather';

interface UVIndexCardProps {
  data: UVIndexData[];
}

const uvColors = {
  low: '#22c55e',        // green
  moderate: '#eab308',   // yellow
  high: '#f97316',       // orange
  'very-high': '#ef4444', // red
};

export function UVIndexCard({ data }: UVIndexCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-lg dark:shadow-slate-900/50 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Ultraviolet Index</h3>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Low</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Moderate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-xs text-slate-500 dark:text-slate-400">High</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Very High</span>
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
          <BarChart data={data} barSize={14}>
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
              domain={[0, 12]}
              ticks={[0, 2, 4, 6, 8, 10, 12]}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? getUvColor(entry.level) : getUvColorTransparent(entry.level)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function getUvColor(level: string): string {
  const colors: Record<string, string> = {
    low: '#22c55e',
    moderate: '#eab308',
    high: '#f97316',
    'very-high': '#ef4444',
  };
  return colors[level] || '#22c55e';
}

function getUvColorTransparent(level: string): string {
  const colors: Record<string, string> = {
    low: '#22c55e66',
    moderate: '#eab30866',
    high: '#f9731666',
    'very-high': '#ef444466',
  };
  return colors[level] || '#22c55e66';
}
