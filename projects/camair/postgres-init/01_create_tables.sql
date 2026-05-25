-- This script runs automatically when the postgres container first starts.

-- 1. Create a separate database for the application data
-- (Note: The 'airflow' database is created automatically by docker-compose)
CREATE DATABASE camair;

-- 2. Connect to the new database
\c camair

-- Enable PostGIS (spatial extensions)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- 3. Create the provinces table with spatial geometry
CREATE TABLE IF NOT EXISTS provinces (
    adm1_pcode   TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    center_lat   DOUBLE PRECISION,
    center_lon   DOUBLE PRECISION,
    area_sqkm    DOUBLE PRECISION,
    geom         GEOMETRY(Geometry, 4326)
);

CREATE INDEX IF NOT EXISTS idx_provinces_geom ON provinces USING GIST (geom);

-- 4. Create the processed_air_quality table in the 'camair' database
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

-- 4. Create the processed_weather table
CREATE TABLE IF NOT EXISTS processed_weather (
    id                 INTEGER,
    name               TEXT,
    temp_c             DOUBLE PRECISION,
    temp_f             DOUBLE PRECISION,
    feelslike_c        DOUBLE PRECISION,
    feelslike_f        DOUBLE PRECISION,
    wind_mph           DOUBLE PRECISION,
    wind_kph           DOUBLE PRECISION,
    wind_degree        INTEGER,
    wind_dir           TEXT,
    pressure_mb        DOUBLE PRECISION,
    pressure_in        DOUBLE PRECISION,
    precip_mm          DOUBLE PRECISION,
    precip_in          DOUBLE PRECISION,
    humidity           INTEGER,
    cloud              INTEGER,
    vis_km             DOUBLE PRECISION,
    vis_miles          DOUBLE PRECISION,
    uv                 DOUBLE PRECISION,
    gust_mph           DOUBLE PRECISION,
    gust_kph           DOUBLE PRECISION,
    is_day             BOOLEAN,
    condition_text     TEXT,
    condition_icon     TEXT,
    condition_code     INTEGER,
    last_updated       TEXT,
    last_updated_epoch BIGINT,
    created_at         TEXT,
    created_at_ts      TIMESTAMP
);

-- 5. Create the processed_uv_index table
CREATE TABLE IF NOT EXISTS processed_uv_index (
    id                 INTEGER,
    name               TEXT,
    uv                 DOUBLE PRECISION,
    last_updated       TEXT,
    last_updated_epoch BIGINT,
    created_at         TEXT,
    created_at_ts      TIMESTAMP
);
