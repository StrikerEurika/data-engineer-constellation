import type { AirQualityRecord } from '@/types/air-quality.types';
import { getAqiInfo } from '@/utils/aqi-utils';
import { X, MapPin, Clock } from 'lucide-react';
import { AqiBadge } from './AqiBadge';
import { Card, CardContent } from '@/components/ui/Card';

interface ProvinceDetailProps {
  record: AirQualityRecord;
  onClose: () => void;
}

function PollutantRow({
  label, value, unit, max, color,
}: {
  label: string; value: number; unit: string; max: number; color: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
        <span className="text-xs font-mono font-semibold text-slate-900 dark:text-white">{value.toFixed(2)} <span className="text-slate-500 dark:text-slate-500">{unit}</span></span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export function ProvinceDetail({ record, onClose }: ProvinceDetailProps) {
  const aqiInfo = getAqiInfo(record.us_epa_index);

  return (
    <Card className="fade-in" style={{ borderColor: `${aqiInfo.hex}30` }}>
      <CardContent className="pt-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Selected Province</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{record.name}</h3>
            <div className="mt-2">
              <AqiBadge index={record.us_epa_index} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AQI color band */}
        <div
          className="h-1 rounded-full mb-5"
          style={{ background: `linear-gradient(90deg, ${aqiInfo.hex}40, ${aqiInfo.hex})` }}
        />

        {/* Pollutants */}
        <div className="space-y-4">
          <PollutantRow label="PM2.5" value={record.pm2_5} unit="µg/m³" max={150}  color="#f472b6" />
          <PollutantRow label="PM10"  value={record.pm10}  unit="µg/m³" max={250}  color="#fb923c" />
          <PollutantRow label="CO"    value={record.co}    unit="µg/m³" max={800}  color="#60a5fa" />
          <PollutantRow label="NO₂"   value={record.no2}   unit="µg/m³" max={100}  color="#a78bfa" />
          <PollutantRow label="O₃"    value={record.o3}    unit="µg/m³" max={180}  color="#34d399" />
          <PollutantRow label="SO₂"   value={record.so2}   unit="µg/m³" max={75}   color="#fbbf24" />
        </div>

        {/* Indices */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-slate-100 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] rounded-xl p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">US EPA</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{record.us_epa_index}</p>
          </div>
          <div className="bg-slate-100 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] rounded-xl p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">GB DEFRA</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{record.gb_defra_index}</p>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-slate-200/60 dark:border-white/[0.06]">
          <Clock className="w-3 h-3 text-slate-500" />
          <span className="text-[10px] text-slate-500">Last updated: {record.last_updated}</span>
        </div>
      </CardContent>
    </Card>
  );
}
