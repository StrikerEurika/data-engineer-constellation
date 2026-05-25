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
}

export interface UVRecord {
  id: number;
  name: string;
  uv: number;
  last_updated: string;
  last_updated_epoch: number;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T[];
}
