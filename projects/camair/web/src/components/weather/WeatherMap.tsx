import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import type { Map as LeafletMap, LeafletEvent, PathOptions, StyleFunction } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Thermometer, CloudRain, Wind, Droplets, Target, Map as MapIcon } from "lucide-react";
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

type MetricType = "temp_c" | "precip_mm" | "wind_kph" | "humidity" | "plain";

interface WeatherProvinceProperties {
  adm1_name: string;
  adm1_pcode?: string;
  name?: string;
  temp_c?: number;
  precip_mm?: number;
  wind_kph?: number;
  humidity?: number;
  condition_text?: string;
  [key: string]: unknown;
}

interface GeoJsonFeature {
  type: string;
  properties: WeatherProvinceProperties;
  geometry: unknown;
}

interface GeoJsonData {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
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
    case "plain": return "#e2e8f0"; // Neutral slate-200 fill color
  }
}

// ── Map Actions & Zoom Sync ──────────────────────────────────────────────

function MapController({
  selectedProvince,
  geoJsonData,
  mapRef,
}: {
  selectedProvince: string;
  geoJsonData: GeoJsonData | null;
  mapRef: React.MutableRefObject<LeafletMap | null>;
}) {
  const map = useMap();
  const prevProvince = useRef<string | null>(null);

  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);

  useEffect(() => {
    if (!selectedProvince || !geoJsonData) return;
    if (prevProvince.current === null) {
      prevProvince.current = selectedProvince;
      return;
    }
    if (prevProvince.current === selectedProvince) return;

    prevProvince.current = selectedProvince;
    
    let targetLayer: (L.Layer & { feature?: GeoJsonFeature }) | null = null;
    map.eachLayer((layer) => {
      const featureLayer = layer as L.Layer & { feature?: GeoJsonFeature };
      if (featureLayer.feature?.properties?.adm1_name === selectedProvince) {
        targetLayer = featureLayer;
      }
    });

    if (targetLayer) {
      const featureGroup = targetLayer as L.FeatureGroup;
      if (typeof featureGroup.getBounds === "function") {
        const bounds = featureGroup.getBounds();
        map.flyToBounds(bounds, {
          padding: [40, 40],
          maxZoom: 9.5,
          duration: 0.8,
        });
      }
    }
  }, [selectedProvince, geoJsonData, map]);

  return null;
}

