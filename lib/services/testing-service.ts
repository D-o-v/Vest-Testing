import api from './api'

/**
 * Thin client wrapper for testing endpoints. Keep functions small and
 * typed so callers know what to expect.
 */

export const testingService = {
  /**
   * Get recent tests (matches Postman: GET {{baseUrl}}/testing/recent-tests/)
   */
  async getRecentTests(queryParams?: Record<string, any>): Promise<any[]> {
    const response = await api.get('/testing/recent-tests/', { params: queryParams })
    return response.data
  },

  /**
   * Get hits-per-state (matches Postman: GET {{baseUrl}}/testing/hits-per-state/)
   * Accepts optional filter param (e.g., 'today')
   */
  async getHitsPerState(options?: { filter?: string; start_date?: string; end_date?: string } | Record<string, any>): Promise<any> {
    const queryParams = options || undefined
    const response = await api.get('/testing/hits-per-state/', { params: queryParams })
    return response.data
  },
  /**
   * Get daily success rate (matches Postman: GET {{baseUrl}}/testing/daily-success-rate/)
   */
  async getDailySuccessRate(params?: Record<string, any>): Promise<any> {
    const response = await api.get('/testing/daily-success-rate/', { params })
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
