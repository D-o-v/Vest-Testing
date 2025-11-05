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
    MTN: "#ffd700",
    GLO: "#ff6b00",
    AIRTEL: "#e20000",
    T2: "#00d4ff",
  }

  // Positions for overlapping circles (v3 style)
  const positions: Record<string, { x: string; y: string; size: number }> = {
    MTN: { x: "35%", y: "45%", size: 120 },
    GLO: { x: "65%", y: "25%", size: 140 },
    AIRTEL: { x: "65%", y: "65%", size: 100 },
    T2: { x: "35%", y: "75%", size: 110 },
  }

  return (
    <Card className="bg-card border-border">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Failure Rates by Network</h2>

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
                  width: `${pos.size}px`,
                  height: `${pos.size}px`,
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
