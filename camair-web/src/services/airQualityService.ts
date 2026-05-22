import type { AirQualityRecord, ApiResponse } from '../types/air-quality.types';
import { MOCK_AIR_QUALITY_DATA, PROVINCE_COORDS } from '../data/mockAirQualityData';

// Realistic static mock data matching the live API structure exactly
const MOCK_RAW: Omit<AirQualityRecord, 'lat' | 'lng'>[] = [
  // { id: 752615, name: 'Takeo',              co: 463.85, no2: 17.85, o3: 108.0, pm2_5: 57.35, pm10: 58.25, so2: 12.75, us_epa_index: 3, gb_defra_index: 7, last_updated: '2026-03-15 04:15', last_updated_epoch: 1773522900, created_at: '2026-03-15T04:15:08.370425+07:00' },
  // { id: 752630, name: 'Battambang',         co: 375.85, no2: 15.35, o3:  62.0, pm2_5: 29.05, pm10: 30.15, so2:  2.35, us_epa_index: 2, gb_defra_index: 3, last_updated: '2026-03-15 04:15', last_updated_epoch: 1773522900, created_at: '2026-03-15T04:30:09.506922+07:00' },
  // { id: 752631, name: 'Kratie',             co: 239.85, no2:  2.05, o3:  92.0, pm2_5:  7.95, pm10:  8.45, so2:  1.45, us_epa_index: 1, gb_defra_index: 1, last_updated: '2026-03-15 04:30', last_updated_epoch: 1773523800, created_at: '2026-03-15T04:30:09.506922+07:00' },
  // { id: 752634, name: 'Mondulkiri',         co: 211.85, no2:  2.95, o3:  97.0, pm2_5:  7.65, pm10:  8.65, so2:  2.35, us_epa_index: 1, gb_defra_index: 1, last_updated: '2026-03-15 04:30', last_updated_epoch: 1773523800, created_at: '2026-03-15T04:30:09.506922+07:00' },
  // { id: 752640, name: 'Tboung Khmum',       co: 375.85, no2: 15.35, o3:  62.0, pm2_5: 29.05, pm10: 30.15, so2:  2.35, us_epa_index: 2, gb_defra_index: 3, last_updated: '2026-03-15 04:15', last_updated_epoch: 1773522900, created_at: '2026-03-15T04:30:09.506922+07:00' },
  // { id: 752641, name: 'Pailin',             co: 333.85, no2: 11.65, o3:  72.0, pm2_5: 24.45, pm10: 25.45, so2:  2.45, us_epa_index: 2, gb_defra_index: 3, last_updated: '2026-03-15 04:30', last_updated_epoch: 1773523800, created_at: '2026-03-15T04:30:09.506922+07:00' },
  // { id: 752642, name: 'Kampong Speu',       co: 606.85, no2: 22.45, o3:  87.0, pm2_5: 60.35, pm10: 62.55, so2:  6.65, us_epa_index: 3, gb_defra_index: 8, last_updated: '2026-03-15 04:30', last_updated_epoch: 1773523800, created_at: '2026-03-15T04:30:09.506922+07:00' },
  // { id: 752645, name: 'Phnom Penh',         co: 606.85, no2: 22.45, o3:  87.0, pm2_5: 60.35, pm10: 62.55, so2:  6.65, us_epa_index: 3, gb_defra_index: 8, last_updated: '2026-03-15 04:45', last_updated_epoch: 1773524700, created_at: '2026-03-15T04:45:09.417420+07:00' },
  // { id: 752646, name: 'Sihanoukville',      co: 345.85, no2:  9.05, o3: 115.0, pm2_5: 34.85, pm10: 36.45, so2:  6.75, us_epa_index: 2, gb_defra_index: 3, last_updated: '2026-03-15 04:45', last_updated_epoch: 1773524700, created_at: '2026-03-15T04:45:09.417420+07:00' },
  // { id: 752647, name: 'Siem Reap',          co: 409.85, no2:  8.65, o3:  67.0, pm2_5: 14.55, pm10: 15.15, so2:  1.95, us_epa_index: 1, gb_defra_index: 2, last_updated: '2026-03-15 04:30', last_updated_epoch: 1773523800, created_at: '2026-03-15T04:45:09.417420+07:00' },
  // { id: 752648, name: 'Koh Kong',           co: 344.85, no2:  8.85, o3:  68.0, pm2_5: 30.55, pm10: 31.85, so2:  3.65, us_epa_index: 2, gb_defra_index: 3, last_updated: '2026-03-15 04:30', last_updated_epoch: 1773523800, created_at: '2026-03-15T04:45:09.417420+07:00' },
  // { id: 752649, name: 'Kampot',             co: 292.85, no2: 10.85, o3:  84.0, pm2_5: 35.05, pm10: 36.95, so2:  2.55, us_epa_index: 2, gb_defra_index: 3, last_updated: '2026-03-15 04:30', last_updated_epoch: 1773523800, created_at: '2026-03-15T04:45:09.417420+07:00' },
  // { id: 752650, name: 'Kep',                co: 456.85, no2: 19.45, o3:  96.0, pm2_5: 58.55, pm10: 60.35, so2:  7.45, us_epa_index: 3, gb_defra_index: 7, last_updated: '2026-03-15 04:45', last_updated_epoch: 1773524700, created_at: '2026-03-15T04:45:09.417420+07:00' },
  // { id: 752651, name: 'Kampong Thom',       co: 279.85, no2:  5.55, o3:  81.0, pm2_5: 22.25, pm10: 24.05, so2:  1.95, us_epa_index: 2, gb_defra_index: 2, last_updated: '2026-03-15 04:30', last_updated_epoch: 1773523800, created_at: '2026-03-15T04:45:09.417420+07:00' },
  // { id: 752652, name: 'Svay Rieng',         co: 455.85, no2: 15.05, o3: 117.0, pm2_5: 53.95, pm10: 54.95, so2:  9.25, us_epa_index: 3, gb_defra_index: 6, last_updated: '2026-03-15 04:45', last_updated_epoch: 1773524700, created_at: '2026-03-15T04:45:09.417420+07:00' },
  // { id: 752653, name: 'Banteay Meanchey',   co: 381.85, no2:  9.25, o3:  84.0, pm2_5: 24.15, pm10: 24.85, so2:  2.25, us_epa_index: 2, gb_defra_index: 3, last_updated: '2026-03-15 04:45', last_updated_epoch: 1773524700, created_at: '2026-03-15T04:45:09.417420+07:00' },
  // { id: 752654, name: 'Kandal',             co: 348.85, no2: 11.55, o3:  68.0, pm2_5: 39.45, pm10: 41.15, so2:  4.75, us_epa_index: 2, gb_defra_index: 4, last_updated: '2026-03-15 04:45', last_updated_epoch: 1773524700, created_at: '2026-03-15T04:45:09.417420+07:00' },
  // { id: 752655, name: 'Prey Veng',          co: 414.85, no2:  8.65, o3:  95.0, pm2_5: 33.75, pm10: 34.85, so2:  4.45, us_epa_index: 2, gb_defra_index: 3, last_updated: '2026-03-15 04:15', last_updated_epoch: 1773522900, created_at: '2026-03-15T04:45:09.417420+07:00' },
  // { id: 752656, name: 'Kampong Chhnang',    co: 245.85, no2:  4.15, o3:  95.0, pm2_5: 17.95, pm10: 19.35, so2:  1.65, us_epa_index: 2, gb_defra_index: 2, last_updated: '2026-03-15 04:45', last_updated_epoch: 1773524700, created_at: '2026-03-15T04:45:09.417420+07:00' },
  // { id: 752657, name: 'Strung Treng',       co: 318.85, no2:  6.05, o3:  59.0, pm2_5: 13.05, pm10: 13.85, so2:  2.05, us_epa_index: 1, gb_defra_index: 2, last_updated: '2026-03-15 04:45', last_updated_epoch: 1773524700, created_at: '2026-03-15T04:45:09.417420+07:00' },
  // { id: 752658, name: 'Preah Vihear',       co: 338.85, no2: 14.45, o3:  56.0, pm2_5: 24.15, pm10: 24.75, so2:  3.45, us_epa_index: 2, gb_defra_index: 3, last_updated: '2026-03-15 04:45', last_updated_epoch: 1773524700, created_at: '2026-03-15T04:45:09.417420+07:00' },
  // { id: 752659, name: 'Ratanakiri',         co: 254.85, no2:  2.35, o3:  97.0, pm2_5:  7.35, pm10:  8.45, so2:  2.15, us_epa_index: 1, gb_defra_index: 1, last_updated: '2026-03-15 04:45', last_updated_epoch: 1773524700, created_at: '2026-03-15T04:45:09.417420+07:00' },
  // { id: 752660, name: 'Kampong Cham',       co: 268.85, no2:  4.45, o3:  88.0, pm2_5: 12.25, pm10: 13.15, so2:  2.35, us_epa_index: 1, gb_defra_index: 2, last_updated: '2026-03-15 04:45', last_updated_epoch: 1773524700, created_at: '2026-03-15T04:45:09.417420+07:00' },
  // { id: 752661, name: 'Oddar Meanchey',     co: 338.85, no2: 14.45, o3:  56.0, pm2_5: 24.15, pm10: 24.75, so2:  3.45, us_epa_index: 2, gb_defra_index: 3, last_updated: '2026-03-15 04:45', last_updated_epoch: 1773524700, created_at: '2026-03-15T04:45:09.417420+07:00' },
  // { id: 752662, name: 'Pursat',             co: 337.85, no2: 16.35, o3:  68.0, pm2_5: 44.65, pm10: 46.05, so2:  2.95, us_epa_index: 3, gb_defra_index: 5, last_updated: '2026-03-15 04:30', last_updated_epoch: 1773523800, created_at: '2026-03-15T04:45:09.417420+07:00' },
];

