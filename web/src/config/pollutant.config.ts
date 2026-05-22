import type { PollutantConfig, PollutantType } from "@/types/air-quality.types";

export const POLLUTANT_CONFIG: Record<PollutantType, PollutantConfig> = {
  pm2_5: {
    name: "PM2.5",
    unit: "μg/m³",
    bins: [0, 12, 35.4, 150, 250, 500],
    colors: ["#00e400", "#ffff00", "#ff7e00", "#ff0000", "#990000"],
    labels: [
      "Good",
      "Moderate",
      "Unhealthy for Sensitive",
      "Unhealthy",
      "Hazardous",
    ],
  },
  pm10: {
    name: "PM10",
    unit: "μg/m³",
    bins: [0, 54, 154, 254, 354, 604],
    colors: ["#00e400", "#ffff00", "#ff7e00", "#ff0000", "#990000"],
    labels: [
      "Good",
      "Moderate",
      "Unhealthy for Sensitive",
      "Unhealthy",
      "Hazardous",
    ],
  },
  no2: {
    name: "NO2",
    unit: "ppb",
    bins: [0, 53, 100, 200, 400, 600],
    colors: ["#00e400", "#ffff00", "#ff7e00", "#ff0000", "#990000"],
    labels: [
      "Good",
      "Moderate",
      "Unhealthy for Sensitive",
      "Unhealthy",
      "Hazardous",
    ],
  },
  o3: {
    name: "O3",
    unit: "ppb",
    bins: [0, 54, 70, 85, 105, 200],
    colors: ["#00e400", "#ffff00", "#ff7e00", "#ff0000", "#990000"],
    labels: [
      "Good",
      "Moderate",
      "Unhealthy for Sensitive",
      "Unhealthy",
      "Hazardous",
    ],
  },
  so2: {
    name: "SO2",
    unit: "ppb",
    bins: [0, 35, 75, 185, 300, 500],
    colors: ["#00e400", "#ffff00", "#ff7e00", "#ff0000", "#990000"],
    labels: [
      "Good",
      "Moderate",
      "Unhealthy for Sensitive",
      "Unhealthy",
      "Hazardous",
    ],
  },
  co: {
    name: "CO",
    unit: "ppm",
    bins: [0, 4.4, 9.4, 12.4, 15.4, 30],
    colors: ["#00e400", "#ffff00", "#ff7e00", "#ff0000", "#990000"],
    labels: [
      "Good",
      "Moderate",
      "Unhealthy for Sensitive",
      "Unhealthy",
      "Hazardous",
    ],
  },
};

export const POLLUTANT_OPTIONS: { value: PollutantType; label: string }[] = [
  { value: "pm2_5", label: "PM₂.₅" },
  { value: "pm10", label: "PM₁₀" },
  { value: "no2", label: "NO₂" },
  { value: "o3", label: "O₃" },
  { value: "so2", label: "SO₂" },
  { value: "co", label: "CO" },
];
