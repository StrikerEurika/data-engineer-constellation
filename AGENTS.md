# AGENTS.md — Data Engineer Constellation

This is a Data Engineering learning monorepo. Each project lives under `projects/`.

## Structure

```
projects/
├── camair/     # Cambodia air quality pipeline (Airflow, Kafka, Spark, FastAPI, React)
├── ...         # Future DE projects
```

## Conventions

- Python projects use `uv` for dependency management (`pyproject.toml` + `uv.lock`)
- Python minimum version: 3.14
- Type hints required for all Python code
- Docker Compose at root orchestrates the active project
- Each project has its own `docker-compose.yml` if standalone
- Use `ruff` for linting and formatting
- Use `pytest` for tests

## Commands

```bash
docker compose up -d --build   # Start CamAir stack
docker compose down -v         # Stop and clean volumes
ruff check projects/           # Lint all projects
pytest projects/               # Test all projects
```
