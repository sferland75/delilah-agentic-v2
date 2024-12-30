from typing import List, Dict, Any, Optional
from datetime import datetime
from uuid import uuid4
from pydantic import BaseModel

class ReportConfig(BaseModel):
    id: str
    name: str
    type: str  # 'assessment', 'patient', 'therapist', 'summary'
    filters: Dict[str, Any]
    grouping: Optional[List[str]] = None
    metrics: List[str]
    sort_by: Optional[str] = None
    sort_order: Optional[str] = 'asc'
    limit: Optional[int] = None

class ReportResult(BaseModel):
    id: str
    config_id: str
    generated_at: datetime
    data: List[Dict[str, Any]]
    summary: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None