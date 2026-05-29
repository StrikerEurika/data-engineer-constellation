import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sun, 
  ShieldAlert, 
  Clock, 
  MapPin, 
  ArrowLeft, 
  Sparkles,
  Coffee,
  HeartHandshake,
  Table,
  Info
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Header } from "../layout/Header";
import { fetchUV, fetchUVTrend } from "../services/weatherService";
import { realTimeService } from "../services/realTimeService";
import type { UVRecord } from "../types/weather";
import { formatToUTC7Time } from "../utils/time";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";

const UvTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const uv = payload[0].value;
    
    let uvLabel = "Low";
    let uvColor = "text-green-400";
    if (uv > 2 && uv <= 5) { uvLabel = "Moderate"; uvColor = "text-yellow-400"; }
    else if (uv > 5 && uv <= 7) { uvLabel = "High"; uvColor = "text-orange-400"; }
    else if (uv > 7 && uv <= 10) { uvLabel = "Very High"; uvColor = "text-red-400"; }
    else if (uv > 10) { uvLabel = "Extreme"; uvColor = "text-purple-400"; }

    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-700/60 dark:border-white/[0.08] p-3.5 rounded-2xl shadow-xl text-white text-xs space-y-2.5">
        <p className="font-black text-slate-400">Time: {label}</p>
        <div className="space-y-1.5 font-bold">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>UV Index: <span className="text-yellow-400">{uv}</span></span>
          </div>
          <p className="text-[10px] pl-4 font-black">Level: <span className={uvColor}>{uvLabel}</span></p>
        </div>
      </div>
    );
  }
  return null;
};

