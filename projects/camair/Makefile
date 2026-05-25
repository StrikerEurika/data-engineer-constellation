.PHONY: db-up db-down db-reset seed api-run api-dev lint

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

# Run the FastAPI app (production mode)
api-run:
	uv run uvicorn main:app --host 0.0.0.0 --port 8000 --app-dir api

# Run the FastAPI app with hot reload (development)
api-dev:
	uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000 --app-dir api

# Lint all Python files in the project
lint:
	uv tool run ruff check api/main.py scripts/ scripts/../etl/src/ scripts/../etl/dags/
