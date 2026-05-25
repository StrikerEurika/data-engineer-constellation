from sqlalchemy import Column, Integer, String, Float, BigInteger, DateTime, Boolean
from geoalchemy2 import Geometry
from database import Base

class Province(Base):
    __tablename__ = "provinces"
    adm1_pcode = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    center_lat = Column(Float)
    center_lon = Column(Float)
    area_sqkm = Column(Float)
    geom = Column(Geometry('GEOMETRY', srid=4326))

class AirQuality(Base):
    __tablename__ = "processed_air_quality"
    # Using a composite of id and created_at as a workaround if no single PK exists,
    # but based on SQL, id is present. We'll mark id as PK for SQLAlchemy.
    id = Column(Integer, primary_key=True)
    name = Column(String)
    co = Column(Float)
    no2 = Column(Float)
    o3 = Column(Float)
    so2 = Column(Float)
    pm2_5 = Column(Float)
    pm10 = Column(Float)
    us_epa_index = Column(Integer)
    gb_defra_index = Column(Integer)
    last_updated = Column(String)
    last_updated_epoch = Column(BigInteger)
    created_at = Column(String)
    created_at_ts = Column(DateTime)

class Weather(Base):
    __tablename__ = "processed_weather"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    temp_c = Column(Float)
    temp_f = Column(Float)
    feelslike_c = Column(Float)
    feelslike_f = Column(Float)
    wind_mph = Column(Float)
    wind_kph = Column(Float)
    wind_degree = Column(Integer)
    wind_dir = Column(String)
    pressure_mb = Column(Float)
    pressure_in = Column(Float)
    precip_mm = Column(Float)
    precip_in = Column(Float)
    humidity = Column(Integer)
    cloud = Column(Integer)
    vis_km = Column(Float)
    vis_miles = Column(Float)
    uv = Column(Float)
    gust_mph = Column(Float)
    gust_kph = Column(Float)
    is_day = Column(Boolean)
    condition_text = Column(String)
    condition_icon = Column(String)
    condition_code = Column(Integer)
    last_updated = Column(String)
    last_updated_epoch = Column(BigInteger)
    created_at = Column(String)
    created_at_ts = Column(DateTime)

class UVIndex(Base):
    __tablename__ = "processed_uv_index"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    uv = Column(Float)
    last_updated = Column(String)
    last_updated_epoch = Column(BigInteger)
    created_at = Column(String)
    created_at_ts = Column(DateTime)
