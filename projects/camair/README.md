# CamAir — Cambodia Air Quality Pipeline

A containerized data engineering project that ingests Cambodia air quality data from a public API, streams it through Kafka, processes it with Spark Structured Streaming, serves it via FastAPI, and visualizes it with React.

## Pipeline Overview

1. Airflow DAG fetches air quality data hourly from: https://data.mef.gov.kh/api/v1/realtime-api/aqi
2. Airflow publishes each record to Kafka topic `raw_air_quality`
3. Spark job reads from Kafka, parses and transforms records
4. Spark writes to PostgreSQL (`processed_air_quality` table) and Parquet files

## Tech Stack

- Apache Airflow 2.8.1 (scheduler + webserver)
- Apache Kafka 7.5.0 (with Zookeeper)
- Apache Spark 3.5.1 (master + worker)
- PostgreSQL 13 (Airflow metadata + processed data)
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

1. **Airflow** pulls from Cambodia API → pushes to **Kafka**
2. **Spark Streaming** reads from Kafka → transforms → writes to **PostgreSQL** + **Parquet**
3. **FastAPI** queries PostgreSQL
4. **React** fetches from FastAPI and renders map + charts

## API Credentials

See [NOTE.md](NOTE.md) for any external API keys.
