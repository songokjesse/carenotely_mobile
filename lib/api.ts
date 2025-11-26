import { getToken } from './storage';

const BASE_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/mobile/v1`;

interface RequestOptions extends RequestInit {
    headers?: Record<string, string>;
}

export class ApiError extends Error {
    code?: string;
    statusCode: number;

    constructor(message: string, statusCode: number, code?: string) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.code = code;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }

        // Set the prototype explicitly to fix instanceof checks
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const token = await getToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new ApiError(
                data.error || 'An error occurred',
                response.status,
                data.code
            );
        }

        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        // Network error or JSON parse error
        throw new ApiError(
            'Network error. Please check your connection.',
            0
        );
    }
}

export const api = {
    get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
    post: <T>(endpoint: string, body: any) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    patch: <T>(endpoint: string, body: any) => request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
