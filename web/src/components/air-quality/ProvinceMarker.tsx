import { CircleMarker, Popup } from 'react-leaflet';
import { AqiBadge } from './AqiBadge';
import { getAqiInfo } from '@/utils/aqi-utils';
import type { AirQualityRecord } from '@/types/air-quality.types';

interface ProvinceMarkerProps {
  record: AirQualityRecord;
  isSelected: boolean;
  onClick: () => void;
}

export function ProvinceMarker({ record, isSelected, onClick }: ProvinceMarkerProps) {
  if (typeof record.lat !== 'number' || typeof record.lng !== 'number') {
    return null;
  }

  const aqiInfo = getAqiInfo(record.us_epa_index);
  const baseRadius = record.us_epa_index * 8 + 10;

  return (
    <CircleMarker
      center={[record.lat, record.lng]}
      radius={isSelected ? baseRadius + 10 : baseRadius}
      pathOptions={{
        color: aqiInfo.hex,
        fillColor: aqiInfo.hex,
        fillOpacity: isSelected ? 0.9 : 0.6,
        weight: isSelected ? 3 : 2,
        opacity: 1,
      }}
      eventHandlers={{ click: onClick }}
      className="cursor-pointer"
    >
      <Popup closeButton={false} offset={[0, -10]}>
        <div className="p-2 min-w-[220px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-900">{record.name}</h3>
            <AqiBadge index={record.us_epa_index} />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { key: 'pm2_5', label: 'PM2.5', value: `${record.pm2_5.toFixed(1)} µg/m³` },
              { key: 'pm10', label: 'PM10', value: `${record.pm10.toFixed(1)} µg/m³` },
              { key: 'o3', label: 'O3', value: `${record.o3.toFixed(1)} µg/m³` },
              { key: 'no2', label: 'NO2', value: `${record.no2.toFixed(1)} µg/m³` },
              { key: 'so2', label: 'SO2', value: `${record.so2.toFixed(1)} µg/m³` },
              { key: 'co', label: 'CO', value: `${record.co.toFixed(1)} µg/m³` },
            ].map(({ key, label, value }) => (
              <div key={key} className="bg-slate-100 dark:bg-white/5 rounded-lg px-2 py-1.5">
                <span className="text-slate-500 dark:text-slate-400 block">{label}</span>
                <span className="text-slate-900 dark:text-white font-semibold">{value}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200 dark:border-white/10">
            <span className="text-xs text-slate-500 dark:text-slate-400">US EPA: {record.us_epa_index}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">DEFRA: {record.gb_defra_index}</span>
          </div>
          <p className="text-slate-500 dark:text-slate-500 text-[10px] mt-2 pt-2 border-t border-slate-200 dark:border-white/10">
            Updated: {record.last_updated}
          </p>
        </div>
      </Popup>
    </CircleMarker>
  );
}
