import json
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import psycopg2.extras
import os

app = FastAPI(title="CamAir API", version="1.0.0")

# Allow the frontend (Vite dev server) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", 5432)),
    "dbname": os.getenv("DB_NAME", "camair"),
    "user": os.getenv("DB_USER", "airflow"),
    "password": os.getenv("DB_PASSWORD", "airflow"),
}


def get_connection():
    return psycopg2.connect(**DB_CONFIG)


@app.get("/health")
def health():
    return {"status": "ok"}


def _fetch_latest(table: str, columns: list[str]) -> list[dict]:
    """Get the most recent record per province from the given table."""
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

    except psycopg2.OperationalError as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Province / PostGIS endpoints ─────────────────────────────────────────────


def _query_db(query: str, params: tuple | None = None) -> list[dict]:
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(query, params or ())
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return [dict(row) for row in rows]
    except psycopg2.OperationalError as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/provinces")
def list_provinces():
    """Return all provinces with metadata (name, code, center, area)."""
    return {
        "data": _query_db(
            "SELECT adm1_pcode, name, center_lat, center_lon, area_sqkm "
            "FROM provinces ORDER BY name"
        )
    }


@app.get("/api/v1/provinces/geojson")
def provinces_geojson():
    """Return a GeoJSON FeatureCollection of all province boundaries."""
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
    """Return a single province with its geometry."""
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
    """Return provinces within a given distance of the named province."""
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
    """
    Return the latest air quality reading per province.
    """
    columns = [
        "id", "name", "co", "no2", "o3", "so2", "pm2_5", "pm10",
        "us_epa_index", "gb_defra_index",
        "last_updated", "last_updated_epoch", "created_at",
    ]
    return {"data": _fetch_latest("processed_air_quality", columns)}


@app.get("/api/v1/realtime-api/weather")
def get_weather():
    """
    Return the latest weather reading per province.
    """
    columns = [
        "id", "name", "temp_c", "temp_f", "feelslike_c", "feelslike_f",
        "wind_mph", "wind_kph", "wind_degree", "wind_dir",
        "pressure_mb", "pressure_in", "precip_mm", "precip_in",
        "humidity", "cloud", "vis_km", "vis_miles",
        "uv", "gust_mph", "gust_kph", "is_day",
        "condition_text", "condition_icon", "condition_code",
        "last_updated", "last_updated_epoch", "created_at",
    ]
    return {"data": _fetch_latest("processed_weather", columns)}


@app.get("/api/v1/realtime-api/uv")
def get_uv():
    """
    Return the latest UV index reading per province.
    """
    columns = [
        "id", "name", "uv",
        "last_updated", "last_updated_epoch", "created_at",
    ]
    return {"data": _fetch_latest("processed_uv_index", columns)}


@app.get("/api/v1/realtime-api/all")
def get_all_environmental():
    """
    Return combined AQI + weather + UV data per province, enriched with
    center coordinates from the PostGIS provinces table.
    """
    aqi = {r["name"]: r for r in _fetch_latest(
        "processed_air_quality",
        ["id", "name", "co", "no2", "o3", "so2", "pm2_5", "pm10",
         "us_epa_index", "gb_defra_index",
         "last_updated", "last_updated_epoch", "created_at"]
    )}
    weather = {r["name"]: r for r in _fetch_latest(
        "processed_weather",
        ["id", "name", "temp_c", "temp_f", "feelslike_c", "feelslike_f",
         "wind_mph", "wind_kph", "wind_degree", "wind_dir",
         "pressure_mb", "pressure_in", "precip_mm", "precip_in",
         "humidity", "cloud", "vis_km", "vis_miles",
         "uv", "gust_mph", "gust_kph", "is_day",
         "condition_text", "condition_icon", "condition_code",
         "last_updated", "last_updated_epoch", "created_at"]
    )}
    uv_data = {r["name"]: r for r in _fetch_latest(
        "processed_uv_index",
        ["id", "name", "uv",
         "last_updated", "last_updated_epoch", "created_at"]
    )}

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
