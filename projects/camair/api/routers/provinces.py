import json
from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast
from geoalchemy2 import Geography, Geometry
from geoalchemy2.functions import ST_AsGeoJSON, ST_Distance, ST_DWithin

from database import get_db
import models

router = APIRouter(prefix="/api/v1/provinces", tags=["provinces"])

@router.get("")
def list_provinces(db: Session = Depends(get_db)):
    provinces = db.query(models.Province).order_by(models.Province.name).all()
    # Manual serialization to avoid geometry issues in default pydantic
    return {
        "data": [
            {
                "adm1_pcode": p.adm1_pcode,
                "name": p.name,
                "center_lat": p.center_lat,
                "center_lon": p.center_lon,
                "area_sqkm": p.area_sqkm
            } for p in provinces
        ]
    }

@router.get("/geojson")
def provinces_geojson(db: Session = Depends(get_db)):
    results = db.query(
        models.Province,
        func.ST_AsGeoJSON(models.Province.geom).label("geometry")
    ).all()
    
    features = []
    for row, geometry_json in results:
        features.append({
            "type": "Feature",
            "properties": {
                "adm1_name": row.name,
                "adm1_pcode": row.adm1_pcode,
                "center_lat": row.center_lat,
                "center_lon": row.center_lon,
                "area_sqkm": row.area_sqkm,
            },
            "geometry": json.loads(geometry_json),
        })
    return {"type": "FeatureCollection", "features": features}

@router.get("/{name}")
def get_province(name: str, db: Session = Depends(get_db)):
    result = db.query(
        models.Province,
        func.ST_AsGeoJSON(models.Province.geom).label("geometry")
    ).filter(models.Province.name == name).first()
    
    if not result:
        raise HTTPException(status_code=404, detail=f"Province '{name}' not found")
    
    row, geometry_json = result
    return {
        "data": {
            "name": row.name,
            "adm1_pcode": row.adm1_pcode,
            "center_lat": row.center_lat,
            "center_lon": row.center_lon,
            "area_sqkm": row.area_sqkm,
            "geometry": json.loads(geometry_json),
        }
    }

@router.get("/{name}/nearby")
def get_nearby_provinces(
    name: str,
    distance_km: float = Query(50, description="Search radius in kilometres"),
    db: Session = Depends(get_db)
):
    target = db.query(models.Province).filter(models.Province.name == name).first()
    if not target:
        raise HTTPException(status_code=404, detail=f"Province '{name}' not found")

    # Use cast to Geography for accurate distance in meters
    nearby = db.query(
        models.Province.name,
        models.Province.adm1_pcode,
        models.Province.center_lat,
        models.Province.center_lon,
        func.round(func.ST_Distance(
            cast(target.geom, Geography), 
            cast(models.Province.geom, Geography)
        ) / 1000).label("distance_km")
    ).filter(
        models.Province.name != name,
        func.ST_DWithin(
            cast(target.geom, Geography), 
            cast(models.Province.geom, Geography), 
            distance_km * 1000
        )
    ).order_by("distance_km").all()

    return {
        "province": name,
        "distance_km": distance_km,
        "data": [dict(r._asdict()) for r in nearby]
    }
