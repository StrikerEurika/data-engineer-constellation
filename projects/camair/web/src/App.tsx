import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import OverviewDashboard from "./pages/OverviewDashboard";
import WeatherDashboard from "./pages/WeatherDashboard";
import AirQuality from "./pages/AirQuality";
import UvDashboard from "./pages/UvDashboard";
import Forecast from "./pages/Forecast";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import DashboardLayout from "./layout/DashboardLayout";

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

