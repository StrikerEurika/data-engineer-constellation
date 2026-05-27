.PHONY: db-up db-down db-reset seed api-run api-dev etl-fetch etl-fetch-kafka lint

# ── Database ─────────────────────────────────────────────────────────────────

# Start PostgreSQL + PostGIS in Docker (headless)
db-up:
	docker compose -f docker-compose.camair.yml up -d postgres

# Stop the database container
db-down:
	docker compose -f docker-compose.camair.yml down

# Wipe and re-create the camair database, then re-seed
db-reset: db-down
	docker compose -f docker-compose.camair.yml up -d postgres
	@sleep 3
	uv run python scripts/seed_provinces.py

# Seed province boundaries from GeoJSON into PostGIS
seed:
	uv run python scripts/seed_provinces.py

# ── API ──────────────────────────────────────────────────────────────────────

# Run the FastAPI app (production mode)
api-run:
	uv run uvicorn main:app --host 0.0.0.0 --port 8000 --app-dir api

# Run the FastAPI app with hot reload (development)
api-dev:
	uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000 --app-dir api

# ── ETL ──────────────────────────────────────────────────────────────────────

# Install ETL dependencies (first time)
etl-install:
	cd etl && uv sync

# Fetch all 3 datasets from MEF API and save to data/raw/ as JSON (no Kafka)
etl-fetch:
	cd etl && uv run python -m src.elt.extractors

# Fetch and push to Kafka (requires Kafka running on localhost:9092)
etl-fetch-kafka:
	cd etl && KAFKA_BOOTSTRAP_SERVERS=localhost:9092 uv run python -m src.elt.extractors --kafka

# ── Lint ─────────────────────────────────────────────────────────────────────

lint:
	uv tool run ruff check api/main.py scripts/ scripts/../etl/src/ scripts/../etl/dags/

# --- Web ──────────────────────────────────────────────────────────────────────────────

# web dev
web-dev:
	npm --prefix web run dev