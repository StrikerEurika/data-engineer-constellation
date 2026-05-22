import type { AqiInfo } from '../types/air-quality.types';

// US EPA AQI Category definitions
export const AQI_CATEGORIES: Record<number, AqiInfo> = {
  1: { label: 'Good',                             color: 'bg-emerald-500', textColor: 'text-emerald-400', borderColor: 'border-emerald-500', hex: '#10b981', range: '0–50',    aqiMin: 0,   aqiMax: 50  },
  2: { label: 'Moderate',                         color: 'bg-yellow-400',  textColor: 'text-yellow-400',  borderColor: 'border-yellow-400',  hex: '#facc15', range: '51–100',  aqiMin: 51,  aqiMax: 100 },
  3: { label: 'Unhealthy for Sensitive Groups',   color: 'bg-orange-500',  textColor: 'text-orange-400',  borderColor: 'border-orange-500',  hex: '#f97316', range: '101–150', aqiMin: 101, aqiMax: 150 },
  4: { label: 'Unhealthy',                        color: 'bg-red-500',     textColor: 'text-red-400',     borderColor: 'border-red-500',     hex: '#ef4444', range: '151–200', aqiMin: 151, aqiMax: 200 },
  5: { label: 'Very Unhealthy',                   color: 'bg-purple-600',  textColor: 'text-purple-400',  borderColor: 'border-purple-600',  hex: '#9333ea', range: '201–300', aqiMin: 201, aqiMax: 300 },
  6: { label: 'Hazardous',                        color: 'bg-rose-900',    textColor: 'text-rose-400',    borderColor: 'border-rose-900',    hex: '#881337', range: '301+',    aqiMin: 301, aqiMax: 999 },
};

export function getAqiInfo(usEpaIndex: number): AqiInfo {
  return AQI_CATEGORIES[usEpaIndex] ?? AQI_CATEGORIES[1];
}

export function formatPollutant(value: number, decimals = 1): string {
  return value.toFixed(decimals);
}

export function getPm25Level(pm25: number): string {
  if (pm25 <= 12)  return 'Good';
  if (pm25 <= 35.4) return 'Moderate';
  if (pm25 <= 55.4) return 'Unhealthy SG';
  if (pm25 <= 150.4) return 'Unhealthy';
  if (pm25 <= 250.4) return 'Very Unhealthy';
  return 'Hazardous';
}

export function getStatsSummary(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: sum / sorted.length,
    median: sorted[Math.floor(sorted.length / 2)],
  };
}
