import jwtDecode from 'jwt-decode';

interface TokenPayload {
    userId: string;
    role: string;
    email?: string;
    exp?: number;
    iat?: number;
}

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

// Store tokens in localStorage
export const setTokens = (tokens: AuthTokens): void => {
    try {
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
    } catch (error) {
        console.error('Error storing tokens:', error);
    }
};

// Get tokens from localStorage
export const getTokens = (): AuthTokens | null => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!accessToken || !refreshToken) {
            return null;
        }
        
        return { accessToken, refreshToken };
    } catch (error) {
        console.error('Error retrieving tokens:', error);
        return null;
    }
};

// Remove tokens from localStorage
export const removeTokens = (): void => {
    try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    } catch (error) {
        console.error('Error removing tokens:', error);
    }
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jwtDecode<TokenPayload>(token);
        if (!decoded.exp) return true;
        
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch (error) {
        console.error('Error checking token expiration:', error);
        return true;
    }
};

// Get user details from token
export const getUserFromToken = (token: string): Partial<TokenPayload> | null => {
    try {
        const decoded = jwtDecode<TokenPayload>(token);
        return {
            userId: decoded.userId,
            role: decoded.role,
            email: decoded.email
        };
    } catch (error) {
        console.error('Error getting user from token:', error);
        return null;
    }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
    try {
        const tokens = getTokens();
        if (!tokens) return false;
        return !isTokenExpired(tokens.accessToken);
    } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
};

// Get user role
export const getUserRole = (): string | null => {
    try {
        const tokens = getTokens();
        if (!tokens) return null;
        
        const decoded = jwtDecode<TokenPayload>(tokens.accessToken);
        return decoded.role;
    } catch (error) {
        console.error('Error getting user role:', error);
        return null;
    }
};

// Get user ID
export const getUserId = (): string | null => {
    try {
        const tokens = getTokens();
        if (!tokens) return null;
        
        const decoded = jwtDecode<TokenPayload>(tokens.accessToken);
        return decoded.userId;
    } catch (error) {
        console.error('Error getting user ID:', error);
        return null;
    }
};

// Get user email
export const getUserEmail = (): string | null => {
    try {
        const tokens = getTokens();
        if (!tokens) return null;
        
        const decoded = jwtDecode<TokenPayload>(tokens.accessToken);
        return decoded.email || null;
    } catch (error) {
        console.error('Error getting user email:', error);
        return null;
    }
};

// Check if token needs refresh (5 minutes before expiration)
export const needsTokenRefresh = (): boolean => {
    try {
        const tokens = getTokens();
        if (!tokens) return false;
        
        const decoded = jwtDecode<TokenPayload>(tokens.accessToken);
        if (!decoded.exp) return true;
        
        const currentTime = Math.floor(Date.now() / 1000);
        const fiveMinutes = 5 * 60;
        return decoded.exp - currentTime < fiveMinutes;
    } catch (error) {
        console.error('Error checking token refresh:', error);
        return true;
    }
};