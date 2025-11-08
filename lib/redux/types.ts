export interface AuthState {
  user: any | null;
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