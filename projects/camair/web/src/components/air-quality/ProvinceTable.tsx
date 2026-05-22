import { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import type {
  AirQualityRecord,
  SortField,
  SortDirection,
} from "@/types/air-quality.types";
import { SortIcon } from "./ProvinceTable/SortIcon";
import { SearchBar } from "./ProvinceTable/SearchBar";
import { formatValue } from "@/utils/formatters";

interface ProvinceTableProps {
  data: AirQualityRecord[];
  selectedProvince: string | null;
  onSelectProvince: (name: string) => void;
}

type Column = {
  key: SortField;
  label: string;
  unit?: string;
  align?: "left" | "right";
};

const COLUMNS: Column[] = [
  { key: "name", label: "Province", align: "left" },
  { key: "us_epa_index", label: "AQI Level", align: "left" },
  { key: "pm2_5", label: "PM2.5", unit: "µg/m³", align: "right" },
  { key: "pm10", label: "PM10", unit: "µg/m³", align: "right" },
  { key: "co", label: "CO", unit: "µg/m³", align: "right" },
  { key: "no2", label: "NO₂", unit: "µg/m³", align: "right" },
  { key: "o3", label: "O₃", unit: "µg/m³", align: "right" },
  { key: "so2", label: "SO₂", unit: "µg/m³", align: "right" },
  { key: "last_updated", label: "Updated", align: "right" },
];

export function ProvinceTable({
  data,
  selectedProvince,
  onSelectProvince,
}: ProvinceTableProps) {
  const [sortField, setSortField] = useState<SortField>("us_epa_index");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [search, setSearch] = useState("");

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter((d) => d.name.toLowerCase().includes(q));
  }, [data, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Search bar */}
      <div className="relative">
        <SearchBar value={search} onChange={(value) => setSearch(value)} />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <tr>
              {COLUMNS.map((col) => (
                <TableHead
                  key={col.key as string}
                  className={`cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors ${
                    col.align === "right" ? "text-right" : ""
                  }`}
                  onClick={() => handleSort(col.key)}
                >
                  <div
                    className={`flex items-center gap-1.5 ${
                      col.align === "right" ? "justify-end" : ""
                    }`}
                  >
                    {col.label}
                    <SortIcon
                      field={col.key}
                      sortField={sortField}
                      sortDir={sortDir}
                    />
                    {col.unit && (
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 font-normal">
                        {col.unit}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </tr>
          </TableHeader>
          <TableBody>
            {sorted.map((record) => (
              <TableRow
                key={record.id}
                onClick={() => onSelectProvince(record.name)}
                className={`${
                  record.name === selectedProvince
                    ? "!bg-blue-500/10 dark:!bg-blue-400/10 border-l-2 border-l-blue-500 dark:border-l-blue-400"
                    : ""
                }`}
              >
                {COLUMNS.map((col) => (
                  <TableCell
                    key={col.key as string}
                    className={`${
                      col.align === "right" ? "text-right" : ""
                    } text-slate-900 dark:text-slate-200`}
                  >
                    {formatValue(record, col.key)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {sorted.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>No provinces match "{search}"</p>
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-600 text-right">
        Showing {sorted.length} of {data.length} provinces
      </p>
    </div>
  );
}
