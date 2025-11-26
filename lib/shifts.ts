import { addDays, addHours, format, startOfDay } from 'date-fns';
import { Shift } from './types';

// Mock data generator
const generateMockShifts = (): Shift[] => {
    const shifts: Shift[] = [];
    const today = startOfDay(new Date());

    // Generate shifts for the next 30 days
    for (let i = 0; i < 30; i++) {
        const date = addDays(today, i);

        // 70% chance of having a shift on any given day
        if (Math.random() > 0.3) {
            // Sometimes two shifts
            const numShifts = Math.random() > 0.8 ? 2 : 1;

            for (let j = 0; j < numShifts; j++) {
                const startHour = 8 + (j * 6); // 8am or 2pm
                const startTime = addHours(date, startHour);
                const endTime = addHours(startTime, 4);

                shifts.push({
                    id: `shift-${i}-${j}`,
                    clientId: `client-${i}`,
                    clientName: j === 0 ? 'Alice Johnson' : 'Bob Smith',
                    location: '123 Care Lane, Melbourne',
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString(),
                    status: i === 0 ? 'in-progress' : 'scheduled',
                    serviceType: 'Personal Care',
                });
            }
        }
    }
    return shifts;
};

const MOCK_SHIFTS = generateMockShifts();

export const shiftService = {
    getShifts: async (startDate: Date, endDate: Date): Promise<Shift[]> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return MOCK_SHIFTS.filter(shift => {
            const shiftDate = new Date(shift.startTime);
            return shiftDate >= startDate && shiftDate <= endDate;
        });
    },

    getShiftsByDate: async (date: Date): Promise<Shift[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const targetDateStr = format(date, 'yyyy-MM-dd');

        return MOCK_SHIFTS.filter(shift => {
            return format(new Date(shift.startTime), 'yyyy-MM-dd') === targetDateStr;
        });
    }
};
