import type { AirQualityRecord, ApiResponse, UVRecord, WeatherRecord } from '../types/weather';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchWeather(): Promise<{ data: WeatherRecord[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/realtime-api/weather`);
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    const json = await response.json();
    return json;
  } catch (err) {
    console.warn('Could not reach API for weather.', err);
    return { data: [] };
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
    return await response.json();
  } catch (err) {
    console.warn('Could not reach API for weather trends.', err);
    return { data: [] };
  }
}

export async function fetchUV(): Promise<{ data: UVRecord[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/realtime-api/uv`);
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    const json = await response.json();
    return json;
  } catch (err) {
    console.warn('Could not reach API for UV.', err);
    return { data: [] };
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
    return await response.json();
  } catch (err) {
    console.warn('Could not reach API for UV trends.', err);
    return { data: [] };
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
    return await response.json();
  } catch (err) {
    console.warn('Could not reach API for air quality trends.', err);
    return { data: [] };
  }
}
