import { api } from './api';

export interface Assessment {
    id: string;
    type: 'initial' | 'followUp' | 'discharge';
    status: 'draft' | 'completed' | 'archived';
    clientInfo: {
        name: string;
        dateOfBirth: string;
    };
    functionalStatus: {
        mobility: string;
        adl: string;
        iadl: string;
    };
    environment: {
        homeSetup: string;
        safetyRisks: string[];
    };
    createdAt: string;
    updatedAt: string;
}

export const assessmentService = {
    async create(data: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>) {
        return api.post<Assessment>('/assessments', data);
    },

    async update(id: string, data: Partial<Assessment>) {
        return api.put<Assessment>(`/assessments/${id}`, data);
    },

    async getById(id: string) {
        return api.get<Assessment>(`/assessments/${id}`);
    },

    async list(filters?: { status?: string; type?: string }) {
        const params = new URLSearchParams(filters);
        return api.get<Assessment[]>(`/assessments?${params}`);
    },

    async delete(id: string) {
        return api.delete(`/assessments/${id}`);
    },

    async archive(id: string) {
        return api.put<Assessment>(`/assessments/${id}/archive`, {});
    }
};