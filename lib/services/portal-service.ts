import api from './api';

// Types based on the Postman collection responses
export interface Call {
  id: string;
  organization: string;
  direction: 'inbound' | 'outbound';
  from_number: string;
  to_number: string;
  status: 'completed' | 'failed' | 'in_progress';
  duration: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  protocol: string;
  location_data: Record<string, any>;
  metadata: Record<string, any>;
  start_time: string;
  end_time: string;
  recording_url?: string;
}

export interface Message {
  id: string;
  organization: string;
  direction: 'inbound' | 'outbound';
  from_number: string;
  to_number: string;
  content: string;
  status: 'delivered' | 'blocked' | 'pending' | 'failed';
  message_type: 'SMS' | 'MMS';
  protocol: string;
  size: number;
  filtered_words: Record<string, any>;
  flagged: boolean;
  timestamp: string;
}

export interface TestRecord {
  id: string;
  test_case_description: string;
  originator_number: string;
  originator_location: string;
  originator_network: string;
  time_of_call: string;
  status: string;
  originator_location_detail: LocationDetail;
  recipient_number: string;
  recipient_location: string;
  recipient_location_detail: LocationDetail;
  recipient_network: string;
  receipt_number_format: string;
  service: string;
  duration: number;
  call_setup_time: number;
  data_speed: string;
  url: string;
  url_redirect: string;
  created_at: string;
}

export interface LocationDetail {
  id: string;
  name: string;
  state: string;
  state_display: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  plan: 'basic' | 'professional' | 'enterprise';
  contact_email: string;
  contact_phone: string;
  status: 'active' | 'inactive' | 'warning';
  phoneNumbers: string;
  activeUsers: string;
  callVolume: string;
  messageVolume: string;
  settings: Record<string, any>;
  created_at: string;
  last_activity: string;
}

export interface PaginatedResponse<T> {
  count: number;
  results: T[];
  next?: string;
  previous?: string;
}

export interface DashboardMetrics {
  totalCalls: number;
  totalMessages: number;
  successRate: number;
  activeOrganizations: number;
}

// Portal Service Class
export class PortalService {
  // Analytics endpoints
  async getDashboard(): Promise<DashboardMetrics> {
    const response = await api.get<DashboardMetrics>('/analytics/dashboard/');
    return response.data;
  }

  async getAnalyticsReports(page?: number): Promise<PaginatedResponse<any>> {
    const response = await api.get<PaginatedResponse<any>>('/analytics/reports/', {
      params: { page }
    });
    return response.data;
  }

  async getAnalyticsReport(reportId: string): Promise<any> {
    const response = await api.get(`/analytics/reports/${reportId}/`);
    return response.data;
  }

  // Calls endpoints
  async getCalls(page?: number): Promise<PaginatedResponse<Call>> {
    const response = await api.get<PaginatedResponse<Call>>('/calls/', {
      params: { page }
    });
    return response.data;
  }

  async getCall(callId: string): Promise<Call> {
    const response = await api.get<Call>(`/calls/${callId}/`);
    return response.data;
  }

  async getLiveCalls(): Promise<Call[]> {
    const response = await api.get<Call[]>('/calls/live/');
    return response.data;
  }

  async performCallAction(callId: string, action: any): Promise<void> {
    await api.post(`/calls/${callId}/actions/`, action);
  }

  // Messages endpoints
  async getMessages(page?: number): Promise<PaginatedResponse<Message>> {
    const response = await api.get<PaginatedResponse<Message>>('/messages/', {
      params: { page }
    });
    return response.data;
  }

  async getMessage(messageId: string): Promise<Message> {
    const response = await api.get<Message>(`/messages/${messageId}/`);
    return response.data;
  }

  async getHeldMessages(): Promise<Message[]> {
    const response = await api.get<Message[]>('/messages/held/');
    return response.data;
  }

  async performMessageAction(messageId: string, action: any): Promise<void> {
    await api.post(`/messages/${messageId}/actions/`, action);
  }

  // Organizations endpoints
  async getOrganizations(page?: number): Promise<PaginatedResponse<Organization>> {
    const response = await api.get<PaginatedResponse<Organization>>('/organizations/', {
      params: { page }
    });
    return response.data;
  }

