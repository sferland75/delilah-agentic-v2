// Common types
export type AssessmentType = 'initial' | 'followUp' | 'discharge';

export interface ClinicalInfo {
    diagnosis: string;
    medicalHistory: string;
    medications: string[];
    allergies: string[];
    vitalSigns?: {
        bloodPressure?: string;
        heartRate?: string;
        temperature?: string;
    };
}

export interface EmergencyContact {
    name: string;
    relationship: string;
    phone: string;
}

export interface FunctionalStatus {
    mobility: string;
    selfCare: string;
    communication: string;
    cognition: string;
    transfers: string;
    homeManagement: string;
    communityAccess: string;
    social: string;
    notes: string;
}

export interface HomeEnvironment {
    safetyRisks: string[];
    homeSetup: string;
    modifications: string[];
    equipment: string[];
    supportSystems: string;
}

export interface Recommendations {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    equipment: string[];
    services: string[];
    modifications: string[];
    followUp: string;
    notes: string;
}

export type AssessmentStatus = 'draft' | 'pending' | 'completed' | 'archived';

// Main Assessment interface
export interface Assessment {
    id?: string;
    clientId: string;
    type: AssessmentType;
    dateCreated: string;
    lastModified: string;
    status: AssessmentStatus;
    emergencyContact: EmergencyContact;
    clinicalInfo: ClinicalInfo;
    functionalStatus: FunctionalStatus;
    homeEnvironment: HomeEnvironment;
    recommendations: Recommendations;
}

// Form data interface
export interface AssessmentFormData extends Omit<Assessment, 'id' | 'dateCreated' | 'lastModified'> {
    id?: string;
}