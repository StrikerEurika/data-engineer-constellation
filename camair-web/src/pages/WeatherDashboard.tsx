import { useState, useEffect } from "react";
// Sidebar is now handled by DashboardLayout
import { Header } from "../layout/Header";
import { MainWeatherCard } from "../components/weather/MainWeatherCard";
import { ForecastSection } from "../components/weather/ForecastSection";
import { WindCard } from "../components/weather/WindCard";
import { WeatherMap } from "../components/weather/WeatherMap";
import { AirQualityCard } from "../components/weather/AirQualityCard";
import { RainChanceCard } from "../components/weather/RainChanceCard";
import { UVIndexCard } from "../components/weather/UVIndexCard";
import type {
  WeatherCity,
  AirQualityData,
  RainChanceData,
  UVIndexData,
} from "../types/weather";

// Mock data
const mockCities: WeatherCity[] = [
  {
    id: "new-york",
    name: "New York",
    forecasts: [
      { date: "14", day: "Sun", temp: 25, condition: "sunny", icon: "☀️" },
      { date: "15", day: "Mon", temp: 24, condition: "rainy", icon: "🌧️" },
      {
        date: "16",
        day: "Tue",
        temp: 27,
        condition: "partly-cloudy",
        icon: "⛅",
      },
      {
        date: "17",
        day: "Wed",
        temp: 29,
        condition: "partly-cloudy",
        icon: "⛅",
      },
      { date: "18", day: "Thu", temp: 32, condition: "rainy", icon: "🌧️" },
      { date: "19", day: "Fri", temp: 34, condition: "sunny", icon: "☀️" },
      { date: "20", day: "Sat", temp: 31, condition: "cloudy", icon: "☁️" },
    ],
  },
  {
    id: "los-angeles",
    name: "Los Angeles",
    forecasts: [
      { date: "14", day: "Sun", temp: 28, condition: "sunny", icon: "☀️" },
      { date: "15", day: "Mon", temp: 27, condition: "sunny", icon: "☀️" },
      { date: "16", day: "Tue", temp: 29, condition: "sunny", icon: "☀️" },
      {
        date: "17",
        day: "Wed",
        temp: 30,
        condition: "partly-cloudy",
        icon: "⛅",
      },
      { date: "18", day: "Thu", temp: 28, condition: "cloudy", icon: "☁️" },
      { date: "19", day: "Fri", temp: 26, condition: "rainy", icon: "🌧️" },
      { date: "20", day: "Sat", temp: 27, condition: "sunny", icon: "☀️" },
    ],
  },
  {
    id: "chicago",
    name: "Chicago",
    forecasts: [
      { date: "14", day: "Sun", temp: 22, condition: "cloudy", icon: "☁️" },
      { date: "15", day: "Mon", temp: 20, condition: "rainy", icon: "🌧️" },
      {
        date: "16",
        day: "Tue",
        temp: 23,
        condition: "partly-cloudy",
        icon: "⛅",
      },
      { date: "17", day: "Wed", temp: 25, condition: "sunny", icon: "☀️" },
      { date: "18", day: "Thu", temp: 27, condition: "sunny", icon: "☀️" },
      { date: "19", day: "Fri", temp: 24, condition: "cloudy", icon: "☁️" },
      { date: "20", day: "Sat", temp: 22, condition: "rainy", icon: "🌧️" },
    ],
  },
  {
    id: "miami",
    name: "Miami",
    forecasts: [
      { date: "14", day: "Sun", temp: 32, condition: "sunny", icon: "☀️" },
      {
        date: "15",
        day: "Mon",
        temp: 33,
        condition: "partly-cloudy",
        icon: "⛅",
      },
      { date: "16", day: "Tue", temp: 31, condition: "rainy", icon: "🌧️" },
      { date: "17", day: "Wed", temp: 30, condition: "rainy", icon: "🌧️" },
      {
        date: "18",
        day: "Thu",
        temp: 32,
        condition: "partly-cloudy",
        icon: "⛅",
      },
      { date: "19", day: "Fri", temp: 34, condition: "sunny", icon: "☀️" },
      { date: "20", day: "Sat", temp: 35, condition: "sunny", icon: "☀️" },
    ],
  },
];

const mockAirQuality: AirQualityData[] = [
  { day: "Sun", clean: 35, average: 10, harmful: 5 },
  { day: "Mon", clean: 28, average: 15, harmful: 8 },
  { day: "Tue", clean: 42, average: 8, harmful: 3 },
  { day: "Wed", clean: 38, average: 12, harmful: 6 },
  { day: "Thu", clean: 45, average: 5, harmful: 2 },
  { day: "Fri", clean: 40, average: 10, harmful: 4 },
  { day: "Sat", clean: 32, average: 14, harmful: 7 },
  { day: "Sun", clean: 36, average: 11, harmful: 5 },
  { day: "Mon", clean: 30, average: 13, harmful: 6 },
  { day: "Tue", clean: 38, average: 9, harmful: 4 },
];

const mockRainChance: RainChanceData[] = [
  { day: "Sun", chance: 45 },
  { day: "Mon", chance: 62 },
  { day: "Tue", chance: 78 },
  { day: "Wed", chance: 35 },
  { day: "Thu", chance: 70 },
  { day: "Fri", chance: 20 },
  { day: "Sat", chance: 55 },
];

const mockUVIndex: UVIndexData[] = [
  { day: "Sun", value: 9, level: "high" },
  { day: "Mon", value: 5, level: "moderate" },
  { day: "Tue", value: 4, level: "moderate" },
  { day: "Wed", value: 7, level: "high" },
  { day: "Thu", value: 11, level: "very-high" },
  { day: "Fri", value: 6, level: "moderate" },
  { day: "Sat", value: 7, level: "high" },
];

export default function WeatherDashboard() {
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
    <>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Main weather card */}
        <MainWeatherCard
          location="New York, USA"
          temperature={25}
          condition="Sunny"
          high={27}
          low={10}
          feelsLike={24}
          sunrise="4:50 AM"
          sunset="6:54 PM"
          visibility={5}
          windSpeed={7.9}
          humidity={85}
        />

        {/* Forecast section */}
        <ForecastSection cities={mockCities} />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Wind card */}
        <WindCard
          speed={45}
          direction="W"
          directionDegrees={270}
          change={2.3}
          timeAgo="1 hours ago"
        />

        {/* Weather map */}
        <div className="lg:col-span-2">
          <WeatherMap />
        </div>
      </div>

      {/* Third row - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AirQualityCard data={mockAirQuality} />
        <RainChanceCard data={mockRainChance} />
        <UVIndexCard data={mockUVIndex} />
      </div>
    </>
  );
}
