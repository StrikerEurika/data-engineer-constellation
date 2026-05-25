import type { WeatherRecord, ApiResponse } from '../types/weather';

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

export async function fetchUV(): Promise<{ data: any[] }> {
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
