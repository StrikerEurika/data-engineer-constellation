#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE camair;
    GRANT ALL PRIVILEGES ON DATABASE camair TO $POSTGRES_USER;
EOSQL
