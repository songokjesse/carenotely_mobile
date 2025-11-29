import { api } from './api';
import { ModuleType, Observation } from './types';

interface ObservationsResponse {
    observations: Observation[];
}

interface ObservationResponse {
    observation: Observation;
}

interface CreateObservationData {
    moduleType: ModuleType;
    data: any;
    recordedAt?: string;
    clientId?: string;
}

export const observationsService = {
    /**
     * Get all observations for a shift
     */
    getObservations: async (shiftId: string): Promise<Observation[]> => {
        const response = await api.get<ObservationsResponse>(`/shifts/${shiftId}/observations`);
        return response.observations;
    },

    /**
     * Create a new clinical observation
     */
    createObservation: async (shiftId: string, data: CreateObservationData): Promise<Observation> => {
        const response = await api.post<ObservationResponse>(`/shifts/${shiftId}/observations`, data);
        return response.observation;
    },
};
