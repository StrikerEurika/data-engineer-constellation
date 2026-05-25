import os
from datetime import datetime, timedelta

# Airflow Defaults
DEFAULT_DAG_ARGS = {
    'owner': 'data_engineering_student',
    'depends_on_past': False,
    'start_date': datetime(2026, 3, 15),
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
}

# API config
AIR_QUALITY_API_URL = "https://data.mef.gov.kh/api/v1/realtime-api/aqi"
WEATHER_API_URL = "https://data.mef.gov.kh/api/v1/realtime-api/weather"
UV_API_URL = "https://data.mef.gov.kh/api/v1/realtime-api/uv"

# kafka — override via env var for local dev (e.g. localhost:9092)
KAFKA_BOOTSTRAP_SERVERS = os.getenv(
    "KAFKA_BOOTSTRAP_SERVERS", "kafka:29092"
).split(",")
KAFKA_TOPIC_AIR_QUALITY = 'raw_air_quality'
KAFKA_TOPIC_WEATHER = 'raw_weather'
KAFKA_TOPIC_UV = 'raw_uv'

# Output directory for local (no-Kafka) mode
LOCAL_OUTPUT_DIR = os.getenv("ETL_OUTPUT_DIR", "data/raw")