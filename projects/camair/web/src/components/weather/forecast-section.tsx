import { useState } from 'react';
import { Plus, Download, MoreVertical, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { WeatherCity, WeatherForecast } from '@/types/weather';

interface ForecastSectionProps {
  cities: WeatherCity[];
  selectedCity?: string;
  onCitySelect?: (id: string) => void;
  className?: string;
}

const weatherIcons: Record<string, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  'partly-cloudy': '⛅',
};

export function ForecastSection({ cities, selectedCity: externalSelectedCity, onCitySelect, className }: ForecastSectionProps) {
  const [localSelectedCity, setLocalSelectedCity] = useState(cities[0]?.id || '');
  const activeCityId = externalSelectedCity !== undefined ? externalSelectedCity : localSelectedCity;

  const handleCitySelect = (id: string) => {
    if (onCitySelect) {
      onCitySelect(id);
    } else {
      setLocalSelectedCity(id);
    }
  };

  const selectedForecasts = cities.find(c => c.id === activeCityId)?.forecasts || [];

  return (
    <Card glass className={cn("p-6 h-full min-h-[380px] flex flex-col justify-between transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-800", className)}>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            7-Day Forecast
          </h3>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-all">
              <Download className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-all">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* City tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => handleCitySelect(city.id)}
              className={cn(
                'px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer',
                activeCityId === city.id
                  ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-100 dark:border-white/[0.04]'
              )}
            >
              {city.name}
            </button>
          ))}
          <button className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 border border-slate-100 dark:border-white/[0.04] transition-all cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 7-day forecast cards list */}
      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar flex-1 items-center">
        {selectedForecasts.map((forecast, index) => (
          <ForecastCard key={index} forecast={forecast} isToday={index === 0} />
        ))}
      </div>
    </Card>
  );
}

function ForecastCard({ forecast, isToday }: { forecast: WeatherForecast; isToday: boolean }) {
  return (
    <div
      className={cn(
        'flex-shrink-0 w-22 rounded-2xl p-3 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        isToday 
          ? 'bg-blue-500/10 border-2 border-blue-500/30 shadow-md shadow-blue-500/5' 
          : 'bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-white/[0.04]'
      )}
    >
      <p className={cn('text-[10px] font-black uppercase tracking-wider mb-0.5', isToday ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500')}>
        {forecast.day}
      </p>
      <p className={cn('text-[9px] font-bold mb-2', isToday ? 'text-blue-500/80' : 'text-slate-400 dark:text-slate-500')}>
        {forecast.date}
      </p>
      <div className="text-3xl my-2.5 filter drop-shadow-md select-none transform hover:scale-110 transition-transform duration-300">
        {weatherIcons[forecast.condition] || '☀️'}
      </div>
      <p className={cn('text-base font-black', isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200')}>
        {forecast.temp}°
      </p>
    </div>
  );
}
