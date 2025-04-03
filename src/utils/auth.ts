import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
    exp: number;
    iat: number;
    userId: string;
    role: string;
    email?: string;
}

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export const getTokens = (): AuthTokens | null => {
    const accessToken = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!accessToken || !refreshToken) return null;
    
    return { accessToken, refreshToken };
};

export const setTokens = (tokens: AuthTokens): void => {
    localStorage.setItem('token', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
};

export const removeTokens = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
};

export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jwtDecode<TokenPayload>(token);
        const currentTime = Date.now() / 1000; // Convert to seconds
        return decoded.exp < currentTime;
    } catch (error) {
        console.error('Error decoding token:', error);
        return true;
    }
};

export const getUserRole = (): string | null => {
    const tokens = getTokens();
    if (!tokens) return null;
    
    try {
        const decoded = jwtDecode<TokenPayload>(tokens.accessToken);
        return decoded.role;
    } catch (error) {
        console.error('Error getting user role:', error);
        return null;
    }
};

export const getUserId = (): string | null => {
    const tokens = getTokens();
    if (!tokens) return null;
    
    try {
        const decoded = jwtDecode<TokenPayload>(tokens.accessToken);
        return decoded.userId;
    } catch (error) {
        console.error('Error getting user ID:', error);
        return null;
    }
};

export const getUserEmail = (): string | null => {
    const tokens = getTokens();
    if (!tokens) return null;
    
    try {
        const decoded = jwtDecode<TokenPayload>(tokens.accessToken);
        return decoded.email || null;
    } catch (error) {
        console.error('Error getting user email:', error);
        return null;
    }
};

export const isAuthenticated = (): boolean => {
    const tokens = getTokens();
    if (!tokens) return false;
    
    return !isTokenExpired(tokens.accessToken);
}; 