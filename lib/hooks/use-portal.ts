import { useState, useEffect, useCallback } from 'react';
import { portalService, Call, Message, TestRecord, Organization, PaginatedResponse } from '../services/portal-service';

// Generic hook for paginated data
export function usePaginatedData<T>(
  fetchFn: (page?: number) => Promise<PaginatedResponse<T>>,
  deps: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const fetchData = useCallback(async (pageNum: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFn(pageNum);
      setData(response.results);
      setTotalCount(response.count);
      setHasNext(!!response.next);
      setHasPrevious(!!response.previous);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [fetchFn, ...deps]);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const nextPage = () => hasNext && fetchData(page + 1);
  const prevPage = () => hasPrevious && fetchData(page - 1);
  const goToPage = (pageNum: number) => fetchData(pageNum);
  const refresh = () => fetchData(page);

  return {
    data,
    loading,
    error,
    page,
    totalCount,
    hasNext,
    hasPrevious,
    nextPage,
    prevPage,
    goToPage,
    refresh
  };
}

// Specific hooks for different data types
export function useCalls() {
  return usePaginatedData((page) => portalService.getCalls(page));
}

export function useMessages() {
  return usePaginatedData((page) => portalService.getMessages(page));
}

export function useTestingRecords() {
  return usePaginatedData((page) => portalService.getTestingRecords(page));
}

export function useOrganizations() {
  return usePaginatedData((page) => portalService.getOrganizations(page));
}

// Dashboard hook
export function useDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [recentTests, setRecentTests] = useState<TestRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardData, recentTestsData] = await Promise.all([
        portalService.getDashboard(),
        portalService.getRecentTests()
      ]);
      setMetrics(dashboardData);
      setRecentTests(recentTestsData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    metrics,
    recentTests,
    loading,
    error,
    refresh: fetchDashboardData
  };
}

// Live data hooks
export function useLiveCalls() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveCalls = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await portalService.getLiveCalls();
      setCalls(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch live calls');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Run once immediately
    fetchLiveCalls();
    // Set up polling for live data. Wrap the async call so any thrown
    // promise rejections are caught and logged (avoids unhandled rejections).
    const runner = () => {
      fetchLiveCalls().catch((e) => {
        const msg = e instanceof Error ? e.message : String(e)
        console.error('Polling live calls failed:', msg)
      })
    }
    const interval = setInterval(runner, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [fetchLiveCalls]);

  return { calls, loading, error, refresh: fetchLiveCalls };
}

export function useHeldMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHeldMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await portalService.getHeldMessages();
      setMessages(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch held messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeldMessages();
  }, [fetchHeldMessages]);

  return { messages, loading, error, refresh: fetchHeldMessages };
}

// Network analytics hooks
export function useNetworkAnalytics(startDate: string, endDate: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNetworkData = useCallback(async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);
    try {
      const hitsParams = (startDate && endDate)
        ? { start_date: startDate, end_date: endDate }
        : { filter: 'today' };

      const [successRate, failureRate, hitsPerState] = await Promise.all([
        portalService.getNetworkSuccessRate(startDate, endDate),
        portalService.getNetworkFailureRate(startDate, endDate),
        // pass an options object — portalService.getHitsPerState accepts filter or date range
        portalService.getHitsPerState(hitsParams as any)
      ]);
      setData({ successRate, failureRate, hitsPerState });
    } catch (err: unknown) {
  const errorMessage = err instanceof Error ? err.message : String(err || 'Failed to fetch network analytics');
  setError(errorMessage);
  // Avoid logging raw objects to reduce risk of log injection
  import('@/lib/utils/logger').then(({ default: logger }) => logger.error('Network analytics fetch failed:', errorMessage)).catch(() => {})
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchNetworkData();
  }, [fetchNetworkData]);

  return { data, loading, error, refresh: fetchNetworkData };
}

// System monitoring hooks
export function useSystemHealth() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await portalService.getSystemHealth();
      setHealth(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch system health');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSystemHealth();
    const runner = () => {
      fetchSystemHealth().catch((e) => {
        const msg = e instanceof Error ? e.message : String(e)
        console.error('Polling system health failed:', msg)
      })
    }
    // Poll system health every 30 seconds
    const interval = setInterval(runner, 30000);
    return () => clearInterval(interval);
  }, [fetchSystemHealth]);

  return { health, loading, error, refresh: fetchSystemHealth };
}