"use client"

import type { AggregatedMetrics } from "@/lib/types"
import { Card } from "@/components/ui/card"

interface ReportStatsProps {
  metrics: Record<string, AggregatedMetrics>
  filteredCount: number
  totalCount: number
}

export default function ReportStats({ metrics, filteredCount, totalCount }: ReportStatsProps) {
  const mnos = Object.values(metrics)
  const avgSuccessRate = mnos.length > 0 ? mnos.reduce((sum, m) => sum + m.successRate, 0) / mnos.length : 0
  const totalAttempts = mnos.reduce((sum, m) => sum + m.totalAttempts, 0)
  const totalSuccesses = mnos.reduce((sum, m) => sum + m.totalSuccesses, 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-card border-border">
        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Filtered Records</p>
          <p className="text-2xl font-bold text-foreground">{filteredCount}</p>
          <p className="text-xs text-muted-foreground mt-1">of {totalCount} total</p>
        </div>
      </Card>

      <Card className="bg-card border-border">
        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Attempts</p>
          <p className="text-2xl font-bold text-foreground">{totalAttempts}</p>
        </div>
      </Card>

      <Card className="bg-card border-border">
        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Successes</p>
          <p className="text-2xl font-bold text-green-500">{totalSuccesses}</p>
        </div>
      </Card>

      <Card className="bg-card border-border">
        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Avg Success Rate</p>
          <p className="text-2xl font-bold text-foreground">{avgSuccessRate.toFixed(1)}%</p>
        </div>
      </Card>
    </div>
  )
}
