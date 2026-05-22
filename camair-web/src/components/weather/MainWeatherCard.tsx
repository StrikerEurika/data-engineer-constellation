import { MapPin, ChevronDown, Sun, Eye, Wind, Droplets } from 'lucide-react';

interface MainWeatherCardProps {
  location: string;
  temperature: number;
  condition: string;
  high: number;
  low: number;
  feelsLike: number;
  sunrise: string;
  sunset: string;
  visibility: number;
  windSpeed: number;
  humidity: number;
}

export function MainWeatherCard({
  location,
  temperature,
  condition,
  high,
  low,
  feelsLike,
  sunrise,
  sunset,
  visibility,
  windSpeed,
  humidity,
}: MainWeatherCardProps) {
  return (
    <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden min-h-[320px] transition-all duration-500 shadow-xl shadow-blue-500/20 dark:shadow-none border border-white/10">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 dark:bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 dark:cyan-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
      
      {/* Sun illustration */}
      <div className="absolute top-10 right-12 w-24 h-24 hidden sm:block">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-200 to-orange-400 dark:from-yellow-500 dark:to-orange-600 shadow-2xl shadow-yellow-200/50 dark:shadow-yellow-900/20 animate-pulse" />
        <div className="absolute inset-4 rounded-full bg-white/30 dark:bg-white/10 backdrop-blur-md" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="space-y-6">
          {/* Location selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 bg-white/15 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
              <MapPin className="w-4 h-4 text-white" />
              <span className="text-white font-semibold text-sm tracking-wide">{location}</span>
            </div>
            <button className="flex items-center gap-1.5 bg-white/15 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl text-white hover:bg-white/25 transition-all border border-white/20 font-medium text-sm">
              <span>°C</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Temperature & Condition */}
          <div>
            <div className="flex items-start gap-1 mb-1">
              <span className="text-7xl md:text-8xl font-bold text-white tracking-tighter">{temperature}°</span>
              <span className="text-2xl font-medium text-white/80 mt-4">{condition}</span>
            </div>
            <div className="flex items-center gap-4 text-white/90">
              <p className="text-sm font-medium bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">High: {high}°</p>
              <p className="text-sm font-medium bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">Low: {low}°</p>
            </div>
          </div>
        </div>

        {/* Weather details grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
          <WeatherDetail icon={<Sun className="w-4 h-4" />} label="Sunrise" value={sunrise} />
          <WeatherDetail icon={<Sun className="w-4 h-4" />} label="Sunset" value={sunset} />
          <WeatherDetail icon="🌡️" label="Feels like" value={`${feelsLike}°`} subValue="Ideal" />
          <WeatherDetail icon={<Eye className="w-4 h-4" />} label="Visibility" value={`${visibility} km`} subValue="Good" />
          <WeatherDetail icon={<Wind className="w-4 h-4" />} label="Wind" value={`${windSpeed} km/h`} subValue="Light" />
          <WeatherDetail icon={<Droplets className="w-4 h-4" />} label="Humidity" value={`${humidity}%`} subValue="Normal" />
        </div>
      </div>
    </div>
  );
}

function WeatherDetail({ icon, label, value, subValue }: { icon: any; label: string; value: string; subValue?: string }) {
  return (
    <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-[1.5rem] p-4 border border-white/10 hover:bg-white/15 transition-all">
      <div className="flex items-center gap-2 text-white/70 text-[10px] uppercase tracking-wider font-bold mb-1.5">
        {statusIcon(icon)}
        <span>{label}</span>
      </div>
      <p className="text-white font-bold text-lg leading-none">{value}</p>
      {subValue && <p className="text-white/50 text-[10px] mt-1 font-medium">{subValue}</p>}
    </div>
  );
}

function statusIcon(icon: any) {
  if (typeof icon === 'string') {
    return <span className="text-sm">{icon}</span>;
  }
  return icon;
}
