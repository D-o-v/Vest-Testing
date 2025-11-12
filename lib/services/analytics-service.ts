import api from './api'

export const analyticsService = {
  /**
   * Fetch dashboard analytics from backend
   * Endpoint from Postman collection: GET {{baseUrl}}/analytics/dashboard/
   */
  async getDashboard(): Promise<any> {
    const response = await api.get('/analytics/dashboard/')
    return response.data
  },
}

export default analyticsService
