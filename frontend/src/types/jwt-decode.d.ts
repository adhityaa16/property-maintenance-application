declare module 'jwt-decode' {
  interface JwtPayload {
    userId: string;
    role: string;
    email?: string;
    exp?: number;
    iat?: number;
    [key: string]: any;
  }

  interface JwtDecodeOptions {
    header?: boolean;
  }

  function jwtDecode<T = JwtPayload>(token: string, options?: JwtDecodeOptions): T;

  export default jwtDecode;
} 