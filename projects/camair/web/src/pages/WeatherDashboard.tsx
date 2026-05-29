import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CloudSun, MapPin } from "lucide-react";
import { Header } from "../layout/Header";
import { MainWeatherCard } from "../components/weather/MainWeatherCard";
import { WindCard } from "../components/weather/WindCard";
import { WeatherMap } from "../components/weather/WeatherMap";
import { RainChanceCard } from "../components/weather/RainChanceCard";
import { ForecastSection } from "../components/weather/ForecastSection";
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
  }, [selectedProvince]);

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
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return `T-${fallbackIndex}`;

    return formatToUTC7Time(date);
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
    return <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">Loading weather dashboard data...</div>;
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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main weather card */}
        <div className="xl:col-span-2">
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
        <div className="xl:col-span-1">
          {currentProvinceWeather && (
            <WindCard
              speed={currentProvinceWeather.wind_kph}
              direction={currentProvinceWeather.wind_dir}
              directionDegrees={currentProvinceWeather.wind_degree}
              change={0}
              timeAgo={getTimeAgo(currentProvinceWeather.created_at)}
            />
          )}
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 gap-6">
        {/* Weather map */}
        <div className="w-full">
          <WeatherMap />
        </div>
      </div>

      {/* Third row - Status Summary & Forecasts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Province list selector */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
           <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Provinces Overview</h3>
           <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
              {weatherData.map(w => (
                <div 
                  key={w.name} 
                  onClick={() => setSelectedProvince(w.name)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${selectedProvince === w.name ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                >
                  <div className="flex items-center gap-3">
                    <img src={w.condition_icon} alt={w.condition_text} className="w-8 h-8" />
                    <span className="font-medium text-slate-700 dark:text-slate-200">{w.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{w.temp_c}°</span>
                </div>
              ))}
           </div>
        </div>

        {/* Rain Chance Card */}
        <div className="lg:col-span-1">
          <RainChanceCard data={rainChartData} />
        </div>

        {/* Forecast Card */}
        <div className="lg:col-span-1">
          {sortedForecastCities.length > 0 && (
            <ForecastSection cities={sortedForecastCities} />
          )}
        </div>
      </div>
    </div>
  );
}
