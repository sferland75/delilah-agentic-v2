import {
  AssessmentFormData,
  AssessmentType,
  CoreAssessment,
  Form1Assessment,
  CATAssessment,
  FunctionalStatus
} from '../types/assessment';

export const createEmptyFunctionalStatus = (): FunctionalStatus => ({
  mobility: '',
  cognition: '',
  communication: '',
  transfers: '',
  social: '',
  notes: '',
  selfCare: '',
  homeManagement: '',
  communityAccess: ''
});

export const createEmptyHomeEnvironment = () => ({
  housingType: '',
  accessibility: '',
  safety: '',
  modifications: [],
  notes: '',
  access: '',
  layout: '',
  barriers: '',
  safetyRisks: [],
  equipment: [],
  homeSetup: '',
  supportSystems: ''
});

export const createEmptyRecommendations = () => ({
  equipment: [],
  services: [],
  modifications: [],
  followUp: '',
  notes: '',
  immediate: [],
  shortTerm: [],
  longTerm: []
});

export const createEmptyCoreAssessment = (): CoreAssessment => ({
  clientInfo: {
    name: '',
    dateOfBirth: '',
    address: '',
    phone: '',
    email: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  },
  functionalStatus: createEmptyFunctionalStatus(),
  homeEnvironment: createEmptyHomeEnvironment(),
  recommendations: createEmptyRecommendations()
});

export const createEmptyForm1Assessment = (): Form1Assessment => ({
  attendantCare: {
    routinePersonalCare: { tasks: [], totalHours: 0 },
    basicSupervisory: { tasks: [], totalHours: 0 },
    complexHealth: { tasks: [], totalHours: 0 }
  },
  monthlyCost: 0,
  levelOfCare: 'Level 1'
});

export const createEmptyCATAssessment = (): CATAssessment => ({
  functionalImpacts: {
    adl: [],
    iadl: [],
    mobility: [],
    cognition: []
  },
  clinicalObservations: '',
  situational: null,
  supportingDocuments: []
});

export const createEmptyAssessmentData = (): AssessmentFormData => ({
  id: '',
  clientId: '',
  assessmentType: AssessmentType.INITIAL,
  assessorId: '',
  dateCreated: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  status: 'draft',
  core: createEmptyCoreAssessment(),
  form1: null,
  cat: null,
  documents: [],
  notes: '',
  dateTime: new Date().toISOString(),
  location: '',
  primaryConcerns: ''
});

export const convertFormToAssessmentData = (data: AssessmentFormData): AssessmentFormData => {
  return {
    ...data,
    lastModified: new Date().toISOString()
  };
};