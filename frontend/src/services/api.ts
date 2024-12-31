// For development, we'll use mock data initially
import { Assessment, AssessmentSummary, Client } from '../types/assessment';

const MOCK_DELAY = 500; // Simulate network delay

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for development
let assessments: Assessment[] = [];
let clients: Client[] = [
    {
        id: '1',
        name: 'John Doe',
        dateOfBirth: '1955-05-15',
        mrn: '12345'
    },
    {
        id: '2',
        name: 'Jane Smith',
        dateOfBirth: '1948-08-22',
        mrn: '12346'
    }
];

export const api = {
    async fetchAssessments(): Promise<AssessmentSummary[]> {
        await delay(MOCK_DELAY);
        return assessments.map(a => ({
            id: a.id,
            type: a.type,
            status: a.status,
            clientId: a.clientId,
            clientName: clients.find(c => c.id === a.clientId)?.name || 'Unknown',
            dateCreated: a.dateCreated,
            lastModified: a.lastModified
        }));
    },

    async fetchAssessment(id: string): Promise<Assessment> {
        await delay(MOCK_DELAY);
        const assessment = assessments.find(a => a.id === id);
        if (!assessment) throw new Error('Assessment not found');
        return assessment;
    },

    async createAssessment(data: Partial<Assessment>): Promise<Assessment> {
        await delay(MOCK_DELAY);
        const newAssessment: Assessment = {
            id: Math.random().toString(36).substring(2, 15),
            type: data.type || 'initial',
            status: 'draft',
            clientId: data.clientId!,
            therapistId: '1', // Mock therapist ID
            dateCreated: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            core: data.core || {
                functionalStatus: {
                    mobility: { walking: '', balance: '', transfers: '', equipment: [] },
                    adl: { feeding: '', dressing: '', bathing: '', toileting: '', grooming: '' },
                    iadl: {
                        mealPrep: '', housekeeping: '', laundry: '', shopping: '',
                        transportation: '', medication: '', finances: ''
                    }
                },
                clinicalFactors: {
                    diagnoses: [],
                    medications: [],
                    precautions: []
                },
                environment: {
                    setting: 'home',
                    homeSetup: '',
                    accessibility: {
                        entranceAccess: '',
                        bathroomAccess: '',
                        bedroomAccess: '',
                        stairsPresent: false
                    },
                    safetyRisks: [],
                    modifications: {
                        existing: [],
                        recommended: []
                    }
                }
            }
        };
        assessments.push(newAssessment);
        return newAssessment;
    },

    async updateAssessment(id: string, data: Partial<Assessment>): Promise<Assessment> {
        await delay(MOCK_DELAY);
        const index = assessments.findIndex(a => a.id === id);
        if (index === -1) throw new Error('Assessment not found');
        
        const updated = {
            ...assessments[index],
            ...data,
            lastModified: new Date().toISOString()
        };
        assessments[index] = updated;
        return updated;
    },

    async deleteAssessment(id: string): Promise<void> {
        await delay(MOCK_DELAY);
        assessments = assessments.filter(a => a.id !== id);
    },

    async fetchClients(): Promise<Client[]> {
        await delay(MOCK_DELAY);
        return clients;
    }
};