-- This script runs automatically when the postgres container first starts.

-- 1. Create a separate database for the application data
-- (Note: The 'airflow' database is created automatically by docker-compose)
CREATE DATABASE camair;

-- 2. Connect to the new database
\c camair

-- 3. Create the processed_air_quality table in the 'camair' database
CREATE TABLE IF NOT EXISTS processed_air_quality (
    id                 INTEGER,
    name               TEXT,
    co                 DOUBLE PRECISION,
    no2                DOUBLE PRECISION,
    o3                 DOUBLE PRECISION,
    so2                DOUBLE PRECISION,
    pm2_5              DOUBLE PRECISION,
    pm10               DOUBLE PRECISION,
    us_epa_index       INTEGER,
    gb_defra_index     INTEGER,
    last_updated       TEXT,
    last_updated_epoch BIGINT,
    created_at         TEXT,
    created_at_ts      TIMESTAMP
);
