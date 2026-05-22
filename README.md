# Data Engineer Constellation

A monorepo for Data Engineering learning projects. Each project is a star in the constellation.

## Projects

| Project | Description | Stack |
|---------|-------------|-------|
| [CamAir](./projects/camair/) | Cambodia air quality pipeline | Airflow, Kafka, Spark, PostgreSQL, FastAPI, React |

### CamAir

Ingests Cambodia air quality data from a public API, streams it through Kafka, processes with Spark Structured Streaming, serves via FastAPI, and visualizes with React.

See [projects/camair/README.md](./projects/camair/README.md) for details.

## Upcoming Projects

- Batch processing (dbt + Spark)
- Real-time streaming (Flink/Kafka Streams)
- Data warehousing (DuckDB/ClickHouse)
- ML pipelines (Feast + Airflow)
- Streaming with RisingWave/Materialize

## Root Commands

```bash
# Start CamAir (docker-compose.yml at root)
docker compose up -d

# Lint Python across all projects
ruff check projects/

# Run tests across all projects
pytest projects/
```
