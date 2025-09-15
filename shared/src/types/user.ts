export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRegistration {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user?: Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
  accessToken?: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  roles: string[];
  iat: number;
  exp: number;
}