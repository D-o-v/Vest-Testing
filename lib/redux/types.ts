export type UserType = 'admin' | 'engineer' | 'user';

export interface User {
  id: string;
  email: string;
  userType: UserType;
  name?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  userType: UserType;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface Test {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results: any;
}

export interface TestState {
  tests: Test[];
  currentTest: Test | null;
  loading: boolean;
  error: string | null;
}