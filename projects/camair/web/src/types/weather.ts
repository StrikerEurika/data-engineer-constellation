export interface WeatherRecord {
  id: number;
  name: string;
  temp_c: number;
  temp_f: number;
  feelslike_c: number;
  feelslike_f: number;
  wind_mph: number;
  wind_kph: number;
  wind_degree: number;
  wind_dir: string;
  pressure_mb: number;
  pressure_in: number;
  precip_mm: number;
  precip_in: number;
  humidity: number;
  cloud: number;
  vis_km: number;
  vis_miles: number;
  uv: number;
  gust_mph: number;
  gust_kph: number;
  is_day: number;
  condition_text: string;
  condition_icon: string;
  condition_code: number;
  last_updated: string;
  last_updated_epoch: number;
  created_at: string;
  created_at_ts?: string;
}

export interface UVRecord {
  id: number;
  name: string;
  uv: number;
  last_updated: string;
  last_updated_epoch: number;
  created_at: string;
  created_at_ts?: string;
}

export interface AirQualityRecord {
  id: number;
  name: string;
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
  created_at_ts?: string;
}

export interface RainChanceData {
  day: string;
  chance: number;
}

export interface AirQualityData {
  day: string;
  clean: number;
  average: number;
  harmful: number;
}

export interface UVIndexData {
  day: string;
  value: number;
  level: 'low' | 'moderate' | 'high' | 'very-high';
}

export interface WeatherForecast {
  day: string;
  date: string;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy';
  temp: number;
}

export interface WeatherCity {
  id: string;
  name: string;
  forecasts: WeatherForecast[];
}

export interface ApiResponse<T> {
  data: T[];
}
