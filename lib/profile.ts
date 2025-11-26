import { api } from './api';
import { UserProfile } from './types';

export const profileService = {
    /**
     * Get current user profile and organization membership
     */
    getProfile: async (): Promise<UserProfile> => {
        return await api.get<UserProfile>('/profile');
    },
};
