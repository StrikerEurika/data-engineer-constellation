import requests
import json
from kafka import KafkaProducer
from src.elt.config import (
    AIR_QUALITY_API_URL,
    WEATHER_API_URL,
    UV_API_URL,
    KAFKA_BOOTSTRAP_SERVERS,
    KAFKA_TOPIC_AIR_QUALITY,
    KAFKA_TOPIC_WEATHER,
    KAFKA_TOPIC_UV,
)


def _fetch_and_produce(api_url: str, topic: str):
    producer = KafkaProducer(
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        value_serializer=lambda v: json.dumps(v).encode("utf-8"),
    )

    try:
        print(f"Fetching data from {api_url}...")
        response = requests.get(api_url)
        response.raise_for_status()
        data_payload = response.json()
        for record in data_payload.get("data", []):
            producer.send(topic, value=record)
        producer.flush()
        print(f"Successfully pushed {len(data_payload.get('data', []))} records to Kafka topic: {topic}")

    except Exception as e:
        print(f"Error fetching from {api_url} or pushing to {topic}: {e}")
        raise e


def fetch_air_quality_and_push_to_kafka():
    _fetch_and_produce(AIR_QUALITY_API_URL, KAFKA_TOPIC_AIR_QUALITY)


def fetch_weather_and_push_to_kafka():
    _fetch_and_produce(WEATHER_API_URL, KAFKA_TOPIC_WEATHER)


def fetch_uv_and_push_to_kafka():
    _fetch_and_produce(UV_API_URL, KAFKA_TOPIC_UV)
