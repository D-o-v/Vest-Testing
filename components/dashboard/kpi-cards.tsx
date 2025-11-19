"use client"

import { useEffect, useState } from "react"
import { MNO_COLORS, MNO_NAMES } from "@/lib/constants"
import { MessageSquare, Phone, Wifi, HelpCircle } from 'lucide-react'
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
        // expose raw service breakdown from API if present for rendering small values
        serviceBreakdown: net?.service_breakdown ?? net?.serviceBreakdown ?? {},
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
              <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between">
                <div className="sm:flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: MNO_COLORS[metric.mno] }}
                    />
                    <p className="text-sm font-semibold text-foreground truncate">{MNO_NAMES[metric.mno] || metric.mno}</p>
                  </div>

                  <div className="mb-3">
                    <span className="text-2xl font-bold text-foreground">{metric.successRate.toFixed(1)}%</span>
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                  </div>

                  {/* Progress bar full width */}
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full transition-all rounded-full"
                      style={{
                        width: `100%`,
                        backgroundColor: MNO_COLORS[metric.mno],
                      }}
                    />
                    {/* overlay to show actual percent visually */}
                    <div className="relative -mt-1.5 pointer-events-none">
                      <div style={{ width: `${metric.successRate}%` }} className="h-1.5 rounded-full" />
                    </div>
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

                {/* Right-side compact service breakdown - icons + numbers only */}
                <div className="mt-3 sm:mt-0 sm:ml-4 w-full sm:w-20 shrink-0">
                  <div className="text-xs font-medium text-muted-foreground mb-2 sr-only">By service</div>
                  <div className="grid gap-2 text-xs">
                    {Object.entries((metric as any).serviceBreakdown || {}).length > 0 ? (
                      Object.entries((metric as any).serviceBreakdown || {}).map(([svc, info]: any) => {
                        const svcKey = String(svc || 'Unknown')
                        const total = Number(info?.total ?? info?.count ?? ((info?.success ?? 0) + (info?.failed ?? 0)) ?? 0) || 0
                        const success = Number(info?.success ?? info?.success_count ?? info?.successRecords ?? 0) || 0
                        const pct = Number(info?.success_rate ?? info?.successRate ?? (total ? Math.round((success / total) * 100) : 0)) || 0
                        const ServiceIcon = svcKey.toLowerCase().includes('sms') || svcKey.toLowerCase().includes('text') ? MessageSquare
                          : svcKey.toLowerCase().includes('voice') ? Phone
                          : svcKey.toLowerCase().includes('data') ? Wifi
                          : HelpCircle

                        return (
                          <div key={svc} className="flex items-center justify-end gap-2">
                            <ServiceIcon className="size-3 text-muted-foreground" />
                            <div className="flex flex-col items-end leading-tight">
                              <span className="font-semibold text-sm">{total}</span>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <>
                        <div className="flex items-center justify-end gap-2"><Phone className="size-3 text-muted-foreground"/><div className="flex flex-col items-end leading-tight"><span className="font-semibold">0</span></div></div>
                        <div className="flex items-center justify-end gap-2"><MessageSquare className="size-3 text-muted-foreground"/><div className="flex flex-col items-end leading-tight"><span className="font-semibold">0</span></div></div>
                        <div className="flex items-center justify-end gap-2"><Wifi className="size-3 text-muted-foreground"/><div className="flex flex-col items-end leading-tight"><span className="font-semibold">0</span></div></div>
                        <div className="flex items-center justify-end gap-2"><HelpCircle className="size-3 text-muted-foreground"/><div className="flex flex-col items-end leading-tight"><span className="font-semibold">0</span></div></div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
