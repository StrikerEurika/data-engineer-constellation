import type { PollutantType, AirQualityData } from "../types/air-quality.types";
import { POLLUTANT_CONFIG } from "../config/pollutant.config";

export const getProvinceColor = (
  value: number | null | undefined,
  pollutant: PollutantType,
): string => {
  if (!value && value !== 0) return "#cccccc";

  const config = POLLUTANT_CONFIG[pollutant];
  for (let i = 0; i < config.bins.length; i++) {
    if (value <= config.bins[i]) {
      return config.colors[i];
    }
  }
  return config.colors[config.colors.length - 1];
};

export const getHealthCategory = (
  value: number | null | undefined,
  pollutant: PollutantType,
): string => {
  if (!value && value !== 0) return "No Data";

  const config = POLLUTANT_CONFIG[pollutant];
  for (let i = 0; i < config.bins.length; i++) {
    if (value <= config.bins[i]) {
      return config.labels[i];
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
