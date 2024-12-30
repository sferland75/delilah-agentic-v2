from typing import Dict, Any, List
from uuid import UUID
import logging
from pathlib import Path
import pypdf
import re
from datetime import datetime

from .base import BaseAgent, AgentType, AgentConfig, AgentContext

logger = logging.getLogger(__name__)

class PDFParserAgent(BaseAgent):
    """Agent for parsing medical records and assessment notes from PDFs"""
    
    def __init__(self, config: AgentConfig):
        super().__init__(
            agent_type=AgentType.ASSESSMENT,
            name="pdf_parser_agent",
            config=config
        )
        
    async def process_documents(self,
                              context: AgentContext,
                              pdf_paths: List[Path],
                              assessment_notes: str) -> Dict[str, Any]:
        """Process medical records PDFs and therapist notes"""
        try:
            # Start processing session
            await self.start_session(context)
            
            # Parse medical records
            medical_data = await self._parse_medical_records(pdf_paths)
            
            # Parse assessment notes
            assessment_data = self._parse_assessment_notes(assessment_notes)
            
            # Combine and structure all data
            structured_data = self._structure_data(medical_data, assessment_data)
            
            return structured_data
            
        except Exception as e:
            logger.error(f"Error processing documents: {str(e)}")
            await self.handle_error(e, context)
            raise
            
        finally:
            await self.end_session(context.session_id)
    
    async def _parse_medical_records(self, pdf_paths: List[Path]) -> List[Dict[str, Any]]:
        """Extract relevant information from medical record PDFs"""
        medical_data = []
        
        for pdf_path in pdf_paths:
            try:
                with open(pdf_path, 'rb') as file:
                    pdf = pypdf.PdfReader(file)
                    text = ""
                    for page in pdf.pages:
                        text += page.extract_text()
                    
                    # Extract key medical information
                    diagnoses = self._extract_diagnoses(text)
                    medications = self._extract_medications(text)
                    history = self._extract_medical_history(text)
                    
                    medical_data.append({
                        "source": pdf_path.name,
                        "diagnoses": diagnoses,
                        "medications": medications,
                        "medical_history": history,
                        "processed_at": datetime.utcnow().isoformat()
                    })
                    
            except Exception as e:
                logger.error(f"Error processing {pdf_path}: {str(e)}")
                continue
        
        return medical_data
    
    def _parse_assessment_notes(self, notes: str) -> Dict[str, Any]:
        """Parse and structure therapist's assessment notes"""
        sections = {
            "mobility": self._extract_section(notes, "Mobility"),
            "adl": self._extract_section(notes, "Activities of Daily Living"),
            "home_safety": self._extract_section(notes, "Home Safety"),
            "recommendations": self._extract_section(notes, "Recommendations"),
            "additional_notes": self._extract_section(notes, "Additional Notes")
        }
        
        return {
            "sections": sections,
            "key_observations": self._extract_key_observations(notes),
            "risk_factors": self._identify_risk_factors(notes),
            "immediate_concerns": self._identify_immediate_concerns(notes)
        }
    
    def _structure_data(self,
                       medical_data: List[Dict[str, Any]],
                       assessment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Combine and structure all data for analysis"""
        return {
            "medical_records": {
                "diagnoses": self._combine_diagnoses(medical_data),
                "medications": self._combine_medications(medical_data),
                "history": self._combine_history(medical_data)
            },
            "assessment": assessment_data,
            "identified_risks": self._analyze_risks(medical_data, assessment_data),
            "recommendations": self._compile_recommendations(assessment_data),
            "metadata": {
                "processed_at": datetime.utcnow().isoformat(),
                "source_count": len(medical_data)
            }
        }
    
    def _extract_diagnoses(self, text: str) -> List[str]:
        """Extract diagnoses from medical text"""
        # Look for diagnosis patterns
        diagnoses = []
        diagnosis_patterns = [
            r"Diagnosis:[\s\n]*(.*?)(?:\n\n|\Z)",
            r"Assessment:[\s\n]*(.*?)(?:\n\n|\Z)",
            r"Impression:[\s\n]*(.*?)(?:\n\n|\Z)"
        ]
        
        for pattern in diagnosis_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE | re.MULTILINE)
            for match in matches:
                diagnoses.extend([d.strip() for d in match.group(1).split('\n') if d.strip()])
        
        return list(set(diagnoses))  # Remove duplicates
    
    def _extract_medications(self, text: str) -> List[Dict[str, str]]:
        """Extract medications from medical text"""
        medications = []
        # Look for medication patterns
        med_pattern = r"(?i)([\w\s]+)\s+(\d+[\w\/]+)\s+(\w+)\s+(\w+)"
        matches = re.finditer(med_pattern, text)
        
        for match in matches:
            medications.append({
                "name": match.group(1).strip(),
                "dosage": match.group(2),
                "frequency": match.group(3),
                "route": match.group(4)
            })
        
        return medications
    
    def _extract_medical_history(self, text: str) -> Dict[str, List[str]]:
        """Extract medical history information"""
        return {
            "surgeries": self._extract_section(text, "Surgical History"),
            "conditions": self._extract_section(text, "Past Medical History"),
            "allergies": self._extract_section(text, "Allergies"),
            "family_history": self._extract_section(text, "Family History")
        }
    
    def _extract_section(self, text: str, section_name: str) -> List[str]:
        """Extract content from a specific section"""
        pattern = f"{section_name}:?[\\s\\n]*(.*?)(?:\\n\\n|\\Z)"
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            return [item.strip() for item in match.group(1).split('\n') if item.strip()]
        return []
    
    def _extract_key_observations(self, notes: str) -> List[str]:
        """Extract key observations from assessment notes"""
        observations = []
        
        # Look for marked observations (*, !, important, note, etc.)
        observation_patterns = [
            r"\*(.*?)(?:\n|$)",
            r"!(.*?)(?:\n|$)",
            r"(?i)important:?\s*(.*?)(?:\n|$)",
            r"(?i)note:?\s*(.*?)(?:\n|$)"
        ]
        
        for pattern in observation_patterns:
            matches = re.finditer(pattern, notes)
            observations.extend([m.group(1).strip() for m in matches])
        
        return observations
    
    def _identify_risk_factors(self, notes: str) -> List[Dict[str, Any]]:
        """Identify risk factors from assessment notes"""
        risk_factors = []
        
        # Common risk patterns to look for
        risk_patterns = {
            "fall_risk": r"(?i)(?:fall[s]? risk|balance|gait)\s*(.*?)(?:\n|$)",
            "medication": r"(?i)(?:medication|drug) risk\s*(.*?)(?:\n|$)",
            "safety": r"(?i)(?:safety[s]? risk|hazard)\s*(.*?)(?:\n|$)",
            "cognitive": r"(?i)(?:cognitive|memory|confusion)\s*(.*?)(?:\n|$)"
        }
        
        for risk_type, pattern in risk_patterns.items():
            matches = re.finditer(pattern, notes)
            for match in matches:
                risk_factors.append({
                    "type": risk_type,
                    "description": match.group(1).strip(),
                    "source": "assessment_notes"
                })
        
        return risk_factors
    
    def _identify_immediate_concerns(self, notes: str) -> List[str]:
        """Identify immediate concerns requiring attention"""
        concerns = []
        
        # Look for urgent or immediate concern patterns
        concern_patterns = [
            r"(?i)urgent:?\s*(.*?)(?:\n|$)",
            r"(?i)immediate:?\s*(.*?)(?:\n|$)",
            r"(?i)critical:?\s*(.*?)(?:\n|$)",
            r"(?i)attention:?\s*(.*?)(?:\n|$)"
        ]
        
        for pattern in concern_patterns:
            matches = re.finditer(pattern, notes)
            concerns.extend([m.group(1).strip() for m in matches])
        
        return concerns
    
    def _combine_diagnoses(self, medical_data: List[Dict[str, Any]]) -> List[str]:
        """Combine and deduplicate diagnoses from all sources"""
        all_diagnoses = []
        for data in medical_data:
            all_diagnoses.extend(data.get("diagnoses", []))
        return list(set(all_diagnoses))
    
    def _combine_medications(self, medical_data: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        """Combine medications from all sources"""
        all_medications = []
        seen = set()
        
        for data in medical_data:
            for med in data.get("medications", []):
                key = f"{med['name']}-{med['dosage']}"
                if key not in seen:
                    seen.add(key)
                    all_medications.append(med)
        
        return all_medications
    
    def _combine_history(self, medical_data: List[Dict[str, Any]]) -> Dict[str, List[str]]:
        """Combine medical history from all sources"""
        combined = {
            "surgeries": [],
            "conditions": [],
            "allergies": [],
            "family_history": []
        }
        
        for data in medical_data:
            history = data.get("medical_history", {})
            for key in combined:
                combined[key].extend(history.get(key, []))
        
        # Remove duplicates while preserving order
        for key in combined:
            combined[key] = list(dict.fromkeys(combined[key]))
        
        return combined
    
    def _analyze_risks(self,
                      medical_data: List[Dict[str, Any]],
                      assessment_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analyze combined risks from medical records and assessment"""
        risks = []
        
        # Add risks from assessment
        risks.extend(assessment_data.get("risk_factors", []))
        
        # Add risks from medical history
        for data in medical_data:
            history = data.get("medical_history", {})
            conditions = history.get("conditions", [])
            
            # Look for high-risk conditions
            risk_conditions = [
                "diabetes",
                "hypertension",
                "stroke",
                "falls",
                "dizziness",
                "vision impairment"
            ]
            
            for condition in conditions:
                if any(risk in condition.lower() for risk in risk_conditions):
                    risks.append({
                        "type": "medical_condition",
                        "description": condition,
                        "source": "medical_records"
                    })
        
        return risks
    
    def _compile_recommendations(self, assessment_data: Dict[str, Any]) -> List[str]:
        """Compile recommendations from assessment data"""
        recommendations = []
        
        # Get explicit recommendations
        recommendations.extend(
            assessment_data.get("sections", {}).get("recommendations", [])
        )
        
        # Add recommendations based on risks
        risk_factors = assessment_data.get("risk_factors", [])
        for risk in risk_factors:
            if risk["type"] == "fall_risk":
                recommendations.append(
                    "Consider home safety evaluation and fall prevention measures"
                )
            elif risk["type"] == "medication":
                recommendations.append(
                    "Review medication management and potential interactions"
                )
            elif risk["type"] == "safety":
                recommendations.append(
                    "Address identified safety hazards in the home environment"
                )
            elif risk["type"] == "cognitive":
                recommendations.append(
                    "Consider cognitive assessment and support strategies"
                )
        
        return list(dict.fromkeys(recommendations))  # Remove duplicates