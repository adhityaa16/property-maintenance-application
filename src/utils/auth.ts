import jwtDecode from 'jwt-decode';

interface TokenPayload {
    exp: number;
    iat: number;
    userId: string;
    role: string;
}

export const getToken = (): string | null => {
    return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
    localStorage.setItem('token', token);
};

export const removeToken = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
};

export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded: TokenPayload = jwtDecode(token);
        return decoded.exp * 1000 < Date.now();
    } catch (error) {
        return true;
    }
};

export const getUserRole = (): string | null => {
    const token = getToken();
    if (!token) return null;
    try {
        const decoded: TokenPayload = jwtDecode(token);
        return decoded.role;
    } catch (error) {
        return null;
    }
};

export const getUserId = (): string | null => {
    const token = getToken();
    if (!token) return null;
    try {
        const decoded: TokenPayload = jwtDecode(token);
        return decoded.userId;
    } catch (error) {
        return null;
    }
}; 