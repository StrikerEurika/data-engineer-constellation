import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Wind, 
  Sun, 
  Droplets, 
  ChevronRight, 
  CloudRain, 
  Thermometer,
  Shield,
  Activity,
  Map as MapIcon
} from "lucide-react";
import { Header } from "@/layout/Header";
import { useState, useEffect } from "react";
import { fetchAirQuality } from "@/services/airQualityService";
import { fetchWeather, fetchUV } from "@/services/weatherService";
import type { AirQualityRecord } from "@/types/air-quality.types";
import type { WeatherRecord, UVRecord } from "@/types/weather";

export default function Home() {
  const navigate = useNavigate();
  const [aqiData, setAqiData] = useState<AirQualityRecord[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherRecord[]>([]);
  const [uvData, setUvData] = useState<UVRecord[]>([]);
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

  const toggleDarkMode = () => setDarkMode(!darkMode);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const [aqi, weather, uv] = await Promise.all([
          fetchAirQuality(),
          fetchWeather(),
          fetchUV()
        ]);
        setAqiData(aqi.data);
        setWeatherData(weather.data);
        setUvData(uv.data);
      } catch (err) {
        console.error("Failed to load summary data", err);
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, []);

  const avgAqi = aqiData.length 
    ? Math.round(aqiData.reduce((acc, curr) => acc + curr.pm2_5, 0) / aqiData.length) 
    : 0;
  
  const hottestProvince = weatherData.length
    ? [...weatherData].sort((a, b) => b.temp_c - a.temp_c)[0]
    : null;

  const highestUv = uvData.length
    ? [...uvData].sort((a, b) => b.uv - a.uv)[0]
    : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-[3rem] bg-blue-600 dark:bg-blue-700 p-8 md:p-16 text-white mb-12 shadow-2xl shadow-blue-500/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold border border-white/30">
                <Activity className="w-4 h-4" />
                <span>Live Environmental Data</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter">
                Breathe Better, <br />
                <span className="text-blue-200">Live Healthier.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-blue-100 max-w-lg leading-relaxed font-medium">
                Monitor real-time air quality, weather conditions, and UV levels across all provinces of Cambodia. Stay informed and protect your health.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/dashboard/air-quality")}
                  className="bg-white text-blue-600 hover:bg-blue-50 h-14 px-8 rounded-2xl text-lg font-bold shadow-xl shadow-black/10 group transition-all"
                >
                  Explore AQI Map
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate("/dashboard/weather")}
                  className="border-white/40 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 h-14 px-8 rounded-2xl text-lg font-bold"
                >
                  View Weather
                </Button>
              </div>
            </div>

            <div className="hidden lg:grid grid-cols-2 gap-6">
              <SummaryCard 
                icon={<Wind className="w-8 h-8 text-blue-200" />}
                title="Avg. Air Quality"
                value={`${avgAqi} μg/m³`}
                label="Overall Cambodia"
                color="bg-white/10"
              />
              <SummaryCard 
                icon={<Thermometer className="w-8 h-8 text-orange-200" />}
                title="Hottest Spot"
                value={hottestProvince ? `${hottestProvince.temp_c}°C` : "N/A"}
                label={hottestProvince?.name || "Loading..."}
                color="bg-white/10"
              />
              <SummaryCard 
                icon={<Sun className="w-8 h-8 text-yellow-200" />}
                title="Highest UV"
                value={highestUv ? highestUv.uv.toString() : "N/A"}
                label={highestUv?.name || "Loading..."}
                color="bg-white/10"
              />
              <SummaryCard 
                icon={<Shield className="w-8 h-8 text-green-200" />}
                title="Health Index"
                value="Moderate"
                label="Take precautions"
                color="bg-white/10"
              />
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <FeatureCard 
            icon={<MapIcon className="w-10 h-10 text-blue-600" />}
            title="Interactive Map"
            description="Visualize air pollutants across the entire country with our high-resolution interactive GIS map."
            onClick={() => navigate("/dashboard/air-quality")}
          />
          <FeatureCard 
            icon={<CloudRain className="w-10 h-10 text-indigo-600" />}
            title="Weather Forecasts"
            description="Get accurate weather updates, humidity, and wind speeds for every province in Cambodia."
            onClick={() => navigate("/dashboard/weather")}
          />
          <FeatureCard 
            icon={<Sun className="w-10 h-10 text-orange-600" />}
            title="UV Monitoring"
            description="Protect your skin from harmful radiation with our real-time UV index tracking and alerts."
            onClick={() => navigate("/dashboard/uv")}
          />
        </div>

        {/* Footer info */}
        <div className="text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
          <p>© 2026 Camair Cambodia. Data sourced from Environmental Protection Agencies.</p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, title, value, label, color }: any) {
  return (
    <div className={`${color} backdrop-blur-lg border border-white/20 p-6 rounded-[2rem] space-y-3 hover:scale-105 transition-transform cursor-default`}>
      {icon}
      <div>
        <p className="text-white/70 text-sm font-bold uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-black text-white">{value}</p>
        <p className="text-white/60 text-xs font-medium mt-1">{label}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer group"
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
        {description}
      </p>
      <div className="mt-6 flex items-center text-blue-600 font-bold group-hover:gap-2 transition-all">
        Learn more <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
}

