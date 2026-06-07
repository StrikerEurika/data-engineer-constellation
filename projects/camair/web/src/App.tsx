import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import OverviewDashboard from "./pages/overview-dashboard";
import WeatherDashboard from "./pages/weather-dashboard";
import AirQuality from "./pages/air-quality";
import UvDashboard from "./pages/uv-dashboard";
import Forecast from "./pages/forecast";
import Tasks from "./pages/tasks";
import Calendar from "./pages/calendar";
import Settings from "./pages/settings";
import DashboardLayout from "./layout/dashboard-layout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<OverviewDashboard />} />
          <Route path="weather" element={<WeatherDashboard />} />
          <Route path="air-quality" element={<AirQuality />} />
          <Route path="uv" element={<UvDashboard />} />
          <Route path="forecast" element={<Forecast />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

