export type ShiftStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export interface Shift {
    id: string;
    clientId: string;
    clientName: string;
    location: string;
    startTime: string; // ISO string
    endTime: string; // ISO string
    status: ShiftStatus;
    serviceType: string;
}
