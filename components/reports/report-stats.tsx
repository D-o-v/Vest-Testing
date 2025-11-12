"use client"

import type { AggregatedMetrics } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <div className="p-3">
          <p className="text-xs text-blue-600 mb-1 font-medium">Records</p>
          <p className="text-xl font-bold text-blue-900">{filteredCount}</p>
          <p className="text-xs text-blue-600 opacity-75">of {totalCount}</p>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <div className="p-3">
          <p className="text-xs text-purple-600 mb-1 font-medium">Attempts</p>
          <p className="text-xl font-bold text-purple-900">{totalAttempts}</p>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <div className="p-3">
          <p className="text-xs text-green-600 mb-1 font-medium">Successes</p>
          <p className="text-xl font-bold text-green-900">{totalSuccesses}</p>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <div className="p-3">
          <p className="text-xs text-orange-600 mb-1 font-medium">Success Rate</p>
          <p className="text-xl font-bold text-orange-900">{avgSuccessRate.toFixed(1)}%</p>
        </div>
      </Card>
    </div>
  )
}
