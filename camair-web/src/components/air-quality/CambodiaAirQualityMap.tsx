// components/CambodiaAirQualityMap.tsx
import React, { useState, useEffect, useRef } from "react";
import { MapContainer, GeoJSON, TileLayer } from "react-leaflet";
import L, { type LeafletEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import type {
  GeoJsonData,
  GeoJsonFeature,
  AirQualityData,
  PollutantType,
} from "@/types/air-quality.types";
import { POLLUTANT_CONFIG, POLLUTANT_OPTIONS } from "@/config/pollutant.config";
import {
  getProvinceColor,
  getHealthCategory,
  getProvinceData,
} from "@/utils/air-quality.utils";

// Fix Leaflet default icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface CambodiaAirQualityMapProps {
  geoJsonData: GeoJsonData;
  airQualityData: AirQualityData[];
  initialPollutant?: PollutantType;
  center?: [number, number];
  zoom?: number;
}

interface SelectedProvince {
  name: string;
  data: AirQualityData;
  category: string;
  value: number;
}

const CambodiaAirQualityMap: React.FC<CambodiaAirQualityMapProps> = ({
  geoJsonData,
  airQualityData,
  initialPollutant = "pm2_5",
  center = [12.5657, 104.991],
  zoom = 6.5,
}) => {
  const [selectedPollutant, setSelectedPollutant] =
    useState<PollutantType>(initialPollutant);
  const [selectedProvince, setSelectedProvince] =
    useState<SelectedProvince | null>(null);
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  // Style function for GeoJSON layers
  const styleProvince = (feature: GeoJsonFeature) => {
    const provinceName = feature.properties.adm1_name;
    const provinceData = getProvinceData(provinceName, airQualityData);
    const value = provinceData ? provinceData[selectedPollutant] : null;

    return {
      fillColor: getProvinceColor(value, selectedPollutant),
      weight: 1.5,
      opacity: 1,
      color: "#ffffff",
      fillOpacity: 0.8,
      dashArray: undefined,
    };
  };

  // Highlight province on hover
  const highlightProvince = (e: LeafletEvent) => {
    const layer = e.target as L.GeoJSON;
    layer.setStyle({
      weight: 3,
      color: "#333333",
      fillOpacity: 0.9,
    });
    layer.bringToFront();
  };

  const resetHighlight = (e: LeafletEvent) => {
    const layer = e.target as L.GeoJSON;
    if (geoJsonRef.current) {
      const originalStyle = styleProvince(layer.feature as unknown as GeoJsonFeature);
      layer.setStyle(originalStyle);
    }
  };

  // On each feature - add interactions
  const onEachProvince = (feature: GeoJsonFeature, layer: L.Layer) => {
    const provinceName = feature.properties.adm1_name;
    const provinceData = getProvinceData(provinceName, airQualityData);

    if (provinceData) {
      const value = provinceData[selectedPollutant];
      const category = getHealthCategory(value, selectedPollutant);
      const config = POLLUTANT_CONFIG[selectedPollutant];

      const tooltipContent = `
        <div class="p-2 font-sans text-sm">
          <strong class="text-gray-900">${provinceName}</strong><br/>
          <span class="text-gray-700">${config.name}: ${value !== null ? value + " " + config.unit : "No data"}</span><br/>
          <span class="font-semibold" style="color: ${getProvinceColor(value, selectedPollutant)}">
            ${category}
          </span>
        </div>
      `;

      layer.bindTooltip(tooltipContent, {
        sticky: true,
        className: "custom-tooltip",
      });

      layer.on({
        click: () => {
          setSelectedProvince({
            name: provinceName,
            data: provinceData,
            category: category,
            value: value || 0,
          });
        },
        mouseover: highlightProvince,
        mouseout: resetHighlight,
      } as L.LeafletEventHandlerFnMap);
    } else {
      layer.bindTooltip(
        `<div class="p-2"><strong>${provinceName}</strong><br/>No data available</div>`,
        { sticky: true },
      );
    }
  };

  // Update styles when pollutant changes
  useEffect(() => {
    if (geoJsonRef.current) {
      geoJsonRef.current.eachLayer((layer: L.Layer) => {
        const geoJsonLayer = layer as L.GeoJSON;
        if (geoJsonLayer.feature) {
          const newStyle = styleProvince(
            geoJsonLayer.feature as unknown as GeoJsonFeature,
          );
          geoJsonLayer.setStyle(newStyle);

          // Update tooltip
          const provinceName = (geoJsonLayer.feature as unknown as GeoJsonFeature)
            .properties.adm1_name;
          const provinceData = getProvinceData(provinceName, airQualityData);

          if (provinceData) {
            const value = provinceData[selectedPollutant];
            const category = getHealthCategory(value, selectedPollutant);
            const config = POLLUTANT_CONFIG[selectedPollutant];

            const tooltipContent = `
              <div class="p-2 font-sans text-sm">
                <strong class="text-gray-900">${provinceName}</strong><br/>
                <span class="text-gray-700">${config.name}: ${value !== null ? value + " " + config.unit : "No data"}</span><br/>
                <span class="font-semibold" style="color: ${getProvinceColor(value, selectedPollutant)}">
                  ${category}
                </span>
              </div>
            `;

            geoJsonLayer.unbindTooltip();
            geoJsonLayer.bindTooltip(tooltipContent, {
              sticky: true,
              className: "custom-tooltip",
            });
          }
        }
      });
    }
  }, [selectedPollutant, airQualityData]);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      {/* Pollutant Selector */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-md p-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Pollutant
        </label>
        <select
          value={selectedPollutant}
          onChange={(e) =>
            setSelectedPollutant(e.target.value as PollutantType)
          }
          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          {POLLUTANT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white rounded-lg shadow-md p-3 min-w-[180px]">
        <strong className="text-sm text-gray-900 block mb-2">
          {POLLUTANT_CONFIG[selectedPollutant].name}
        </strong>
        <div className="space-y-1">
          {POLLUTANT_CONFIG[selectedPollutant].bins.map((bin, index) => {
            const prevBin =
              index > 0
                ? POLLUTANT_CONFIG[selectedPollutant].bins[index - 1]
                : 0;
            const range =
              index === 0
                ? `0-${bin}`
                : index === POLLUTANT_CONFIG[selectedPollutant].bins.length - 1
                  ? `> ${prevBin}`
                  : `${prevBin + 1}-${bin}`;

            return (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div
                  className="w-4 h-4 rounded-sm border border-gray-300"
                  style={{
                    backgroundColor:
                      POLLUTANT_CONFIG[selectedPollutant].colors[index],
                  }}
                />
                <span className="text-gray-600">
                  {range} {POLLUTANT_CONFIG[selectedPollutant].unit}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200">
          {POLLUTANT_CONFIG[selectedPollutant].labels.map((label, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs mt-1">
              <span
                style={{
                  color: POLLUTANT_CONFIG[selectedPollutant].colors[idx],
                }}
              >
                ●
              </span>
              <span className="text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info Panel */}
      {selectedProvince && (
        <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-md p-4 max-w-[280px]">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedProvince.name}
            </h3>
            <button
              onClick={() => setSelectedProvince(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2">
            {POLLUTANT_OPTIONS.map(({ value, label }) => {
              const val = selectedProvince.data[value];
              if (val === undefined) return null;
              const config = POLLUTANT_CONFIG[value];
              return (
                <div key={value} className="text-sm">
                  <span className="font-medium text-gray-700">{label}:</span>{" "}
                  <span className="text-gray-900">
                    {val} {config.unit}
                  </span>
                  <span
                    className="ml-2 text-xs font-medium px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: getProvinceColor(val, value),
                      color:
                        getProvinceColor(val, value) === "#ffff00"
                          ? "#000"
                          : "#fff",
                    }}
                  >
                    {getHealthCategory(val, value)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              ⚠️ Health recommendations based on WHO standards
            </p>
          </div>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CartoDB'
        />

        <GeoJSON
          data={geoJsonData as any}
          style={styleProvince as any}
          onEachFeature={onEachProvince as any}
          ref={geoJsonRef}
        />
      </MapContainer>

      {/* Global styles for tooltips */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-tooltip {
          background: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
          font-family: ui-sans-serif, system-ui, sans-serif !important;
          padding: 0 !important;
        }
        .custom-tooltip::before {
          display: none;
        }
        .leaflet-tooltip-top:before,
        .leaflet-tooltip-bottom:before,
        .leaflet-tooltip-left:before,
        .leaflet-tooltip-right:before {
          display: none !important;
        }
      ` }} />
    </div>
  );
};

export default CambodiaAirQualityMap;