// Attach coordinates
const MOCK_DATA: AirQualityRecord[] = MOCK_RAW.map((r) => {
  const coords = PROVINCE_COORDS[r.name];
  return {
    ...r,
    lat: coords?.[0],
    lng: coords?.[1],
  };
});

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Fetches air quality data from the real FastAPI backend.
 * Falls back to mock data if the API is unreachable (e.g., offline dev).
 */
export async function fetchAirQuality(): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/realtime-api/aqi`);
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    const json: ApiResponse = await response.json();

    // If the DB is empty (e.g., Spark hasn't run yet), fall back to mock
    if (!json.data || json.data.length === 0) {
      console.warn('API returned no data — using mock data as fallback.');
      return { data: MOCK_AIR_QUALITY_DATA };
    }

    // Attach coordinates (the DB doesn't store lat/lng, the frontend knows them)
    const enriched = json.data.map((r) => {
      const coords = PROVINCE_COORDS[r.name];
      return { ...r, lat: coords?.[0], lng: coords?.[1] };
    });

    return { data: enriched };
  } catch (err) {
    console.warn('Could not reach API — using mock data as fallback.', err);
    const enriched = MOCK_AIR_QUALITY_DATA.map((r) => {
      const coords = PROVINCE_COORDS[r.name];
      return {
        ...r,
        lat: coords?.[0],
        lng: coords?.[1],
      };
    });
    return { data: enriched };
  }
}

export { MOCK_DATA };

