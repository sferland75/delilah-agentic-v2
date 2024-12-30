from typing import Dict, List, Optional, Any
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel

from .base import BaseAgent, AgentType, AgentStatus, AgentContext

class AnalysisResult(BaseModel):
    """Model for analysis outputs"""
    client_id: UUID
    assessment_id: UUID
    timestamp: datetime
    insights: Dict[str, Any]
    recommendations: List[Dict[str, Any]]
    metrics: Dict[str, Any]
    risk_score: float
    priority_level: str

class AnalysisAgent(BaseAgent):
    """Agent responsible for analyzing assessment data and generating insights"""
    
    def __init__(self, name: str = "analysis_agent"):
        super().__init__(AgentType.ANALYSIS, name)
        
    async def analyze_assessment(
        self, 
        assessment_data: Dict[str, Any], 
        context: AgentContext
    ) -> AnalysisResult:
        """Analyze processed assessment data and generate insights"""
        session_id = await self.start_session(context)
        
        try:
            self.update_status(AgentStatus.BUSY)
            
            # Extract key components
            functional_changes = assessment_data.get("functional_changes", {})
            risk_factors = assessment_data.get("risk_factors", [])
            metrics = assessment_data.get("metrics", {})
            
            # Generate insights
            insights = self._generate_insights(
                functional_changes,
                risk_factors,
                metrics
            )
            
            # Calculate risk score
            risk_score = self._calculate_risk_score(
                functional_changes,
                risk_factors,
                metrics
            )
            
            # Determine priority level
            priority_level = self._determine_priority(risk_score, risk_factors)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                insights,
                risk_score,
                priority_level
            )
            
            # Update metrics
            await self._update_metrics(insights, risk_score)
            
            result = AnalysisResult(
                client_id=assessment_data["client_id"],
                assessment_id=assessment_data["id"],
                timestamp=datetime.utcnow(),
                insights=insights,
                recommendations=recommendations,
                metrics=metrics,
                risk_score=risk_score,
                priority_level=priority_level
            )
            
            self.update_status(AgentStatus.IDLE)
            return result
            
        except Exception as e:
            await self.handle_error(e, context)
            raise
        finally:
            await self.end_session(session_id)
            
    def _generate_insights(
        self,
        functional_changes: Dict[str, Any],
        risk_factors: List[Dict[str, Any]],
        metrics: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate insights from assessment data"""
        insights = {
            "functional_impact": {
                "overall_status": self._analyze_functional_status(functional_changes),
                "key_areas": self._identify_key_impact_areas(functional_changes),
                "trends": self._analyze_trends(metrics)
            },
            "risk_analysis": {
                "primary_risks": self._analyze_primary_risks(risk_factors),
                "secondary_risks": self._analyze_secondary_risks(risk_factors),
                "environmental_factors": self._analyze_environmental_factors(risk_factors)
            },
            "intervention_needs": {
                "immediate": [],
                "short_term": [],
                "long_term": []
            }
        }
        
        return insights
        
    def _calculate_risk_score(
        self,
        functional_changes: Dict[str, Any],
        risk_factors: List[Dict[str, Any]],
        metrics: Dict[str, Any]
    ) -> float:
        """Calculate overall risk score"""
        base_score = 0.0
        
        # Risk factor weights
        severity_weights = {
            "high": 1.0,
            "moderate": 0.6,
            "low": 0.3
        }
        
        # Calculate risk factor component
        for risk in risk_factors:
            base_score += severity_weights.get(risk["severity"], 0.3)
            
        # Adjust for functional changes
        if functional_changes.get("adl_changes"):
            base_score += len(functional_changes["adl_changes"]) * 0.2
            
        # Normalize to 0-10 scale
        normalized_score = min(base_score, 10.0)
        
        return round(normalized_score, 1)
        
    def _determine_priority(
        self,
        risk_score: float,
        risk_factors: List[Dict[str, Any]]
    ) -> str:
        """Determine priority level based on risk score and factors"""
        if risk_score >= 8.0 or any(r["severity"] == "high" for r in risk_factors):
            return "high"
        elif risk_score >= 5.0:
            return "moderate"
        else:
            return "low"
            
    def _generate_recommendations(
        self,
        insights: Dict[str, Any],
        risk_score: float,
        priority_level: str
    ) -> List[Dict[str, Any]]:
        """Generate recommendations based on insights and risk level"""
        recommendations = []
        
        # Add immediate recommendations based on priority
        if priority_level == "high":
            recommendations.extend([
                {
                    "type": "immediate",
                    "category": "safety",
                    "recommendation": "Immediate safety assessment required",
                    "rationale": "High risk score indicates potential safety concerns",
                    "timeframe": "24-48 hours"
                }
            ])
            
        # Add insights-based recommendations
        for impact in insights["functional_impact"]["key_areas"]:
            recommendations.append({
                "type": "intervention",
                "category": "functional",
                "recommendation": f"Address {impact} through targeted intervention",
                "rationale": "Significant functional impact identified",
                "timeframe": "1-2 weeks"
            })
            
        return recommendations
        
    async def _update_metrics(
        self,
        insights: Dict[str, Any],
        risk_score: float
    ) -> None:
        """Update dashboard metrics based on analysis"""
        await self.message_queue.put({
            "type": "metric_update",
            "metric": "analysis_completed",
            "data": {
                "risk_score": risk_score,
                "insights_generated": len(insights["functional_impact"]["key_areas"]),
                "timestamp": datetime.utcnow()
            }
        })
        
    def _analyze_functional_status(
        self,
        functional_changes: Dict[str, Any]
    ) -> str:
        """Analyze overall functional status"""
        impact_count = len(functional_changes.get("adl_changes", []))
        
        if impact_count > 5:
            return "severe_impact"
        elif impact_count > 3:
            return "moderate_impact"
        else:
            return "mild_impact"
            
    def _identify_key_impact_areas(
        self,
        functional_changes: Dict[str, Any]
    ) -> List[str]:
        """Identify key areas of functional impact"""
        impact_areas = set()
        
        for change in functional_changes.get("adl_changes", []):
            if "mobility" in change["activity"].lower():
                impact_areas.add("mobility")
            elif any(term in change["activity"].lower() for term in ["bath", "dress", "groom"]):
                impact_areas.add("self_care")
            elif any(term in change["activity"].lower() for term in ["meal", "cook", "shop"]):
                impact_areas.add("home_management")
                
        return list(impact_areas)
        
    def _analyze_trends(
        self,
        metrics: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze trends in metrics"""
        return {
            "functional_trajectory": self._calculate_trajectory(metrics),
            "risk_trajectory": self._calculate_risk_trajectory(metrics)
        }
        
    def _analyze_primary_risks(
        self,
        risk_factors: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Analyze primary risk factors"""
        return [
            risk for risk in risk_factors
            if risk["severity"] == "high"
        ]
        
    def _analyze_secondary_risks(
        self,
        risk_factors: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Analyze secondary risk factors"""
        return [
            risk for risk in risk_factors
            if risk["severity"] == "moderate"
        ]
        
    def _analyze_environmental_factors(
        self,
        risk_factors: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Analyze environmental risk factors"""
        return [
            risk for risk in risk_factors
            if risk["type"] == "environmental"
        ]
        
    def _calculate_trajectory(
        self,
        metrics: Dict[str, Any]
    ) -> str:
        """Calculate functional trajectory"""
        if metrics.get("functional_status", {}).get("independent", 0) > 0.7:
            return "improving"
        elif metrics.get("functional_status", {}).get("unable", 0) > 0.3:
            return "declining"
        else:
            return "stable"
            
    def _calculate_risk_trajectory(
        self,
        metrics: Dict[str, Any]
    ) -> str:
        """Calculate risk trajectory"""
        risk_count = len(metrics.get("risk_factors", []))
        
        if risk_count > 5:
            return "escalating"
        elif risk_count > 2:
            return "moderate"
        else:
            return "stable"