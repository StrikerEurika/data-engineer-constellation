import { Search, Sun, Moon, Bell } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export function Header({ darkMode, toggleDarkMode }: HeaderProps) {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      {/* Left: Date & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1 w-full">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Today, {dateStr.split(',')[0]}</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{dateStr}</p>
        </div>
        
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search your location..."
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-400 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {/* Theme Toggle */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-1.5 shadow-sm">
          <button
            onClick={toggleDarkMode}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              !darkMode ? 'bg-blue-50 text-amber-500' : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <Sun className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={toggleDarkMode}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              darkMode ? 'bg-slate-800 text-blue-400 shadow-inner' : 'text-slate-400 hover:text-blue-400'
            }`}
          >
            <Moon className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Notifications */}
        {/* <button className="w-11 h-11 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
          <Bell className="w-5 h-5" />
        </button> */}

        {/* Profile */}
        {/* <button className="w-11 h-11 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-md ring-1 ring-slate-200 dark:ring-slate-700">
          <img 
            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" 
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </button> */}
      </div>
    </header>
  );
}
