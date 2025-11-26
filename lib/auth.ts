import { saveToken } from './storage';

const AUTH_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/auth`;

// Extract session token from Set-Cookie header
function extractSessionToken(headers: Headers): string | null {
    const setCookie = headers.get('set-cookie');
    if (!setCookie) return null;

    // Better Auth typically sets a cookie named 'better-auth.session_token' or similar
    // Parse the Set-Cookie header to extract the token value
    const cookies = setCookie.split(',').map(c => c.trim());

    for (const cookie of cookies) {
        // Look for session token cookie
        const match = cookie.match(/better-auth\.session_token=([^;]+)/i) ||
            cookie.match(/session[_-]?token=([^;]+)/i);
        if (match && match[1]) {
            // URL-decode the token (cookies are URL-encoded)
            return decodeURIComponent(match[1]);
        }
    }

    return null;
}

export const auth = {
    signIn: async (email: string, password: string) => {
        try {
            const response = await fetch(`${AUTH_URL}/sign-in/email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            console.log('Login response status:', response.status);
            console.log('Login response data:', JSON.stringify(data, null, 2));
            console.log('Response headers:', {
                setCookie: response.headers.get('set-cookie'),
            });

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Failed to sign in');
            }

            // IMPORTANT: Prioritize the full signed token from cookies
            // The cookie contains the complete token with signature, while the body only has the token ID
            let token = extractSessionToken(response.headers);
            console.log('Token from cookie:', token);

            // Fallback to body token if cookie extraction fails
            if (!token) {
                token = data.token || data.session?.token;
                console.log('Token from body (fallback):', token);
            }

            if (token) {
                console.log('Saving token:', token.substring(0, 30) + '...');
                await saveToken(token);
                return { ...data, token };
            } else {
                console.error('Login response:', data);
                console.error('Could not find token in body or cookies');
                throw new Error('No session token received from server. Please check your backend configuration.');
            }

        } catch (error) {
            throw error;
        }
    },
};
