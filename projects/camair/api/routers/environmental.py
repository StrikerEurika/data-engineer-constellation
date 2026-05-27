from datetime import UTC, datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas

# This router provides endpoints
router = APIRouter(prefix="/api/v1/realtime-api", tags=["environmental"])

def get_latest_records(db: Session, model: type[Any]) -> list[Any]:
    """Helper to get DISTINCT ON (name) records ordered by created_at DESC, joining with provinces to get adm1_pcode."""
    results = db.query(model, models.Province.adm1_pcode).outerjoin(
        models.Province, model.name == models.Province.name
    ).distinct(model.name).order_by(
        model.name, 
        model.created_at_ts.desc()
    ).all()
    
    # Map the results to include adm1_pcode in the model instance
    records = []
    for record, adm1_pcode in results:
        record.adm1_pcode = adm1_pcode
        records.append(record)
    return records


def get_trend_records(
    db: Session,
    model: type[Any],
    province: str | None = None,
    hours: int = 24,
) -> list[Any]:
    cutoff = datetime.now(UTC).replace(tzinfo=None) - timedelta(hours=hours)
    query = db.query(model, models.Province.adm1_pcode).outerjoin(
        models.Province, model.name == models.Province.name
    ).filter(model.created_at_ts >= cutoff)

    if province:
        query = query.filter(model.name == province)

    results = query.order_by(model.name, model.created_at_ts.asc()).all()
    
    # Map the results to include adm1_pcode in the model instance
    records = []
    for record, adm1_pcode in results:
        record.adm1_pcode = adm1_pcode
        records.append(record)
    return records

@router.get("/aqi", response_model=schemas.ApiResponse[schemas.AirQualityBase])
def get_air_quality(db: Session = Depends(get_db)):
    return {"data": get_latest_records(db, models.AirQuality)}


@router.get("/aqi/trends", response_model=schemas.ApiResponse[schemas.AirQualityBase])
def get_air_quality_trends(
    province: str | None = None,
    hours: int = 24,
    db: Session = Depends(get_db),
):
    return {"data": get_trend_records(db, models.AirQuality, province, hours)}

@router.get("/weather", response_model=schemas.ApiResponse[schemas.WeatherBase])
def get_weather(db: Session = Depends(get_db)):
    return {"data": get_latest_records(db, models.Weather)}


@router.get("/weather/trends", response_model=schemas.ApiResponse[schemas.WeatherBase])
def get_weather_trends(
    province: str | None = None,
    hours: int = 24,
    db: Session = Depends(get_db),
):
    return {"data": get_trend_records(db, models.Weather, province, hours)}

@router.get("/uv", response_model=schemas.ApiResponse[schemas.UVBase])
def get_uv(db: Session = Depends(get_db)):
    return {"data": get_latest_records(db, models.UVIndex)}


@router.get("/uv/trends", response_model=schemas.ApiResponse[schemas.UVBase])
def get_uv_trends(
    province: str | None = None,
    hours: int = 24,
    db: Session = Depends(get_db),
):
    return {"data": get_trend_records(db, models.UVIndex, province, hours)}

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
            "adm1_pcode": p.adm1_pcode,
            "lat": p.center_lat,
            "lng": p.center_lon,
            "air_quality": aqi_map.get(p.name),
            "weather": weather_map.get(p.name),
            "uv": uv_map.get(p.name),
        })

    return {"data": combined}
