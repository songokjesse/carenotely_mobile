import { differenceInMinutes } from 'date-fns';
import { Shift } from './types';

export const shiftUtils = {
    /**
     * Check if user can clock in to a shift
     * Rules: Can clock in up to 15 minutes before shift start, and anytime after
     */
    canClockIn: (shift: Shift): { canClock: boolean; reason?: string } => {
        // Already clocked in
        if (shift.clockInTime) {
            return { canClock: false, reason: 'Already clocked in' };
        }

        // Shift is cancelled or completed
        if (shift.status === 'CANCELLED' || shift.status === 'COMPLETED' || shift.status === 'NO_SHOW') {
            return { canClock: false, reason: 'Shift is not active' };
        }

        const now = new Date();
        const shiftStart = new Date(shift.startTime);
        const minutesUntilStart = differenceInMinutes(shiftStart, now);

        // Too early (more than 15 minutes before start)
        if (minutesUntilStart > 15) {
            return {
                canClock: false,
                reason: `You can clock in ${minutesUntilStart - 15} minutes from now (15 minutes before shift start)`
            };
        }

        return { canClock: true };
    },

    /**
     * Check if user can clock out of a shift
     * Rules: Must be clocked in
     */
    canClockOut: (shift: Shift): { canClock: boolean; reason?: string } => {
        // Not clocked in yet
        if (!shift.clockInTime) {
            return { canClock: false, reason: 'You must clock in first' };
        }

        // Already clocked out
        if (shift.clockOutTime) {
            return { canClock: false, reason: 'Already clocked out' };
        }

        return { canClock: true };
    },

    /**
     * Get shift status display
     */
    getShiftStatusInfo: (shift: Shift): { label: string; color: string; icon: string } => {
        if (shift.clockOutTime) {
            return { label: 'Completed', color: '#10B981', icon: 'checkmark-circle' };
        }
        if (shift.clockInTime) {
            return { label: 'In Progress', color: '#3B82F6', icon: 'time' };
        }

        const now = new Date();
        const shiftStart = new Date(shift.startTime);
        const minutesUntilStart = differenceInMinutes(shiftStart, now);

        if (minutesUntilStart <= 15 && minutesUntilStart >= 0) {
            return { label: 'Ready to Start', color: '#10B981', icon: 'play-circle' };
        }
        if (minutesUntilStart < 0) {
            return { label: 'Overdue', color: '#EF4444', icon: 'alert-circle' };
        }

        return { label: 'Scheduled', color: '#6B7280', icon: 'calendar' };
    },
};
