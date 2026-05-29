from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Database Configuration
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "camair"
    DB_USER: str = "airflow"
    DB_PASSWORD: str = "airflow"

    # Application Settings
    DB_POLL_INTERVAL_SECONDS: int = 2

    @property
    def SQLALCHEMY_DATABASE_URL(self) -> str:
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

# Column configurations (kept for compatibility or internal use)
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

# Aliases for backward compatibility if needed
SQLALCHEMY_DATABASE_URL = settings.SQLALCHEMY_DATABASE_URL
POLL_INTERVAL = settings.DB_POLL_INTERVAL_SECONDS
