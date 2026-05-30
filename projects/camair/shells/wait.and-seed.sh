#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Checking if database is ready..."
until docker compose -f "$PROJECT_ROOT/docker-compose.camair.yml" exec postgres pg_isready -U postgres; do
  echo "Database is unavailable - sleeping..."
  sleep 2
done

echo "Database is up! Seeding provinces..."
uv run "$PROJECT_ROOT/scripts/seed_provinces.py"
