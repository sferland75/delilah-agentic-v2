import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Assessment } from '../types/assessment';

export function useAssessments() {
    const queryClient = useQueryClient();

    const assessments = useQuery({
        queryKey: ['assessments'],
        queryFn: () => api.fetchAssessments()
    });

    const createAssessment = useMutation({
        mutationFn: (data: Partial<Assessment>) => api.createAssessment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
        }
    });

    const updateAssessment = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Assessment> }) => 
            api.updateAssessment(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
        }
    });

    const deleteAssessment = useMutation({
        mutationFn: (id: string) => api.deleteAssessment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
        }
    });

    return {
        assessments,
        createAssessment,
        updateAssessment,
        deleteAssessment,
        isLoading: assessments.isLoading || 
            createAssessment.isPending || 
            updateAssessment.isPending || 
            deleteAssessment.isPending
    };
}

export function useAssessment(id?: string) {
    return useQuery({
        queryKey: ['assessment', id],
        queryFn: () => api.fetchAssessment(id!),
        enabled: !!id
    });
}

export function useClients() {
    return useQuery({
        queryKey: ['clients'],
        queryFn: () => api.fetchClients()
    });
}