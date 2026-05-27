import { useEffect, useState, useRef } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import L, { type LeafletEvent } from "leaflet";
import type {
  GeoJsonData,
  GeoJsonFeature,
  PollutantType,
  AirQualityRecord,
} from "@/types/air-quality.types";
import { POLLUTANT_CONFIG } from "@/config/pollutant.config";
import { getAqiInfo } from "@/utils/aqi-utils";
import { getProvinceColor, getHealthCategory } from "@/utils/air-quality.utils";

import { formatToUTC7Intl } from "@/utils/time";

interface ProvinceMapOverlayProps {
  airQualityData: AirQualityRecord[];
  selectedProvince: string | null;
  onSelectProvince: (name: string) => void;
  selectedPollutant: PollutantType | "none";
}

function ProvinceGeoJSON({
  geoJsonData,
  selectedProvince,
  onSelectProvince,
  selectedPollutant,
}: {
  geoJsonData: GeoJsonData;
  selectedProvince: string | null;
  onSelectProvince: (name: string) => void;
  selectedPollutant: PollutantType;
}) {
  const map = useMap();
  const geoJsonRef = useRef<L.GeoJSON | null>(null);
  const pollutantKey = selectedPollutant;
  const config = POLLUTANT_CONFIG[pollutantKey];

  const styleProvince = (feature?: GeoJsonFeature) => {
    if (!feature) return {};
    const name = feature.properties.adm1_name;
    const value = (feature.properties as any)[pollutantKey] ?? null;
    const isSelected = selectedProvince === name;

    return {
      fillColor: getProvinceColor(value, pollutantKey),
      weight: isSelected ? 3 : 1.5,
      opacity: 1,
      color: isSelected ? "#1e293b" : "#ffffff",
      fillOpacity: isSelected ? 0.9 : 0.7,
    };
  };

  const highlightProvince = (e: LeafletEvent) => {
    const layer = e.target as L.Path;
    const currentStyle = (layer as any).options || {};
    layer.setStyle({
      weight: 3,
      color: "#334155",
      fillColor: currentStyle.fillColor,
      fillOpacity: 0.85,
    });
    layer.bringToFront();
  };

  const resetHighlight = (e: LeafletEvent) => {
    const layer = e.target as L.Path;
    const feat = (layer as any).feature as GeoJsonFeature | undefined;
    if (feat) {
      layer.setStyle(styleProvince(feat) as L.PathOptions);
    }
  };

  const onEachProvince = (feature: GeoJsonFeature, layer: L.Layer) => {
    const props = feature.properties as any;
    const name = props.adm1_name;
    const value = props[pollutantKey] ?? null;
    const category = getHealthCategory(value, pollutantKey);

    const tooltipContent = value !== null
      ? `<div class="p-2 text-sm"><strong>${name}</strong><br/>${config.name}: ${value} ${config.unit}<br/><span style="color: ${getProvinceColor(value, pollutantKey)}">${category}</span></div>`
      : `<div class="p-2 text-sm"><strong>${name}</strong><br/>No data</div>`;

    layer.bindTooltip(tooltipContent, {
      sticky: true,
      className: "custom-tooltip",
    });

    if (value !== null) {
      const aqiInfo = getAqiInfo(props.us_epa_index);
      const popupContent = `
        <div style="padding: 8px; min-width: 220px; font-family: inherit;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <strong style="font-size: 14px;">${name}</strong>
            <span style="background: ${aqiInfo.hex}; color: white; padding: 2px 8px; border-radius: 9999px; font-size: 11px;">${aqiInfo.label}</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
            <div style="background: #f1f5f9; border-radius: 8px; padding: 6px 8px;">
              <span style="color: #64748b; display: block; font-size: 10px;">PM2.5</span>
              <span style="font-weight: 600;">${Number(props.pm2_5).toFixed(1)} µg/m³</span>
            </div>
            <div style="background: #f1f5f9; border-radius: 8px; padding: 6px 8px;">
              <span style="color: #64748b; display: block; font-size: 10px;">PM10</span>
              <span style="font-weight: 600;">${Number(props.pm10).toFixed(1)} µg/m³</span>
            </div>
            <div style="background: #f1f5f9; border-radius: 8px; padding: 6px 8px;">
              <span style="color: #64748b; display: block; font-size: 10px;">O3</span>
              <span style="font-weight: 600;">${Number(props.o3).toFixed(1)} µg/m³</span>
            </div>
            <div style="background: #f1f5f9; border-radius: 8px; padding: 6px 8px;">
              <span style="color: #64748b; display: block; font-size: 10px;">NO2</span>
              <span style="font-weight: 600;">${Number(props.no2).toFixed(1)} µg/m³</span>
            </div>
            <div style="background: #f1f5f9; border-radius: 8px; padding: 6px 8px;">
              <span style="color: #64748b; display: block; font-size: 10px;">SO2</span>
              <span style="font-weight: 600;">${Number(props.so2).toFixed(1)} µg/m³</span>
            </div>
            <div style="background: #f1f5f9; border-radius: 8px; padding: 6px 8px;">
              <span style="color: #64748b; display: block; font-size: 10px;">CO</span>
              <span style="font-weight: 600;">${Number(props.co).toFixed(1)} µg/m³</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
            <span>US EPA: ${props.us_epa_index}</span>
            <span>DEFRA: ${props.gb_defra_index}</span>
          </div>
          <p style="font-size: 10px; color: #94a3b8; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
            Updated: ${props.last_updated ? formatToUTC7Intl(new Date(props.last_updated)) : "No Data"}
          </p>
        </div>
      `;
      layer.bindPopup(popupContent, { closeButton: false, offset: [0, -10] });
    }

    layer.on({
      click: () => {
        onSelectProvince(name);
      },
      mouseover: highlightProvince,
      mouseout: resetHighlight,
    } as L.LeafletEventHandlerFnMap);
  };

  useEffect(() => {
    if (geoJsonRef.current && selectedProvince) {
      geoJsonRef.current.eachLayer((layer) => {
        const feat = (layer as L.GeoJSON).feature as GeoJsonFeature | undefined;
        if (feat?.properties.adm1_name === selectedProvince) {
          const bounds = (layer as any).getBounds?.();
          if (bounds) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
        }
      });
    }
  }, [selectedProvince, map]);

  const geoJsonKey = `${pollutantKey}-${selectedProvince ?? "none"}`;

  return (
    <GeoJSON
      key={geoJsonKey}
      data={geoJsonData as any}
      style={styleProvince as any}
      onEachFeature={onEachProvince as any}
      ref={geoJsonRef}
    />
  );
}

export function ProvinceMapOverlay({
  airQualityData,
  selectedProvince,
  onSelectProvince,
  selectedPollutant,
}: ProvinceMapOverlayProps) {
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonData | null>(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    fetch(`${apiUrl}/api/v1/provinces/geojson`)
      .then((res) => res.json())
      .then((data) => setGeoJsonData(data as GeoJsonData))
      .catch(() => setGeoJsonData(null));
  }, []);

  if (!geoJsonData || selectedPollutant === "none") return null;

  return (
    <ProvinceGeoJSON
      geoJsonData={geoJsonData}
      selectedProvince={selectedProvince}
      onSelectProvince={onSelectProvince}
      selectedPollutant={selectedPollutant}
    />
  );
}
