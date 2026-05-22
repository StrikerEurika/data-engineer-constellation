export interface AirQualityRecord {
  id: number;
  name: string; // Province name
  co: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
  us_epa_index: number;
  gb_defra_index: number;
  last_updated: string;
  last_updated_epoch: number;
  created_at: string;
  // Derived coordinates for map placement
  lat?: number;
  lng?: number;
}

export interface ApiResponse {
  data: AirQualityRecord[];
}

export type AqiCategory = 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';

export interface AqiInfo {
  label: AqiCategory;
  color: string;       // Tailwind bg color class
  textColor: string;   // Tailwind text color class
  borderColor: string;
  hex: string;         // Hex for map markers and charts
  range: string;
  aqiMin: number;
  aqiMax: number;
}

export type SortField = keyof AirQualityRecord;
export type SortDirection = 'asc' | 'desc';
