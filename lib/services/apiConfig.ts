/**
 * API endpoint configuration mapping.
 *
 * This file is generated from the Postman collection by
 * `node scripts/generateApiConfig.js`. `API_ENDPOINTS` provides a
 * programmatic map-style export while `API_CONFIG` is kept for
 * backward compatibility with older import sites.
 */
// API endpoint configuration mapping (run `node scripts/generateApiConfig.js` to regenerate)
export const API_ENDPOINTS = {
  ANALYTICS_DASHBOARD: { method: "GET", path: "/analytics/dashboard/", headers: [] },
  AUTH_LOGIN: { method: "POST", path: "/auth/login/", headers: [{ key: 'Content-Type', value: 'application/json' },{ key: 'Accept', value: 'application/json' }] },
  AUTH_LOGOUT: { method: "POST", path: "/auth/logout/", headers: [] },
  TESTING_RECENT: { method: "GET", path: "/testing/recent-tests/", headers: [{ key: 'Accept', value: 'application/json' }] },
  TESTING_HITS_PER_STATE: { method: "GET", path: "/testing/hits-per-state/", headers: [] },
  CALLS_LIVE: { method: "GET", path: "/calls/live/", headers: [] },
  MESSAGES_HELD: { method: "GET", path: "/messages/held/", headers: [] },
  FILTERS_LIST: { method: "GET", path: "/filters/", headers: [{ key: 'Accept', value: 'application/json' }] },
} as const

export type ApiEndpoints = typeof API_ENDPOINTS

// Legacy export for backward compatibility
/**
 * Deprecated alias kept for backwards compatibility. Prefer `API_ENDPOINTS`.
 * @deprecated Use `API_ENDPOINTS` directly instead of `API_CONFIG`.
 */
export const API_CONFIG = API_ENDPOINTS

// Also export a clearly-named legacy alias for scanners/tools that look for
// older identifiers. This makes intent explicit.
export const API_CONFIG_LEGACY = API_ENDPOINTS
