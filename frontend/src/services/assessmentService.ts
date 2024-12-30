import { Assessment, AssessmentStatus } from '../types/assessment';

// Mock data for development
const createMockAssessment = (): Assessment => ({
    id: Math.random().toString(36).substr(2, 9),
    clientId: '',
    dateCreated: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    status: 'draft',
    emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
    },
    clinicalInfo: {
        diagnosis: '',
        medicalHistory: '',
        medications: [],
        allergies: []
    },
    functionalStatus: {
        mobility: '',
        selfCare: '',
        communication: '',
        cognition: '',
        transfers: '',
        homeManagement: '',
        communityAccess: '',
        social: '',
        notes: ''
    },
    homeEnvironment: {
        safetyRisks: [],
        homeSetup: '',
        modifications: [],
        equipment: [],
        supportSystems: ''
    },
    recommendations: {
        immediate: [],
        shortTerm: [],
        longTerm: [],
        equipment: [],
        services: [],
        modifications: [],
        followUp: '',
        notes: ''
    }
});

const MOCK_ASSESSMENTS: Assessment[] = [
    createMockAssessment(),
    createMockAssessment()
];

class AssessmentService {
    private mockAssessments: Assessment[] = MOCK_ASSESSMENTS;

    async getAll(): Promise<Assessment[]> {
        return Promise.resolve(this.mockAssessments);
    }

    async get(id: string): Promise<Assessment | null> {
        const assessment = this.mockAssessments.find(a => a.id === id);
        return Promise.resolve(assessment || null);
    }

    // Alias for get method to maintain compatibility
    async getById(id: string): Promise<Assessment | null> {
        return this.get(id);
    }

    async getClients(): Promise<Array<{ id: string; name: string }>> {
        return Promise.resolve([
            { id: '1', name: 'John Doe' },
            { id: '2', name: 'Jane Smith' }
        ]);
    }

    async create(data: Partial<Assessment>): Promise<Assessment> {
        const newAssessment: Assessment = {
            ...createMockAssessment(),
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            dateCreated: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            status: 'draft'
        };

        this.mockAssessments.push(newAssessment);
        return Promise.resolve(newAssessment);
    }

    async update(id: string, data: Partial<Assessment>): Promise<Assessment> {
        const index = this.mockAssessments.findIndex(a => a.id === id);
        if (index === -1) {
            throw new Error('Assessment not found');
        }

        const updatedAssessment: Assessment = {
            ...this.mockAssessments[index],
            ...data,
            id,
            lastModified: new Date().toISOString()
        };

        this.mockAssessments[index] = updatedAssessment;
        return Promise.resolve(updatedAssessment);
    }

    async delete(id: string): Promise<void> {
        const index = this.mockAssessments.findIndex(a => a.id === id);
        if (index === -1) {
            throw new Error('Assessment not found');
        }

        this.mockAssessments.splice(index, 1);
        return Promise.resolve();
    }

    async complete(id: string): Promise<Assessment> {
        const index = this.mockAssessments.findIndex(a => a.id === id);
        if (index === -1) {
            throw new Error('Assessment not found');
        }

        const assessment = this.mockAssessments[index];
        const updatedAssessment: Assessment = {
            ...assessment,
            status: 'completed',
            lastModified: new Date().toISOString()
        };

        this.mockAssessments[index] = updatedAssessment;
        return Promise.resolve(updatedAssessment);
    }
}

export const assessmentService = new AssessmentService();