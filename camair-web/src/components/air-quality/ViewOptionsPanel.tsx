import { cn } from "@/lib/utils";
import { Layers, X } from "lucide-react";

// interface for view options
interface ViewOption {
  id: string;
  label: string;
  enabled: boolean;
}

// View Options Sidebar
export function ViewOptionsPanel({
  isOpen,
  onClose,
  options,
  onToggle,
  onApply,
}: {
  isOpen: boolean;
  onClose: () => void;
  options: ViewOption[];
  onToggle: (id: string) => void;
  onApply: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed left-4 top-20 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 transition-all duration-300",
          isOpen
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-full pointer-events-none",
        )}
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              View Options
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {/* Pollutant Section */}
          <div>
            <button className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              <Layers className="w-4 h-4" />
              Pollutant Layers
            </button>
            <div className="space-y-2">
              {options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {option.label}
                  </span>
                  <button
                    onClick={() => onToggle(option.id)}
                    className={cn(
                      "w-10 h-5 rounded-full transition-colors relative",
                      option.enabled
                        ? "bg-blue-500"
                        : "bg-slate-200 dark:bg-slate-700",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                        option.enabled ? "left-5" : "left-0.5",
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onApply}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}
