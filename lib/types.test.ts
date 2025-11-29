import { isSILShift, Shift, Site, Client } from './types';

describe('isSILShift', () => {
    it('should return true for a SIL shift', () => {
        const silShift: Partial<Shift> = {
            site: {} as Site,
            client: undefined,
        };
        expect(isSILShift(silShift as Shift)).toBe(true);
    });

    it('should return false for a normal shift', () => {
        const normalShift: Partial<Shift> = {
            client: {} as Client,
            site: undefined,
        };
        expect(isSILShift(normalShift as Shift)).toBe(false);
    });

    it('should return false if both client and site are undefined', () => {
        const emptyShift: Partial<Shift> = {
            client: undefined,
            site: undefined,
        };
        expect(isSILShift(emptyShift as Shift)).toBe(false);
    });

    it('should return false if site is null', () => {
        const nullSiteShift: Partial<Shift> = {
            site: null,
        };
        expect(isSILShift(nullSiteShift as Shift)).toBe(false);
    });
});
