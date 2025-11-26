export interface User {
  id?: number;
  email: string;
  userName: string;
  role?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    email: string;
    userName: string;
    role: string;
    userId?: number; // Agregamos userId opcional por si el backend lo incluye
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  userName: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface LoginAttempt {
  id: number;
  userId: number;
  username: string;
  ipAddress: string;
  userAgent: string;
  attemptTime: string;
  success: boolean;
  failureReason?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}