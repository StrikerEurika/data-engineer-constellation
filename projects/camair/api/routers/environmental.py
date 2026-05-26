from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
import models
import schemas

# This router provides endpoints
router = APIRouter(prefix="/api/v1/realtime-api", tags=["environmental"])

def get_latest_records(db: Session, model):
    """Helper to get DISTINCT ON (name) records ordered by created_at DESC."""
    # SQLAlchemy doesn't have a direct .distinct('name') for all dialects,
    # but for Postgres we can use distinct(model.name)
    return db.query(model).distinct(model.name).order_by(
        model.name, 
        model.created_at_ts.desc()
    ).all()

@router.get("/aqi", response_model=schemas.ApiResponse[schemas.AirQualityBase])
def get_air_quality(db: Session = Depends(get_db)):
    return {"data": get_latest_records(db, models.AirQuality)}

@router.get("/weather", response_model=schemas.ApiResponse[schemas.WeatherBase])
def get_weather(db: Session = Depends(get_db)):
    return {"data": get_latest_records(db, models.Weather)}

@router.get("/uv", response_model=schemas.ApiResponse[schemas.UVBase])
def get_uv(db: Session = Depends(get_db)):
    return {"data": get_latest_records(db, models.UVIndex)}

@router.get("/all")
def get_all_environmental(db: Session = Depends(get_db)):
    aqi_list = get_latest_records(db, models.AirQuality)
    weather_list = get_latest_records(db, models.Weather)
    uv_list = get_latest_records(db, models.UVIndex)
    
    aqi_map = {r.name: r for r in aqi_list}
    weather_map = {r.name: r for r in weather_list}
    uv_map = {r.name: r for r in uv_list}

    provinces = db.query(models.Province).order_by(models.Province.name).all()
    
    combined = []
    for p in provinces:
        combined.append({
            "name": p.name,
            "lat": p.center_lat,
            "lng": p.center_lon,
            "air_quality": aqi_map.get(p.name),
            "weather": weather_map.get(p.name),
            "uv": uv_map.get(p.name),
        })

    return {"data": combined}
