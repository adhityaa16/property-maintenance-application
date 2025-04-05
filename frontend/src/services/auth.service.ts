import api from './api';
import { setTokens, removeTokens } from '../utils/auth';

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'owner' | 'tenant' | 'service_provider';
    companyName?: string;
}

interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        role: string;
        firstName: string;
        lastName: string;
    };
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    setTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken
    });
    return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    setTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken
    });
    return response.data;
};

export const logout = async (): Promise<void> => {
    try {
        await api.post('/auth/logout');
    } finally {
        removeTokens();
    }
};

export const verifyEmail = async (token: string): Promise<void> => {
    await api.post('/auth/verify-email', { token });
};

export const requestPasswordReset = async (email: string): Promise<void> => {
    await api.post('/auth/request-password-reset', { email });
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, newPassword });
};

export const updateProfile = async (userId: string, data: Partial<RegisterData>): Promise<void> => {
    await api.put(`/users/${userId}`, data);
};

export const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', { oldPassword, newPassword });
}; 