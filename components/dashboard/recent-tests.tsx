"use client"

import { useEffect, useMemo, useState } from "react"
import type { TestRecord } from "@/lib/types"
import { MNO_COLORS } from "@/lib/constants"
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
      <div className="p-4">
        <h2 className="text-sm font-bold tracking-tight text-foreground mb-4">Recent Tests</h2>

        <div className="space-y-2 overflow-auto h-[400px] pr-1">
          {recentTests.map((test: any, idx: number) => (
            <div key={test.id || idx} className="bg-muted/20 border border-border/50 rounded-lg p-3 hover:bg-muted/40 hover:border-border transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: MNO_COLORS[test.mno] || MNO_COLORS.MTN }}
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
          ))}
        </div>
      </div>
    </Card>
  )
}
