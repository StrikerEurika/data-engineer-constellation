from sqlalchemy import Column, String, Float
from geoalchemy2 import Geometry
from app.models.base import Base

class Province(Base):
    __tablename__ = "provinces"
    adm1_pcode = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    center_lat = Column(Float)
    center_lon = Column(Float)
    area_sqkm = Column(Float)
    geom = Column(Geometry('GEOMETRY', srid=4326))
