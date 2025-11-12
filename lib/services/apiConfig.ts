// Minimal generated mapping (run `node scripts/generateApiConfig.js` to regenerate)
export const API_CONFIG = {
  "analytics.dashboard.analytics dashboard list": { method: "GET", path: "/analytics/dashboard/", headers: [] },
  "auth.login.auth login create": { method: "POST", path: "/auth/login/", headers: [{ key: 'Content-Type', value: 'application/json' },{ key: 'Accept', value: 'application/json' }] },
  "auth.logout.auth logout create": { method: "POST", path: "/auth/logout/", headers: [] },
  "testing.recent-tests.testing recent-tests list": { method: "GET", path: "/testing/recent-tests/", headers: [{ key: 'Accept', value: 'application/json' }] },
  "testing.hits-per-state.testing hits-per-state list": { method: "GET", path: "/testing/hits-per-state/", headers: [] },
  "calls.live.calls live list": { method: "GET", path: "/calls/live/", headers: [] },
  "messages.held.messages held list": { method: "GET", path: "/messages/held/", headers: [] },
  "filters.filters list": { method: "GET", path: "/filters/", headers: [{ key: 'Accept', value: 'application/json' }] },
} as const

export type ApiConfig = typeof API_CONFIG
