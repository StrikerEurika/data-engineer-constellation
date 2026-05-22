import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";

import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { AirQualityRecord, PollutantType } from "@/types/air-quality.types";
import { ProvinceMapOverlay } from "@/components/map/ProvinceMapOverlay";
import cambodiaGeoJsonUrl from "@/assets/geoData/cambodia-provinces.geojson?url";

function MapInitHandler({
  mapRef,
  onReady,
}: {
  mapRef: React.MutableRefObject<LeafletMap | null>;
  onReady: () => void;
}) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
    onReady();
  }, [map, mapRef, onReady]);
  return null;
}

interface MapProps {
  center: [number, number];
  zoom: number;
  loading: boolean;
  filteredData: AirQualityRecord[];
  selectedProvince: string | null;
  onProvinceSelect: (name: string) => void;
  mapRef: React.MutableRefObject<LeafletMap | null>;
  onMapReady: () => void;
  selectedPollutant: PollutantType | "none";
}

export function Map({
  center,
  zoom,
  loading,
  filteredData,
  selectedProvince,
  onProvinceSelect,
  mapRef,
  onMapReady,
  selectedPollutant,
}: MapProps) {
  if (loading) {
    return (
      <div className="absolute inset-0 skeleton flex items-center justify-center">
        <span className="text-slate-500 dark:text-slate-400">
          Loading map...
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={zoom}
        className="z-10 h-full w-full"
        zoomControl={false}
        attributionControl={false}
      >
        <MapInitHandler mapRef={mapRef} onReady={onMapReady} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <ProvinceMapOverlay
          geoJsonUrl={cambodiaGeoJsonUrl}
          airQualityData={filteredData}
          selectedProvince={selectedProvince}
          onSelectProvince={onProvinceSelect}
          selectedPollutant={selectedPollutant}
        />
      </MapContainer>
    </div>
  );
}
