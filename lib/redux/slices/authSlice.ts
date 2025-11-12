import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { AxiosInstance } from 'axios';
import apiInstance from '../../services/api';
import { AuthState, LoginCredentials, AuthResponse } from '../types';

// Type assertion for the imported API instance
const api = apiInstance as AxiosInstance;

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Helper to extract a safe error message from unknown error values
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  try {
    // attempt to read a common axios error shape
    const anyErr = err as any
    return anyErr?.response?.data?.message || anyErr?.message || String(err)
  } catch {
    return String(err)
  }
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      // API returns a wrapper: { success: true, data: { user, tokens: { accessToken } } }
      const response = await api.post<AuthResponse>('/auth/login/', credentials);
      const payload = response.data || {};
      const user = payload.data?.user || payload.user || null;
      const token = payload.data?.tokens?.accessToken || payload.token || null;
      
      if (!token) {
        return rejectWithValue('Authentication failed: No token received');
      }
      
      return { user, token };
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error) || 'Login failed')
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout/');
      return;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error) || 'Logout failed')
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload?.user || null;
        state.token = action.payload?.token || null;
      })
      .addCase(login.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, logout: logoutAction } = authSlice.actions;

// Export the reducer with explicit type
const authReducer = authSlice.reducer;
export type { AuthState };
export default authReducer;