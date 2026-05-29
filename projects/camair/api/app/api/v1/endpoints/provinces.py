import json
from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, text
from geoalchemy2 import Geography
from geoalchemy2.functions import ST_AsGeoJSON, ST_Distance, ST_DWithin

from app.core.database import get_db
from app.models.province import Province

router = APIRouter()

@router.get("")
def list_provinces(db: Session = Depends(get_db)):
    provinces = db.query(Province).order_by(Province.name).all()
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
    query = text(
        """
        SELECT json_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(features.feature)
        )
        FROM (
            WITH latest_air_quality AS (
                SELECT DISTINCT ON (name)
                    name,
                    pm2_5,
                    pm10,
                    o3,
                    no2,
                    so2,
                    co,
                    us_epa_index,
                    gb_defra_index,
                    last_updated
                FROM processed_air_quality
                ORDER BY name, created_at_ts DESC
            )
            SELECT json_build_object(
                'type',       'Feature',
                'id',         p.adm1_pcode,
                'geometry',   ST_AsGeoJSON(ST_SimplifyPreserveTopology(p.geom, 0.01))::jsonb,
                'properties', jsonb_build_object(
                    'adm1_name',      p.name,
                    'adm1_pcode',     p.adm1_pcode,
                    'center_lat',     p.center_lat,
                    'center_lon',     p.center_lon,
                    'pm2_5',          laq.pm2_5,
                    'pm10',           laq.pm10,
                    'o3',             laq.o3,
                    'no2',            laq.no2,
                    'so2',            laq.so2,
                    'co',             laq.co,
                    'us_epa_index',   laq.us_epa_index,
                    'gb_defra_index', laq.gb_defra_index,
                    'last_updated',   laq.last_updated
                )
            ) AS feature
            FROM provinces p
            LEFT JOIN latest_air_quality laq ON p.name = laq.name
        ) AS features;
        """
    )
    
    result = db.execute(query).scalar()
    return result

@router.get("/{name}")
def get_province(name: str, db: Session = Depends(get_db)):
    result = db.query(
        Province,
        func.ST_AsGeoJSON(Province.geom).label("geometry")
    ).filter(Province.name == name).first()
    
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
    target = db.query(Province).filter(Province.name == name).first()
    if not target:
        raise HTTPException(status_code=404, detail=f"Province '{name}' not found")

    nearby = db.query(
        Province.name,
        Province.adm1_pcode,
        Province.center_lat,
        Province.center_lon,
        func.round(func.ST_Distance(
            cast(target.geom, Geography), 
            cast(Province.geom, Geography)
        ) / 1000).label("distance_km")
    ).filter(
        Province.name != name,
        func.ST_DWithin(
            cast(target.geom, Geography), 
            cast(Province.geom, Geography), 
            distance_km * 1000
        )
    ).order_by("distance_km").all()

    return {
        "province": name,
        "distance_km": distance_km,
        "data": [dict(r._asdict()) for r in nearby]
    }
