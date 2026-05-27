import type { PollutantType, AirQualityData } from "../types/air-quality.types";
import { POLLUTANT_CONFIG } from "../config/pollutant.config";

export const getProvinceColor = (
  value: number | null | undefined,
  pollutant: PollutantType,
): string => {
  if (value === null || value === undefined) return "#cccccc";

  const config = POLLUTANT_CONFIG[pollutant];
  if (!config) return "#cccccc";

  for (let i = 0; i < config.bins.length; i++) {
    if (value <= config.bins[i]) {
      return config.colors[i] || config.colors[config.colors.length - 1];
    }
  }
  return config.colors[config.colors.length - 1];
};

export const getHealthCategory = (
  value: number | null | undefined,
  pollutant: PollutantType,
): string => {
  if (value === null || value === undefined) return "No Data";

  const config = POLLUTANT_CONFIG[pollutant];
  if (!config) return "No Data";

  for (let i = 0; i < config.bins.length; i++) {
    if (value <= config.bins[i]) {
      return config.labels[i] || config.labels[config.labels.length - 1];
    }
  }
  return config.labels[config.labels.length - 1];
};

export const getProvinceData = (
  provinceName: string,
  data: AirQualityData[],
): AirQualityData | undefined => {
  return data.find(
    (d) => d.province.toLowerCase() === provinceName.toLowerCase(),
  );
};
