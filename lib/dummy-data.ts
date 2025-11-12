/**
 * Dummy data generator intentionally removed.
 *
 * Historically this file generated local test data. To avoid accidental
 * usage in production and ensure the app uses live backend data, the
 * generator now throws with a clear message. Keep the exported name
 * for backwards compatibility but do not attempt to call this function.
 */
export function createTestData(): any[] {
  throw new Error(
    'Dummy data removed: please use testingService.getRecords() or other API endpoints for live data.'
  )
}

// Backwards-compatible alias kept for callers that referenced the old name.
/** @deprecated Use testingService.getRecords() instead of local dummy generation. */
export const createDummyData = createTestData
