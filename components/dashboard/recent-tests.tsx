"use client"

import { useEffect, useMemo, useState } from "react"
import type { TestRecord } from "@/lib/types"
import { MNO_COLORS } from "@/lib/constants"
import { Card } from "@/components/ui/card"
import testingService from '@/lib/services/testing-service'

export default function RecentTests({ records }: { records?: TestRecord[] }) {
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    if (records && records.length > 0) {
      return // Use provided records
    }

    // Try backend first (Postman: GET /testing/recent-tests/)
    let mounted = true
    testingService.getRecentTests()
      .then(data => {
        if (!mounted) return
        // normalize API shape to the UI-friendly shape used below
        const normalize = (t: any) => {
          const mnoRaw = t.originator_network || t.mno || t.originatorNetwork || ''
          const mno = String(mnoRaw).toUpperCase()
          const state = t.originator_location_detail?.state_display || t.originator_location_detail?.state || t.state || t.originator_location || ''
          const status = t.status || t.result || ''
          const service = t.service || t.type || t.test_type || ''
          const timestamp = t.time_of_call || t.timestamp || t.created_at || null
          const durationRaw = t.duration ?? t.duration_seconds ?? null
          const callSetupRaw = t.call_setup_time ?? t.callSetupTime ?? null

          const fmtDuration = (d: any) => {
            if (d == null || d === '') return null
            const n = Number(d)
            if (Number.isNaN(n)) return String(d)
            if (n >= 60) return `${Math.floor(n / 60)}m ${n % 60}s`
            return `${n}s`
          }

          return {
            id: t.id,
            mno,
            state,
            status,
            service,
            timestamp,
            duration: fmtDuration(durationRaw),
            callSetupTime: callSetupRaw != null ? String(callSetupRaw) : null,
            // keep original for debugging if needed
            __raw: t,
          }
        }

        setDashboardData({ recentTests: Array.isArray(data) ? data.map(normalize) : [] })
      })
      .catch((err) => {
        console.error('Failed to load recent tests from API', err)
        // Leave dashboardData null so component shows empty state rather than local data
      })
    return () => { mounted = false }
  }, [records])

  const recentTests = useMemo(() => {
    // if parent passed records, try to normalize them too (they may be API-shaped)
    const normalizeIfNeeded = (t: any) => {
      if (!t) return t
      // already normalized if it has mno and timestamp
      if (t.mno && (t.timestamp || t.time_of_call)) return t
      const mnoRaw = t.originator_network || t.mno || t.originatorNetwork || ''
      const mno = String(mnoRaw).toUpperCase()
      const state = t.originator_location_detail?.state_display || t.originator_location_detail?.state || t.state || t.originator_location || ''
      const status = t.status || t.result || ''
      const service = t.service || t.type || t.test_type || ''
      const timestamp = t.time_of_call || t.timestamp || t.created_at || null
      const durationRaw = t.duration ?? t.duration_seconds ?? null
      const callSetupRaw = t.call_setup_time ?? t.callSetupTime ?? null
      const fmtDuration = (d: any) => {
        if (d == null || d === '') return null
        const n = Number(d)
        if (Number.isNaN(n)) return String(d)
        if (n >= 60) return `${Math.floor(n / 60)}m ${n % 60}s`
        return `${n}s`
      }
      return {
        id: t.id,
        mno,
        state,
        status,
        service,
        timestamp,
        duration: fmtDuration(durationRaw),
        callSetupTime: callSetupRaw != null ? String(callSetupRaw) : null,
        __raw: t,
      }
    }

    if (records && records.length > 0) {
      return records.map(normalizeIfNeeded).slice(-8).reverse()
    }

    return dashboardData?.recentTests || []
  }, [records, dashboardData])

  const recentTestsItems = recentTests.map((test: any, idx: number) => {
    const mnoKey = String(test.mno || '').toUpperCase()
    const color = (MNO_COLORS as any)[mnoKey] || MNO_COLORS.MTN
    return (
      <div key={test.id || idx} className="bg-muted/20 border border-border/50 rounded-lg p-3 hover:bg-muted/40 hover:border-border transition-all">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm font-bold text-foreground">{test.mno}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{test.state}</span>
          </div>
          <span className={`text-xs font-bold ${
            test.result === 'Success' || test.status === 'Success'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {test.result || test.status}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-muted-foreground">
            <span>{test.type || test.service}</span>
            {test.duration && <span>• {test.duration}</span>}
            {test.callSetupTime && <span>• {test.callSetupTime}</span>}
          </div>
          <span className="text-muted-foreground">
            {test.timestamp ? new Date(test.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
          </span>
        </div>
      </div>
    )
  })

  return (
    <Card className="bg-card border-border">
      <div className="p-4">
        <h2 className="text-sm font-bold tracking-tight text-foreground mb-4">Recent Tests</h2>

        <div className="space-y-2 overflow-auto h-[400px] pr-1">
          {recentTestsItems}
        </div>
      </div>
    </Card>
  )
}