  async getOrganization(orgId: string): Promise<Organization> {
    const response = await api.get<Organization>(`/organizations/${orgId}/`);
    return response.data;
  }

  async createOrganization(data: Partial<Organization>): Promise<Organization> {
    const response = await api.post<Organization>('/organizations/', data);
    return response.data;
  }

  async updateOrganization(orgId: string, data: Partial<Organization>): Promise<Organization> {
    const response = await api.put<Organization>(`/organizations/${orgId}/`, data);
    return response.data;
  }

  async deleteOrganization(orgId: string): Promise<void> {
    await api.delete(`/organizations/${orgId}/`);
  }

  // Testing endpoints
  async getTestingRecords(page?: number): Promise<PaginatedResponse<TestRecord>> {
    const response = await api.get<PaginatedResponse<TestRecord>>('/testing/records/', {
      params: { page }
    });
    return response.data;
  }

  async getTestingRecord(recordId: string): Promise<TestRecord> {
    const response = await api.get<TestRecord>(`/testing/records/${recordId}/`);
    return response.data;
  }

  async createTestingRecord(data: Partial<TestRecord>): Promise<TestRecord> {
    const response = await api.post<TestRecord>('/testing/records/', data);
    return response.data;
  }

  async updateTestingRecord(recordId: string, data: Partial<TestRecord>): Promise<TestRecord> {
    const response = await api.put<TestRecord>(`/testing/records/${recordId}/`, data);
    return response.data;
  }

  async deleteTestingRecord(recordId: string): Promise<void> {
    await api.delete(`/testing/records/${recordId}/`);
  }

  async getRecentTests(): Promise<TestRecord[]> {
    const response = await api.get<TestRecord[]>('/testing/recent-tests/');
    return response.data;
  }

  async getTestingStats(): Promise<any> {
    const response = await api.get('/testing/records/stats/');
    return response.data;
  }

  async uploadTestingCSV(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/testing/records/upload/csv/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async uploadTestingJSON(data: any): Promise<any> {
    const response = await api.post('/testing/records/upload/json/', data);
    return response.data;
  }

  // Testing locations
  async getTestingLocations(): Promise<LocationDetail[]> {
    const response = await api.get<LocationDetail[]>('/testing/locations/');
    return response.data;
  }

  async createTestingLocation(data: { name: string; state: string }): Promise<LocationDetail> {
    const response = await api.post<LocationDetail>('/testing/locations/', data);
    return response.data;
  }

  // Network data endpoints
  async getNetworkSuccessRate(startDate: string, endDate: string): Promise<any> {
    const response = await api.get('/testing/network-success-rate/', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  }

  async getNetworkFailureRate(startDate: string, endDate: string): Promise<any> {
    const response = await api.get('/testing/network-failure-rate/', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  }

  async getHitsPerState(filter: 'today' | 'week' | 'month' = 'today'): Promise<any> {
    const response = await api.get('/testing/hits-per-state/', {
      params: { filter }
    });
    return response.data;
  }

  async getOriginatorNetworks(): Promise<string[]> {
    const response = await api.get<string[]>('/testing/originator-networks/');
    return response.data;
  }

  async getRecipientNetworks(): Promise<string[]> {
    const response = await api.get<string[]>('/testing/recipient-networks/');
    return response.data;
  }

  // System endpoints
  async getSystemHealth(): Promise<any> {
    const response = await api.get('/system/health/');
    return response.data;
  }

  async getSystemLogs(page?: number): Promise<PaginatedResponse<any>> {
    const response = await api.get<PaginatedResponse<any>>('/system/logs/', {
      params: { page }
    });
    return response.data;
  }

  // Protocol endpoints
  async getProtocolStatus(): Promise<any> {
    const response = await api.get('/protocols/status/');
    return response.data;
  }

  async getProtocolMetrics(protocol: string): Promise<any> {
    const response = await api.get(`/protocols/${protocol}/metrics/`);
    return response.data;
  }
}

// Export singleton instance
export const portalService = new PortalService();