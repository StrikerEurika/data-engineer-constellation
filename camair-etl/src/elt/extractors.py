import requests
import json
from kafka import KafkaProducer
from src.elt.config import AIR_QUALITY_API_URL, KAFKA_BOOTSTRAP_SERVERS, KAFKA_TOPIC_RAW


def fetch_data_and_push_to_kafka():
    producer = KafkaProducer(
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        value_serializer=lambda v: json.dumps(v).encode("utf-8"),
    )

    try:
        print(f"Fetching data from {AIR_QUALITY_API_URL}...")
        response = requests.get(AIR_QUALITY_API_URL)
        response.raise_for_status()
        data_payload = response.json()
        for record in data_payload.get("data", []):
            producer.send(KAFKA_TOPIC_RAW, value=record)
        producer.flush()
        print(f"Successfully pushed data to Kafka topic: {KAFKA_TOPIC_RAW}")

    except Exception as e:
        print(f"Error fetching or pushing data: {e}")
        raise e
