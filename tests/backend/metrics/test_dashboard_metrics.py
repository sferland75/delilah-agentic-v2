import pytest
from datetime import datetime, timedelta
from uuid import uuid4
import asyncio
from backend.metrics.dashboard_metrics import DashboardMetrics, MetricUpdate

@pytest.fixture
def metrics():
    return DashboardMetrics()

@pytest.fixture
def sample_metrics_data(metrics):
    """Populate metrics with sample data"""
    # Active clients
    client_ids = [uuid4() for _ in range(5)]
    for client_id in client_ids:
        metrics._metrics["client_activity"].extend([
            {
                "value": "active",
                "timestamp": datetime.utcnow() - timedelta(days=i),
                "metadata": {"client_id": client_id}
            }
            for i in range(14)  # Two weeks of activity
        ])
    
    # Pending assessments
    for i in range(7):
        metrics._metrics["assessment_status"].append({
            "value": "pending",
            "timestamp": datetime.utcnow() - timedelta(days=i),
            "metadata": {"priority": "high" if i < 3 else "normal"}
        })
    
    # Scheduled hours
    current_week = datetime.utcnow()
    next_week = current_week + timedelta(days=7)
    metrics._metrics["scheduled_hours"].extend([
        {
            "value": 4,
            "timestamp": current_week + timedelta(days=i),
            "metadata": {}
        }
        for i in range(14)  # Two weeks of scheduled hours
    ])
    
    # Reports due
    for i in range(5):
        due_date = datetime.utcnow() + timedelta(days=1 if i < 2 else 5)
        metrics._metrics["report_status"].append({
            "value": "pending",
            "timestamp": datetime.utcnow(),
            "metadata": {"due_date": due_date.isoformat()}
        })
    
    return metrics

@pytest.mark.asyncio
async def test_metric_update(metrics):
    update = MetricUpdate(
        metric_type="test_metric",
        value=42,
        metadata={"test": "data"}
    )
    
    await metrics.update_metric(update)
    assert len(metrics._metrics["test_metric"]) == 1
    assert metrics._metrics["test_metric"][0]["value"] == 42

@pytest.mark.asyncio
async def test_metric_subscription(metrics):
    received_messages = []
    
    async def callback(message):
        received_messages.append(message)
    
    metrics.subscribe(callback)
    
    update = MetricUpdate(
        metric_type="test_metric",
        value=42
    )
    
    await metrics.update_metric(update)
    assert len(received_messages) == 1
    assert received_messages[0]["value"] == 42

def test_current_metrics(sample_metrics_data):
    metrics = sample_metrics_data
    current = metrics.get_current_metrics()
    
    # Check active clients
    assert "activeClients" in current
    assert current["activeClients"]["value"] == 5
    assert "change" in current["activeClients"]
    
    # Check pending assessments
    assert "pendingAssessments" in current
    assert current["pendingAssessments"]["value"] == 7
    assert current["pendingAssessments"]["priority"] == 3
    
    # Check scheduled hours
    assert "scheduledHours" in current
    assert "value" in current["scheduledHours"]
    assert "nextWeek" in current["scheduledHours"]
    
    # Check reports due
    assert "reportsDue" in current
    assert current["reportsDue"]["value"] == 5
    assert current["reportsDue"]["urgent"] == 2

def test_trend_data(sample_metrics_data):
    metrics = sample_metrics_data
    trends = metrics.get_trend_data()
    
    assert "completed" in trends
    assert "pending" in trends
    assert "predicted" in trends
    
    # Check predictions
    assert len(trends["predicted"]) > 0
    for prediction in trends["predicted"]:
        assert "date" in prediction
        assert "value" in prediction
        assert isinstance(prediction["value"], (int, float))
        assert prediction["value"] >= 0  # No negative predictions

def test_insights(sample_metrics_data):
    metrics = sample_metrics_data
    insights = metrics.get_insights()
    
    assert "riskFactors" in insights
    assert "status" in insights
    assert "actionItems" in insights
    assert "areasOfAttention" in insights
    
    # Check risk detection
    assert any(
        risk["type"] == "workload_alert"
        for risk in insights["riskFactors"]
    )
    
    # Check action items for high-priority cases
    assert any(
        "high-priority cases" in item.lower()
        for item in insights["actionItems"]
    )
    
    # Verify status reflects workload
    assert "workload" in insights["status"].lower()

@pytest.mark.asyncio
async def test_metric_history_maintenance(metrics):
    # Add old metrics
    old_date = datetime.utcnow() - timedelta(days=200)
    old_update = MetricUpdate(
        metric_type="test_metric",
        value="old_value",
        timestamp=old_date
    )
    await metrics.update_metric(old_update)
    
    # Add recent metrics
    recent_update = MetricUpdate(
        metric_type="test_metric",
        value="recent_value"
    )
    await metrics.update_metric(recent_update)
    
    # Check that old metrics are cleaned up
    assert len(metrics._metrics["test_metric"]) == 1
    assert metrics._metrics["test_metric"][0]["value"] == "recent_value"

@pytest.mark.asyncio
async def test_multiple_subscribers(metrics):
    messages1 = []
    messages2 = []
    
    async def callback1(message):
        messages1.append(message)
        
    async def callback2(message):
        messages2.append(message)
    
    metrics.subscribe(callback1)
    metrics.subscribe(callback2)
    
    update = MetricUpdate(
        metric_type="test_metric",
        value=42
    )
    
    await metrics.update_metric(update)
    
    assert len(messages1) == 1
    assert len(messages2) == 1
    assert messages1[0]["value"] == messages2[0]["value"] == 42

@pytest.mark.asyncio
async def test_subscriber_error_handling(metrics):
    async def failing_callback(message):
        raise Exception("Test error")
    
    metrics.subscribe(failing_callback)
    
    update = MetricUpdate(
        metric_type="test_metric",
        value=42
    )
    
    # Should not raise exception
    await metrics.update_metric(update)
    
    # Subscriber should still be registered
    assert failing_callback in metrics._subscribers

def test_trend_data_empty_metrics(metrics):
    trends = metrics.get_trend_data()
    
    assert "completed" in trends
    assert "pending" in trends
    assert "predicted" in trends
    
    assert len(trends["completed"]) == 0
    assert len(trends["pending"]) == 0
    assert len(trends["predicted"]) == 0