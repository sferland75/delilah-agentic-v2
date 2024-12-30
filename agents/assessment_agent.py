from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from uuid import UUID, uuid4
from pydantic import ValidationError, BaseModel

from .base import BaseAgent, AgentType, AgentStatus, AgentContext
from backend.models.assessment import (
    Assessment, PhysicalSymptom, CognitiveSymptom, EmotionalSymptom,
    Tolerance, RangeOfMotion, DailyActivity, EnvironmentalAssessment,
    AttendantCareNeed, ActivityLevel
)

class AssessmentValidationRule(BaseModel):
    """Rules for validating assessment data"""
    field_path: str
    validation_type: str
    parameters: Dict[str, Any]
    error_message: str

class AssessmentAgent(BaseAgent):
    """Agent responsible for processing and validating OT assessments"""
    
    def __init__(self, name: str = "assessment_agent"):
        super().__init__(AgentType.ASSESSMENT, name)
        self.validation_rules: List[AssessmentValidationRule] = self._setup_validation_rules()
        
    def _setup_validation_rules(self) -> List[AssessmentValidationRule]:
        """Setup validation rules for assessments"""
        return [
            AssessmentValidationRule(
                field_path="physical_symptoms",
                validation_type="required_fields",
                parameters={"fields": ["symptom", "details"]},
                error_message="Physical symptoms must include both symptom and details"
            ),
            AssessmentValidationRule(
                field_path="cognitive_symptoms",
                validation_type="min_count",
                parameters={"min_count": 1},
                error_message="At least one cognitive symptom must be documented"
            ),
            AssessmentValidationRule(
                field_path="emotional_symptoms",
                validation_type="min_count",
                parameters={"min_count": 1},
                error_message="At least one emotional symptom must be documented"
            ),
            AssessmentValidationRule(
                field_path="daily_activities",
                validation_type="comparison_required",
                parameters={"fields": ["pre_accident", "current"]},
                error_message="Both pre-accident and current status must be documented"
            )
        ]

    async def validate_assessment(self, assessment: Assessment) -> List[str]:
        """Validate assessment data against rules"""
        errors = []
        
        try:
            # Basic model validation
            assessment.validate()
            
            # Custom rule validation
            for rule in self.validation_rules:
                field_value = assessment
                for path_part in rule.field_path.split('.'):
                    field_value = getattr(field_value, path_part)
                
                if rule.validation_type == "required_fields":
                    for field in rule.parameters["fields"]:
                        if not all(getattr(item, field, None) for item in field_value):
                            errors.append(rule.error_message)
                            
                elif rule.validation_type == "min_count":
                    if len(field_value) < rule.parameters["min_count"]:
                        errors.append(rule.error_message)
                        
                elif rule.validation_type == "comparison_required":
                    for item in field_value:
                        for field in rule.parameters["fields"]:
                            if not getattr(item, field, None):
                                errors.append(rule.error_message)
                                
            # Validate attendant care calculations
            if assessment.attendant_care_needs:
                total_minutes = sum(need.minutes_per_week for need in assessment.attendant_care_needs)
                calculated_hours = total_minutes / 60
                if calculated_hours != assessment.total_attendant_care_hours:
                    errors.append("Total attendant care hours calculation mismatch")
                    
                # Validate monthly benefit calculation
                hourly_rates = {1: 14.90, 2: 14.90, 3: 22.36}
                monthly_total = 0
                for need in assessment.attendant_care_needs:
                    weekly_hours = need.minutes_per_week / 60
                    monthly_hours = weekly_hours * 4.33
                    monthly_total += monthly_hours * hourly_rates[need.level]
                
                expected_benefit = min(monthly_total, 6000)
                if abs(expected_benefit - assessment.monthly_attendant_care_benefit) > 0.01:
                    errors.append("Monthly attendant care benefit calculation mismatch")
                    
        except ValidationError as e:
            errors.extend([f"{err['loc']}: {err['msg']}" for err in e.errors()])
            
        return errors

    async def process_assessment(self, assessment: Assessment, context: AgentContext) -> Dict[str, Any]:
        """Process an assessment and generate analysis"""
        session_id = await self.start_session(context)
        
        try:
            self.update_status(AgentStatus.BUSY)
            
            # Validate assessment data
            errors = await self.validate_assessment(assessment)
            if errors:
                raise ValueError(f"Assessment validation failed: {errors}")
            
            # Process functional changes
            functional_changes = self._analyze_functional_changes(assessment)
            
            # Generate risk factors
            risk_factors = self._identify_risk_factors(assessment)
            
            # Calculate metrics
            metrics = self._calculate_metrics(assessment)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                assessment, 
                functional_changes,
                risk_factors
            )
            
            # Prepare result
            result = {
                "session_id": session_id,
                "status": "processed",
                "validation_status": "passed",
                "functional_changes": functional_changes,
                "risk_factors": risk_factors,
                "metrics": metrics,
                "recommendations": recommendations,
                "timestamp": datetime.utcnow()
            }
            
            # Update dashboard metrics
            await self._update_metrics(assessment, metrics)
            
            self.update_status(AgentStatus.IDLE)
            return result
            
        except Exception as e:
            await self.handle_error(e, context)
            raise
        finally:
            await self.end_session(session_id)
            
    def _analyze_functional_changes(self, assessment: Assessment) -> Dict[str, Any]:
        """Analyze changes in functional status"""
        changes = {
            "adl_changes": [],
            "mobility_changes": [],
            "cognitive_changes": [],
            "emotional_changes": []
        }
        
        # Analyze ADL changes
        for activity in assessment.daily_activities:
            if activity.pre_accident != activity.current:
                changes["adl_changes"].append({
                    "activity": activity.activity,
                    "pre_status": activity.pre_accident,
                    "current_status": activity.current,
                    "details": activity.current_details
                })
                
        # Analyze mobility changes
        for tolerance in assessment.tolerances:
            if "mobility" in tolerance.activity.lower():
                changes["mobility_changes"].append({
                    "activity": tolerance.activity,
                    "details": tolerance.client_report,
                    "observations": tolerance.therapist_observations
                })
                
        # Add cognitive changes
        changes["cognitive_changes"] = [
            {"symptom": sym.symptom, "impact": sym.impact}
            for sym in assessment.cognitive_symptoms
        ]
        
        # Add emotional changes
        changes["emotional_changes"] = [
            {"symptom": sym.symptom, "severity": sym.severity}
            for sym in assessment.emotional_symptoms
        ]
        
        return changes
    
    def _identify_risk_factors(self, assessment: Assessment) -> List[Dict[str, Any]]:
        """Identify risk factors from assessment data"""
        risk_factors = []
        
        # Check for severe pain symptoms
        for symptom in assessment.physical_symptoms:
            if (symptom.pain_rating and 
                symptom.pain_rating.maximum >= 8):
                risk_factors.append({
                    "type": "pain",
                    "severity": "high",
                    "details": f"Severe {symptom.symptom} pain reported",
                    "recommendations": ["Pain management referral recommended"]
                })
                
        # Check for emotional risk factors
        emotional_risks = [
            sym for sym in assessment.emotional_symptoms
            if any(risk in sym.symptom.lower() 
                  for risk in ["suicid", "depress", "hopeless"])
        ]
        if emotional_risks:
            risk_factors.append({
                "type": "psychological",
                "severity": "high",
                "details": "Significant psychological symptoms noted",
                "recommendations": [
                    "Urgent psychological assessment recommended",
                    "Consider suicide risk assessment if not completed"
                ]
            })
            
        # Check for cognitive risks
        cognitive_risks = [
            sym for sym in assessment.cognitive_symptoms
            if any(risk in sym.symptom.lower() 
                  for risk in ["memory", "confusion", "attention"])
        ]
        if cognitive_risks:
            risk_factors.append({
                "type": "cognitive",
                "severity": "moderate",
                "details": "Cognitive impairments affecting daily function",
                "recommendations": [
                    "Neuropsychological assessment recommended",
                    "Consider safety assessment for independent living"
                ]
            })
            
        # Check environmental risks
        env_risks = []
        if assessment.environmental_assessment.accessibility_issues:
            env_risks.extend(assessment.environmental_assessment.accessibility_issues)
        if assessment.environmental_assessment.safety_concerns:
            env_risks.extend(assessment.environmental_assessment.safety_concerns)
            
        if env_risks:
            risk_factors.append({
                "type": "environmental",
                "severity": "moderate",
                "details": "Environmental safety concerns identified",
                "recommendations": [
                    "Home safety assessment recommended",
                    "Consider environmental modifications"
                ]
            })
            
        # Check functional decline risks
        significant_declines = [
            activity for activity in assessment.daily_activities
            if (activity.pre_accident == ActivityLevel.INDEPENDENT and 
                activity.current == ActivityLevel.UNABLE)
        ]
        if significant_declines:
            risk_factors.append({
                "type": "functional_decline",
                "severity": "high",
                "details": "Significant functional decline in ADLs",
                "recommendations": [
                    "Regular OT monitoring recommended",
                    "Consider additional support services"
                ]
            })
            
        return risk_factors
        
    def _calculate_metrics(self, assessment: Assessment) -> Dict[str, Any]:
        """Calculate assessment metrics for dashboard"""
        metrics = {
            "functional_status": {
                "total_activities": len(assessment.daily_activities),
                "independent": len([a for a in assessment.daily_activities 
                                  if a.current == ActivityLevel.INDEPENDENT]),
                "requires_assistance": len([a for a in assessment.daily_activities 
                                         if a.current == ActivityLevel.PARTIAL_ASSISTANCE]),
                "unable": len([a for a in assessment.daily_activities 
                             if a.current == ActivityLevel.UNABLE])
            },
            "symptom_counts": {
                "physical": len(assessment.physical_symptoms),
                "cognitive": len(assessment.cognitive_symptoms),
                "emotional": len(assessment.emotional_symptoms)
            },
            "attendant_care": {
                "total_hours": assessment.total_attendant_care_hours,
                "monthly_benefit": assessment.monthly_attendant_care_benefit,
                "care_levels": {
                    1: len([n for n in assessment.attendant_care_needs if n.level == 1]),
                    2: len([n for n in assessment.attendant_care_needs if n.level == 2]),
                    3: len([n for n in assessment.attendant_care_needs if n.level == 3])
                }
            }
        }
        
        return metrics
        
    def _generate_recommendations(
        self, 
        assessment: Assessment,
        functional_changes: Dict[str, Any],
        risk_factors: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Generate recommendations based on assessment findings"""
        recommendations = []
        
        # Add recommendations from risk factors
        for risk in risk_factors:
            recommendations.extend([
                {
                    "type": "risk_mitigation",
                    "priority": "high" if risk["severity"] == "high" else "moderate",
                    "recommendation": rec,
                    "rationale": risk["details"]
                }
                for rec in risk["recommendations"]
            ])
            
        # Add recommendations based on functional changes
        if functional_changes["adl_changes"]:
            recommendations.append({
                "type": "functional",
                "priority": "high",
                "recommendation": "OT intervention for ADL retraining",
                "rationale": "Significant changes in ADL independence"
            })
            
        if functional_changes["mobility_changes"]:
            recommendations.append({
                "type": "mobility",
                "priority": "high",
                "recommendation": "Physiotherapy for mobility optimization",
                "rationale": "Changes in mobility status noted"
            })
            
        # Add environmental recommendations
        if assessment.environmental_assessment.accessibility_issues:
            recommendations.append({
                "type": "environmental",
                "priority": "moderate",
                "recommendation": "Home modification assessment",
                "rationale": "Accessibility issues identified in home environment"
            })
            
        return recommendations
        
    async def _update_metrics(self, assessment: Assessment, metrics: Dict[str, Any]) -> None:
        """Update dashboard metrics based on assessment data"""
        await self.message_queue.put({
            "type": "metric_update",
            "metric": "assessment_completed",
            "data": {
                "client_id": assessment.id,
                "type": assessment.type,
                "status": "completed",
                "metrics": metrics,
                "timestamp": datetime.utcnow()
            }
        })