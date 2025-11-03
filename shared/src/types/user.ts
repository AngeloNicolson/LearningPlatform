/**
 * @file user.ts
 * @author Angelo Nicolson
 * @brief User-related TypeScript type definitions for shared API contracts
 * @description Defines TypeScript interfaces for user entities, authentication requests/responses, and JWT payload structure.
 * Shared between client and server for type-safe user management including User profile, UserRegistration, UserLogin,
 * AuthResponse, and JWTPayload interfaces ensuring consistent type definitions across the full stack.
 */

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