export default function UvDashboard() {
  const navigate = useNavigate();
  const [uvData, setUvData] = useState<UVRecord[]>([]);
  const [uvTrend, setUvTrend] = useState<UVRecord[]>([]);
  const [selectedProvince, setSelectedProvince] = useState("Phnom Penh");
  const [skinType, setSkinType] = useState<"fair" | "medium" | "dark">("fair");
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

    const unsubscribeUV = realTimeService.subscribe("uv", (updated) => {
      setUvData(updated as UVRecord[]);
    });

    return () => {
      unsubscribeUV();
    };
  }, []);

  useEffect(() => {
    loadProvinceTrends(selectedProvince);
  }, [selectedProvince]);

  const loadData = async () => {
    setLoading(true);
    try {
      const uvRes = await fetchUV();
      setUvData(uvRes.data);
    } catch (error) {
      console.error("Failed to load UV data", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProvinceTrends = async (province: string) => {
    try {
      const uvTrendRes = await fetchUVTrend(province);
      setUvTrend(uvTrendRes.data);
    } catch (error) {
      console.error("Failed to load UV province trends", error);
      setUvTrend([]);
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const currentProvinceUV = uvData.find(u => u.name === selectedProvince) || uvData[0];

  const formatTrendLabel = (timestamp: string | undefined, index: number): string => {
    if (!timestamp) return `T-${index}`;
    return formatToUTC7Time(timestamp);
  };

  const chartData = uvTrend.map((record, index) => ({
    time: formatTrendLabel(record.created_at_ts || record.created_at, index),
    uv: record.uv,
    level: record.uv <= 2 ? 'low' : record.uv <= 5 ? 'moderate' : record.uv <= 7 ? 'high' : record.uv <= 10 ? 'very-high' : 'extreme'
  }));

  // UV categories helper
  const getUvDetails = (uv: number) => {
    if (uv <= 2) {
      return { 
        label: "Low", 
        color: "bg-green-500", 
        textColor: "text-green-500", 
        borderColor: "border-green-500", 
        hex: "#22c55e",
        timeToBurn: "45-60 minutes",
        protection: "Minimal protection needed. Wear sunglasses on bright days.",
        alert: "Safe to stay outdoors with minimal precautions."
      };
    }
    if (uv <= 5) {
      return { 
        label: "Moderate", 
        color: "bg-yellow-500", 
        textColor: "text-yellow-500", 
        borderColor: "border-yellow-500", 
        hex: "#eab308",
        timeToBurn: "30-45 minutes",
        protection: "Apply sunscreen SPF 15+. Wear a hat and seek shade during midday.",
        alert: "Moderate risk. Sun protection is recommended."
      };
    }
    if (uv <= 7) {
      return { 
        label: "High", 
        color: "bg-orange-500", 
        textColor: "text-orange-500", 
        borderColor: "border-orange-500", 
        hex: "#f97316",
        timeToBurn: "15-25 minutes",
        protection: "Apply SPF 30+ sunscreen. Wear protective clothing, wide-brim hat, and sunglasses.",
        alert: "High risk of skin damage. Protection is essential."
      };
    }
    if (uv <= 10) {
      return { 
        label: "Very High", 
        color: "bg-red-500", 
        textColor: "text-red-500", 
        borderColor: "border-red-500", 
        hex: "#ef4444",
        timeToBurn: "10-15 minutes",
        protection: "SPF 30+ every 2 hours. Minimize sun exposure between 11:00 AM and 3:00 PM.",
        alert: "Very high risk of rapid burning. Cover up completely."
      };
    }
    return { 
      label: "Extreme", 
      color: "bg-purple-600", 
      textColor: "text-purple-600", 
      borderColor: "border-purple-600", 
      hex: "#7e22ce",
      timeToBurn: "Less than 10 minutes",
      protection: "Avoid outdoor activity if possible. SPF 50+ is mandatory. Full shade is highly advised.",
      alert: "Critical warning. Extreme risk of immediate skin damage."
    };
  };

  // Safe sun duration based on skin type and UV
  const getPersonalizedSunLimit = (uv: number, skin: "fair" | "medium" | "dark") => {
    if (uv === 0) return "Unlimited";
    
    let baseMinutes = 200 / uv; // base formula for fair skin
    
    if (skin === "medium") baseMinutes *= 2;
    if (skin === "dark") baseMinutes *= 4.5;
    
    const rounded = Math.round(baseMinutes);
    if (rounded > 180) return "Over 3 hours";
    return `${rounded} minutes`;
  };

  if (loading && !uvData.length) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-slate-500 dark:text-slate-400 font-bold">Loading UV Data...</div>
      </div>
    );
  }

  const currentUv = currentProvinceUV?.uv ?? 0;
  const uvInfo = getUvDetails(currentUv);
  const personalizedLimit = getPersonalizedSunLimit(currentUv, skinType);

  // Ranked provinces list (highest UV first)
  const rankedProvinces = [...uvData].sort((a, b) => b.uv - a.uv);

  return (
    <div className="space-y-6">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      {/* Back button & page title */}
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
              <Sun className="w-6 h-6 text-yellow-500 fill-yellow-500 animate-spin-slow" />
              Ultraviolet (UV) Monitoring
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Protect your skin from solar radiation. Safe sun exposure calculations and local warnings.
            </p>
          </div>
        </div>

        {/* Selected Province Selector */}
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-slate-400" />
          <select 
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-sm"
          >
            {uvData.map(u => (
              <option key={u.name} value={u.name}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: Main UV index card & Exposure Advisor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main UV index gauge card */}
        <Card glass className="lg:col-span-2 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-yellow-500/10 rounded-full blur-[60px]" />
          
          <CardHeader>
            <CardTitle>Solar Radiation Intensity — {selectedProvince}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            {/* Big UV Value */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">UV Index</span>
              <p className="text-7xl font-black text-slate-900 dark:text-white my-3 select-none leading-none">
                {currentUv}
              </p>
              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase ${uvInfo.color} text-white shadow-sm shadow-black/10`}>
                {uvInfo.label} Risk
              </span>
              <p className="text-xs text-slate-400 mt-4 font-semibold">
                Updated: {currentProvinceUV ? formatToUTC7Time(currentProvinceUV.created_at) : "N/A"}
              </p>
            </div>

            {/* Quick Stats list */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Exposure Risk</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {uvInfo.alert}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Approximate Time to Burn</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Skin damage can occur in <strong className="text-orange-500">{uvInfo.timeToBurn}</strong> for unprotected light skin types.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <HeartHandshake className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Safety Precaution</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {uvInfo.protection}
                  </p>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Personalized Exposure advisor */}
        <Card glass className="relative overflow-hidden bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Sun Exposure Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Skin type options */}
            <div className="space-y-3">
              <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Select Skin Type</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSkinType("fair")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${skinType === "fair" ? "border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-bold" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 text-slate-500"}`}
                >
                  <span className="w-6 h-6 rounded-full bg-[#fce3db] border border-black/10 mb-1" />
                  <span className="text-[10px] font-bold">Fair / Light</span>
                </button>
                <button
                  onClick={() => setSkinType("medium")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${skinType === "medium" ? "border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-bold" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 text-slate-500"}`}
                >
                  <span className="w-6 h-6 rounded-full bg-[#e3bba8] border border-black/10 mb-1" />
                  <span className="text-[10px] font-bold">Medium / Olive</span>
                </button>
                <button
                  onClick={() => setSkinType("dark")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${skinType === "dark" ? "border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-bold" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 text-slate-500"}`}
                >
                  <span className="w-6 h-6 rounded-full bg-[#784e3a] border border-black/10 mb-1" />
                  <span className="text-[10px] font-bold">Dark / Deep</span>
                </button>
              </div>
            </div>

            {/* Calculations results */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Safe Exposure Limit</span>
                <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{personalizedLimit}</p>
                <p className="text-[10px] text-slate-500 mt-1 font-semibold">Maximum time without protection before skin damage occurs.</p>
              </div>
            </div>

            {/* General Advice */}
            <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Safe limit calculations are approximate. Exposure before 10:00 AM and after 4:00 PM is generally safer.
              </p>
            </div>

          </CardContent>
        </Card>

      </div>

      {/* Grid: 24-Hour UV trend & Provinces ranks */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Trend chart */}
        <div className="xl:col-span-2">
          <Card glass className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                24-Hour UV Index Trend ({selectedProvince})
              </CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} domain={[0, 12]} ticks={[0, 2, 4, 6, 8, 10, 12]} />
                  <Tooltip content={<UvTooltip />} />
                  <Bar dataKey="uv" name="UV index" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.uv <= 2 ? '#22c55e' : entry.uv <= 5 ? '#eab308' : entry.uv <= 7 ? '#f97316' : entry.uv <= 10 ? '#ef4444' : '#7e22ce'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* UV Index rankings */}
        <div className="xl:col-span-1">
          <Card glass className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="w-5 h-5 text-yellow-500" />
                UV Index Rankings
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="max-h-64 overflow-y-auto px-6 custom-scrollbar space-y-2">
                {rankedProvinces.map((prov, idx) => {
                  const uvLevel = getUvDetails(prov.uv);
                  const isSelected = prov.name === selectedProvince;

                  return (
                    <div
                      key={prov.name}
                      onClick={() => setSelectedProvince(prov.name)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected 
                          ? "bg-yellow-50/50 dark:bg-yellow-500/10 border-yellow-300 dark:border-yellow-800" 
                          : "bg-white dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-400 w-4">{idx + 1}.</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{prov.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${uvLevel.color} text-white`}>
                          {uvLevel.label}
                        </span>
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100 w-6 text-right">
                          {prov.uv}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Sun safety health tips */}
      <Card glass className="border-l-4 border-l-yellow-500">
        <CardContent className="pt-6 flex gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-500/10 flex items-center justify-center shrink-0">
            <Coffee className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white">Did you know?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Cambodia is situated close to the equator, receiving high levels of direct solar radiation year-round. Peak UV radiation is normally recorded between 11:30 AM and 1:30 PM. Reflections from water or concrete can double UV exposure!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
