export type ShiftStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export type ModuleType =
    | 'BOWEL_MONITORING'
    | 'FLUID_INTAKE'
    | 'SEIZURE_MONITORING'
    | 'BEHAVIOUR_OBSERVATION'
    | 'BGL_MONITORING';

export interface Client {
    id: string;
    name: string;
    ndisNumber?: string;
    dateOfBirth?: string;
    notes?: string;
    enabledModules?: ModuleType[];
}

export interface Shift {
    id: string;
    client: Client;
    startTime: string; // ISO string
    endTime: string; // ISO string
    status: ShiftStatus;
    serviceType: string;
    location: string;
    progressNotesCount?: number;
    observationsCount?: number;
    clockInTime?: string;
    clockOutTime?: string;
}

export interface ProgressNote {
    id: string;
    noteText: string;
    mood?: string;
    incidentFlag: boolean;
    behavioursFlag: boolean;
    medicationFlag: boolean;
    createdAt: string;
    author: {
        name: string;
    };
}

export interface Observation {
    id: string;
    type: ModuleType;
    data: any;
    recordedAt: string;
}

export interface UserProfile {
    user: {
        id: string;
        name: string;
        email: string;
        image?: string;
    };
    organisation: {
        id: string;
        name: string;
        role: string;
    };
}
