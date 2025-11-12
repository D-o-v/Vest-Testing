"use client"

import { useEffect, useState } from "react"
import { MNO_COLORS, MNO_NAMES } from "@/lib/constants"
import type { AggregatedMetrics } from "@/lib/types"
import { Card } from "@/components/ui/card"
import analyticsService from '@/lib/services/analytics-service'
import { portalService } from '@/lib/services/portal-service'

export default function KPICards({ metrics, startDate, endDate }: { metrics?: Record<string, AggregatedMetrics>, startDate?: string | null, endDate?: string | null }) {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (metrics && Object.keys(metrics).length > 0) {
      setLoading(false)
      return // Use provided metrics
    }

    // Try backend first (Postman: GET /analytics/dashboard/)
    setLoading(true)
    let mounted = true
    const params: Record<string, any> = {}
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate

    analyticsService.getDashboard(Object.keys(params).length ? params : undefined)
      .then(async (data) => {
        if (!mounted) return
        // if analytics endpoint directly returns networks, use it
        if (data && Array.isArray((data as any).networks)) {
          setDashboardData(data)
          setLoading(false)
          return
        }

        // otherwise try network-success-rate endpoint as a fallback source (no dummy data)
        try {
          const nr = await portalService.getNetworkSuccessRate(params.start_date, params.end_date)
          if (!mounted) return
          if (nr && Array.isArray(nr.networks)) {
            setDashboardData(nr)
            setLoading(false)
            return
          }
        } catch (e) {
          const msg = e && (e as any).message ? (e as any).message : String(e)
          console.error('portalService.getNetworkSuccessRate failed:', msg)
        }

        // final fallback to analytics response (may contain other KPI shapes)
        setDashboardData(data)
        setLoading(false)
      })
      .catch(err => {
        // No local fallbacks: log error and stop loading. UI will render empty state.
        const msg = err && (err as any).message ? (err as any).message : String(err)
        console.error('analyticsService.getDashboard failed:', msg)
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [metrics, startDate, endDate])

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-bold tracking-tight text-foreground mb-6">Network Performance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse bg-muted p-6 h-32"/>
          ))}
        </div>
      </div>
    )
  }

  const kpiData = dashboardData

  // prefer metrics prop > API networks array; be resilient to different nesting keys
  if (!metrics && !kpiData) return null

  const networksSource: any[] | undefined = kpiData?.networks ?? kpiData?.successRate?.networks ?? kpiData?.success_rate?.networks ?? kpiData?.results?.networks

  // debug keys to help trace API shape in development
  if (typeof window !== 'undefined' && kpiData) {
    try { console.debug('KPICards dashboardData keys:', Object.keys(kpiData)) } catch (e) { /* ignore */ }
  }

  const mnos: AggregatedMetrics[] = metrics
    ? Object.values(metrics)
    : ((networksSource ?? []) as any[]).map((n: any) => ({
      mno: String((n.network ?? n.mno) || '').toUpperCase(),
      successRate: Number(n.success_rate ?? n.successRate ?? 0) || 0,
      totalAttempts: Number(n.total_records ?? n.totalAttempts ?? 0) || 0,
      totalSuccesses: Number(n.success_records ?? n.totalSuccesses ?? 0) || 0,
    } as AggregatedMetrics))

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
  {mnos.map((metric: AggregatedMetrics) => (
          <Card
            key={metric.mno}
            className="bg-linear-to-br border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-md"
            style={{
              backgroundImage: `linear-gradient(135deg, ${MNO_COLORS[metric.mno]}25 0%, transparent 100%)`,
            }}
          >
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: MNO_COLORS[metric.mno] }}
                />
                <p className="text-xs font-semibold text-muted-foreground">{MNO_NAMES[metric.mno]}</p>
              </div>

              <div className="mb-3">
                <span className="text-2xl font-bold text-foreground">{metric.successRate.toFixed(1)}%</span>
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </div>

              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full transition-all rounded-full"
                  style={{
                    width: `${metric.successRate}%`,
                    backgroundColor: MNO_COLORS[metric.mno],
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div>
                  <span className="text-muted-foreground block">Tests</span>
                  <span className="font-bold text-foreground">{metric.totalAttempts}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Pass</span>
                  <span className="font-bold text-green-500">{metric.totalSuccesses}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
