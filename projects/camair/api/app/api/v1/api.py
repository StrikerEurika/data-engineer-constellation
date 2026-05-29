from fastapi import APIRouter
from app.api.v1.endpoints import provinces, environmental

api_router = APIRouter()
api_router.include_router(provinces.router, prefix="/provinces", tags=["provinces"])
api_router.include_router(environmental.router, prefix="/realtime-api", tags=["environmental"])
