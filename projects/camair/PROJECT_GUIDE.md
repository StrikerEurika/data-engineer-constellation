# CamAir: Cambodia Environmental Monitoring System

## Project Goal
CamAir is a real-time environmental monitoring platform for Cambodia. It collects, processes, and visualizes Air Quality (AQI), Weather, and UV Index data across all 25 provinces. The system is designed for high-frequency updates (every 15 minutes) and live dashboard synchronization.

---

## Technical Architecture

### 1. ETL Pipeline (The Data Engine)
Located in `/etl`, this layer handles the "Extract, Transform, Load" lifecycle.
- **Ingestion**: A continuous Python ingestor (`src/elt/ingestor.py`) polls the Cambodia MEF APIs and pushes raw JSON to **Apache Kafka**.
- **Orchestration**: **Apache Airflow** manages periodic triggers and ensures pipeline health.
- **Processing**: **Apache Spark (PySpark)** streaming jobs (`src/elt/spark/`) consume Kafka topics, perform data cleaning, enrich records with timestamps/icons, and sink the results into PostgreSQL.

### 2. Backend API (The Brain)
Located in `/api`, built with **FastAPI**.
- **Modularity**: Divided into `routers`, `models`, `schemas`, and `services`.
- **ORM**: Uses **SQLAlchemy** and **GeoAlchemy2** for database interactions.
- **Real-Time**: A background `db_poller` (`worker.py`) monitors the database and broadcasts updates to connected clients using **WebSockets**.
- **Geospatial**: Powered by **PostGIS** for spatial queries like "nearby provinces" and GeoJSON generation.

### 3. Frontend (The Face)
Located in `/web`, built with **React**, **TypeScript**, and **Tailwind CSS**.
- **Dashboards**: Two main views: `AirQuality` (map-centric) and `WeatherDashboard` (card-centric).
- **Live Sync**: Uses `realTimeService.ts` to maintain a WebSocket connection for zero-refresh updates.
- **Visuals**: **Leaflet** for interactive maps and **Recharts** for pollutant/weather trends.

---

## Data Flow Lifecycle
1. **Source**: External MEF APIs (AQI, Weather, UV).
2. **Buffer**: Kafka (Topics: `raw_air_quality`, `raw_weather`, `raw_uv`).
3. **Compute**: Spark Streaming (Logic: parsing, casting, cleaning).
4. **Storage**: PostgreSQL (Tables: `processed_air_quality`, `processed_weather`, etc.).
5. **Sync**: FastAPI WebSocket Broadcaster.
6. **View**: React Dashboard (Live Update).

---

## Tech Stack Summary
- **Languages**: Python (Backend/ETL), TypeScript (Frontend).
- **Data**: Kafka, Spark, Postgres/PostGIS.
- **Frameworks**: FastAPI, React.
- **Infra**: Docker Compose, Airflow.

---

## Roadmap & Pending Tasks (For Delegation)

### Phase 1: Data Completion (High Priority)
- [ ] **Historical Data**: The current Spark jobs append data, but the API only fetches the `DISTINCT ON (name)` latest. Implement endpoints that return 24-hour trends for Recharts.
- [ ] **Rain Chance Mapping**: The `RainChanceCard.tsx` in the frontend is currently empty/mock. Map the `precip_mm` and `cloud` coverage from the DB to these components.

### Phase 2: User Experience
- [ ] **Province Search**: Improve the global search to allow quick navigation between Air Quality and Weather views for a specific province.
- [ ] **Alert System**: Implement a backend service that sends notifications (or UI alerts) when AQI exceeds "Unhealthy" levels (EPA Index > 3).

### Phase 3: Infrastructure
- [ ] **Alembic Migrations**: Transition database schema management from raw SQL scripts to Alembic.
- [ ] **API Documentation**: Review and polish the Pydantic schemas to ensure `http://localhost:8000/docs` is fully interactive and documented.

---

## Getting Started for New Agents
1. **Spin up Infra**: `docker-compose -f docker-compose.camair.yml up -d`
2. **Seed Data**: Run `scripts/seed_provinces.py` to populate the geography.
3. **Verify API**: Check `http://localhost:8000/health` and `http://localhost:8000/api/v1/provinces`.
4. **Frontend**: `cd web && npm install && npm run dev`.
