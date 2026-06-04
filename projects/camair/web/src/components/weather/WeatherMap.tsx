import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import type { Map as LeafletMap, LeafletEvent, PathOptions } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Thermometer, CloudRain, Wind, Droplets, Target } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { WeatherRecord } from "@/types/weather";
import cambodiaGeoJsonUrl from "@/assets/geoData/cambodia-provinces.geojson?url";

interface WeatherMapProps {
  weatherData: WeatherRecord[];
  selectedProvince: string;
  onProvinceSelect: (name: string) => void;
  className?: string;
}

type MetricType = "temp_c" | "precip_mm" | "wind_kph" | "humidity";

interface GeoJsonFeature {
  type: string;
  properties: {
    adm1_name: string;
    adm1_pcode?: string;
    [key: string]: any;
  };
  geometry: any;
}

// ── Color Scales ──────────────────────────────────────────────────────────

function getTempColor(val: number | null): string {
  if (val === null) return "#94a3b8";
  if (val <= 24) return "#3b82f6"; // Cool blue
  if (val <= 27) return "#60a5fa"; // Light blue
  if (val <= 30) return "#fef08a"; // Soft yellow
  if (val <= 32) return "#facc15"; // Warm yellow
  if (val <= 34) return "#f97316"; // Orange
  if (val <= 36) return "#ea580c"; // Dark orange
  return "#dc2626"; // Red
}

function getPrecipColor(val: number | null): string {
  if (val === null) return "#94a3b8";
  if (val === 0) return "#f8fafc"; // No rain (off-white)
  if (val <= 0.5) return "#e0f2fe"; // Very light drizzle
  if (val <= 2) return "#bae6fd"; // Light rain
  if (val <= 5) return "#7dd3fc"; // Moderate rain
  if (val <= 10) return "#2563eb"; // Heavy rain
  return "#1e3a8a"; // Severe storm / high precip
}

function getWindColor(val: number | null): string {
  if (val === null) return "#94a3b8";
  if (val <= 5) return "#f0fdf4"; // Calm
  if (val <= 10) return "#bbf7d0"; // Light breeze
  if (val <= 18) return "#4ade80"; // Moderate wind
  if (val <= 25) return "#06b6d4"; // Fresh breeze
  if (val <= 35) return "#3b82f6"; // Strong wind
  return "#7c3aed"; // Gale
}

function getHumidityColor(val: number | null): string {
  if (val === null) return "#94a3b8";
  if (val <= 45) return "#fffbeb"; // Dry
  if (val <= 60) return "#e0f2fe"; // Comfortable
  if (val <= 75) return "#7dd3fc"; // Moderately humid
  if (val <= 85) return "#0284c7"; // Humid
  return "#0369a1"; // Very humid
}

function getMetricColor(val: number | null, metric: MetricType): string {
  switch (metric) {
    case "temp_c": return getTempColor(val);
    case "precip_mm": return getPrecipColor(val);
    case "wind_kph": return getWindColor(val);
    case "humidity": return getHumidityColor(val);
  }
}

// ── Map Actions & Zoom Sync ──────────────────────────────────────────────

function MapController({
  selectedProvince,
  geoJsonData,
  mapRef,
}: {
  selectedProvince: string;
  geoJsonData: any;
  mapRef: React.MutableRefObject<LeafletMap | null>;
}) {
  const map = useMap();

  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);

  useEffect(() => {
    if (!selectedProvince || !geoJsonData) return;
    
    // Find the feature matching the selected province and fly to bounds
    let targetLayer: any = null;
    map.eachLayer((layer: any) => {
      if (layer.feature && layer.feature.properties && layer.feature.properties.adm1_name === selectedProvince) {
        targetLayer = layer;
      }
    });

    if (targetLayer && typeof targetLayer.getBounds === "function") {
      const bounds = targetLayer.getBounds();
      map.flyToBounds(bounds, {
        padding: [40, 40],
        maxZoom: 9.5,
        duration: 0.8,
      });
    }
  }, [selectedProvince, geoJsonData, map]);

  return null;
}

