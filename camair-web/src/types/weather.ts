export interface WeatherForecast {
  date: string;
  day: string;
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy';
  icon: string;
}

export interface WeatherCity {
  id: string;
  name: string;
  forecasts: WeatherForecast[];
}

export interface WeatherDetails {
  sunrise: string;
  sunset: string;
  feelsLike: number;
  visibility: number;
  windSpeed: number;
  windDirection: string;
  humidity: number;
}

export interface AirQualityData {
  day: string;
  clean: number;
  average: number;
  harmful: number;
}

export interface RainChanceData {
  day: string;
  chance: number;
}

export interface UVIndexData {
  day: string;
  value: number;
  level: 'low' | 'moderate' | 'high' | 'very-high';
}
