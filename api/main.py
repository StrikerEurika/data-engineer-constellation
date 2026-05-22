from fastapi import FastAPI, HTTPException
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
    "host": os.getenv("DB_HOST", "postgres"),
    "port": int(os.getenv("DB_PORT", 5432)),
    "dbname": os.getenv("DB_NAME", "airflow"),
    "user": os.getenv("DB_USER", "airflow"),
    "password": os.getenv("DB_PASSWORD", "airflow"),
}


def get_connection():
    return psycopg2.connect(**DB_CONFIG)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/v1/realtime-api/aqi")
def get_air_quality():
    """
    Return the latest air quality reading per province.
    Matches the shape the frontend already expects: { data: [...] }
    """
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Get the most recent record per province
        cursor.execute("""
            SELECT DISTINCT ON (name)
                id, name, co, no2, o3, so2, pm2_5, pm10,
                us_epa_index, gb_defra_index,
                last_updated, last_updated_epoch, created_at
            FROM processed_air_quality
            ORDER BY name, created_at DESC
        """)

        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        return {"data": [dict(row) for row in rows]}

    except psycopg2.OperationalError as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
