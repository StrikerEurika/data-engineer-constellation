import { Button } from "../ui/button";
import { MapPin, Minus, Plus } from "lucide-react";
import type { Map as LeafletMap } from "leaflet";

interface MapNavigatorsProps {
  center: [number, number];
  zoom: number;
  mapRef: React.MutableRefObject<LeafletMap | null>;
}

export const MapNavigators = ({ center, zoom, mapRef }: MapNavigatorsProps) => {
  return (
    <div className="absolute right-4 bottom-4 z-50 flex gap-2">
      <Button
        onClick={() => mapRef.current?.zoomOut()}
        className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
        title="Zoom out"
      >
        <Minus className="w-3 h-3" />
      </Button>
      <Button
        onClick={() => mapRef.current?.zoomIn()}
        className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
        title="Zoom in"
      >
        <Plus className="w-3 h-3" />
      </Button>
      <Button
        onClick={() =>
          mapRef.current?.flyTo(center, zoom, {
            duration: 1.2,
          })
        }
        className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
        title="Reset to default view"
      >
        <MapPin className="w-3 h-3" />
      </Button>
    </div>
  );
};
