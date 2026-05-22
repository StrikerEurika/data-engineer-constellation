import {
  Home,
  Clock,
  CheckCircle,
  Calendar,
  Settings,
  LogOut,
  AirVent,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  // { icon: Home, label: "Dashboard", to: "/dashboard" },
  { icon: AirVent, label: "Air Quality", to: "/dashboard/air-quality" },
  // { icon: Clock, label: "Forecast", to: "/dashboard/forecast" },
  // { icon: CheckCircle, label: "Tasks", to: "/dashboard/tasks" },
  // { icon: Calendar, label: "Calendar", to: "/dashboard/calendar" },
  // { icon: Settings, label: "Settings", to: "/dashboard/settings" },
];

export function Sidebar() {
  return (
    <aside className="sticky h-full top-7 w-full md:w-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-row md:flex-col items-center py-4 md:py-6 px-4 md:px-0 gap-6 shadow-sm dark:shadow-none transition-all duration-300">
      {/* Logo */}
      <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M7 7H17M7 12H17M7 17H17"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-row md:flex-col gap-2 md:gap-4">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }: { isActive: boolean }) =>
              cn(
                "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200",
                isActive
                  ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300",
              )
            }
            end={item.to === "/dashboard"}
          >
            <item.icon className="w-5 h-5" />
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      {/* <button className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all duration-200">
        <LogOut className="w-5 h-5" />
      </button> */}
    </aside>
  );
}
