import { format } from 'date-fns';
import { api } from './api';
import { Shift, ShiftStatus } from './types';

interface GetShiftsParams {
    startDate?: Date;
    endDate?: Date;
    status?: ShiftStatus;
}

interface ShiftsResponse {
    shifts: Shift[];
}

interface ShiftResponse {
    shift: Shift;
}

interface ClockInOutData {
    location: {
        lat: number;
        lng: number;
        accuracy: number;
    };
}

export const shiftService = {
    /**
     * Get worker's assigned shifts with optional filtering
     */
    getShifts: async (params?: GetShiftsParams): Promise<Shift[]> => {
        const queryParams = new URLSearchParams();

        if (params?.startDate) {
            queryParams.append('startDate', format(params.startDate, 'yyyy-MM-dd'));
        }
        if (params?.endDate) {
            queryParams.append('endDate', format(params.endDate, 'yyyy-MM-dd'));
        }
        if (params?.status) {
            queryParams.append('status', params.status);
        }

        const query = queryParams.toString();
        const endpoint = query ? `/shifts?${query}` : '/shifts';

        const response = await api.get<ShiftsResponse>(endpoint);
        return response.shifts;
    },

    /**
     * Get shifts for a specific date
     */
    getShiftsByDate: async (date: Date): Promise<Shift[]> => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const shifts = await shiftService.getShifts({
            startDate: date,
            endDate: date,
        });
        return shifts;
    },

    /**
     * Get detailed information about a specific shift
     */
    getShiftDetails: async (id: string): Promise<Shift> => {
        const response = await api.get<ShiftResponse>(`/shifts/${id}`);
        return response.shift;
    },

    /**
     * Update shift status
     */
    updateShiftStatus: async (id: string, status: ShiftStatus): Promise<Shift> => {
        const response = await api.patch<ShiftResponse>(`/shifts/${id}/status`, { status });
        return response.shift;
    },

    /**
     * Clock in to a shift
     */
    clockIn: async (id: string, location: ClockInOutData['location']): Promise<Shift> => {
        const response = await api.post<ShiftResponse>(`/shifts/${id}/clock-in`, { location });
        return response.shift;
    },

    /**
     * Clock out of a shift
     */
    clockOut: async (id: string, location: ClockInOutData['location']): Promise<Shift> => {
        const response = await api.post<ShiftResponse>(`/shifts/${id}/clock-out`, { location });
        return response.shift;
    },
};
