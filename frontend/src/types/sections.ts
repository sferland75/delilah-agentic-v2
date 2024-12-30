import { 
    ClientInfo, 
    FunctionalStatus, 
    HomeEnvironment,
    Form1Assessment,
    CATAssessment
} from './assessment';

// Section Data Types
export type ADLInfo = FunctionalStatus;
export type DemographicInfo = ClientInfo;
export type EnvironmentalInfo = HomeEnvironment;

export interface ClinicalInfo {
    symptoms: string;
    painLevel: number;
    rangeOfMotion: string;
    strength: string;
    endurance: string;
    balance: string;
    coordination: string;
    observations: string;
}

export interface DocumentInfo {
    title: string;
    type: string;
    date: string;
    notes: string;
    attachments: string[];
}

export interface Documentation {
    medicalDocs: DocumentInfo[];
    legalDocs: DocumentInfo[];
    otherDocs: DocumentInfo[];
    notes: string;
}

export interface RecommendationGroups {
    equipment: string[];
    homeModifications: string[];
    therapy: string[];
    followUp: string;
    referrals: string[];
}

// Section Props
export interface SectionProps<T> {
    data: T;
    onChange: (data: T) => void;
}

export type CoreSectionProps = SectionProps<{
    clientInfo: ClientInfo;
    adl: ADLInfo;
    environmental: EnvironmentalInfo;
}>;

export type Form1SectionProps = SectionProps<Form1Assessment>;
export type CATSectionProps = SectionProps<CATAssessment>;
export type ADLSectionProps = SectionProps<ADLInfo>;
export type DemographicSectionProps = SectionProps<DemographicInfo>;
export type EnvironmentalSectionProps = SectionProps<EnvironmentalInfo>;
export type ClinicalSectionProps = SectionProps<ClinicalInfo>;
export type DocumentationSectionProps = SectionProps<Documentation>;
export type RecommendationsSectionProps = SectionProps<RecommendationGroups>;