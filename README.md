# CamAir Data Engineering Pipeline

CamAir is a containerized data engineering project that ingests Cambodia air quality data from a public API, streams it through Kafka, and processes it with Spark Structured Streaming.

**TBH, I vibecoded this project to build a complete data pipeline using popular open-source tools.**

## Pipeline Overview

1. Airflow DAG fetches air quality data hourly from:
   https://data.mef.gov.kh/api/v1/realtime-api/aqi
2. Airflow publishes each record to Kafka topic: raw_air_quality
3. Spark job reads from Kafka, parses and transforms records
4. Spark writes output to console and Parquet files in the local data folder

## Tech Stack

- Apache Airflow 2.8.1 (scheduler + webserver)
- Apache Kafka 7.5.0 (with Zookeeper)
- Apache Spark 3.5.1 (master + worker)
- PostgreSQL 13 (Airflow metadata database)
- Docker Compose
- Python with kafka-python, requests, pyspark

## Project Structure

- docker-compose.yml: service orchestration
- camair-etl/airflow-custom/Dockerfile: custom Airflow image that installs Python requirements
- requirements.txt: Python dependencies for Airflow DAG runtime
- camair-etl/dags/fetch_air_quality.py: Airflow ingestion DAG
- camair-etl/spark_jobs/process_air_quality.py: Spark streaming processing job
- camair-etl/data/: local storage for processed data and checkpoints (Still Error)
- camair-etl/logs/: Airflow logs (You can also view logs via docker compose logs)

## Prerequisites

- Docker Desktop with Compose support
- Git

## Quick Start

1. **Start all services and clear old data** (this ensures the PostgreSQL database creates our new tables properly):
```bash
docker compose down -v
docker compose up -d --build
```
*Note: This starts Airflow, Spark Master, Spark Worker, PostgreSQL, Kafka, our new FastAPI backend, and automatically runs the Spark Streaming job!*

2. **Open the Airflow UI:**
- URL: http://localhost:8080
- Username: `admin`
- Password: `admin`

3. **Enable the Ingestion DAG:**
- In the Airflow UI, find `cambodia_air_quality_ingestion`
- Toggle the switch to "Unpause/Play"
- Airflow and Spark will now stream the data into PostgreSQL automatically!

4. **Start the Frontend Web App:**
- In a separate terminal, navigate to the `/web` folder and run:
```bash
npm install
npm run dev
```
- Open http://localhost:5173 to view the live dashboard!

---

## Technical Details: Where does the data go?

1. **Airflow** pulls from the Cambodia public API and pushes to **Kafka**.
2. **Spark Streaming** (`spark-job` container) constantly listens to Kafka.
3. Once Spark transforms the data, it writes it to **PostgreSQL** (`processed_air_quality` table) AND saves a backup as Parquet files.
4. The **FastAPI Backend** (`camair-api` container on port 8000) queries PostgreSQL.
5. The **React Frontend** fetches from FastAPI and maps the coordinates.

## Useful Commands

View Spark Streaming logs (to watch it process data in real-time):
```bash
docker compose logs -f spark-job
```

View API Backend logs:
```bash
docker compose logs -f api
```

View Airflow scheduler logs:
```bash
docker compose logs -f airflow-scheduler
```

Stop services:
```bash
docker compose down
```
