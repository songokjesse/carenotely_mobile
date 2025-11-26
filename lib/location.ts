import * as Location from 'expo-location';

export interface LocationCoords {
    lat: number;
    lng: number;
    accuracy: number;
}

export const locationService = {
    /**
     * Request location permissions and get current location
     */
    getCurrentLocation: async (): Promise<LocationCoords> => {
        // Request permission
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            throw new Error('Location permission denied. Please enable location services to clock in/out.');
        }

        // Get current position
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });

        return {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            accuracy: location.coords.accuracy || 0,
        };
    },

    /**
     * Check if location permissions are granted
     */
    hasPermission: async (): Promise<boolean> => {
        const { status } = await Location.getForegroundPermissionsAsync();
        return status === 'granted';
    },
};
