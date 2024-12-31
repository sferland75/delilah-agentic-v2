export type AssessmentType = 'initial' | 'followUp' | 'discharge';
export type AssessmentStatus = 'draft' | 'inProgress' | 'completed' | 'archived';

export interface Client {
    id: string;
    name: string;
    dateOfBirth: string;
    mrn?: string;  // Medical Record Number
    insurance?: {
        provider: string;
        policyNumber: string;
    };
}

export interface AssessmentCore {
    functionalStatus: {
        mobility: {
            walking: string;
            balance: string;
            transfers: string;
            equipment: string[];
        };
        adl: {
            feeding: string;
            dressing: string;
            bathing: string;
            toileting: string;
            grooming: string;
        };
        iadl: {
            mealPrep: string;
            housekeeping: string;
            laundry: string;
            shopping: string;
            transportation: string;
            medication: string;
            finances: string;
        };
    };
    clinicalFactors: {
        diagnoses: string[];
        medications: string[];
        precautions: string[];
        vitals?: {
            bloodPressure?: string;
            heartRate?: string;
            respiration?: string;
            temperature?: string;
            spO2?: string;
        };
        painLevel?: number;
        cognition?: string;
    };
    environment: {
        setting: 'home' | 'facility' | 'other';
        homeSetup: string;
        accessibility: {
            entranceAccess: string;
            bathroomAccess: string;
            bedroomAccess: string;
            stairsPresent: boolean;
            stairsDescription?: string;
        };
        safetyRisks: Array<{
            risk: string;
            severity: 'low' | 'medium' | 'high';
            mitigation?: string;
        }>;
        modifications: {
            existing: string[];
            recommended: string[];
        };
    };
}

export interface Assessment {
    id: string;
    type: AssessmentType;
    status: AssessmentStatus;
    clientId: string;
    therapistId: string;
    dateCreated: string;
    lastModified: string;
    core: AssessmentCore;
    summary?: string;
    recommendations?: string[];
    goals?: Array<{
        description: string;
        timeframe: 'shortTerm' | 'longTerm';
        status: 'pending' | 'inProgress' | 'achieved' | 'discontinued';
    }>;
    attachments?: Array<{
        id: string;
        name: string;
        type: string;
        url: string;
    }>;
}

export interface AssessmentSummary {
    id: string;
    type: AssessmentType;
    status: AssessmentStatus;
    clientId: string;
    clientName: string;
    dateCreated: string;
    lastModified: string;
}