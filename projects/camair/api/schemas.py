from datetime import datetime
from typing import Generic, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    data: list[T]

class ProvinceBase(BaseModel):
    adm1_pcode: str
    name: str
    center_lat: Optional[float]
    center_lon: Optional[float]
    area_sqkm: Optional[float]

    class Config:
        from_attributes = True

class AirQualityBase(BaseModel):
    id: Optional[int]
    adm1_pcode: Optional[str] = None
    name: str
    co: Optional[float]
    no2: Optional[float]
    o3: Optional[float]
    so2: Optional[float]
    pm2_5: Optional[float]
    pm10: Optional[float]
    us_epa_index: Optional[int]
    gb_defra_index: Optional[int]
    last_updated: Optional[str]
    last_updated_epoch: Optional[int]
    created_at: Optional[str]
    created_at_ts: Optional[datetime]

    class Config:
        from_attributes = True

class WeatherBase(BaseModel):
    id: Optional[int]
    adm1_pcode: Optional[str] = None
    name: str
    temp_c: Optional[float]
    temp_f: Optional[float]
    feelslike_c: Optional[float]
    feelslike_f: Optional[float]
    wind_mph: Optional[float]
    wind_kph: Optional[float]
    wind_degree: Optional[int]
    wind_dir: Optional[str]
    pressure_mb: Optional[float]
    pressure_in: Optional[float]
    precip_mm: Optional[float]
    precip_in: Optional[float]
    humidity: Optional[int]
    cloud: Optional[int]
    vis_km: Optional[float]
    vis_miles: Optional[float]
    uv: Optional[float]
    gust_mph: Optional[float]
    gust_kph: Optional[float]
    is_day: Optional[bool]
    condition_text: Optional[str]
    condition_icon: Optional[str]
    condition_code: Optional[int]
    last_updated: Optional[str]
    last_updated_epoch: Optional[int]
    created_at: Optional[str]
    created_at_ts: Optional[datetime]

    class Config:
        from_attributes = True

class UVBase(BaseModel):
    id: Optional[int]
    adm1_pcode: Optional[str] = None
    name: str
    uv: Optional[float]
    last_updated: Optional[str]
    last_updated_epoch: Optional[int]
    created_at: Optional[str]
    created_at_ts: Optional[datetime]

    class Config:
        from_attributes = True
