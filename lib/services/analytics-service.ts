import api from './api'

/**
 * Analytics service wrapper — thin client around API endpoints.
 * Keep functions small and documented for readability.
 */
export const analyticsService = {
  /**
   * Fetch dashboard analytics from backend
   * Endpoint from Postman collection: GET {{baseUrl}}/analytics/dashboard/
   */
  async getDashboard(queryParams?: Record<string, any>): Promise<any> {
    const response = await api.get('/analytics/dashboard/', { params: queryParams })
    return response.data
  },
}

export default analyticsService
