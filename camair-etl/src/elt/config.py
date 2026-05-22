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

# kafka
KAFKA_BOOTSTRAP_SERVERS = ['kafka:29092']
KAFKA_TOPIC_RAW = 'raw_air_quality'