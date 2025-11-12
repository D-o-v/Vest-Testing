import api from './api'

export const testingService = {
  /**
   * Get recent tests (matches Postman: GET {{baseUrl}}/testing/recent-tests/)
   */
  async getRecentTests(): Promise<any[]> {
    const response = await api.get('/testing/recent-tests/')
    return response.data
  },

  /**
   * Get hits-per-state (matches Postman: GET {{baseUrl}}/testing/hits-per-state/)
   * Accepts optional filter param (e.g., 'today')
   */
  async getHitsPerState(filter?: string): Promise<any> {
    const response = await api.get('/testing/hits-per-state/', {
      params: filter ? { filter } : undefined,
    })
    return response.data
  },
  /**
   * Get testing records list (paginated). Returns array or {results: []}
   */
  async getRecords(params?: Record<string, any>): Promise<any> {
    const response = await api.get('/testing/records/', { params })
    // Some endpoints return { count, results } while others may return array
    return response.data?.results ?? response.data
  },
}

export default testingService
