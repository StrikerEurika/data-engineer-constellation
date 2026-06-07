import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import type { SortField, SortDirection } from "@/types/air-quality.types";

interface SortIconProps {
  field: SortField;
  sortField: SortField;
  sortDir: SortDirection;
}

export function SortIcon({ field, sortField, sortDir }: SortIconProps) {
  if (field !== sortField)
    return (
      <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
    );
  return sortDir === "asc" ? (
    <ChevronUp className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
  ) : (
    <ChevronDown className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
  );
}
