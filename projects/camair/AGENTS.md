# AGENTS.md — CamAir

This project builds a real-world Cambodia environmental data platform around spatial data, using Airflow, Kafka, Spark, PostgreSQL/PostGIS, Docker, FastAPI, and React.

## Project Goal

- Ingest Cambodia air quality, weather, and UV data from public APIs.
- Process the data into a usable multi-province dataset.
- Store geo-aware records in PostgreSQL/PostGIS.
- Expose clean APIs through FastAPI.
- Ship a usable web app that visualizes the data for Cambodia provinces.

## Freshness Target

- The source API refreshes every 15 minutes.
- ETL must pick up each refresh reliably, persist the latest state, and propagate updates through storage and API layers.
- The UI should reflect the newest available data without manual intervention.
- Prefer incremental, idempotent updates over full rewrites unless a full reload is explicitly needed.

## Core Architecture

- `etl/` owns ingestion, Airflow DAGs, Spark streaming jobs, and ETL configuration.
- `postgres-init/` owns database bootstrap and spatial schema setup.
- `api/` owns the FastAPI backend and read-only service layer.
- `web/` owns the React + TypeScript frontend dashboard.
- `scripts/` contains one-off operational helpers such as province seeding.

## Working Rules

- Prefer small, local changes that keep the pipeline runnable end to end.
- When changing data contracts, update every affected layer: ingestion, processing, database schema, API, and frontend as needed.
- Treat freshness as a first-class requirement. If the ETL cannot preserve a 15-minute update cadence, fix the pipeline before adding presentation changes.
- Keep spatial behavior explicit. Use province-level geography, coordinates, GeoJSON, and PostGIS functions intentionally.
- Do not copy secrets from `NOTE.md` into code, docs, or logs. Treat that file as sensitive reference material.
- Preserve the existing Docker-based workflow unless the task explicitly asks for a different setup.

## Implementation Priorities

- Favor production-shaped data modeling over toy examples.
- Prefer province-level aggregations and spatial queries over flat CSV-style outputs.
- Keep transformations deterministic and easy to test.
- Ensure persisted data stays aligned with the most recent API refresh so downstream services can serve current values.
- Make API responses and UI data structures simple enough to support a real dashboard.

## Validation Expectations

- For Python changes, run the smallest relevant lint or test command for the touched project area.
- For frontend changes, run the smallest relevant typecheck, lint, or build command in `web/`.
- For ETL and Docker changes, verify the affected service configuration still composes cleanly.

## Helpful References

- `README.md` for the overall system description and run instructions.
- `NOTE.md` for external API reference material.
- `docker-compose.camair.yml` for the full local stack.
