import asyncio
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import SessionLocal
from app.models import province as province_models
from app.models import environmental as env_models
from app.websocket.manager import manager
from app.core.config import settings

def get_max_ts(db: Session, model):
    result = db.query(func.max(model.created_at_ts)).scalar()
    return result.isoformat() if result and hasattr(result, "isoformat") else str(result) if result else None

def fetch_latest_with_coords(db: Session, model, coords_map: dict):
    records = db.query(model).distinct(model.name).order_by(
        model.name, 
        model.created_at_ts.desc()
    ).all()
    
    results = []
    for r in records:
        data = {c.name: getattr(r, c.name) for c in r.__table__.columns}
        if data.get("created_at_ts") and hasattr(data["created_at_ts"], "isoformat"):
            data["created_at_ts"] = data["created_at_ts"].isoformat()
            
        c = coords_map.get(r.name)
        data["lat"] = c[0] if c else None
        data["lng"] = c[1] if c else None
        results.append(data)
    return results

async def db_poller():
    last_max: dict[str, str | None] = {
        "air_quality": None,
        "weather": None,
        "uv": None,
    }

    while True:
        db = SessionLocal()
        try:
            provinces = db.query(province_models.Province).filter(province_models.Province.center_lat.isnot(None)).all()
            coords = {p.name: (p.center_lat, p.center_lon) for p in provinces}

            for model, key, msg_type in [
                (env_models.AirQuality, "air_quality", "air_quality"),
                (env_models.Weather, "weather", "weather"),
                (env_models.UVIndex, "uv", "uv"),
            ]:
                current_max = get_max_ts(db, model)
                if current_max and current_max != last_max[key]:
                    rows = fetch_latest_with_coords(db, model, coords)
                    last_max[key] = current_max
                    if rows:
                        await manager.broadcast({
                            "type": msg_type,
                            "data": rows,
                        })
        except Exception as e:
            print(f"Error in db_poller: {e}")
        finally:
            db.close()

        await asyncio.sleep(settings.DB_POLL_INTERVAL_SECONDS)
