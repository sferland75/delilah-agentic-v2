from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from datetime import datetime
from ..services.analytics_service import AnalyticsService
from ..database import get_db

router = APIRouter()

@router.get("/analytics/dashboard")
async def get_dashboard_metrics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db = Depends(get_db),
    analytics_service: AnalyticsService = Depends(lambda: AnalyticsService(db))
):
    return await analytics_service.get_dashboard_metrics(start_date, end_date)