import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import WeatherDashboard from "./pages/WeatherDashboard";
import Forecast from "./pages/Forecast";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import AirQuality from "./pages/AirQuality";
import DashboardLayout from "./layout/DashboardLayout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<WeatherDashboard />} />
          <Route path="air-quality" element={<AirQuality />} />
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
