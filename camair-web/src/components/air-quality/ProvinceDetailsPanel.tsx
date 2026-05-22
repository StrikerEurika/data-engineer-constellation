import { Target, Activity, Bell, TrendingUp, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { AqiGauge, PollutantChart } from "@/components/air-quality";
import type { AirQualityRecord } from "@/types/air-quality.types";

interface ProvinceDetailsPanelProps {
  selectedRecord: AirQualityRecord | null;
}

export function ProvinceDetailsPanel({ selectedRecord }: ProvinceDetailsPanelProps) {
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
              {/* <div className="flex gap-3 mt-6">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                  <Check className="w-4 h-4" />
                  Watchlist
                </button>
                <button className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <TrendingUp className="w-5 h-5" />
                </button>
              </div> */}
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
