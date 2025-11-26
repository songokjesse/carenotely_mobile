import { endOfDay, format, startOfDay } from 'date-fns';
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
            // Format the date in local timezone to avoid UTC conversion issues
            const year = params.startDate.getFullYear();
            const month = String(params.startDate.getMonth() + 1).padStart(2, '0');
            const day = String(params.startDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            queryParams.append('startDate', dateStr);
            console.log('🔍 Formatted startDate:', dateStr, 'from', params.startDate);
        }
        if (params?.endDate) {
            // Format the date in local timezone to avoid UTC conversion issues
            const year = params.endDate.getFullYear();
            const month = String(params.endDate.getMonth() + 1).padStart(2, '0');
            const day = String(params.endDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            queryParams.append('endDate', dateStr);
            console.log('🔍 Formatted endDate:', dateStr, 'from', params.endDate);
        }
        if (params?.status) {
            queryParams.append('status', params.status);
        }

        const query = queryParams.toString();
        const endpoint = query ? `/shifts?${query}` : '/shifts';

        console.log('🔍 API endpoint:', endpoint);

        try {
            const response = await api.get<ShiftsResponse>(endpoint);
            return response.shifts;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get shifts for a specific date
     */
    getShiftsByDate: async (date: Date): Promise<Shift[]> => {
        // Use start and end of day to capture all shifts on this date
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);

        console.log('🔍 getShiftsByDate called with:', {
            inputDate: date,
            dayStart,
            dayEnd,
            dayStartFormatted: format(dayStart, 'yyyy-MM-dd HH:mm:ss'),
            dayEndFormatted: format(dayEnd, 'yyyy-MM-dd HH:mm:ss'),
        });

        const shifts = await shiftService.getShifts({
            startDate: dayStart,
            endDate: dayEnd,
        });

        console.log('🔍 Raw shifts from API:', shifts.length, shifts.map(s => ({
            id: s.id,
            startTime: s.startTime,
            endTime: s.endTime,
            client: s.client.name,
        })));

        // Client-side filter to ensure we only return shifts that occur on the selected date
        // This handles cases where the backend might return shifts from adjacent dates
        const filtered = shifts.filter(shift => {
            const shiftStart = new Date(shift.startTime);
            const shiftEnd = new Date(shift.endTime);
            const shiftStartDate = format(shiftStart, 'yyyy-MM-dd');
            const selectedDate = format(date, 'yyyy-MM-dd');

            const matchesStartDate = shiftStartDate === selectedDate;
            const spansDate = shiftStart <= dayEnd && shiftEnd >= dayStart;
            const included = matchesStartDate || spansDate;

            console.log('🔍 Filtering shift:', {
                shiftId: shift.id,
                shiftStartTime: shift.startTime,
                shiftStartDate,
                selectedDate,
                matchesStartDate,
                spansDate,
                included,
            });

            // Include shift if it starts on the selected date OR spans across it
            return included;
        });

        console.log('🔍 Filtered shifts:', filtered.length);
        return filtered;
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
