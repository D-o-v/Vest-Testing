import api from './api'

export const analyticsService = {
  /**
   * Fetch dashboard analytics from backend
   * Endpoint from Postman collection: GET {{baseUrl}}/analytics/dashboard/
   */
  async getDashboard(params?: Record<string, any>): Promise<any> {
    const response = await api.get('/analytics/dashboard/', { params })
    return response.data
  },
}

export default analyticsService
