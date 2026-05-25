import asyncio
from database import query_db, fetch_latest
from manager import manager
from config import AQI_COLS, WEATHER_COLS, UV_COLS, POLL_INTERVAL

def get_max_ts(table: str) -> str | None:
    rows = query_db(f"SELECT MAX(created_at_ts) AS max_ts FROM {table}")
    if rows and rows[0]["max_ts"]:
        val = rows[0]["max_ts"]
        return val.isoformat() if hasattr(val, "isoformat") else str(val)
    return None

def get_province_coords() -> dict[str, tuple[float, float]]:
    rows = query_db(
        "SELECT name, center_lat, center_lon "
        "FROM provinces WHERE center_lat IS NOT NULL"
    )
    return {r["name"]: (r["center_lat"], r["center_lon"]) for r in rows}

def enrich_with_coords(records: list[dict], coords: dict) -> list[dict]:
    for r in records:
        c = coords.get(r["name"])
        r["lat"] = c[0] if c else None
        r["lng"] = c[1] if c else None
    return records

async def db_poller():
    last_max: dict[str, str | None] = {
        "processed_air_quality": None,
        "processed_weather": None,
        "processed_uv_index": None,
    }
    coords = {}

    while True:
        coords = get_province_coords() or coords

        for table, cols, msg_type in [
            ("processed_air_quality", AQI_COLS, "air_quality"),
            ("processed_weather", WEATHER_COLS, "weather"),
            ("processed_uv_index", UV_COLS, "uv"),
        ]:
            current_max = await asyncio.to_thread(get_max_ts, table)
            if current_max and current_max != last_max[table]:
                rows = await asyncio.to_thread(fetch_latest, table, cols)
                last_max[table] = current_max
                if rows:
                    enrich_with_coords(rows, coords)
                    await manager.broadcast({
                        "type": msg_type,
                        "data": rows,
                    })

        await asyncio.sleep(POLL_INTERVAL)
