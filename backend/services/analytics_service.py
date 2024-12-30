from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
from collections import defaultdict

class TimeframeMetrics(BaseModel):
    total_assessments: int
    completed_assessments: int
    completion_rate: float
    average_score: float
    average_completion_time: float

class TherapistMetrics(BaseModel):
    assessments_assigned: int
    assessments_completed: int
    average_review_time: float
    patient_count: int
    average_patient_score: float

class PatientMetrics(BaseModel):
    assessment_count: int
    completion_rate: float
    average_score: float
    score_trend: List[float]
    last_assessment_date: Optional[datetime]

class AnalyticsService:
    def __init__(self, db_session):
        self.db = db_session

    async def get_dashboard_metrics(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=30)
        if not end_date:
            end_date = datetime.utcnow()

        # Mock data for now
        return {
            "overview": {
                "total_assessments": 150,
                "active_patients": 45,
                "active_therapists": 8,
                "pending_reviews": 12
            },
            "completion_rates": {
                "last_7_days": 85.5,
                "last_30_days": 82.3,
                "last_90_days": 80.1
            },
            "score_distribution": {
                "high": 35,
                "medium": 95,
                "low": 20
            },
            "trends": {
                "assessments_per_day": self._generate_trend_data(30),
                "average_scores": self._generate_trend_data(30, min_value=70, max_value=90),
                "completion_times": self._generate_trend_data(30, min_value=20, max_value=60)
            }
        }