import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CloudSun, MapPin, ListFilter } from "lucide-react";
import { Header } from "../layout/header";
import { MainWeatherCard } from "../components/weather/main-weather-card";
import { WindCard } from "../components/weather/wind-card";
import { WeatherMap } from "../components/weather/weather-map";
import { RainChanceCard } from "../components/weather/rain-chance-card";
import { ForecastSection } from "../components/weather/forecast-section";
import { TemperatureTrendCard } from "../components/weather/temperature-trend-card";
import { AtmosphericTrendsCard } from "../components/weather/atmospheric-trends-card";
import { Card } from "../components/ui/card";
import { cn } from "../lib/utils";
import {
  fetchWeather,
  fetchWeatherTrend,
} from "../services/weatherService";
import { realTimeService } from "../services/realTimeService";
import type {
  RainChanceData,
  WeatherRecord,
  WeatherCity,
  WeatherForecast,
} from "../types/weather";
import { formatToUTC7Time } from "../utils/time";

export default function WeatherDashboard() {
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState<WeatherRecord[]>([]);
  const [weatherTrend, setWeatherTrend] = useState<WeatherRecord[]>([]);
  const [selectedProvince, setSelectedProvince] = useState("Phnom Penh");
  const [loading, setLoading] = useState(true);

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      return (
        saved === "dark" ||
        (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    loadData();

    const unsubscribeWeather = realTimeService.subscribe("weather", (updated) => {
      setWeatherData(updated as WeatherRecord[]);
    });

    return () => {
      unsubscribeWeather();
    };
  }, []);

  useEffect(() => {
    loadProvinceTrends(selectedProvince);
  }, [selectedProvince, weatherData]);

  const loadData = async () => {
    setLoading(true);
    try {
      const weatherRes = await fetchWeather();
      setWeatherData(weatherRes.data);
    } catch (error) {
      console.error("Failed to load dashboard weather data", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProvinceTrends = async (province: string) => {
    try {
      const weatherTrendRes = await fetchWeatherTrend(province);
      setWeatherTrend(weatherTrendRes.data);
    } catch (error) {
      console.error("Failed to load weather province trends", error);
      setWeatherTrend([]);
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const currentProvinceWeather = weatherData.find(w => w.name === selectedProvince) || weatherData[0];

  const getTimeAgo = (timestamp: string) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} mins ago`;
    return `${Math.floor(diffMins / 60)} hours ago`;
  };

  const trendWeatherSource = weatherTrend.length
    ? weatherTrend
    : currentProvinceWeather
      ? [currentProvinceWeather]
      : [];

  const rainChartData: RainChanceData[] = trendWeatherSource.map((record, index) => ({
    day: formatTrendLabel(record.created_at_ts || record.created_at, index),
    chance: estimateRainChance(record),
  }));

  function formatTrendLabel(timestamp: string | undefined, fallbackIndex: number): string {
    if (!timestamp) return `T-${fallbackIndex}`;
    return formatToUTC7Time(timestamp);
  }

  function estimateRainChance(record: WeatherRecord): number {
    const precipSignal = Math.min(record.precip_mm * 25, 70);
    const cloudSignal = record.cloud * 0.3;
    return Math.round(Math.min(100, precipSignal + cloudSignal));
  }

  // Generate 7-day forecasts
  const getForecastCities = (): WeatherCity[] => {
    return weatherData.map(w => {
      const forecasts: WeatherForecast[] = [];
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const conditions: ("sunny" | "cloudy" | "rainy" | "partly-cloudy")[] = [
        "sunny", "partly-cloudy", "cloudy", "rainy", "partly-cloudy", "sunny", "sunny"
      ];
      
      const now = new Date();
      for (let i = 0; i < 7; i++) {
        const forecastDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
        const dayName = i === 0 ? "Today" : days[forecastDate.getDay()];
        const dateStr = `${forecastDate.getDate()} ${forecastDate.toLocaleString([], { month: "short" })}`;
        const tempOffset = Math.round((Math.sin(i) * 2 + Math.random() - 0.5) * 10) / 10;
        
        forecasts.push({
          day: dayName,
          date: dateStr,
          condition: conditions[(w.id + i) % conditions.length],
          temp: Math.round(w.temp_c + tempOffset)
        });
      }

      return {
        id: w.name,
        name: w.name,
        forecasts
      };
    });
  };

  const forecastCities = getForecastCities();
  const sortedForecastCities = [...forecastCities].sort((a, b) => {
    if (a.name === selectedProvince) return -1;
    if (b.name === selectedProvince) return 1;
    return 0;
  });

  if (loading && !weatherData.length) {
    return (
      <div className="space-y-6 animate-pulse">
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

        {/* Back navigation & Page title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-2">
              <div className="h-7 w-56 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-4 w-96 max-w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
            </div>
          </div>
          <div className="w-32 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
          {/* Main weather card skeleton */}
          <div className="xl:col-span-2 h-[380px]">
            <Card glass className="p-6 h-full flex flex-col justify-between">
              <div className="space-y-4 flex-1">
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="h-14 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="h-4 w-44 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  </div>
                  <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 dark:border-white/[0.04]">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
                      <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Wind card skeleton */}
          <div className="xl:col-span-1 h-[380px]">
            <Card glass className="p-6 h-full flex flex-col justify-between">
              {/* Title */}
              <div className="flex items-center justify-between">
                <div className="h-5 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-3.5 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
              </div>

              {/* Middle row */}
              <div className="flex items-center gap-6 my-auto py-4 flex-1">
                {/* Speed display skeleton */}
                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <div className="h-10 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                      <div className="h-4 w-8 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    </div>
                    <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  </div>
                  <div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                </div>

                {/* Compass circle skeleton */}
                <div className="w-28 h-28 rounded-full bg-slate-200/50 dark:bg-slate-800/50 border border-slate-200/30 dark:border-white/[0.02] flex-shrink-0 animate-pulse" />
              </div>

              {/* Wind details skeleton */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/[0.04] grid grid-cols-3 gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-3 w-12 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Second row (Weather Map skeleton) */}
        <div className="grid grid-cols-1 gap-6">
          <div className="w-full h-[500px]">
            <Card glass className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <div className="space-y-2">
                  <div className="h-5 w-56 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  <div className="h-3.5 w-80 bg-slate-200 dark:bg-slate-800 rounded-md" />
                </div>
                <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
              <div className="flex-1 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-white/[0.04]" />
            </Card>
          </div>
        </div>

        {/* Third row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Provinces Overview skeleton */}
          <Card glass className="p-6 h-[400px] flex flex-col">
            <div className="space-y-3 shrink-0 mb-4">
              <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-3.5 w-60 bg-slate-200 dark:bg-slate-800 rounded-md" />
            </div>
            <div className="space-y-2.5 flex-1 overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between items-center p-3 border border-slate-100 dark:border-white/[0.02] rounded-2xl bg-white/40 dark:bg-slate-900/10">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-md" />
                      <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    </div>
                  </div>
                  <div className="h-6 w-12 bg-slate-200 dark:bg-slate-800 rounded-md" />
                </div>
              ))}
            </div>
          </Card>

          {/* Rain Chance skeleton */}
          <Card glass className="p-6 h-[400px] flex flex-col justify-between">
            <div className="space-y-4 flex-1">
              <div className="space-y-2">
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-3.5 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
              </div>
              <div className="flex-1 bg-slate-100 dark:bg-slate-900/30 rounded-2xl border border-slate-200/30 dark:border-white/[0.02] mt-4" />
            </div>
          </Card>

          {/* Forecast skeleton */}
          <Card glass className="p-6 h-[400px] flex flex-col justify-between">
            <div className="space-y-4 flex-1">
              <div className="space-y-2">
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-3.5 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
              </div>
              <div className="space-y-4 mt-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="h-6 w-10 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Fourth row skeleton - Detailed Trend Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <Card glass className="p-6 h-[380px] flex flex-col justify-between">
            <div className="space-y-4 flex-1">
              <div className="space-y-2">
                <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                <div className="h-3.5 w-72 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
              </div>
              <div className="flex-1 bg-slate-100 dark:bg-slate-900/30 rounded-2xl border border-slate-200/30 dark:border-white/[0.02] mt-4 animate-pulse" />
            </div>
          </Card>
          <Card glass className="p-6 h-[380px] flex flex-col justify-between">
            <div className="space-y-4 flex-1">
              <div className="space-y-2">
                <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                <div className="h-3.5 w-72 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
              </div>
              <div className="flex-1 bg-slate-100 dark:bg-slate-900/30 rounded-2xl border border-slate-200/30 dark:border-white/[0.02] mt-4 animate-pulse" />
            </div>
          </Card>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      {/* Back navigation & Page title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/dashboard")}
            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <CloudSun className="w-6 h-6 text-blue-500" />
              Weather Conditions & Forecasting
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Detailed local temperature, atmospheric wind systems, humidity indexing, and precipitation forecasting.
            </p>
          </div>
        </div>

        {/* Selected Province Selector */}
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-slate-400" />
          <select 
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            {weatherData.map(w => (
              <option key={w.name} value={w.name}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
        {/* Main weather card */}
        <div className="xl:col-span-2 h-full">
          {currentProvinceWeather && (
            <MainWeatherCard
              location={currentProvinceWeather.name}
              temperature={currentProvinceWeather.temp_c}
              condition={currentProvinceWeather.condition_text}
              high={Math.round(currentProvinceWeather.temp_c + 2)} 
              low={Math.round(currentProvinceWeather.temp_c - 3)}  
              feelsLike={currentProvinceWeather.feelslike_c}
              sunrise="5:50 AM" 
              sunset="6:15 PM"  
              visibility={currentProvinceWeather.vis_km}
              windSpeed={currentProvinceWeather.wind_kph}
              humidity={currentProvinceWeather.humidity}
            />
          )}
        </div>

        {/* Wind card */}
        <div className="xl:col-span-1 h-full">
          {currentProvinceWeather && (
            <WindCard
              speed={currentProvinceWeather.wind_kph}
              direction={currentProvinceWeather.wind_dir}
              directionDegrees={currentProvinceWeather.wind_degree}
              change={0}
              timeAgo={getTimeAgo(currentProvinceWeather.created_at)}
              gustSpeed={currentProvinceWeather.gust_kph}
            />
          )}
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 gap-6 items-stretch">
        {/* Weather map */}
        <div className="w-full h-full">
          <WeatherMap 
            weatherData={weatherData}
            selectedProvince={selectedProvince}
            onProvinceSelect={setSelectedProvince}
          />
        </div>
      </div>

      {/* Third row - Status Summary & Forecasts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Province list selector */}
        <Card glass className="lg:col-span-1 p-6 h-full min-h-[380px] flex flex-col justify-between transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-800">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <ListFilter className="w-5 h-5 text-blue-500" />
                Provinces Overview
              </h3>
              <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">
                Live Registry
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Live provincial metrics. Click a province to focus dashboard.
            </p>
          </div>

          <div className="space-y-2 flex-1 min-h-[220px] max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
            {weatherData.map(w => (
              <div 
                key={w.name} 
                onClick={() => setSelectedProvince(w.name)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border",
                  selectedProvince === w.name 
                    ? "bg-blue-50/50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-800/60 shadow-sm"
                    : "bg-white/40 dark:bg-slate-900/10 border-slate-100 dark:border-white/[0.02] hover:border-slate-200 dark:hover:border-white/[0.06]"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    {selectedProvince === w.name && (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping absolute" />
                    )}
                    <span className={cn("w-1.5 h-1.5 rounded-full transition-all", selectedProvince === w.name ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-700")} />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block">{w.name}</span>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block mt-0.5">{w.condition_text}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <img src={w.condition_icon} alt={w.condition_text} className="w-7 h-7 filter drop-shadow-sm select-none" />
                  <span className="font-black text-sm text-slate-900 dark:text-white">{w.temp_c}°</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Rain Chance Card */}
        <div className="lg:col-span-1 h-full">
          <RainChanceCard data={rainChartData} />
        </div>

        {/* Forecast Card */}
        <div className="lg:col-span-1 h-full">
          {sortedForecastCities.length > 0 && (
            <ForecastSection 
              cities={sortedForecastCities} 
              selectedCity={selectedProvince}
              onCitySelect={setSelectedProvince}
            />
          )}
        </div>
      </div>

      {/* Fourth row - Detailed Trend Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <TemperatureTrendCard data={trendWeatherSource} />
        <AtmosphericTrendsCard data={trendWeatherSource} />
      </div>
    </div>
  );
}
