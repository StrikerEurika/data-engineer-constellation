import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sun, 
  Cloud, 
  Wind, 
  Droplets, 
  ShieldAlert, 
  Compass, 
  TrendingUp, 
  Table, 
  Search, 
  ArrowRight,
  Zap,
  Activity,
  Heart,
  Thermometer
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Header } from "../layout/Header";
import {
  fetchAirQualityTrend,
  fetchUV,
  fetchUVTrend,
  fetchWeather,
  fetchWeatherTrend,
} from "../services/weatherService";
import { fetchAirQuality } from "../services/airQualityService";
import { realTimeService } from "../services/realTimeService";
import { getAqiInfo } from "../utils/aqi-utils";
import { POLLUTANT_CONFIG } from "../config/pollutant.config";
import type { WeatherRecord, UVRecord, AirQualityRecord } from "../types/weather";
import { formatToUTC7Time } from "../utils/time";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function OverviewDashboard() {
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState<WeatherRecord[]>([]);
  const [uvData, setUvData] = useState<UVRecord[]>([]);
  const [aqiData, setAqiData] = useState<AirQualityRecord[]>([]);
  
  const [weatherTrend, setWeatherTrend] = useState<WeatherRecord[]>([]);
  const [uvTrend, setUvTrend] = useState<UVRecord[]>([]);
  const [airQualityTrend, setAirQualityTrend] = useState<AirQualityRecord[]>([]);

  const [selectedProvince, setSelectedProvince] = useState("Phnom Penh");
  const [searchQuery, setSearchQuery] = useState("");
  const [trendTab, setTrendTab] = useState<"weather" | "aqi" | "uv">("weather");
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

    const unsubscribeAQI = realTimeService.subscribe("air_quality", (updated) => {
      setAqiData(updated as AirQualityRecord[]);
    });

    return () => {
      unsubscribeWeather();
      unsubscribeUV();
      unsubscribeAQI();
    };
  }, []);

  useEffect(() => {
    loadProvinceTrends(selectedProvince);
  }, [selectedProvince]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [weatherRes, uvRes, aqiRes] = await Promise.all([
        fetchWeather(),
        fetchUV(),
        fetchAirQuality()
      ]);
      setWeatherData(weatherRes.data);
      setUvData(uvRes.data);
      setAqiData(aqiRes.data);
    } catch (error) {
      console.error("Failed to load overview data", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProvinceTrends = async (province: string) => {
    try {
      const [weatherTrendRes, uvTrendRes, airQualityTrendRes] = await Promise.all([
        fetchWeatherTrend(province),
        fetchUVTrend(province),
        fetchAirQualityTrend(province),
      ]);
      setWeatherTrend(weatherTrendRes.data);
      setUvTrend(uvTrendRes.data);
      setAirQualityTrend(airQualityTrendRes.data);
    } catch (error) {
      console.error("Failed to load province trends", error);
      setWeatherTrend([]);
      setUvTrend([]);
      setAirQualityTrend([]);
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Get selected province data
  const currentProvinceWeather = weatherData.find(w => w.name === selectedProvince) || weatherData[0];
  const currentProvinceUV = uvData.find(u => u.name === selectedProvince) || uvData[0];
  const currentProvinceAQI = aqiData.find(a => a.name === selectedProvince) || aqiData[0];

  // Helper formatting trends
  const formatTrendLabel = (timestamp: string | undefined, index: number): string => {
    if (!timestamp) return `T-${index}`;
    return formatToUTC7Time(timestamp);
  };

  // Charts data
  const weatherChartData = weatherTrend.map((record, index) => ({
    time: formatTrendLabel(record.created_at_ts || record.created_at, index),
    temp: record.temp_c,
    humidity: record.humidity,
  }));

  const aqiChartData = airQualityTrend.map((record, index) => ({
    time: formatTrendLabel(record.created_at_ts || record.created_at, index),
    pm2_5: record.pm2_5,
    pm10: record.pm10,
  }));

  const uvChartData = uvTrend.map((record, index) => ({
    time: formatTrendLabel(record.created_at_ts || record.created_at, index),
    uv: record.uv,
  }));

  // Country Averages
  const avgTemp = weatherData.length 
    ? Math.round(weatherData.reduce((acc, curr) => acc + curr.temp_c, 0) / weatherData.length * 10) / 10
    : 0;

  const avgAqi = aqiData.length
    ? Math.round(aqiData.reduce((acc, curr) => acc + curr.pm2_5, 0) / aqiData.length)
    : 0;

  const avgUv = uvData.length
    ? Math.round(uvData.reduce((acc, curr) => acc + curr.uv, 0) / uvData.length * 10) / 10
    : 0;

  const healthiestProvince = aqiData.length
    ? [...aqiData].sort((a, b) => a.pm2_5 - b.pm2_5)[0]?.name
    : "Loading...";

  // Sort and filter table list
  const filteredProvinces = weatherData.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAqiBadgeColor = (epaIndex: number): string => {
    const aqiInfo = getAqiInfo(epaIndex);
    return `${aqiInfo.color} text-white`;
  };

  const getUvLevelInfo = (uv: number) => {
    if (uv <= 2) return { label: "Low", color: "bg-green-500 text-white", text: "Low danger. Safe outdoors." };
    if (uv <= 5) return { label: "Moderate", color: "bg-yellow-500 text-slate-900", text: "Moderate risk. Use protection." };
    if (uv <= 7) return { label: "High", color: "bg-orange-500 text-white", text: "High risk. SPF and cover-up." };
    if (uv <= 10) return { label: "Very High", color: "bg-red-500 text-white", text: "Very high risk. Avoid midday sun." };
    return { label: "Extreme", color: "bg-purple-600 text-white", text: "Extreme risk. Take maximum precaution." };
  };

  const getAqiHealthTips = (epaIndex: number): string => {
    switch(epaIndex) {
      case 1: return "Ideal weather for outdoor physical activities and exercise.";
      case 2: return "Acceptable air. Extremely sensitive people should limit outdoor time.";
      case 3: return "Sensitive groups may feel discomfort. Reduce prolonged exertion.";
      case 4: return "Everyone may experience effects. Wear a PM2.5 protective mask.";
      case 5: return "Avoid all outdoor activities. Keep windows and doors tightly shut.";
      default: return "Health warning: emergency conditions. Stay indoors.";
    }
  };

  if (loading && !weatherData.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-bold animate-pulse">Loading Live Cambodia Environmental Data...</p>
      </div>
    );
  }

  const currentAqiInfo = currentProvinceAQI ? getAqiInfo(currentProvinceAQI.us_epa_index) : getAqiInfo(1);
  const currentUvLevel = currentProvinceUV ? getUvLevelInfo(currentProvinceUV.uv) : getUvLevelInfo(0);

  return (
    <div className="space-y-6">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-slate-900/30 p-6 rounded-[2rem] border border-slate-200/50 dark:border-white/[0.04]">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-500 fill-blue-500" />
            Cambodia Environment Hub
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Live updates for Weather, Air Quality (AQI), and UV Index across all provinces.
          </p>
        </div>

        {/* Global Selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Selected Province:</span>
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

      {/* Country Averages Summary Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card glass className="relative overflow-hidden bg-gradient-to-br from-blue-500/5 to-purple-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Avg Temp</span>
              <Thermometer className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{avgTemp}°C</p>
            <p className="text-xs text-slate-500 mt-1 font-semibold">Across Cambodia</p>
          </CardContent>
        </Card>

        <Card glass className="relative overflow-hidden bg-gradient-to-br from-emerald-500/5 to-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Avg PM2.5</span>
              <Activity className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{avgAqi} μg/m³</p>
            <p className="text-xs text-slate-500 mt-1 font-semibold">Overall Country AQI</p>
          </CardContent>
        </Card>

        <Card glass className="relative overflow-hidden bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Avg UV Index</span>
              <Sun className="w-5 h-5 text-yellow-500 animate-spin-slow" />
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{avgUv}</p>
            <p className="text-xs text-slate-500 mt-1 font-semibold">Radiation Level</p>
          </CardContent>
        </Card>

        <Card glass className="relative overflow-hidden bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Healthiest Spot</span>
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-3 truncate">{healthiestProvince}</p>
            <p className="text-xs text-slate-500 mt-1 font-semibold">Lowest PM2.5 level</p>
          </CardContent>
        </Card>
      </div>

      {/* Selected Province Tri-Dimension Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* WEATHER SUMMARY */}
        <Card glass className="group hover:border-slate-300 dark:hover:border-slate-800 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-700 dark:text-slate-200">Weather Summary</CardTitle>
            <Cloud className="w-6 h-6 text-blue-500" />
          </CardHeader>
          <CardContent className="space-y-6">
            {currentProvinceWeather ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white">
                      {currentProvinceWeather.temp_c}°C
                    </h3>
                    <p className="text-sm font-bold text-slate-400 mt-1">
                      Feels like {currentProvinceWeather.feelslike_c}°C
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <img 
                      src={currentProvinceWeather.condition_icon} 
                      alt={currentProvinceWeather.condition_text} 
                      className="w-16 h-16 filter drop-shadow-md"
                    />
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full mt-1 text-center">
                      {currentProvinceWeather.condition_text}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400">Humidity</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{currentProvinceWeather.humidity}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-sky-400" />
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400">Wind</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{currentProvinceWeather.wind_kph} km/h</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400">Direction</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{currentProvinceWeather.wind_dir} ({currentProvinceWeather.wind_degree}°)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400">Clouds</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{currentProvinceWeather.cloud}%</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => navigate("/dashboard/weather")}
                  className="w-full flex items-center justify-center gap-2 mt-4 py-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 text-blue-500 dark:text-blue-400 font-bold hover:bg-blue-500 hover:text-white transition-all text-sm cursor-pointer"
                >
                  Detailed Forecast
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400">No Weather Data</div>
            )}
          </CardContent>
        </Card>

        {/* AIR QUALITY SUMMARY */}
        <Card glass className="group hover:border-slate-300 dark:hover:border-slate-800 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-700 dark:text-slate-200">Air Quality (AQI)</CardTitle>
            <Activity className="w-6 h-6 text-emerald-500" />
          </CardHeader>
          <CardContent className="space-y-6">
            {currentProvinceAQI ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white">
                      {currentProvinceAQI.pm2_5}
                      <span className="text-xs text-slate-400 font-medium ml-1">μg/m³ PM2.5</span>
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${getAqiBadgeColor(currentProvinceAQI.us_epa_index)}`}>
                        {currentAqiInfo.label}
                      </span>
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center border font-bold text-slate-800 dark:text-slate-100" style={{ borderColor: currentAqiInfo.hex, backgroundColor: `${currentAqiInfo.hex}15` }}>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">EPA</span>
                    <span className="text-lg font-black">{currentProvinceAQI.us_epa_index}</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/40 text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed min-h-16">
                  {getAqiHealthTips(currentProvinceAQI.us_epa_index)}
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400">PM10</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{currentProvinceAQI.pm10} μg/m³</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400">Ozone (O₃)</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{currentProvinceAQI.o3} ppb</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400">NO₂</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{currentProvinceAQI.no2} ppb</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400">CO</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{currentProvinceAQI.co} ppm</p>
                  </div>
                </div>

                <button 
                  onClick={() => navigate("/dashboard/air-quality")}
                  className="w-full flex items-center justify-center gap-2 mt-4 py-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 dark:text-emerald-400 font-bold hover:bg-emerald-500 hover:text-white transition-all text-sm cursor-pointer"
                >
                  Interactive AQI Map
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400">No AQI Data</div>
            )}
          </CardContent>
        </Card>

        {/* UV INDEX SUMMARY */}
        <Card glass className="group hover:border-slate-300 dark:hover:border-slate-800 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-700 dark:text-slate-200">UV Exposure</CardTitle>
            <Sun className="w-6 h-6 text-yellow-500 animate-spin-slow" />
          </CardHeader>
          <CardContent className="space-y-6">
            {currentProvinceUV ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white">
                      {currentProvinceUV.uv}
                      <span className="text-xs text-slate-400 font-medium ml-1.5">Index Value</span>
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${currentUvLevel.color}`}>
                        {currentUvLevel.label} Level
                      </span>
                    </div>
                  </div>
                  
                  {/* Visual gauge bar */}
                  <div className="h-2 w-20 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex -rotate-90 origin-right translate-x-5 translate-y-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 via-orange-500 to-purple-600 rounded-full" 
                      style={{ width: `${Math.min(100, (currentProvinceUV.uv / 12) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/40 text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed min-h-16">
                  {currentUvLevel.text} Avoid outdoor tasks from 11:00 AM to 3:00 PM.
                </div>

                {/* Skin exposure recommendations */}
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Precaution Recommendations</p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    <span>Apply SPF 30+ sunscreen every 2 hours</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    <span>Wear protective wide-brim hat & sunglasses</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    <span>Hydrate frequently to avoid heat strain</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate("/dashboard/uv")}
                  className="w-full flex items-center justify-center gap-2 mt-4 py-2.5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-yellow-600 dark:text-yellow-400 font-bold hover:bg-yellow-500 hover:text-white transition-all text-sm cursor-pointer"
                >
                  UV Safety Guidelines
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400">No UV Data</div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Interactive Charts Panel & Province List */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* TRENDS CHART */}
        <div className="xl:col-span-2">
          <Card glass className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                24-Hour Historical Trends ({selectedProvince})
              </CardTitle>

              {/* Chart Tabs */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setTrendTab("weather")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${trendTab === "weather" ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800"}`}
                >
                  Temperature
                </button>
                <button
                  onClick={() => setTrendTab("aqi")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${trendTab === "aqi" ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800"}`}
                >
                  PM2.5 / PM10
                </button>
                <button
                  onClick={() => setTrendTab("uv")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${trendTab === "uv" ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800"}`}
                >
                  UV index
                </button>
              </div>
            </CardHeader>
            <CardContent className="h-[300px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                {trendTab === "weather" ? (
                  <LineChart data={weatherChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#f97316" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                ) : trendTab === "aqi" ? (
                  <AreaChart data={aqiChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="pm2_5" name="PM2.5 (μg/m³)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPm)" />
                    <Line type="monotone" dataKey="pm10" name="PM10 (μg/m³)" stroke="#6366f1" strokeWidth={2} dot={false} />
                  </AreaChart>
                ) : (
                  <BarChart data={uvChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} domain={[0, 12]} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="uv" name="UV index" fill="#eab308" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* PROVINCES TABLE/LIST */}
        <div className="xl:col-span-1">
          <Card glass className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Table className="w-5 h-5 text-blue-500" />
                Province List
              </CardTitle>

              {/* Search Bar */}
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search province..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <div className="max-h-[320px] overflow-y-auto px-6 custom-scrollbar space-y-2">
                {filteredProvinces.map((prov) => {
                  const aq = aqiData.find(a => a.name === prov.name) || aqiData[0];
                  const uv = uvData.find(u => u.name === prov.name) || uvData[0];
                  const isSelected = prov.name === selectedProvince;

                  return (
                    <div
                      key={prov.name}
                      onClick={() => setSelectedProvince(prov.name)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected 
                          ? "bg-blue-50/50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-800" 
                          : "bg-white dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img 
                          src={prov.condition_icon} 
                          alt={prov.condition_text} 
                          className="w-7 h-7"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{prov.name}</p>
                          <p className="text-[10px] font-semibold text-slate-400">{prov.condition_text}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100">{prov.temp_c}°</span>
                        {aq && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getAqiBadgeColor(aq.us_epa_index)}`}>
                            AQI {aq.pm2_5}
                          </span>
                        )}
                        {uv && (
                          <span className="text-[10px] font-black text-yellow-600 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                            UV {uv.uv}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Dedicated Section Navigator Visual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div 
          onClick={() => navigate("/dashboard/weather")}
          className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-sky-500 text-white rounded-[2rem] p-6 shadow-lg shadow-blue-500/15 cursor-pointer transform hover:-translate-y-1.5 transition-all duration-300"
        >
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-15">
            <Cloud className="w-36 h-36" />
          </div>
          <span className="text-[10px] font-black tracking-widest uppercase text-blue-100">Dimension 1</span>
          <h3 className="text-xl font-black mt-2">Weather & Forecast</h3>
          <p className="text-xs text-blue-50/90 mt-2 font-medium leading-relaxed">
            Detailed 7-day meteorological forecasts, wind velocity tracking, barometric pressure details, and rain probability charts.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold group-hover:gap-3 transition-all text-white">
            Explore Weather Dashboard
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div 
          onClick={() => navigate("/dashboard/air-quality")}
          className="group relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-500 text-white rounded-[2rem] p-6 shadow-lg shadow-emerald-500/15 cursor-pointer transform hover:-translate-y-1.5 transition-all duration-300"
        >
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-15">
            <Activity className="w-36 h-36" />
          </div>
          <span className="text-[10px] font-black tracking-widest uppercase text-emerald-100">Dimension 2</span>
          <h3 className="text-xl font-black mt-2">Air Quality Index</h3>
          <p className="text-xs text-emerald-50/90 mt-2 font-medium leading-relaxed">
            High-resolution interactive GIS map overlaid with PM2.5, PM10, ozone and other particulate pollutants across all 25 provinces.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold group-hover:gap-3 transition-all text-white">
            Explore AQI Map
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div 
          onClick={() => navigate("/dashboard/uv")}
          className="group relative overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-500 text-white rounded-[2rem] p-6 shadow-lg shadow-purple-500/15 cursor-pointer transform hover:-translate-y-1.5 transition-all duration-300"
        >
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-15">
            <Sun className="w-36 h-36" />
          </div>
          <span className="text-[10px] font-black tracking-widest uppercase text-purple-100">Dimension 3</span>
          <h3 className="text-xl font-black mt-2">UV Index & Safety</h3>
          <p className="text-xs text-purple-50/90 mt-2 font-medium leading-relaxed">
            Ultraviolet radiation levels, risk warnings, skin exposure limits, and detailed medical precautions relative to current sunlight levels.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold group-hover:gap-3 transition-all text-white">
            Explore UV Protection
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

    </div>
  );
}
