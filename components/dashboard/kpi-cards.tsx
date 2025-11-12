"use client"

import { useEffect, useState } from "react"
import { MNO_COLORS, MNO_NAMES } from "@/lib/constants"
import type { AggregatedMetrics } from "@/lib/types"
import { Card } from "@/components/ui/card"
import analyticsService from '@/lib/services/analytics-service'
import { portalService } from '@/lib/services/portal-service'
import logger from '@/lib/utils/logger'

export default function KPICards({ startDate, endDate }: { startDate?: string | null, endDate?: string | null }) {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    let mounted = true
    const params: Record<string, any> = {}
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate

    // Use network-success-rate endpoint directly for KPI data
    portalService.getNetworkSuccessRate(params.start_date || '', params.end_date || '')
      .then(data => {
        if (!mounted) return
        setDashboardData(data)
        setLoading(false)
      })
      .catch(err => {
        const sanitizedMsg = err instanceof Error ? err.message : 'Unknown error'
        logger.error('Failed to fetch network success rate:', sanitizedMsg)
        if (mounted) setLoading(false)
      })
    
    return () => { mounted = false }
  }, [startDate, endDate])

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

  // Guarantee: always render KPI cards for the canonical MNO list.
  // If API data is present, merge it; otherwise show zeros.
  const canonicalMnos = ['MTN', 'GLO', 'AIRTEL', 'T2']

  const apiNetworks: Record<string, any> = {}
  if (dashboardData?.networks && Array.isArray(dashboardData.networks)) {
    for (const net of dashboardData.networks) {
      let key = String(net.network ?? net.mno ?? '').toUpperCase()
      if (key === 'AIRTEL') key = 'AIRTEL'
      if (key === 'T2' || key === 'T2' || key === 'T2') key = 'T2'
      if (key === 'T2' || key === 'T2') key = 'T2'
      apiNetworks[key] = net
    }
  }

  const mnos: AggregatedMetrics[] = canonicalMnos.map((mnoKey) => {
    const net = apiNetworks[mnoKey]
    const successRate = Number(net?.success_rate ?? net?.successRate ?? 0) || 0
    const totalAttempts = Number(net?.total_records ?? net?.totalRecords ?? 0) || 0
    const totalSuccesses = Number(net?.success_records ?? net?.successRecords ?? 0) || 0
    const totalFailures = Math.max(0, totalAttempts - totalSuccesses)
    const failureRate = totalAttempts > 0 ? (totalFailures / totalAttempts) * 100 : 0
    // fill remaining AggregatedMetrics fields with sensible defaults
    return {
      mno: mnoKey as any,
      successRate,
      totalAttempts,
      totalSuccesses,
      totalFailures,
      failureRate,
      avgDuration: 0,
      avgCallSetupTime: 0,
    }
  })

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
                <p className="text-xs font-semibold text-muted-foreground">{MNO_NAMES[metric.mno] || metric.mno}</p>
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
