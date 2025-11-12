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

// Auth responses may come in multiple shapes depending on the backend wrapper.
// Accept both a flat shape and a wrapped shape used by some APIs.
export interface AuthResponse {
  // flat shape
  user?: User;
  token?: string;

  // wrapped shape: { success: true, data: { user, tokens: { accessToken } } }
  success?: boolean;
  data?: {
    user?: User;
    tokens?: { accessToken?: string };
  };
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