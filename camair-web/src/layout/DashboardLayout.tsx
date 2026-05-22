import { Outlet } from "react-router-dom";
import { Sidebar } from "../layout/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen p-4 md:p-6 transition-colors duration-300">
      <div className="max-w-400 mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <Sidebar />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
