// Pollutant Bar Chart Component
import { BarChart } from "recharts";
import {
  Bar,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// type
import type { AirQualityRecord } from "@/types/air-quality.types";

export function PollutantChart({ data }: { data: AirQualityRecord | null }) {
  if (!data) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        Select a province to view pollutant breakdown
      </div>
    );
  }

  const chartData = [
    { name: "PM2.5", value: data.pm2_5, fill: "#ec4899" },
    { name: "PM10", value: data.pm10, fill: "#f59e0b" },
    { name: "O3", value: data.o3, fill: "#8b5cf6" },
    { name: "NO2", value: data.no2, fill: "#ef4444" },
    { name: "SO2", value: data.so2, fill: "#06b6d4" },
    { name: "CO", value: data.co / 10, fill: "#10b981" }, // Scale down CO for visualization
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="oklch(var(--border))"
          />
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "var(--foreground)" }}
            width={50}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                const actualValue = d.name === "CO" ? d.value * 10 : d.value;
                return (
                  <div className="bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 p-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: d.fill }}
                      />
                      <span className="font-medium text-slate-900 dark:text-slate-200">
                        {d.name}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {actualValue.toFixed(1)}{" "}
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                        µg/m³
                      </span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
