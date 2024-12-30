from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from collections import defaultdict
import asyncio
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

class MetricUpdate(BaseModel):
    """Model for metric updates"""
    metric_type: str
    value: Any
    timestamp: datetime = datetime.utcnow()
    metadata: Optional[Dict[str, Any]] = None

class DashboardMetrics:
    """Manages dashboard metrics and real-time updates"""
    
    def __init__(self):
        self._metrics = defaultdict(list)
        self._subscribers = set()
        self._lock = asyncio.Lock()
        
    async def update_metric(self, update: MetricUpdate) -> None:
        """Update a metric and notify subscribers"""
        async with self._lock:
            self._metrics[update.metric_type].append({
                "value": update.value,
                "timestamp": update.timestamp,
                "metadata": update.metadata or {}
            })
            
            # Maintain history (keep last 6 months)
            cutoff = datetime.utcnow() - timedelta(days=180)
            self._metrics[update.metric_type] = [
                m for m in self._metrics[update.metric_type]
                if m["timestamp"] > cutoff
            ]
            
            # Notify subscribers
            if self._subscribers:
                await self._notify_subscribers(update)
                
    async def _notify_subscribers(self, update: MetricUpdate) -> None:
        """Notify all subscribers of metric updates"""
        message = {
            "type": "metric_update",
            "metric": update.metric_type,
            "value": update.value,
            "timestamp": update.timestamp.isoformat(),
            "metadata": update.metadata
        }
        
        for subscriber in self._subscribers:
            try:
                await subscriber(message)
            except Exception as e:
                logger.error(f"Error notifying subscriber: {str(e)}")
                
    def subscribe(self, callback) -> None:
        """Add a subscriber for metric updates"""
        self._subscribers.add(callback)
        
    def unsubscribe(self, callback) -> None:
        """Remove a subscriber"""
        self._subscribers.discard(callback)
        
    def get_current_metrics(self) -> Dict[str, Any]:
        """Get current values for all metrics"""
        current_metrics = {}
        
        # Active Clients
        active_clients = self._calculate_active_clients()
        current_metrics["activeClients"] = {
            "value": active_clients["current"],
            "change": active_clients["change"],
            "period": "this week"
        }
        
        # Pending Assessments
        pending = self._calculate_pending_assessments()
        current_metrics["pendingAssessments"] = {
            "value": pending["count"],
            "priority": pending["high_priority"]
        }
        
        # Scheduled Hours
        scheduled = self._calculate_scheduled_hours()
        current_metrics["scheduledHours"] = {
            "value": scheduled["current"],
            "nextWeek": scheduled["next_week"]
        }
        
        # Reports Due
        reports = self._calculate_reports_due()
        current_metrics["reportsDue"] = {
            "value": reports["count"],
            "urgent": reports["urgent"]
        }
        
        return current_metrics
        
    def get_trend_data(self) -> Dict[str, List[Dict[str, Any]]]:
        """Get trend data for charts"""
        now = datetime.utcnow()
        month_start = datetime(now.year, now.month, 1)
        
        trends = {
            "completed": self._get_assessment_trends("completed", month_start),
            "pending": self._get_assessment_trends("pending", month_start),
            "predicted": self._generate_predictions()
        }
        
        return trends
        
    def _calculate_active_clients(self) -> Dict[str, int]:
        """Calculate active clients metrics"""
        now = datetime.utcnow()
        week_ago = now - timedelta(days=7)
        
        current = len(set(
            m["metadata"].get("client_id")
            for m in self._metrics.get("client_activity", [])
            if m["timestamp"] > week_ago
        ))
        
        previous = len(set(
            m["metadata"].get("client_id")
            for m in self._metrics.get("client_activity", [])
            if week_ago - timedelta(days=7) < m["timestamp"] <= week_ago
        ))
        
        return {
            "current": current,
            "change": current - previous
        }
        
    def _calculate_pending_assessments(self) -> Dict[str, int]:
        """Calculate pending assessment metrics"""
        pending = [
            m for m in self._metrics.get("assessment_status", [])
            if m["value"] == "pending"
        ]
        
        high_priority = len([
            p for p in pending
            if p["metadata"].get("priority") == "high"
        ])
        
        return {
            "count": len(pending),
            "high_priority": high_priority
        }
        
    def _calculate_scheduled_hours(self) -> Dict[str, int]:
        """Calculate scheduled hours metrics"""
        now = datetime.utcnow()
        week_start = now - timedelta(days=now.weekday())
        next_week = week_start + timedelta(days=7)
        
        current_week = sum(
            m["value"]
            for m in self._metrics.get("scheduled_hours", [])
            if week_start <= m["timestamp"] < next_week
        )
        
        next_week_hours = sum(
            m["value"]
            for m in self._metrics.get("scheduled_hours", [])
            if next_week <= m["timestamp"] < next_week + timedelta(days=7)
        )
        
        return {
            "current": current_week,
            "next_week": next_week_hours
        }
        
    def _calculate_reports_due(self) -> Dict[str, int]:
        """Calculate reports due metrics"""
        reports = [
            m for m in self._metrics.get("report_status", [])
            if m["value"] == "pending"
        ]
        
        urgent = len([
            r for r in reports
            if r["metadata"].get("due_date")
            and datetime.fromisoformat(r["metadata"]["due_date"]) <= datetime.utcnow() + timedelta(days=2)
        ])
        
        return {
            "count": len(reports),
            "urgent": urgent
        }
        
    def _get_assessment_trends(self, status: str, since: datetime) -> List[Dict[str, Any]]:
        """Get trend data for assessments"""
        metrics = [
            m for m in self._metrics.get("assessment_status", [])
            if m["value"] == status and m["timestamp"] >= since
        ]
        
        # Group by day
        daily_counts = defaultdict(int)
        for metric in metrics:
            day = metric["timestamp"].date()
            daily_counts[day] += 1
            
        return [
            {"date": day.isoformat(), "value": count}
            for day, count in sorted(daily_counts.items())
        ]
        
    def _generate_predictions(self) -> List[Dict[str, Any]]:
        """Generate prediction data for future assessments"""
        # Get historical data
        now = datetime.utcnow()
        history_start = now - timedelta(days=90)
        
        completed = self._get_assessment_trends("completed", history_start)
        if not completed:
            return []
            
        # Calculate trend
        values = [item["value"] for item in completed]
        if len(values) < 2:
            return []
            
        # Simple linear regression
        n = len(values)
        sum_x = sum(range(n))
        sum_y = sum(values)
        sum_xy = sum(i * v for i, v in enumerate(values))
        sum_xx = sum(i * i for i in range(n))
        
        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x)
        intercept = (sum_y - slope * sum_x) / n
        
        # Generate predictions
        predictions = []
        last_date = datetime.fromisoformat(completed[-1]["date"])
        
        for i in range(1, 91):  # 3 months prediction
            next_date = last_date + timedelta(days=i)
            predicted_value = max(0, round(intercept + slope * (n + i), 1))
            
            predictions.append({
                "date": next_date.isoformat(),
                "value": predicted_value
            })
            
        return predictions

    def get_insights(self) -> Dict[str, Any]:
        """Generate AI insights based on metrics"""
        insights = {
            "riskFactors": [],
            "status": "Normal workload",
            "actionItems": [],
            "areasOfAttention": []
        }
        
        # Check workload increase
        active_clients = self._calculate_active_clients()
        if active_clients["change"] > 5:
            insights["riskFactors"].append({
                "type": "workload_alert",
                "message": "Increased intake rate detected",
                "recommendations": [
                    "Consider redistributing new cases",
                    "Review capacity for next week"
                ]
            })
        
        # Check assessment delays
        pending = self._calculate_pending_assessments()
        if pending["high_priority"] > 2:
            insights["actionItems"].append(
                "Schedule team review for high-priority cases"
            )
        
        # Set overall status
        if pending["high_priority"] > 2 or active_clients["change"] > 5:
            insights["status"] = "Moderate workload with some attention needed"
        
        # Areas of attention
        reports = self._calculate_reports_due()
        if reports["urgent"] > 0:
            insights["areasOfAttention"].append(
                "Some reports approaching deadline"
            )
        
        if pending["high_priority"] > 0:
            insights["areasOfAttention"].append(
                "Higher than usual intake rate"
            )
            
        return insights