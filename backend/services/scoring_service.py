from typing import Dict, List, Optional, Any
from pydantic import BaseModel

class ScoringRule(BaseModel):
    field_id: str
    weight: float = 1.0
    scoring_method: str  # 'numeric', 'scale', 'custom'
    value_map: Optional[Dict[str, float]] = None
    custom_logic: Optional[str] = None

class ScoringMethod(BaseModel):
    method: str  # 'weighted_sum', 'average', 'custom'
    rules: List[ScoringRule]
    ranges: List[ScoreRange]
    custom_logic: Optional[str] = None

class ScoringResult(BaseModel):
    total_score: float
    section_scores: Dict[str, float]
    field_scores: Dict[str, float]
    score_label: Optional[str] = None
    details: Optional[Dict[str, Any]] = None