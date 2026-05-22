import { useState } from 'react';
import { Plus, Download, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WeatherCity, WeatherForecast } from '@/types/weather';

interface ForecastSectionProps {
  cities: WeatherCity[];
}

const weatherIcons: Record<string, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  'partly-cloudy': '⛅',
};

export function ForecastSection({ cities }: ForecastSectionProps) {
  const [selectedCity, setSelectedCity] = useState(cities[0]?.id || '');

  const selectedForecasts = cities.find(c => c.id === selectedCity)?.forecasts || [];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-lg dark:shadow-slate-900/50 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Forecast</h3>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-all">
            <Download className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-all">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* City tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        {cities.map((city) => (
          <button
            key={city.id}
            onClick={() => setSelectedCity(city.id)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              selectedCity === city.id
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
            )}
          >
            {city.name}
          </button>
        ))}
        <button className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 hover:text-slate-600 dark:hover:text-slate-300 transition-all">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 7-day forecast */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {selectedForecasts.map((forecast, index) => (
          <ForecastCard key={index} forecast={forecast} isToday={index === 0} />
        ))}
      </div>
    </div>
  );
}

function ForecastCard({ forecast, isToday }: { forecast: WeatherForecast; isToday: boolean }) {
  return (
    <div
      className={cn(
        'flex-shrink-0 w-20 rounded-2xl p-3 text-center transition-all',
        isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800' : 'bg-slate-50 dark:bg-slate-700'
      )}
    >
      <p className={cn('text-xs font-medium mb-1', isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400')}>
        {forecast.day}
      </p>
      <p className={cn('text-xs mb-2', isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500')}>
        {forecast.date}
      </p>
      <div className="text-2xl mb-2">{weatherIcons[forecast.condition]}</div>
      <p className={cn('text-lg font-semibold', isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200')}>
        {forecast.temp}°
      </p>
    </div>
  );
}