export function WeatherMap({ weatherData, selectedProvince, onProvinceSelect, className }: WeatherMapProps) {
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonData | null>(null);
  const [activeMetric, setActiveMetric] = useState<MetricType>("temp_c");
  const mapRef = useRef<LeafletMap | null>(null);
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

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
      features: geoJsonData.features.map((feature: GeoJsonFeature) => {
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

  // Build tooltip HTML from enriched feature properties based on the active metric
  function getTooltipContent(props: WeatherProvinceProperties, metric: MetricType): string {
    const provinceName = props.adm1_name || props.name || "";
    if (metric === "plain") {
      return `<div class="p-2 text-sm"><strong>${provinceName}</strong></div>`;
    }

    let metricName = "";
    let valueStr = "N/A";
    let unit = "";
    let color = "#94a3b8";

    const val = props[metric] as number | null ?? null;
    if (val !== null) {
      valueStr = val.toString();
    }

    switch (metric) {
      case "temp_c":
        metricName = "Temperature";
        unit = "°C";
        color = getTempColor(val);
        if (props.condition_text && val !== null) {
          valueStr = `${val}${unit} (${props.condition_text})`;
          unit = "";
        }
        break;
      case "precip_mm":
        metricName = "Rainfall";
        unit = " mm";
        color = getPrecipColor(val);
        break;
      case "wind_kph":
        metricName = "Wind Speed";
        unit = " km/h";
        color = getWindColor(val);
        break;
      case "humidity":
        metricName = "Humidity";
        unit = "%";
        color = getHumidityColor(val);
        break;
    }

    const valueDisplay = val !== null ? `${valueStr}${unit}` : "No data";

    return `
      <div class="p-2 text-sm font-sans">
        <strong>${provinceName}</strong><br/>
        <span style="color: ${color}; font-weight: 600;">${metricName}: ${valueDisplay}</span>
      </div>
    `;
  }

  // Compute style from enriched feature properties
  const getProvinceStyle = useCallback((props: WeatherProvinceProperties | undefined): PathOptions => {
    if (!props) return { fillColor: "#94a3b8", fillOpacity: 0.65 };

    const provinceName = props.adm1_name as string;
    const metric = activeMetric;
    const val = metric === "plain" ? null : (props[metric] as number | null ?? null);
    const fillColor = getMetricColor(val, metric);
    const isSelected = selectedProvince === provinceName;

    return {
      fillColor,
      weight: isSelected ? 3.5 : (metric === "plain" ? 1.5 : 1.2),
      opacity: 1,
      color: isSelected 
        ? "#0f172a" 
        : (metric === "plain" ? "#94a3b8" : "#e2e8f0"),
      fillOpacity: metric === "plain"
        ? (isSelected ? 0.4 : 0.15)
        : (isSelected ? 0.85 : 0.65),
    };
  }, [activeMetric, selectedProvince]);

  // Ref to always get the latest style callback inside stable event listeners
  const getProvinceStyleRef = useRef(getProvinceStyle);
  useEffect(() => {
    getProvinceStyleRef.current = getProvinceStyle;
  }, [getProvinceStyle]);

  const activeMetricRef = useRef(activeMetric);
  useEffect(() => {
    activeMetricRef.current = activeMetric;
  }, [activeMetric]);

  // In-place update of styles and tooltips when metric/selection changes
  useEffect(() => {
    geoJsonRef.current?.eachLayer((layer) => {
      const featureLayer = layer as L.Path & { feature?: GeoJsonFeature };
      if (featureLayer.feature) {
        featureLayer.setStyle(getProvinceStyle(featureLayer.feature.properties));
        if (typeof featureLayer.setTooltipContent === "function") {
          featureLayer.setTooltipContent(getTooltipContent(featureLayer.feature.properties, activeMetric));
        }
      }
    });
  }, [getProvinceStyle, activeMetric]);

  // Static initial style (used during GeoJSON construction)
  const styleFeature = useCallback((feature?: GeoJsonFeature): PathOptions => {
    return getProvinceStyle(feature?.properties);
  }, [getProvinceStyle]);

  // Stable callback — runs once at mount
  const onEachFeature = useCallback((feature: GeoJsonFeature, layer: L.Layer) => {
    const provinceName = feature.properties.adm1_name;

    layer.bindTooltip(getTooltipContent(feature.properties, activeMetricRef.current), { sticky: true, direction: "top" });

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
        const l = e.target as L.Path & { feature?: GeoJsonFeature };
        if (l.feature) {
          l.setStyle(getProvinceStyleRef.current(l.feature.properties));
        }
      },
    });
  }, []);

  // Recenter map handler
  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.setView([12.5657, 104.991], 7.5);
    }
  };

  const mapTileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <Card glass className={cn("p-6 h-[900px] flex flex-col transition-all duration-300 relative", className)}>
      
      {/* Map Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 z-20 relative shrink-0">
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
        <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-0.5 rounded-xl self-start sm:self-center overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveMetric("temp_c")}
            title="Temperature overlay"
            className={cn(
              "p-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0",
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
              "p-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0",
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
              "p-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0",
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
              "p-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0",
              activeMetric === "humidity" 
                ? "bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Humidity</span>
          </button>
          <button
            onClick={() => setActiveMetric("plain")}
            title="Plain map boundaries"
            className={cn(
              "p-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0",
              activeMetric === "plain" 
                ? "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Plain</span>
          </button>
        </div>
      </div>

      {/* Interactive Map Display */}
      <div className="flex-1 min-h-0 rounded-2xl relative border border-slate-100 dark:border-white/[0.04] bg-slate-100 dark:bg-slate-900/50 z-10">
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
            <TileLayer url={mapTileUrl} attribution="&copy; OpenStreetMap contributors" />
            <MapController selectedProvince={selectedProvince} geoJsonData={geoJsonData} mapRef={mapRef} />
            {enrichedGeoJson && (
              <GeoJSON
                ref={geoJsonRef}
                data={enrichedGeoJson}
                style={styleFeature as StyleFunction}
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
  if (metric === "plain") return null;
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
