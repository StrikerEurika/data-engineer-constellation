import asyncio
import json
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import psycopg2.extras
import os


# ── DB helpers ─────────────────────────────────────────────────────────────────

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", 5432)),
    "dbname": os.getenv("DB_NAME", "camair"),
    "user": os.getenv("DB_USER", "airflow"),
    "password": os.getenv("DB_PASSWORD", "airflow"),
}


def get_connection():
    return psycopg2.connect(**DB_CONFIG)


def _query_db(query: str, params: tuple | None = None) -> list[dict]:
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(query, params or ())
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return [dict(row) for row in rows]
    except psycopg2.OperationalError:
        return []


def _fetch_latest(table: str, columns: list[str]) -> list[dict]:
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cols_str = ", ".join(columns)
        cursor.execute(f"""
            SELECT DISTINCT ON (name)
                {cols_str}
            FROM {table}
            ORDER BY name, created_at DESC
        """)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return [dict(row) for row in rows]
    except psycopg2.OperationalError:
        return []


AQI_COLS = [
    "id", "name", "co", "no2", "o3", "so2", "pm2_5", "pm10",
    "us_epa_index", "gb_defra_index",
    "last_updated", "last_updated_epoch", "created_at",
]
WEATHER_COLS = [
    "id", "name", "temp_c", "temp_f", "feelslike_c", "feelslike_f",
    "wind_mph", "wind_kph", "wind_degree", "wind_dir",
    "pressure_mb", "pressure_in", "precip_mm", "precip_in",
    "humidity", "cloud", "vis_km", "vis_miles",
    "uv", "gust_mph", "gust_kph", "is_day",
    "condition_text", "condition_icon", "condition_code",
    "last_updated", "last_updated_epoch", "created_at",
]
UV_COLS = [
    "id", "name", "uv",
    "last_updated", "last_updated_epoch", "created_at",
]


# ── WebSocket Connection Manager ──────────────────────────────────────────────

class ConnectionManager:
    def __init__(self):
        self.active: set[WebSocket] = set()

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.add(ws)

    def disconnect(self, ws: WebSocket):
        self.active.discard(ws)

    async def broadcast(self, message: dict):
        dead: list[WebSocket] = []
        for ws in self.active:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.active.discard(ws)


manager = ConnectionManager()


# ── DB Poller → WebSocket Broadcast ──────────────────────────────────────────

def _get_max_ts(table: str) -> str | None:
    rows = _query_db(f"SELECT MAX(created_at_ts) AS max_ts FROM {table}")
    if rows and rows[0]["max_ts"]:
        val = rows[0]["max_ts"]
        return val.isoformat() if hasattr(val, "isoformat") else str(val)
    return None


def _get_province_coords() -> dict[str, tuple[float, float]]:
    rows = _query_db(
        "SELECT name, center_lat, center_lon "
        "FROM provinces WHERE center_lat IS NOT NULL"
    )
    return {r["name"]: (r["center_lat"], r["center_lon"]) for r in rows}


def _enrich_with_coords(records: list[dict], coords: dict) -> list[dict]:
    for r in records:
        c = coords.get(r["name"])
        r["lat"] = c[0] if c else None
        r["lng"] = c[1] if c else None
    return records


POLL_INTERVAL = int(os.getenv("DB_POLL_INTERVAL_SECONDS", "2"))


async def db_poller():
    last_max: dict[str, str | None] = {
        "processed_air_quality": None,
        "processed_weather": None,
        "processed_uv_index": None,
    }
    coords = {}

    while True:
        coords = _get_province_coords() or coords

        for table, cols, msg_type in [
            ("processed_air_quality", AQI_COLS, "air_quality"),
            ("processed_weather", WEATHER_COLS, "weather"),
            ("processed_uv_index", UV_COLS, "uv"),
        ]:
            current_max = await asyncio.to_thread(_get_max_ts, table)
            if current_max and current_max != last_max[table]:
                rows = await asyncio.to_thread(_fetch_latest, table, cols)
                last_max[table] = current_max
                if rows:
                    _enrich_with_coords(rows, coords)
                    await manager.broadcast({
                        "type": msg_type,
                        "data": rows,
                    })

        await asyncio.sleep(POLL_INTERVAL)


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(application: FastAPI):
    task = asyncio.create_task(db_poller())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


