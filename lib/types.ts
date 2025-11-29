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

export interface Resident {
    id: string;
    name: string;
    ndisNumber?: string;
    dateOfBirth?: string;
    enabledModules?: ModuleType[];
}

export interface Site {
    id: string;
    name: string;
    address: string;
    residents: Resident[];
}

export interface Shift {
    id: string;
    client?: Client; // Optional for SIL shifts
    site?: Site; // For SIL shifts with multiple residents
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

/**
 * Type guard to check if a shift is a SIL (Supported Independent Living) shift
 * SIL shifts have a site with multiple residents instead of a single client
 */
export function isSILShift(shift: Shift): shift is Shift & { site: Site } {
    return shift.site !== undefined && shift.site !== null;
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