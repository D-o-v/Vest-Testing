import api from './api';

export interface Test {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results?: TestResult[];
}

export interface TestResult {
  id: string;
  testId: string;
  status: 'pass' | 'fail';
  message?: string;
  duration: number;
  timestamp: string;
}

export interface CreateTestParams {
  name: string;
  description?: string;
}

export interface TestFilters {
  status?: Test['status'];
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const testService = {
  async createTest(params: CreateTestParams): Promise<Test> {
    const response = await api.post<Test>('/tests', params);
    return response.data;
  },

  async getTests(filters?: TestFilters): Promise<PaginatedResponse<Test>> {
    const response = await api.get<PaginatedResponse<Test>>('/tests', {
      params: filters,
    });
    return response.data;
  },

  async getTestById(id: string): Promise<Test> {
    const response = await api.get<Test>(`/tests/${id}`);
    return response.data;
  },

  async updateTest(id: string, params: Partial<CreateTestParams>): Promise<Test> {
    const response = await api.patch<Test>(`/tests/${id}`, params);
    return response.data;
  },

  async deleteTest(id: string): Promise<void> {
    await api.delete(`/tests/${id}`);
  },

  async runTest(id: string): Promise<void> {
    await api.post(`/tests/${id}/run`);
  },

  async getTestResults(id: string): Promise<TestResult[]> {
    const response = await api.get<TestResult[]>(`/tests/${id}/results`);
    return response.data;
  }
};