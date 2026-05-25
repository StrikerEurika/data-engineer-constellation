from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import timedelta
from src.elt.config import DEFAULT_DAG_ARGS
from src.elt.extractors import (
    fetch_air_quality_and_push_to_kafka,
    fetch_weather_and_push_to_kafka,
    fetch_uv_and_push_to_kafka,
)

with DAG(
    'cambodia_environmental_ingestion', # DAG identity name
    default_args=DEFAULT_DAG_ARGS,
    description='Fetch air quality, weather, and UV data from Cambodia MEF API',
    schedule_interval=timedelta(hours=1),
    catchup=False,
) as dag:
    ingest_air_quality = PythonOperator(
        task_id='fetch_air_quality',
        python_callable=fetch_air_quality_and_push_to_kafka,
    )

    ingest_weather = PythonOperator(
        task_id='fetch_weather',
        python_callable=fetch_weather_and_push_to_kafka,
    )

    ingest_uv = PythonOperator(
        task_id='fetch_uv',
        python_callable=fetch_uv_and_push_to_kafka,
    )