# ── App Setup ──────────────────────────────────────────────────────────────────

app = FastAPI(title="CamAir API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── WebSocket Endpoint ────────────────────────────────────────────────────────

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(ws)


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


# ── Province / PostGIS endpoints ─────────────────────────────────────────────

@app.get("/api/v1/provinces")
def list_provinces():
    return {
        "data": _query_db(
            "SELECT adm1_pcode, name, center_lat, center_lon, area_sqkm "
            "FROM provinces ORDER BY name"
        )
    }


@app.get("/api/v1/provinces/geojson")
def provinces_geojson():
    rows = _query_db(
        "SELECT name, adm1_pcode, center_lat, center_lon, area_sqkm, "
        "ST_AsGeoJSON(geom) AS geometry FROM provinces ORDER BY name"
    )
    features = []
    for row in rows:
        features.append({
            "type": "Feature",
            "properties": {
                "adm1_name": row["name"],
                "adm1_pcode": row["adm1_pcode"],
                "center_lat": row["center_lat"],
                "center_lon": row["center_lon"],
                "area_sqkm": row["area_sqkm"],
            },
            "geometry": json.loads(row["geometry"]),
        })
    return {"type": "FeatureCollection", "features": features}


@app.get("/api/v1/provinces/{name}")
def get_province(name: str):
    rows = _query_db(
        "SELECT name, adm1_pcode, center_lat, center_lon, area_sqkm, "
        "ST_AsGeoJSON(geom) AS geometry FROM provinces WHERE name = %s",
        (name,),
    )
    if not rows:
        raise HTTPException(status_code=404, detail=f"Province '{name}' not found")
    row = rows[0]
    return {
        "data": {
            **{k: row[k] for k in ("name", "adm1_pcode", "center_lat", "center_lon", "area_sqkm")},
            "geometry": json.loads(row["geometry"]),
        }
    }


@app.get("/api/v1/provinces/{name}/nearby")
def get_nearby_provinces(
    name: str,
    distance_km: float = Query(50, description="Search radius in kilometres"),
):
    rows = _query_db(
        """
        SELECT p2.name, p2.adm1_pcode, p2.center_lat, p2.center_lon,
               ROUND(ST_Distance(p1.geom::geography, p2.geom::geography) / 1000) AS distance_km
        FROM provinces p1, provinces p2
        WHERE p1.name = %s
          AND p2.name != %s
          AND ST_DWithin(p1.geom::geography, p2.geom::geography, %s * 1000)
        ORDER BY distance_km
        """,
        (name, name, distance_km),
    )
    return {"province": name, "distance_km": distance_km, "data": rows}


# ── Environmental data endpoints ─────────────────────────────────────────────

@app.get("/api/v1/realtime-api/aqi")
def get_air_quality():
    return {"data": _fetch_latest("processed_air_quality", AQI_COLS)}


@app.get("/api/v1/realtime-api/weather")
def get_weather():
    return {"data": _fetch_latest("processed_weather", WEATHER_COLS)}


@app.get("/api/v1/realtime-api/uv")
def get_uv():
    return {"data": _fetch_latest("processed_uv_index", UV_COLS)}


@app.get("/api/v1/realtime-api/all")
def get_all_environmental():
    aqi = {r["name"]: r for r in _fetch_latest("processed_air_quality", AQI_COLS)}
    weather = {r["name"]: r for r in _fetch_latest("processed_weather", WEATHER_COLS)}
    uv_data = {r["name"]: r for r in _fetch_latest("processed_uv_index", UV_COLS)}

    province_coords = {
        r["name"]: (r["center_lat"], r["center_lon"])
        for r in _query_db(
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
