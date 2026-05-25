import json
import os
import psycopg2
import psycopg2.extras

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "postgres"),
    "port": int(os.getenv("DB_PORT", 5432)),
    "dbname": os.getenv("DB_NAME", "camair"),
    "user": os.getenv("DB_USER", "airflow"),
    "password": os.getenv("DB_PASSWORD", "airflow"),
}

GEOJSON_PATH = os.getenv("GEOJSON_PATH", "/geo/cambodia-provinces.geojson")


def get_connection():
    return psycopg2.connect(**DB_CONFIG)


def seed_provinces():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT count(*) FROM provinces")
    count = cursor.fetchone()[0]
    if count > 0:
        print(f"Provinces table already has {count} rows. Skipping seed.")
        cursor.close()
        conn.close()
        return

    print(f"Reading GeoJSON from {GEOJSON_PATH}...")
    with open(GEOJSON_PATH) as f:
        geojson = json.load(f)

    features = geojson.get("features", [])
    print(f"Found {len(features)} province features.")

    for feature in features:
        props = feature.get("properties", {})
        geometry = feature.get("geometry")

        adm1_pcode = props.get("adm1_pcode")
        name = props.get("adm1_name")
        center_lat = props.get("center_lat")
        center_lon = props.get("center_lon")
        area_sqkm = props.get("area_sqkm")

        geom_json = json.dumps(geometry)

        cursor.execute(
            """
            INSERT INTO provinces (adm1_pcode, name, center_lat, center_lon, area_sqkm, geom)
            VALUES (%s, %s, %s, %s, %s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326))
            ON CONFLICT (adm1_pcode) DO UPDATE
            SET name = EXCLUDED.name,
                geom = EXCLUDED.geom
            """,
            (adm1_pcode, name, center_lat, center_lon, area_sqkm, geom_json),
        )

    conn.commit()
    cursor.close()
    conn.close()
    print(f"Successfully seeded {len(features)} provinces with PostGIS geometries.")


if __name__ == "__main__":
    seed_provinces()
