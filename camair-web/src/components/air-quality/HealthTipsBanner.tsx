import { Cloud, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

interface HealthTipsBannerProps {
  stats: {
    goodCount: number;
    unhealthyCount: number;
  };
}

export function HealthTipsBanner({ stats }: HealthTipsBannerProps) {
  return (
    <Card glass>
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
            <Cloud className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              Health Tips
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Air quality is{" "}
              {stats.goodCount > stats.unhealthyCount
                ? "generally good"
                : "variable"}
              .
              {stats.unhealthyCount > 0
                ? " Some provinces have unhealthy levels - limit outdoor activities."
                : " Perfect time for outdoor activities!"}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </CardContent>
    </Card>
  );
}
