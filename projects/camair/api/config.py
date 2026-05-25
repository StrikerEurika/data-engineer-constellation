import os

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", 5432)),
    "dbname": os.getenv("DB_NAME", "camair"),
    "user": os.getenv("DB_USER", "airflow"),
    "password": os.getenv("DB_PASSWORD", "airflow"),
}

SQLALCHEMY_DATABASE_URL = (
    f"postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@"
    f"{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['dbname']}"
)

AQI_COLS = [
    "id", "name", "co", "no2", "o3", "so2", "pm2_5", "pm10",
    "us_epa_index", "gb_defra_index",
    "last_updated", "last_updated_epoch", "created_at",
]

WEATHER_COLS = [
    "id", "name", "temp_c", "temp_f", "feelslike_c", "feelslike_f",
    "wind_mph", "wind_kph", "wind_degree", "wind_dir",
    "pressure_mb", "pressure_in", "precip_mm", "precip_in",
    "humidity", "cloud", "vis_km", "vis_miles",
    "uv", "gust_mph", "gust_kph", "is_day",
    "condition_text", "condition_icon", "condition_code",
    "last_updated", "last_updated_epoch", "created_at",
]

UV_COLS = [
    "id", "name", "uv",
    "last_updated", "last_updated_epoch", "created_at",
]

POLL_INTERVAL = int(os.getenv("DB_POLL_INTERVAL_SECONDS", "2"))
