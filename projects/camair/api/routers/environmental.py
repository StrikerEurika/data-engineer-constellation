from fastapi import APIRouter
from database import query_db, fetch_latest
from config import AQI_COLS, WEATHER_COLS, UV_COLS

router = APIRouter(prefix="/api/v1/realtime-api", tags=["environmental"])

@router.get("/aqi")
def get_air_quality():
    return {"data": fetch_latest("processed_air_quality", AQI_COLS)}

@router.get("/weather")
def get_weather():
    return {"data": fetch_latest("processed_weather", WEATHER_COLS)}

@router.get("/uv")
def get_uv():
    return {"data": fetch_latest("processed_uv_index", UV_COLS)}

@router.get("/all")
def get_all_environmental():
    aqi = {r["name"]: r for r in fetch_latest("processed_air_quality", AQI_COLS)}
    weather = {r["name"]: r for r in fetch_latest("processed_weather", WEATHER_COLS)}
    uv_data = {r["name"]: r for r in fetch_latest("processed_uv_index", UV_COLS)}

    province_coords = {
        r["name"]: (r["center_lat"], r["center_lon"])
        for r in query_db(
            "SELECT name, center_lat, center_lon FROM provinces WHERE center_lat IS NOT NULL"
        )
    }

    provinces = set(aqi) | set(weather) | set(uv_data)
    combined = []
    for name in sorted(provinces):
        coords = province_coords.get(name)
        combined.append({
            "name": name,
            "lat": coords[0] if coords else None,
            "lng": coords[1] if coords else None,
            "air_quality": aqi.get(name),
            "weather": weather.get(name),
            "uv": uv_data.get(name),
        })

    return {"data": combined}
