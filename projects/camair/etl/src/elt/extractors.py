import json
import os
import sys
from datetime import datetime

import requests

from src.elt.config import (
    AIR_QUALITY_API_URL,
    WEATHER_API_URL,
    UV_API_URL,
    KAFKA_BOOTSTRAP_SERVERS,
    KAFKA_TOPIC_AIR_QUALITY,
    KAFKA_TOPIC_WEATHER,
    KAFKA_TOPIC_UV,
    LOCAL_OUTPUT_DIR,
)


def _fetch(api_url: str) -> list[dict]:
    print(f"Fetching data from {api_url}...")
    response = requests.get(api_url)
    response.raise_for_status()
    return response.json().get("data", [])


def _kafka_producer():
    from kafka import KafkaProducer

    return KafkaProducer(
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        value_serializer=lambda v: json.dumps(v).encode("utf-8"),
    )


def _push_to_kafka(records: list[dict], topic: str):
    producer = _kafka_producer()
    for record in records:
        producer.send(topic, value=record)
    producer.flush()
    print(f"Pushed {len(records)} records to Kafka topic: {topic}")


def _save_local(records: list[dict], name: str):
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    path = os.path.join(LOCAL_OUTPUT_DIR, f"{name}_{ts}.json")
    os.makedirs(LOCAL_OUTPUT_DIR, exist_ok=True)
    with open(path, "w") as f:
        json.dump(records, f, indent=2)
    print(f"Saved {len(records)} records to {path}")


def _fetch_and_produce(api_url: str, topic: str, name: str, use_kafka: bool = True):
    try:
        records = _fetch(api_url)
        if use_kafka:
            _push_to_kafka(records, topic)
        else:
            _save_local(records, name)
    except Exception as e:
        print(f"Error processing {name}: {e}")
        raise e


def fetch_air_quality_and_push_to_kafka():
    _fetch_and_produce(AIR_QUALITY_API_URL, KAFKA_TOPIC_AIR_QUALITY, "air_quality")


def fetch_weather_and_push_to_kafka():
    _fetch_and_produce(WEATHER_API_URL, KAFKA_TOPIC_WEATHER, "weather")


def fetch_uv_and_push_to_kafka():
    _fetch_and_produce(UV_API_URL, KAFKA_TOPIC_UV, "uv")


# ── CLI entry point for local / standalone use ──────────────────────────────


def main():
    """Fetch all 3 datasets locally (no Kafka)."""
    use_kafka = "--kafka" in sys.argv
    for url, topic, name in [
        (AIR_QUALITY_API_URL, KAFKA_TOPIC_AIR_QUALITY, "air_quality"),
        (WEATHER_API_URL, KAFKA_TOPIC_WEATHER, "weather"),
        (UV_API_URL, KAFKA_TOPIC_UV, "uv"),
    ]:
        _fetch_and_produce(url, topic, name, use_kafka=use_kafka)


if __name__ == "__main__":
    main()
