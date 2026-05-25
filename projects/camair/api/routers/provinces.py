import json
from fastapi import APIRouter, HTTPException, Query
from database import query_db

router = APIRouter(prefix="/api/v1/provinces", tags=["provinces"])

@router.get("")
def list_provinces():
    return {
        "data": query_db(
            "SELECT adm1_pcode, name, center_lat, center_lon, area_sqkm "
            "FROM provinces ORDER BY name"
        )
    }

@router.get("/geojson")
def provinces_geojson():
    rows = query_db(
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

@router.get("/{name}")
def get_province(name: str):
    rows = query_db(
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

@router.get("/{name}/nearby")
def get_nearby_provinces(
    name: str,
    distance_km: float = Query(50, description="Search radius in kilometres"),
):
    rows = query_db(
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
