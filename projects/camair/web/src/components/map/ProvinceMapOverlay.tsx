import { useCallback, useEffect, useState, useRef } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import L, { type LeafletEvent } from "leaflet";
import type {
  GeoJsonData,
  GeoJsonFeature,
  PollutantType,
  AirQualityRecord,
} from "@/types/air-quality.types";
import type { UVRecord } from "@/types/weather";
import { POLLUTANT_CONFIG } from "@/config/pollutant.config";
import { getAqiInfo } from "@/utils/aqi-utils";
import { getProvinceColor, getHealthCategory } from "@/utils/air-quality.utils";
import { formatToUTC7Intl } from "@/utils/time";

type ProvinceProperties = GeoJsonFeature["properties"];
type FeatureLayer = L.Path & {
  feature?: GeoJsonFeature;
  getBounds?: () => L.LatLngBounds;
};

interface ProvinceMapOverlayProps {
  geoJsonUrl: string;
  airQualityData: AirQualityRecord[];
  uvData?: UVRecord[];
  selectedProvince: string | null;
  onSelectProvince: (name: string) => void;
  selectedPollutant: PollutantType | "none";
}

function getNumericProperty(
  properties: ProvinceProperties | undefined,
  key: string,
): number | null {
  const value = properties?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function formatDate(value: unknown): string {
  if (!value) return "No Data";
  return formatToUTC7Intl(new Date(String(value).replace(" ", "T")));
}

function formatMetric(value: unknown, decimals = 1): string {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(decimals)
    : "N/A";
}

function normalizeProvinceName(value: string): string {
  return value.toLowerCase().trim();
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
  const config = POLLUTANT_CONFIG[pollutantKey] || POLLUTANT_CONFIG.pm2_5;

  const styleProvince = useCallback((feature?: GeoJsonFeature): L.PathOptions => {
    const props = feature?.properties;
    const name = props?.adm1_name;
    if (!props || !name) return {};

    const value = getNumericProperty(props, pollutantKey);
    const isSelected = selectedProvince === name;

    return {
      fillColor: getProvinceColor(value, pollutantKey),
      weight: isSelected ? 3 : 1.5,
      opacity: 1,
      color: isSelected ? "#1e293b" : "#ffffff",
      fillOpacity: isSelected ? 0.9 : 0.7,
    };
  }, [pollutantKey, selectedProvince]);

  const highlightProvince = (e: LeafletEvent) => {
    const layer = e.target as L.Path;
    layer.setStyle({
      weight: 3,
      color: "#334155",
      fillColor: layer.options.fillColor,
      fillOpacity: 0.85,
    });
    if (!L.Browser.ie && !L.Browser.edge && !L.Browser.opera) {
      layer.bringToFront();
    }
  };

  const resetHighlight = (e: LeafletEvent) => {
    const layer = e.target as FeatureLayer;
    if (layer.feature) {
      layer.setStyle(styleProvince(layer.feature));
    }
  };

  const onEachProvince = (feature: GeoJsonFeature, layer: L.Layer) => {
    const props = feature.properties;
    const name = props.adm1_name;
    const value = getNumericProperty(props, pollutantKey);
    const category = getHealthCategory(value, pollutantKey);

    const tooltipContent = value !== null
      ? `<div class="p-2 text-sm"><strong>${name}</strong><br/>${config.name}: ${formatMetric(value)} ${config.unit}<br/><span style="color: ${getProvinceColor(value, pollutantKey)}">${category}</span></div>`
      : `<div class="p-2 text-sm"><strong>${name}</strong><br/>No data</div>`;

    layer.bindTooltip(tooltipContent, {
      sticky: true,
      className: "custom-tooltip",
    });

    const aqiInfo = getAqiInfo(props.us_epa_index);
    const updatedAt = pollutantKey === "uv"
      ? formatDate(props.uv_last_updated ?? props.last_updated)
      : formatDate(props.last_updated);
    const selectedMetric = value !== null
      ? `
        <div style="background: #f8fafc; border-radius: 8px; padding: 8px 10px; margin-bottom: 10px; border: 1px solid #e2e8f0;">
          <span style="color: #64748b; display: block; font-size: 10px;">Selected Layer</span>
          <span style="font-weight: 700; color: ${getProvinceColor(value, pollutantKey)};">${config.name}: ${formatMetric(value)} ${config.unit}</span>
          <span style="display: block; font-size: 11px; color: #64748b;">${category}</span>
        </div>
      `
      : "";

    const popupContent = `
      <div style="padding: 8px; min-width: 220px; font-family: inherit;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <strong style="font-size: 14px;">${name}</strong>
          <span style="background: ${aqiInfo.hex}; color: white; padding: 2px 8px; border-radius: 9999px; font-size: 11px;">${aqiInfo.label}</span>
        </div>
        ${selectedMetric}
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
          <div style="background: #f1f5f9; border-radius: 8px; padding: 6px 8px;">
            <span style="color: #64748b; display: block; font-size: 10px;">PM2.5</span>
            <span style="font-weight: 600;">${formatMetric(props.pm2_5)} ug/m3</span>
          </div>
          <div style="background: #f1f5f9; border-radius: 8px; padding: 6px 8px;">
            <span style="color: #64748b; display: block; font-size: 10px;">PM10</span>
            <span style="font-weight: 600;">${formatMetric(props.pm10)} ug/m3</span>
          </div>
          <div style="background: #f1f5f9; border-radius: 8px; padding: 6px 8px;">
            <span style="color: #64748b; display: block; font-size: 10px;">O3</span>
            <span style="font-weight: 600;">${formatMetric(props.o3)} ug/m3</span>
          </div>
          <div style="background: #f1f5f9; border-radius: 8px; padding: 6px 8px;">
            <span style="color: #64748b; display: block; font-size: 10px;">NO2</span>
            <span style="font-weight: 600;">${formatMetric(props.no2)} ug/m3</span>
          </div>
          <div style="background: #f1f5f9; border-radius: 8px; padding: 6px 8px;">
            <span style="color: #64748b; display: block; font-size: 10px;">SO2</span>
            <span style="font-weight: 600;">${formatMetric(props.so2)} ug/m3</span>
          </div>
          <div style="background: #f1f5f9; border-radius: 8px; padding: 6px 8px;">
            <span style="color: #64748b; display: block; font-size: 10px;">CO</span>
            <span style="font-weight: 600;">${formatMetric(props.co)} ug/m3</span>
          </div>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
          <span>US EPA: ${props.us_epa_index ?? "N/A"}</span>
          <span>DEFRA: ${props.gb_defra_index ?? "N/A"}</span>
        </div>
        <p style="font-size: 10px; color: #94a3b8; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
          Updated: ${updatedAt}
        </p>
      </div>
    `;
    layer.bindPopup(popupContent, { closeButton: false, offset: [0, -10] });

    layer.on({
      click: () => {
        onSelectProvince(name);
      },
      mouseover: highlightProvince,
      mouseout: resetHighlight,
    } as L.LeafletEventHandlerFnMap);
  };

  useEffect(() => {
    geoJsonRef.current?.eachLayer((layer) => {
      const featureLayer = layer as FeatureLayer;
      if (featureLayer.feature?.properties?.adm1_name === selectedProvince) {
        const bounds = featureLayer.getBounds?.();
        if (bounds) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
      }
    });
  }, [selectedProvince, map]);

  useEffect(() => {
    geoJsonRef.current?.eachLayer((layer) => {
      const featureLayer = layer as FeatureLayer;
      if (featureLayer.feature) {
        featureLayer.setStyle(styleProvince(featureLayer.feature));
      }
    });
  }, [styleProvince]);

  return (
    <GeoJSON
      key={pollutantKey}
      data={geoJsonData}
      style={styleProvince as L.StyleFunction}
      onEachFeature={onEachProvince as L.GeoJSONOptions["onEachFeature"]}
      ref={geoJsonRef}
    />
  );
}

export function ProvinceMapOverlay({
  geoJsonUrl,
  airQualityData,
  uvData = [],
  selectedProvince,
  onSelectProvince,
  selectedPollutant,
}: ProvinceMapOverlayProps) {
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonData | null>(null);

  useEffect(() => {
    fetch(geoJsonUrl)
      .then((res) => res.json())
      .then((data) => setGeoJsonData(data as GeoJsonData))
      .catch(() => setGeoJsonData(null));
  }, [geoJsonUrl]);

  if (!geoJsonData || selectedPollutant === "none") return null;

  const airQualityByProvince = new Map(
    airQualityData.map((record) => [normalizeProvinceName(record.name), record]),
  );
  const uvByProvince = new Map(
    uvData.map((record) => [normalizeProvinceName(record.name), record]),
  );

  const enrichedGeoJsonData: GeoJsonData = {
    ...geoJsonData,
    features: geoJsonData.features.map((feature) => {
      const provinceName = normalizeProvinceName(feature.properties.adm1_name);
      const airQuality = airQualityByProvince.get(provinceName);
      const uv = uvByProvince.get(provinceName);

      return {
        ...feature,
        properties: {
          ...feature.properties,
          ...(airQuality ?? {}),
          uv: uv?.uv ?? feature.properties.uv,
          uv_last_updated: uv?.last_updated,
        },
      };
    }),
  };

  return (
    <ProvinceGeoJSON
      geoJsonData={enrichedGeoJsonData}
      selectedProvince={selectedProvince}
      onSelectProvince={onSelectProvince}
      selectedPollutant={selectedPollutant}
    />
  );
}
