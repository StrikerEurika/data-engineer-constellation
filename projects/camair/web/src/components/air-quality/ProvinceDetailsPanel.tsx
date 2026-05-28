import { Target, Activity, Cloud, Sun, Droplets, Wind } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { AqiGauge, PollutantChart } from "@/components/air-quality";
import type { AirQualityRecord } from "@/types/air-quality.types";
import type { UVRecord, WeatherRecord } from "@/types/weather";

interface ProvinceDetailsPanelProps {
  selectedRecord: AirQualityRecord | null;
  selectedWeather?: WeatherRecord | null;
  selectedUV?: UVRecord | null;
  isLoading?: boolean;
}

export function ProvinceDetailsPanel({
  selectedRecord,
  selectedWeather,
  selectedUV,
  isLoading = false,
}: ProvinceDetailsPanelProps) {
  const uvValue = selectedUV?.uv ?? selectedWeather?.uv;

  return (
    <div className="space-y-6">
      <Card glass>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Current AQI
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedRecord ? (
            <>
              <AqiGauge
                value={selectedRecord.pm2_5}
                label={selectedRecord.name}
                usEpaIndex={selectedRecord.us_epa_index}
                gbDefraIndex={selectedRecord.gb_defra_index}
              />
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">
              Select a province on the map
            </div>
          )}
        </CardContent>
      </Card>

      <Card glass>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-500" />
              Weather Summary
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 min-h-68">
              <div className="grid grid-cols-2 gap-4">
                <div className="skeleton h-16 rounded-xl" />
                <div className="skeleton h-16 rounded-xl" />
                <div className="skeleton h-16 rounded-xl" />
                <div className="skeleton h-16 rounded-xl" />
              </div>

              <div className="skeleton h-14 rounded-xl" />
            </div>
          ) : selectedWeather ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center">
                    <Sun className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Temp
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedWeather.temp_c}°C
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Humidity
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedWeather.humidity}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center">
                    <Sun className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      UV Index
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {uvValue ?? "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-500/10 flex items-center justify-center">
                    <Wind className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Wind
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedWeather.wind_kph} km/h
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedWeather.condition_icon}
                    alt={selectedWeather.condition_text}
                    className="w-8 h-8"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {selectedWeather.condition_text}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  Feels like {selectedWeather.feelslike_c}°
                </span>
              </div>
            </>
          ) : (
            <div className="flex min-h-68 items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400">
              Weather data unavailable
            </div>
          )}
        </CardContent>
      </Card>

      {!selectedWeather && uvValue !== undefined && (
        <Card glass>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-purple-500" />
                UV Index
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Current UV
              </span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {uvValue}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card glass>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Pollutant Breakdown
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PollutantChart data={selectedRecord} />
        </CardContent>
      </Card>
    </div>
  );
}
