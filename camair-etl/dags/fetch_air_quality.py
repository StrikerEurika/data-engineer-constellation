from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import timedelta
from src.elt.config import DEFAULT_DAG_ARGS
from src.elt.extractors import fetch_data_and_push_to_kafka

# Define the DAG (The schedule and structure)
with DAG(
    'cambodia_air_quality_ingestion',
    default_args=DEFAULT_DAG_ARGS,
    description='Fetch air quality API data and process with Spark',
    schedule_interval=timedelta(hours=1),
    catchup=False,
) as dag:
    ingest_task = PythonOperator(
        task_id='fetch_api_push_kafka',
        python_callable=fetch_data_and_push_to_kafka,
    )