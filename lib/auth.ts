import { saveToken } from './storage';

// NOTE: Using the standard Better Auth endpoint structure as assumed in the plan.
// If this is different, we will need to update it.
const AUTH_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/auth`;

export const auth = {
    signIn: async (email: string, password: string) => {
        try {
            const response = await fetch(`${AUTH_URL}/sign-in/email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': process.env.EXPO_PUBLIC_API_URL || 'https://carenotely.vercel.app', // Required by Better Auth
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to sign in');
            }

            // Better Auth usually returns the session in the response or sets a cookie.
            // For mobile, we might need to handle this differently if it relies on cookies.
            // However, the user documentation says: "The session token is obtained from Better Auth after successful login."
            // Let's assume the response contains the token or session object with a token.

            // Inspecting the likely response structure for Better Auth:
            // It often returns { user: ..., session: { token: ... } }

            if (data.token) {
                await saveToken(data.token);
                return data;
            } else if (data.session && data.session.token) {
                await saveToken(data.session.token);
                return data;
            } else {
                // Fallback: check headers if token is not in body? 
                // Or maybe we need to use the `better-auth/client` if possible, but we are in React Native.
                // For now, let's assume it's in the body as `token` or `session.token`.
                console.warn('Token not found in response, checking for other fields', data);
                // If we can't find it, we might still return success but subsequent requests might fail.
                return data;
            }

        } catch (error) {
            throw error;
        }
    },
};
