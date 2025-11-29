import React from 'react';
import { render } from '@testing-library/react-native';
import { ShiftCard } from './shift-card';
import { Shift, Client, Site } from '../lib/types';

// Mock date-fns to have consistent date formatting
jest.mock('date-fns', () => ({
    ...jest.requireActual('date-fns'),
    format: jest.fn((date, formatString) => {
        if (formatString === 'EEEE, MMM d, yyyy') {
            return 'Friday, Nov 28, 2025';
        }
        return '12:00 PM';
    }),
}));

describe('ShiftCard', () => {
    const baseShift: Omit<Shift, 'client' | 'site'> = {
        id: '1',
        startTime: new Date('2025-11-28T12:00:00Z').toISOString(),
        endTime: new Date('2025-11-28T14:00:00Z').toISOString(),
        status: 'PLANNED',
        serviceType: 'Test Service',
        location: 'Test Location',
    };

    it('should display the client name for a normal shift', () => {
        const normalShift = {
            ...baseShift,
            client: { id: 'c1', name: 'John Doe' } as Client,
        } as Shift;

        const { getByText } = render(<ShiftCard shift={normalShift} />);
        expect(getByText('John Doe')).toBeTruthy();
    });

    it('should display the site name for a SIL shift', () => {
        const silShift = {
            ...baseShift,
            site: { id: 's1', name: 'SIL Site Alpha', address: '123 Fake St', residents: [] } as Site,
        } as Shift;

        const { getByText } = render(<ShiftCard shift={silShift} />);
        expect(getByText('SIL Site Alpha')).toBeTruthy();
    });

    it('should display "Unknown" if client and site are missing', () => {
        const unknownShift = {
            ...baseShift,
        } as Shift;

        const { getByText } = render(<ShiftCard shift={unknownShift} />);
        expect(getByText('Unknown')).toBeTruthy();
    });
});
