export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
  userId: string;
  email: string;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
}
