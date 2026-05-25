import json
import os
import time
from datetime import datetime, timezone

import requests

from src.elt.config import (
    AIR_QUALITY_API_URL,
    WEATHER_API_URL,
    UV_API_URL,
    KAFKA_BOOTSTRAP_SERVERS,
    KAFKA_TOPIC_AIR_QUALITY,
    KAFKA_TOPIC_WEATHER,
    KAFKA_TOPIC_UV,
)

POLL_INTERVAL = int(os.getenv("POLL_INTERVAL_SECONDS", "30"))


def _fetch(api_url: str) -> list[dict]:
    response = requests.get(api_url, timeout=15)
    response.raise_for_status()
    return response.json().get("data", [])


def _kafka_producer():
    from kafka import KafkaProducer

    return KafkaProducer(
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        value_serializer=lambda v: json.dumps(v).encode("utf-8"),
    )


def _push_to_kafka(records: list[dict], topic: str):
    if not records:
        return
    producer = _kafka_producer()
    for record in records:
        producer.send(topic, value=record)
    producer.flush()


def _fetch_and_produce(api_url: str, topic: str, name: str):
    try:
        records = _fetch(api_url)
        _push_to_kafka(records, topic)
        print(
            f"[{datetime.now(timezone.utc).isoformat()}] {name}: "
            f"pushed {len(records)} records to {topic}"
        )
    except Exception as e:
        print(
            f"[{datetime.now(timezone.utc).isoformat()}] "
            f"Error fetching {name}: {e}"
        )


def run_forever():
    print(
        f"Starting continuous ingestor "
        f"(poll interval: {POLL_INTERVAL}s)"
    )
    while True:
        _fetch_and_produce(
            AIR_QUALITY_API_URL, KAFKA_TOPIC_AIR_QUALITY, "air_quality"
        )
        _fetch_and_produce(WEATHER_API_URL, KAFKA_TOPIC_WEATHER, "weather")
        _fetch_and_produce(UV_API_URL, KAFKA_TOPIC_UV, "uv")
        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    run_forever()
