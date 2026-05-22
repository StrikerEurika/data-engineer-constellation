import type { ReactNode } from "react";
import type { AirQualityRecord } from "@/types/air-quality.types";
import { AqiBadge } from "@/components/air-quality/AqiBadge";
import { formatToUTC7Intl } from "@/utils/time";

export function formatValue(
  record: AirQualityRecord,
  key: keyof AirQualityRecord
): ReactNode {
  const val = record[key];
  if (key === "us_epa_index") {
    return <AqiBadge index={record.us_epa_index} />;
  }
  if (key === "name") {
    return (
      <span className="font-medium text-slate-900 dark:text-white">
        {record.name}
      </span>
    );
  }
  if (key === "last_updated") {
    if (!val) {
      return <span className="text-slate-500 text-xs">N/A</span>;
    }
    const date = new Date(val);
    if (isNaN(date.getTime())) {
      return <span className="text-slate-500 text-xs">Invalid Date</span>;
    }
    return (
      <span className="text-slate-500 text-xs">{formatToUTC7Intl(date)}</span>
    );
  }
  if (typeof val === "number") {
    return <span className="font-mono">{val.toFixed(2)}</span>;
  }
  return <span>{val || "N/A"}</span>;
}