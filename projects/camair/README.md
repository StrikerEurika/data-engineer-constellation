# CamAir — Cambodia Air Quality Pipeline

A containerized data engineering project that ingests Cambodia **air quality**, **weather**, and **UV index** data from the public MEF Cambodia API, streams it through Kafka, processes it with Spark Structured Streaming, serves it via FastAPI, and visualizes it with React.

## Pipeline Overview

Three parallel ETL pipelines (AQI, Weather, UV), each following the same flow:

1. Airflow DAG (`cambodia_environmental_ingestion`) fetches data hourly from:
   - `https://data.mef.gov.kh/api/v1/realtime-api/aqi` → Kafka topic `raw_air_quality`
   - `https://data.mef.gov.kh/api/v1/realtime-api/weather` → Kafka topic `raw_weather`
   - `https://data.mef.gov.kh/api/v1/realtime-api/uv` → Kafka topic `raw_uv`
2. Each Spark streaming job reads its Kafka topic, parses and transforms records
3. Spark writes to PostgreSQL tables (`processed_air_quality`, `processed_weather`, `processed_uv_index`) and Parquet files
4. FastAPI serves the latest per-province data via REST endpoints
5. React dashboard renders maps, charts, and tables

## Tech Stack

- Apache Airflow 2.8.1 (scheduler + webserver)
- Apache Kafka 7.5.0 (with Zookeeper)
- Apache Spark 3.5.1 (master + worker)
- PostgreSQL 13 + PostGIS 3.4 (spatial database with province boundaries)
- FastAPI (REST API backend)
- React + TypeScript + Vite (frontend dashboard)
- Docker Compose

## Project Structure

```
projects/camair/
├── api/                  # FastAPI backend
├── web/                  # React frontend
├── etl/                  # Airflow DAGs + Spark jobs + config
│   ├── dags/             # Airflow DAG definitions
│   ├── src/elt/          # Python modules (config, extractors)
│   │   └── spark/        # Spark streaming job
│   ├── docker/           # Dockerfile for custom Airflow image
│   ├── config/           # Airflow config
│   ├── data/             # Parquet output + checkpoints (gitignored)
│   └── logs/             # Airflow logs (gitignored)
└── postgres-init/        # DB init scripts
```

## Quick Start

```bash
# From repo root:
docker compose down -v
docker compose up -d --build
```

- Airflow UI: http://localhost:8080 (admin / admin)
- FastAPI: http://localhost:8000
- pgAdmin: http://localhost:5050 (admin@etl.com / admin_etl)
- Frontend: http://localhost:5173 (run `npm install && npm run dev` in `projects/camair/web/`)

## Data Flow

1. **Airflow** pulls from Cambodia API (AQI + Weather + UV) → pushes to **Kafka** (3 topics)
2. **Spark Streaming** (3 jobs) reads from Kafka → transforms → writes to **PostgreSQL** (3 tables) + **Parquet**
3. **FastAPI** queries PostgreSQL and serves latest per-province data
4. **React** fetches from FastAPI and renders map + charts

## API Endpoints

### Environmental Data
| Endpoint | Description |
|---|---|
| `GET /api/v1/realtime-api/aqi` | Latest air quality per province |
| `GET /api/v1/realtime-api/weather` | Latest weather per province |
| `GET /api/v1/realtime-api/uv` | Latest UV index per province |
| `GET /api/v1/realtime-api/all` | Combined AQI + weather + UV per province (includes lat/lng) |

### Province Geography (PostGIS)
| Endpoint | Description |
|---|---|
| `GET /api/v1/provinces` | All provinces with metadata (code, center coords, area) |
| `GET /api/v1/provinces/geojson` | Full GeoJSON FeatureCollection of province boundaries from PostGIS |
| `GET /api/v1/provinces/{name}` | Single province with boundary geometry |
| `GET /api/v1/provinces/{name}/nearby?distance_km=50` | Spatial query: provinces within X km of the named province |

## PostGIS Integration

The project uses **PostGIS** (via `postgis/postgis:13-3.4`) to store and query Cambodia province boundaries spatially:

1. **`postgres-init/01_create_tables.sql`** — enables PostGIS extensions and creates a `provinces` table with a `GEOMETRY(Geometry, 4326)` column (SRID 4326 = WGS84 lat/lng), with a GIST spatial index for fast geospatial queries.
2. **`scripts/seed_provinces.py`** — a one-shot seed script that reads `cambodia-provinces.geojson` and inserts each province's boundary polygon via `ST_GeomFromGeoJSON`. Runs automatically via the `seed-provinces` Docker Compose service on first startup.
3. **Spatial queries** — the API uses PostGIS functions like `ST_DWithin` (distance search), `ST_Distance` (kilometres between centroids), and `ST_AsGeoJSON` (serve GeoJSON directly from the database), all employing the `geography` cast for metre-level accuracy.

## API Credentials

See [NOTE.md](NOTE.md) for any external API keys.
