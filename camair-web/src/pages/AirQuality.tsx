import { useState, useEffect, useRef } from "react";
import { Cloud, Layers } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { fetchAirQuality } from "@/services/airQualityService";
import type { AirQualityRecord, PollutantType } from "@/types/air-quality.types";
import {
  ViewOptionsPanel,
  ProvinceTable,
  StatsCards,
  Map,
  MapNavigators,
  PollutantSelector,
  MapSearchBar,
  ProvinceDetailsPanel,
  HealthTipsBanner,
} from "@/components/air-quality";
import { Header } from "@/layout/Header";
import { Button } from "@/components/ui/button";
import type { Map as LeafletMap } from "leaflet";

const VIEW_OPTIONS = [
  { id: "pm25", label: "PM2.5", enabled: true },
  { id: "pm10", label: "PM10", enabled: true },
  { id: "o3", label: "O3", enabled: true },
  { id: "no2", label: "NO2", enabled: true },
  { id: "so2", label: "SO2", enabled: false },
  { id: "co", label: "CO", enabled: false },
  { id: "aqi-color", label: "AQI Color Area", enabled: true },
];

export default function AirQuality() {
  const [data, setData] = useState<AirQualityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [viewOptionsOpen, setViewOptionsOpen] = useState(false);
  const [viewOptions, setViewOptions] = useState(VIEW_OPTIONS);
  const [selectedPollutant, setSelectedPollutant] = useState<PollutantType | "none">("none");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMapReady, setIsMapReady] = useState(false);

  const mapRef = useRef<LeafletMap | null>(null);
  const DEFAULT_CENTER: [number, number] = [12.5657, 104.991];
  const DEFAULT_ZOOM = 7.5;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetchAirQuality();
      setData(response.data);
      const phnomPenh = response.data.find((r) => r.name === "Phnom Penh");
      if (phnomPenh) {
        setSelectedProvince("Phnom Penh");
      }
    } catch (error) {
      console.warn("API unavailable, using mock data:", error);
      const response = await fetchAirQuality();
      setData(response.data);
      setSelectedProvince("Phnom Penh");
    } finally {
      setLoading(false);
    }
  };

  const toggleOption = (id: string) => {
    setViewOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, enabled: !o.enabled } : o)),
    );
  };

  const handleApply = () => {
    setViewOptionsOpen(false);
  };

  const selectedRecord = data.find((r) => r.name === selectedProvince) || null;

  const filteredData = data.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const stats = {
    provinces: data.length,
    goodCount: data.filter((r) => r.us_epa_index === 1).length,
    moderateCount: data.filter((r) => r.us_epa_index === 2).length,
    unhealthyCount: data.filter((r) => r.us_epa_index >= 3).length,
  };

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

  return (
    <div className="space-y-6">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <StatsCards
        provinces={stats.provinces}
        goodCount={stats.goodCount}
        moderateCount={stats.moderateCount}
        unhealthyCount={stats.unhealthyCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card glass className="overflow-hidden h-full">
            <div className="relative h-full min-h-137.5">
              {isMapReady && (
                <>
                  {/* View Options Button (Linked to View Options Panel) */}
                  <Button
                    onClick={() => setViewOptionsOpen(true)}
                    className="absolute left-4 top-4 z-50 flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Cloud className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      View Options
                    </span>
                  </Button>

                  {/* search bars */}
                  <MapSearchBar value={searchQuery} onChange={setSearchQuery} />

                  {/* Pollutant selector for overlays */}
                  <PollutantSelector
                    selected={selectedPollutant}
                    onSelect={setSelectedPollutant}
                  />
                </>
              )}

              {/* Map Display (Only map) */}
              <Map
                center={DEFAULT_CENTER}
                zoom={DEFAULT_ZOOM}
                loading={loading}
                filteredData={filteredData}
                selectedProvince={selectedProvince}
                onProvinceSelect={setSelectedProvince}
                mapRef={mapRef}
                onMapReady={() => setIsMapReady(true)}
                selectedPollutant={selectedPollutant}
              />

              {/* map navigatros  */}
              {isMapReady && (
                <MapNavigators
                  center={DEFAULT_CENTER}
                  zoom={DEFAULT_ZOOM}
                  mapRef={mapRef}
                />
              )}

              {/* View Options Panel (Openned when View Options is clicked) */}
              <ViewOptionsPanel
                isOpen={viewOptionsOpen}
                onClose={() => setViewOptionsOpen(false)}
                options={viewOptions}
                onToggle={toggleOption}
                onApply={handleApply}
              />
            </div>
          </Card>
        </div>

        <ProvinceDetailsPanel selectedRecord={selectedRecord} />
      </div>

      <Card glass>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-500" />
              Province Air Quality Overview
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProvinceTable
            data={filteredData}
            selectedProvince={selectedProvince}
            onSelectProvince={setSelectedProvince}
          />
        </CardContent>
      </Card>

      {/* Health Tips Banner */}
      {/* <HealthTipsBanner stats={stats} /> */}
    </div>
  );
}
