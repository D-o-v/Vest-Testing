"use client"

import { useEffect, useMemo, useState } from "react"
import type { TestRecord } from "@/lib/types"
import { Card } from "@/components/ui/card"

export default function RecentTests({ records }: { records?: TestRecord[] }) {
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    if (records && records.length > 0) {
      return // Use provided records
    }

    // Fallback: fetch dummy data
    fetch('/data/dashboard-metrics.json')
      .then(r => r.json())
      .then(data => {
        setDashboardData(data)
      })
      .catch(console.error)
  }, [records])

  const recentTests = useMemo(() => {
    if (records && records.length > 0) {
      return records.slice(-8).reverse()
    }
    return dashboardData?.recentTests || []
  }, [records, dashboardData])

  return (
    <Card className="bg-card border-border">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Tests</h2>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {recentTests.map((test: any, idx: number) => (
            <div key={test.id || idx} className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition">
              <div className="flex items-start justify-between mb-1">
                <span className="text-sm font-semibold text-foreground">{test.mno}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    test.result === "Success"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {test.result}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {test.state} • {test.type}
              </p>
              <p className="text-xs text-muted-foreground">
                {test.metrics.successRate}% Success
                {test.metrics.speed ? ` • ${test.metrics.speed}` : ''}
                {test.metrics.callSetupTime ? ` • ${test.metrics.callSetupTime}` : ''}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
