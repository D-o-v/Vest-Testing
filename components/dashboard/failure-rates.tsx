"use client"

import type { TestRecord, AggregatedMetrics } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { useMemo } from "react"

export default function FailureRates({
  records,
  metrics,
}: { records: TestRecord[]; metrics: Record<string, AggregatedMetrics> }) {
  const failureData = useMemo(() => {
    const mmos = ["MTN", "GLO", "AIRTEL", "T2"] as const
    
    // Use sample data if no records
    if (!records || records.length === 0) {
      return [
        { mno: "MTN", failureRate: 12, totalTests: 1250 },
        { mno: "GLO", failureRate: 18, totalTests: 1000 },
        { mno: "AIRTEL", failureRate: 21, totalTests: 875 },
        { mno: "T2", failureRate: 15, totalTests: 750 }
      ]
    }
    
    return mmos.map((mno) => {
      const mnoRecords = records.filter((r) => r.originatorNetwork === mno)
      const failures = mnoRecords.filter((r) => r.status === "Failed").length
      const rate = mnoRecords.length > 0 ? (failures / mnoRecords.length) * 100 : 0
      return {
        mno,
        failureRate: Math.round(rate),
        totalTests: mnoRecords.length,
      }
    })
  }, [records])

  const colorMap: Record<string, string> = {
    MTN: "#fbbf24", // MTN Yellow
    GLO: "#22c55e", // Glo Green
    AIRTEL: "#ef4444", // Airtel Red
    T2: "#f97316", // 9mobile/T2 Orange
  }

  // Calculate circle sizes based on failure rates
  const maxFailureRate = Math.max(...failureData.map(d => d.failureRate))
  const minSize = 80
  const maxSize = 160
  
  const positions: Record<string, { x: string; y: string }> = {
    MTN: { x: "35%", y: "45%" },
    GLO: { x: "65%", y: "25%" },
    AIRTEL: { x: "65%", y: "65%" },
    T2: { x: "35%", y: "75%" },
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
                className="absolute flex flex-col items-center justify-center rounded-full shadow-lg transition-all hover:shadow-xl hover:scale-105 hover:z-50"
                style={{
                  left: pos.x,
                  top: pos.y,
                  width: `${getCircleSize(data.failureRate)}px`,
                  height: `${getCircleSize(data.failureRate)}px`,
                  backgroundColor: colorMap[data.mno],
                  border: "3px solid rgba(255, 255, 255, 0.3)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{data.failureRate}%</div>
                  <div className="text-xs text-white/80 font-medium">{data.mno}</div>
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
