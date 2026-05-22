import type { ReactNode } from "react";

export type PollutantType = "pm2_5" | "pm10" | "o3" | "no2" | "so2" | "co";

export interface PollutantConfig {
  name: string;
  nameJSX?: ReactNode;
  unit: string;
  bins: number[];
  colors: string[];
  labels: string[];
}

export interface GeoJsonFeature {
  type: "Feature";
  properties: {
    adm1_name: string;
    adm1_name1?: string | null;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
}

export interface GeoJsonData {
  type: "FeatureCollection";
  name: string;
  crs: {
    type: string;
    properties: {
      name: string;
    };
  };
  features: GeoJsonFeature[];
}

export interface AirQualityData {
  province: string;
  pm2_5: number;
  pm10: number;
  no2: number;
  o3: number;
  so2: number;
  co: number;
  timestamp?: string;
}

export interface AirQualityRecord {
  id: number;
  name: string;
  co: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
  us_epa_index: number;
  gb_defra_index: number;
  last_updated: string;
  last_updated_epoch: number;
  created_at: string;
  lat?: number;
  lng?: number;
}

export interface ApiResponse {
  data: AirQualityRecord[];
}

export type AqiCategory =
  | "Good"
  | "Moderate"
  | "Unhealthy for Sensitive Groups"
  | "Unhealthy"
  | "Very Unhealthy"
  | "Hazardous";

export interface AqiInfo {
  label: AqiCategory;
  color: string;
  textColor: string;
  borderColor: string;
  hex: string;
  range: string;
  aqiMin: number;
  aqiMax: number;
}

export type SortField = keyof AirQualityRecord;
export type SortDirection = "asc" | "desc";
