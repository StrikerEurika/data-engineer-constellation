# AGENTS.md — Data Engineer Constellation

This is a Data Engineering learning monorepo. Each project lives under `projects/`.

## Structure

```
projects/
├── camair/          # Cambodia air quality pipeline (Airflow, Kafka, Spark, FastAPI, React)
├── _template/       # Copy this skeleton to start a new Python project
├── <assignment>/    # DE assignments, tutorials, experiments — flat and simple
└── projects/
    └── ...          # NO nesting — keep it flat
```

## How to add a new project

1. Copy `projects/_template/` → `projects/your-project-name/`
2. If it's Python: run `uv sync` inside it to generate `uv.lock`
3. If it's not Python (SQL, configs, docs): no package.json needed
4. Update its `README.md` to describe what it is
5. Add a `docker-compose.yml` **inside** the project if it needs its own infra

## Conventions

- **Python projects** use `uv` for dependency management (`pyproject.toml` + `uv.lock`)
- **Non-Python projects** (SQL only, configs, notebooks) — free-form, no package manager
- Python minimum version: **3.14**
- Type hints required for all Python code
- Each project directory is **self-contained** — src, tests, config, README all inside
- Root `docker-compose.yml` is for CamAir only; new projects get their own `docker-compose.yml`
- Use `ruff` for linting and formatting (run from root: `ruff check projects/`)
- Use `pytest` for tests (run from root: `pytest projects/`)

## Commands

```bash
ruff check projects/           # Lint ALL projects
pytest projects/               # Test ALL projects
ruff check projects/foo/       # Lint just one project
pytest projects/foo/           # Test just one project
```
