import asyncio
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import SessionLocal
import models
from manager import manager
from config import POLL_INTERVAL

def get_max_ts(db: Session, model):
    result = db.query(func.max(model.created_at_ts)).scalar()
    return result.isoformat() if result and hasattr(result, "isoformat") else str(result) if result else None

def fetch_latest_with_coords(db: Session, model, coords_map: dict):
    # DISTINCT ON (name) ORDER BY name, created_at_ts DESC
    records = db.query(model).distinct(model.name).order_by(
        model.name, 
        model.created_at_ts.desc()
    ).all()
    
    results = []
    for r in records:
        # Convert SQLAlchemy model to dict for broadcasting
        # We manually add lat/lng from our coords map
        data = {c.name: getattr(r, c.name) for c in r.__table__.columns}
        # Handle datetime serialization
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
            # Refresh province coords
            provinces = db.query(models.Province).filter(models.Province.center_lat.isnot(None)).all()
            coords = {p.name: (p.center_lat, p.center_lon) for p in provinces}

            for model, key, msg_type in [
                (models.AirQuality, "air_quality", "air_quality"),
                (models.Weather, "weather", "weather"),
                (models.UVIndex, "uv", "uv"),
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

        await asyncio.sleep(POLL_INTERVAL)
