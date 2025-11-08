import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { AxiosInstance } from 'axios';
import apiInstance from '../../services/api';
import { TestState } from '../types';

// Type assertion for the imported API instance
const api = apiInstance as AxiosInstance;

const initialState: TestState = {
  tests: [],
  currentTest: null,
  loading: false,
  error: null,
};

export const fetchTests = createAsyncThunk(
  'test/fetchTests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tests/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tests');
    }
  }
);

export const runTest = createAsyncThunk(
  'test/runTest',
  async (testId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tests/${testId}/run/`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to run test');
    }
  }
);

export const getTestResults = createAsyncThunk(
  'test/getTestResults',
  async (testId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tests/${testId}/results/`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get test results');
    }
  }
);

const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    clearTestError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTests.fulfilled, (state, action) => {
        state.loading = false;
        state.tests = action.payload;
      })
      .addCase(fetchTests.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(runTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(runTest.fulfilled, (state, action) => {
        state.loading = false;
        const testIndex = state.tests.findIndex(t => t.id === action.payload.id);
        if (testIndex !== -1) {
          state.tests[testIndex] = action.payload;
        }
        state.currentTest = action.payload;
      })
      .addCase(runTest.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getTestResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTestResults.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentTest) {
          state.currentTest.results = action.payload;
        }
      })
      .addCase(getTestResults.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTestError } = testSlice.actions;

// Export the reducer with explicit type
const testReducer = testSlice.reducer;
export type { TestState };
export default testReducer;