from typing import Optional
from pydantic import BaseModel

class ProvinceBase(BaseModel):
    adm1_pcode: str
    name: str
    center_lat: Optional[float]
    center_lon: Optional[float]
    area_sqkm: Optional[float]

    class Config:
        from_attributes = True
