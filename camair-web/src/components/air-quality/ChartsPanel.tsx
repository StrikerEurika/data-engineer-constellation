import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import type { AirQualityRecord } from '@/types/air-quality.types';
import { getAqiInfo, AQI_CATEGORIES } from '@/utils/aqi-utils';

interface ChartsProps {
  data: AirQualityRecord[];
  selectedProvince: string | null;
}

const POLLUTANT_COLORS: Record<string, string> = {
  'PM2.5': '#f472b6',
  'PM10':  '#fb923c',
  'CO':    '#60a5fa',
  'NO₂':   '#a78bfa',
  'O₃':    '#34d399',
  'SO₂':   '#fbbf24',
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { province: string } }>;
}

function CustomBarTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  return (
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200/60 dark:border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-500 dark:text-slate-400 mb-1">{p.province}</p>
      <p className="text-slate-900 dark:text-white font-semibold">{name}: <span className="text-blue-500 dark:text-blue-400">{value.toFixed(1)} µg/m³</span></p>
    </div>
  );
}

function AqiDistributionChart({ data }: { data: AirQualityRecord[] }) {
  const counts = Object.entries(AQI_CATEGORIES).map(([idx, info]: [string, any]) => ({
    label: info.label.split(' ')[0],
    count: data.filter((d) => d.us_epa_index === Number(idx)).length,
    hex:   info.hex,
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={counts} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<CustomDistTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Provinces">
            {counts.map((entry, index) => (
              <Cell key={index} fill={entry.hex} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface DistTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { label: string } }>;
}

function CustomDistTooltip({ active, payload }: DistTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200/60 dark:border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-900 dark:text-white font-semibold">{payload[0].payload.label}: <span className="text-blue-500 dark:text-blue-400">{payload[0].value} province(s)</span></p>
    </div>
  );
}

function ProvinceRadarChart({ record }: { record: AirQualityRecord }) {
  const radarData = [
    { metric: 'PM2.5', value: Math.min(record.pm2_5 / 150 * 100, 100) },
    { metric: 'PM10',  value: Math.min(record.pm10  / 250 * 100, 100) },
    { metric: 'CO',    value: Math.min(record.co    / 800 * 100, 100) },
    { metric: 'NO₂',   value: Math.min(record.no2   / 100 * 100, 100) },
    { metric: 'O₃',    value: Math.min(record.o3    / 180 * 100, 100) },
    { metric: 'SO₂',   value: Math.min(record.so2   / 75  * 100, 100) },
  ];

  const aqiInfo = getAqiInfo(record.us_epa_index);

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData}>
          <PolarGrid stroke="rgba(255,255,255,0.06)" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 10 }} />
          <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
          <Radar
            name={record.name}
            dataKey="value"
            stroke={aqiInfo.hex}
            fill={aqiInfo.hex}
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function TopPollutedChart({ data }: { data: AirQualityRecord[] }) {
  const top = [...data]
    .sort((a, b) => b.pm2_5 - a.pm2_5)
    .slice(0, 8)
    .map((d) => ({
      province: d.name.length > 14 ? d.name.slice(0, 12) + '…' : d.name,
      'PM2.5': d.pm2_5,
      aqi: d.us_epa_index,
    }));

  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top} layout="vertical" barSize={14}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="province" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
          <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="PM2.5" radius={[0, 6, 6, 0]}>
            {top.map((entry, i) => (
              <Cell key={i} fill={getAqiInfo(entry.aqi).hex} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ChartsPanel({ data, selectedProvince }: ChartsProps) {
  const selected = selectedProvince ? data.find((d) => d.name === selectedProvince) : null;

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* AQI Distribution */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          AQI Distribution
        </h4>
        <AqiDistributionChart data={data} />
      </div>

      {/* Top Polluted Provinces */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Top Polluted (PM2.5)
        </h4>
        <TopPollutedChart data={data} />
      </div>

      {/* Selected Province Radar */}
      {selected && (
        <div className="fade-in">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Pollutant Profile — {selected.name}
          </h4>
          <p className="text-[10px] text-slate-600 mb-3">Normalized to WHO/EPA thresholds</p>
          <ProvinceRadarChart record={selected} />
        </div>
      )}
    </div>
  );
}