export function WeatherMap({ weatherData, selectedProvince, onProvinceSelect, className }: WeatherMapProps) {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [activeMetric, setActiveMetric] = useState<MetricType>("temp_c");
  const mapRef = useRef<LeafletMap | null>(null);

  // Fetch GeoJSON
  useEffect(() => {
    fetch(cambodiaGeoJsonUrl)
      .then((res) => res.json())
      .then((data) => setGeoJsonData(data))
      .catch((err) => console.error("Failed to load Cambodia GeoJSON", err));
  }, []);

  // Sync selection callback
  const selectProvinceRef = useRef(onProvinceSelect);
  useEffect(() => {
    selectProvinceRef.current = onProvinceSelect;
  }, [onProvinceSelect]);

  const selectedProvinceRef = useRef(selectedProvince);
  useEffect(() => { selectedProvinceRef.current = selectedProvince; }, [selectedProvince]);

  // O(1) lookup map — like air quality's airQualityByProvince
  const weatherByProvince = useMemo(() => {
    const map = new Map<string, WeatherRecord>();
    weatherData.forEach(w => map.set(w.name.toLowerCase().trim(), w));
    return map;
  }, [weatherData]);

  // Enrich GeoJSON with weather data — like ProvinceMapOverlay's enrichment
  const enrichedGeoJson = useMemo(() => {
    if (!geoJsonData) return null;
    return {
      ...geoJsonData,
      features: geoJsonData.features.map((feature: any) => {
        const provinceName = (feature.properties.adm1_name || "").toLowerCase().trim();
        const weather = weatherByProvince.get(provinceName);
        return {
          ...feature,
          properties: {
            ...feature.properties,
            ...(weather || {}),
          },
        };
      }),
    };
  }, [geoJsonData, weatherByProvince]);

  // Store Leaflet layers for in-place style updates
  const layerRefs = useRef<L.Layer[]>([]);

  // Build tooltip HTML from enriched feature properties
  function getTooltipContent(props: Record<string, any>): string {
    const provinceName = props.adm1_name || "";
    const tempVal = props.temp_c != null ? `${props.temp_c}°C` : "No Data";
    const condText = props.condition_text || "";
    const humVal = props.humidity != null ? `${props.humidity}%` : "No Data";
    const windVal = props.wind_kph != null ? `${props.wind_kph} km/h ${props.wind_dir || ""}` : "No Data";
    const precipVal = props.precip_mm != null ? `${props.precip_mm} mm` : "No Data";

    return `
      <div class="p-2 font-sans text-xs">
        <div class="font-black text-slate-800 dark:text-white text-sm mb-1">${provinceName}</div>
        <div class="space-y-0.5">
          <div class="flex justify-between gap-4 font-bold"><span class="text-slate-400">Temp:</span> <span class="text-slate-800 dark:text-white">${tempVal}</span></div>
          ${condText ? `<div class="flex justify-between gap-4 font-bold"><span class="text-slate-400">Condition:</span> <span class="text-slate-600 dark:text-slate-300">${condText}</span></div>` : ""}
          <div class="flex justify-between gap-4"><span class="text-slate-400">Rainfall:</span> <span class="font-semibold">${precipVal}</span></div>
          <div class="flex justify-between gap-4"><span class="text-slate-400">Wind:</span> <span class="font-semibold">${windVal}</span></div>
          <div class="flex justify-between gap-4"><span class="text-slate-400">Humidity:</span> <span class="font-semibold">${humVal}</span></div>
        </div>
      </div>
    `;
  }

  // Compute style from enriched feature properties
  const getProvinceStyle = useCallback((props: Record<string, any> | undefined): PathOptions => {
    if (!props) return { fillColor: "#94a3b8", fillOpacity: 0.65 };

    const provinceName = props.adm1_name as string;
    const metric = activeMetric;
    const val = props[metric] as number | null ?? null;
    const fillColor = getMetricColor(val, metric);
    const isSelected = selectedProvince === provinceName;

    return {
      fillColor,
      weight: isSelected ? 3.5 : 1.2,
      opacity: 1,
      color: isSelected ? "#0f172a" : "#e2e8f0",
      fillOpacity: isSelected ? 0.85 : 0.65,
    };
  }, [activeMetric, selectedProvince]);

  // In-place update of styles + tooltips — like air quality's setTooltipContent effect
  useEffect(() => {
    layerRefs.current.forEach((layer: any) => {
      if (layer.feature) {
        const props = layer.feature.properties;
        layer.setStyle(getProvinceStyle(props));
        layer.setTooltipContent(getTooltipContent(props));
      }
    });
  }, [getProvinceStyle, weatherByProvince]);

  // Static initial style (used during GeoJSON construction)
  const styleFeature = useCallback((feature?: GeoJsonFeature): PathOptions => {
    return getProvinceStyle(feature?.properties);
  }, [getProvinceStyle]);

  // Stable callback — runs once at mount
  const onEachFeature = useCallback((feature: GeoJsonFeature, layer: L.Layer) => {
    const provinceName = feature.properties.adm1_name;
    layerRefs.current.push(layer);

    // Bind empty tooltip initially; effect fills it via setTooltipContent
    layer.bindTooltip("", { sticky: true, className: "custom-map-tooltip border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 p-0 shadow-lg" });

    layer.on({
      click: () => {
        selectProvinceRef.current(provinceName);
      },
      mouseover: (e: LeafletEvent) => {
        const l = e.target as L.Path;
        l.setStyle({
          weight: 3,
          fillOpacity: 0.85,
          color: "#2563eb",
        });
      },
      mouseout: (e: LeafletEvent) => {
        const l = e.target as any;
        if (l.feature) {
          l.setStyle(getProvinceStyle(l.feature.properties));
        }
      },
    });
  }, [getProvinceStyle]);

  // Recenter map handler
  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.setView([12.5657, 104.991], 7.5);
    }
  };

  const mapTileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <Card glass className={cn("p-6 h-[750px] flex flex-col justify-between transition-all duration-300 relative overflow-hidden", className)}>
      
      {/* Map Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 z-20 relative">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-blue-500" />
            Interactive Weather Radar Map
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Thematic overlays across Cambodia provinces. Click a province to view full details.
          </p>
        </div>

        {/* Dimension Overlay Selector */}
        <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-0.5 rounded-xl self-start sm:self-center">
          <button
            onClick={() => setActiveMetric("temp_c")}
            title="Temperature overlay"
            className={cn(
              "p-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
              activeMetric === "temp_c" 
                ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Temperature</span>
          </button>
          <button
            onClick={() => setActiveMetric("precip_mm")}
            title="Rainfall overlay"
            className={cn(
              "p-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
              activeMetric === "precip_mm" 
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Rainfall</span>
          </button>
          <button
            onClick={() => setActiveMetric("wind_kph")}
            title="Wind Speed overlay"
            className={cn(
              "p-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
              activeMetric === "wind_kph" 
                ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <Wind className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Wind</span>
          </button>
          <button
            onClick={() => setActiveMetric("humidity")}
            title="Humidity overlay"
            className={cn(
              "p-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
              activeMetric === "humidity" 
                ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Humidity</span>
          </button>
        </div>
      </div>

      {/* Interactive Map Display */}
      <div className="flex-1 rounded-2xl relative border border-slate-100 dark:border-white/[0.04] bg-slate-100 dark:bg-slate-900/50 z-10">
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <MapContainer
            center={[12.5657, 104.991]}
            zoom={7.5}
            zoomSnap={0.5}
            zoomDelta={0.5}
            className="w-full h-full z-10"
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url={mapTileUrl} attribution="&copy; CartoDB" />
            <MapController selectedProvince={selectedProvince} geoJsonData={geoJsonData} mapRef={mapRef} />
            {enrichedGeoJson && (
              <GeoJSON
                data={enrichedGeoJson}
                style={styleFeature as any}
                onEachFeature={onEachFeature}
              />
            )}
          </MapContainer>
        </div>

        {/* Map UI Controls */}
        <button 
          onClick={handleRecenter}
          title="Recenter Cambodia Map"
          className="absolute right-3.5 bottom-3.5 z-40 w-9 h-9 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-lg border border-slate-200 dark:border-slate-700/80 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
        >
          <Target className="w-4 h-4" />
        </button>

        {/* Map Custom Legend Overlay */}
        <LegendOverlay metric={activeMetric} />
      </div>
    </Card>
  );
}

// ── Legend Sub-component ─────────────────────────────────────────────────

function LegendOverlay({ metric }: { metric: MetricType }) {
  const getLegendConfig = () => {
    switch (metric) {
      case "temp_c":
        return {
          title: "Temp",
          unit: "°C",
          scale: [
            { label: "<24", color: "#3b82f6" },
            { label: "27", color: "#60a5fa" },
            { label: "30", color: "#fef08a" },
            { label: "32", color: "#facc15" },
            { label: "34", color: "#f97316" },
            { label: ">36", color: "#dc2626" },
          ]
        };
      case "precip_mm":
        return {
          title: "Rainfall",
          unit: "mm",
          scale: [
            { label: "0", color: "#f8fafc" },
            { label: "0.5", color: "#e0f2fe" },
            { label: "2", color: "#bae6fd" },
            { label: "5", color: "#7dd3fc" },
            { label: "10", color: "#2563eb" },
            { label: ">10", color: "#1e3a8a" },
          ]
        };
      case "wind_kph":
        return {
          title: "Wind",
          unit: "km/h",
          scale: [
            { label: "5", color: "#f0fdf4" },
            { label: "10", color: "#bbf7d0" },
            { label: "18", color: "#4ade80" },
            { label: "25", color: "#06b6d4" },
            { label: "35", color: "#3b82f6" },
            { label: ">35", color: "#7c3aed" },
          ]
        };
      case "humidity":
        return {
          title: "Humidity",
          unit: "%",
          scale: [
            { label: "45", color: "#fffbeb" },
            { label: "60", color: "#e0f2fe" },
            { label: "75", color: "#7dd3fc" },
            { label: "85", color: "#0284c7" },
            { label: ">85", color: "#0369a1" },
          ]
        };
    }
  };

  const config = getLegendConfig();

  return (
    <div className="absolute left-3.5 bottom-3.5 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-3 py-2.5 rounded-2xl shadow-lg border border-slate-200 dark:border-white/[0.06] flex flex-col gap-1.5 max-w-[170px]">
      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
        {config.title} ({config.unit})
      </span>
      <div className="flex items-center gap-1.5">
        {config.scale.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-0.5">
            <div className="w-4 h-2 rounded-sm border border-slate-200/50 dark:border-slate-800" style={{ backgroundColor: item.color }} />
            <span className="text-[8px] font-bold text-slate-400 leading-none">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
