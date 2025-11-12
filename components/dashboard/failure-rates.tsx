"use client"

import type { TestRecord, AggregatedMetrics } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { useMemo, useEffect, useState } from "react"
import { portalService } from '@/lib/services/portal-service'

export default function FailureRates({
  records,
  metrics,
  startDate,
  endDate,
}: { records: TestRecord[]; metrics: Record<string, AggregatedMetrics>; startDate?: string | null; endDate?: string | null }) {
  const [failureData, setFailureData] = useState<{ mno: string; failureRate: number; totalTests: number }[]>([])

  useEffect(() => {
    let mounted = true

    // Prefer API when date range is provided
    const fetchFailure = async () => {
      if (startDate && endDate) {
        try {
          const res = await portalService.getNetworkFailureRate(startDate, endDate)
          if (!mounted) return
          // expected shape: { date_range: {...}, networks: [{ network, total_records, failure_records, failure_rate }, ...] }
          if (res && Array.isArray(res.networks)) {
            const mapped = (res.networks as any[]).map(n => ({
              mno: String(n.network ?? n.mno ?? '').toUpperCase(),
              failureRate: Number(n.failure_rate ?? n.failureRate ?? ((n.failure_records && n.total_records) ? (n.failure_records / n.total_records) * 100 : 0)) || 0,
              totalTests: Number(n.total_records ?? n.totalTests ?? 0) || 0,
            }))
            setFailureData(mapped)
            return
          }
        } catch (e) {
          const msg = e && (e as any).message ? (e as any).message : String(e)
          import('@/lib/utils/logger').then(({ default: logger }) => logger.error('Failed to fetch failure rates from API:', msg)).catch(() => {})
        }
      }

      // If API not available or no date range, derive from records if present
      if (records && records.length > 0) {
        const mmos = ["MTN", "GLO", "AIRTEL", "T2"] as const
        const derived = mmos.map((mno) => {
          const mnoRecords = records.filter((r) => r.originatorNetwork === mno)
          const failures = mnoRecords.filter((r) => r.status === "Failed").length
          const rate = mnoRecords.length > 0 ? (failures / mnoRecords.length) * 100 : 0
          return {
            mno,
            failureRate: Math.round(rate),
            totalTests: mnoRecords.length,
          }
        })
        setFailureData(derived)
        return
      }

      // No data available — clear
      setFailureData([])
    }

    fetchFailure()
    return () => { mounted = false }
  }, [records, startDate, endDate])

  const colorMap: Record<string, string> = {
    MTN: "#fbbf24", // MTN Yellow
    GLO: "#22c55e", // Glo Green
    AIRTEL: "#ef4444", // Airtel Red
    T2: "#f97316", // T2/T2 Orange
  }

  // Calculate circle sizes based on failure rates
  if (!failureData || failureData.length === 0) {
    return (
      <Card className="bg-card border-border">
        <div className="p-6">
          <h2 className="text-lg font-bold tracking-tight text-foreground mb-6">Failure Rates by Network</h2>
          <div className="text-sm text-muted-foreground">No failure data available for the selected date range.</div>
        </div>
      </Card>
    )
  }

  const maxFailureRate = Math.max(...failureData.map(d => d.failureRate))
  const minSize = 80
  const maxSize = 160
  
  const positions: Record<string, { x: string; y: string }> = {
    MTN: { x: "32%", y: "42%" },
    GLO: { x: "68%", y: "28%" },
    AIRTEL: { x: "68%", y: "68%" },
    T2: { x: "32%", y: "72%" },
  }
  
  const getCircleSize = (failureRate: number) => {
    return minSize + ((failureRate / maxFailureRate) * (maxSize - minSize))
  }

  return (
    <Card className="bg-card border-border">
      <div className="p-6">
        <h2 className="text-lg font-bold tracking-tight text-foreground mb-6">Failure Rates by Network</h2>

        {/* Overlapping bubbles visualization - v3 style */}
        <div className="relative w-full" style={{ height: "300px" }}>
          {failureData.map((data) => {
            const pos = positions[data.mno]
            return (
              <div
                key={data.mno}
                className="absolute transition-all hover:scale-105 hover:z-50"
                style={{
                  left: pos.x,
                  top: pos.y,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Progress ring */}
                <svg
                  width={getCircleSize(data.failureRate) + 16}
                  height={getCircleSize(data.failureRate) + 16}
                  className="absolute"
                  style={{ transform: 'rotate(-90deg)' }}
                >
                  <circle
                    cx={(getCircleSize(data.failureRate) + 16) / 2}
                    cy={(getCircleSize(data.failureRate) + 16) / 2}
                    r={(getCircleSize(data.failureRate) + 16) / 2 - 4}
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="4"
                  />
                  <circle
                    cx={(getCircleSize(data.failureRate) + 16) / 2}
                    cy={(getCircleSize(data.failureRate) + 16) / 2}
                    r={(getCircleSize(data.failureRate) + 16) / 2 - 4}
                    fill="none"
                    stroke={colorMap[data.mno]}
                    strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * ((getCircleSize(data.failureRate) + 16) / 2 - 4)}`}
                    strokeDashoffset={`${2 * Math.PI * ((getCircleSize(data.failureRate) + 16) / 2 - 4) * (1 - data.failureRate / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                
                {/* Inner circle */}
                <div
                  className="rounded-full flex flex-col items-center justify-center shadow-lg"
                  style={{
                    width: `${getCircleSize(data.failureRate)}px`,
                    height: `${getCircleSize(data.failureRate)}px`,
                    backgroundColor: colorMap[data.mno],
                    margin: '8px',
                  }}
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{data.failureRate}%</div>
                    <div className="text-xs text-white/80 font-medium">{data.mno}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="border-t border-border pt-4 mt-6">
          <div className="grid grid-cols-2 gap-3">
            {failureData.map((data) => (
              <div key={data.mno} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colorMap[data.mno] }} />
                <span className="text-sm text-muted-foreground">
                  {data.mno}: {data.totalTests} tests
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
