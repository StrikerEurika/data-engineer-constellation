import type { AirQualityRecord, ApiResponse, UVRecord, WeatherRecord } from '../types/weather';
import { MOCK_WEATHER_DATA, MOCK_UV_DATA } from '../data/mockWeatherData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchWeather(): Promise<{ data: WeatherRecord[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/realtime-api/weather`);
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    const json = await response.json();
    if (!json.data || json.data.length === 0) {
      console.warn('API returned empty weather data — using mock data.');
      return { data: MOCK_WEATHER_DATA };
    }
    return json;
  } catch (err) {
    console.warn('Could not reach API for weather, using mock data.', err);
    return { data: MOCK_WEATHER_DATA };
  }
}

export async function fetchWeatherTrend(
  province: string,
  hours = 24,
): Promise<ApiResponse<WeatherRecord>> {
  try {
    const params = new URLSearchParams({ province, hours: String(hours) });
    const response = await fetch(`${API_BASE_URL}/api/v1/realtime-api/weather/trends?${params}`);
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    const json = await response.json();
    if (!json.data || json.data.length === 0) {
      return { data: generateMockWeatherTrend(province, hours) };
    }
    return json;
  } catch (err) {
    console.warn('Could not reach API for weather trends, using simulated trends.', err);
    return { data: generateMockWeatherTrend(province, hours) };
  }
}

export async function fetchUV(): Promise<{ data: UVRecord[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/realtime-api/uv`);
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    const json = await response.json();
    if (!json.data || json.data.length === 0) {
      console.warn('API returned empty UV data — using mock data.');
      return { data: MOCK_UV_DATA };
    }
    return json;
  } catch (err) {
    console.warn('Could not reach API for UV, using mock data.', err);
    return { data: MOCK_UV_DATA };
  }
}

export async function fetchUVTrend(
  province: string,
  hours = 24,
): Promise<ApiResponse<UVRecord>> {
  try {
    const params = new URLSearchParams({ province, hours: String(hours) });
    const response = await fetch(`${API_BASE_URL}/api/v1/realtime-api/uv/trends?${params}`);
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    const json = await response.json();
    if (!json.data || json.data.length === 0) {
      return { data: generateMockUvTrend(province, hours) };
    }
    return json;
  } catch (err) {
    console.warn('Could not reach API for UV trends, using simulated trends.', err);
    return { data: generateMockUvTrend(province, hours) };
  }
}

export async function fetchAirQualityTrend(
  province: string,
  hours = 24,
): Promise<ApiResponse<AirQualityRecord>> {
  try {
    const params = new URLSearchParams({ province, hours: String(hours) });
    const response = await fetch(`${API_BASE_URL}/api/v1/realtime-api/aqi/trends?${params}`);
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    const json = await response.json();
    if (!json.data || json.data.length === 0) {
      return { data: generateMockAirQualityTrend(province, hours) };
    }
    return json;
  } catch (err) {
    console.warn('Could not reach API for air quality trends, using simulated trends.', err);
    return { data: generateMockAirQualityTrend(province, hours) };
  }
}

// ── Simulators for trends ──────────────────────────────────────────────────
function generateMockWeatherTrend(province: string, hours: number): WeatherRecord[] {
  const current = MOCK_WEATHER_DATA.find(w => w.name === province) || MOCK_WEATHER_DATA[0];
  const records: WeatherRecord[] = [];
  const now = new Date();
  
  for (let i = hours - 1; i >= 0; i -= 2) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();
    
    // Simulate temperature cycle: cooler at night/early morning, hot during the day
    let tempDiff = 0;
    if (hour >= 6 && hour <= 14) {
      tempDiff = (hour - 6) * 0.7; // Rising temp
    } else if (hour > 14 && hour <= 20) {
      tempDiff = 5.6 - (hour - 14) * 0.8; // Falling temp
    } else {
      tempDiff = -0.8 - ((hour > 20 ? hour - 20 : hour + 4) * 0.3); // Cool night
    }
    
    const temp = Math.round((current.temp_c - 2 + tempDiff) * 10) / 10;
    const humidity = Math.min(95, Math.max(45, current.humidity + Math.round(-tempDiff * 3)));
    
    records.push({
      ...current,
      id: Math.floor(Math.random() * 100000),
      temp_c: temp,
      feelslike_c: temp + (humidity > 70 ? 2 : 0),
      humidity: humidity,
      created_at: time.toISOString(),
      created_at_ts: time.toISOString()
    });
  }
  return records;
}

function generateMockUvTrend(province: string, hours: number): UVRecord[] {
  const current = MOCK_UV_DATA.find(u => u.name === province) || MOCK_UV_DATA[0];
  const records: UVRecord[] = [];
  const now = new Date();
  
  for (let i = hours - 1; i >= 0; i -= 2) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();
    
    // UV index is 0 at night, peaks around noon
    let uv = 0;
    if (hour >= 6 && hour <= 18) {
      const peakDist = Math.abs(hour - 12); // distance from noon
      uv = Math.max(0, current.uv * (1 - peakDist / 6));
    }
    uv = Math.round(uv * 10) / 10;
    
    records.push({
      ...current,
      id: Math.floor(Math.random() * 100000),
      uv: uv,
      created_at: time.toISOString(),
      created_at_ts: time.toISOString()
    });
  }
  return records;
}

function generateMockAirQualityTrend(province: string, hours: number): AirQualityRecord[] {
  // Let's import mock AQI data directly to simulate trend
  const records: AirQualityRecord[] = [];
  const now = new Date();
  
  for (let i = hours - 1; i >= 0; i -= 2) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();
    // Simulate morning traffic pollution peak
    const peakFactor = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) ? 1.4 : 1.0;
    
    records.push({
      id: Math.floor(Math.random() * 100000),
      name: province,
      co: 0.8 * peakFactor,
      no2: 20 * peakFactor,
      o3: 40 * (hour > 10 && hour < 16 ? 1.5 : 0.8), // Ozone is higher in afternoon sun
      so2: 4,
      pm2_5: Math.round(25 * peakFactor),
      pm10: Math.round(50 * peakFactor),
      us_epa_index: peakFactor > 1.2 ? 3 : 2,
      gb_defra_index: peakFactor > 1.2 ? 3 : 2,
      last_updated: time.toISOString(),
      last_updated_epoch: Math.floor(time.getTime() / 1000),
      created_at: time.toISOString(),
      created_at_ts: time.toISOString()
    });
  }
  return records;
}
