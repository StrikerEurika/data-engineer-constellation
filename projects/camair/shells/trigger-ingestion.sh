#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Fetching raw AQI, Weather, and UVI data..."
cd "$PROJECT_ROOT/etl"
uv run scr.elt.extractors
