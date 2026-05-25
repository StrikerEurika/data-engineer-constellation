import { useState, useEffect } from "react";
import { Header } from "../layout/Header";
import { MainWeatherCard } from "../components/weather/MainWeatherCard";
import { WindCard } from "../components/weather/WindCard";
import { WeatherMap } from "../components/weather/WeatherMap";
import { AirQualityCard } from "../components/weather/AirQualityCard";
import { RainChanceCard } from "../components/weather/RainChanceCard";
import { UVIndexCard } from "../components/weather/UVIndexCard";
import { fetchWeather, fetchUV } from "../services/weatherService";
import { realTimeService } from "../services/realTimeService";
import type { WeatherRecord, UVRecord } from "../types/weather";

export default function WeatherDashboard() {
  const [weatherData, setWeatherData] = useState<WeatherRecord[]>([]);
  const [uvData, setUvData] = useState<UVRecord[]>([]);
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

    const unsubscribeUV = realTimeService.subscribe("uv", (updated) => {
      setUvData(updated as UVRecord[]);
    });

    return () => {
      unsubscribeWeather();
      unsubscribeUV();
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [weatherRes, uvRes] = await Promise.all([fetchWeather(), fetchUV()]);
      setWeatherData(weatherRes.data);
      setUvData(uvRes.data);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const currentProvinceWeather = weatherData.find(w => w.name === selectedProvince) || weatherData[0];
  const currentProvinceUV = uvData.find(u => u.name === selectedProvince);

  // Helper to get relative time for "last updated"
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

  // Convert current UV to chart format if needed, but UVIndexCard expects a series
  // For now we just pass a single-item array or mock some history based on current
  const uvChartData = currentProvinceUV ? [
    { day: "Today", value: currentProvinceUV.uv, level: getUvLevel(currentProvinceUV.uv) }
  ] : [];

  function getUvLevel(value: number): 'low' | 'moderate' | 'high' | 'very-high' {
    if (value <= 2) return 'low';
    if (value <= 5) return 'moderate';
    if (value <= 7) return 'high';
    return 'very-high';
  }

  if (loading && !weatherData.length) {
    return <div className="flex items-center justify-center h-screen">Loading dashboard data...</div>;
  }

  return (
    <>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Main weather card */}
        <div className="xl:col-span-2">
          {currentProvinceWeather && (
            <MainWeatherCard
              location={currentProvinceWeather.name}
              temperature={currentProvinceWeather.temp_c}
              condition={currentProvinceWeather.condition_text}
              high={currentProvinceWeather.temp_c + 2} // Mock high
              low={currentProvinceWeather.temp_c - 3}  // Mock low
              feelsLike={currentProvinceWeather.feelslike_c}
              sunrise="5:50 AM" // Mock
              sunset="6:15 PM"  // Mock
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
      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* Weather map */}
        <div className="w-full">
          <WeatherMap />
        </div>
      </div>

      {/* Third row - Status Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
           <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Provinces Overview</h3>
           <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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

        <AirQualityCard data={[]} />
        <UVIndexCard data={uvChartData as any} />
      </div>
    </>
  );
}
