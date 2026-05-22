import { Cloud, Wind, Thermometer, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

interface StatsCardsProps {
  provinces: number;
  goodCount: number;
  moderateCount: number;
  unhealthyCount: number;
}

export function StatsCards({ provinces, goodCount, moderateCount, unhealthyCount }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card glass>
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Provinces</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{provinces}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card glass>
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
              <Cloud className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Good AQI</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{goodCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card glass>
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-500/10 flex items-center justify-center">
              <Thermometer className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Moderate</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{moderateCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card glass>
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
              <Wind className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Unhealthy</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{unhealthyCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
