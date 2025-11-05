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
        <h2 className="text-lg font-bold tracking-tight text-foreground mb-6">Recent Tests</h2>

        <div className="overflow-auto max-h-[480px] pr-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-border">
                <th className="text-left py-2 font-semibold">MNO</th>
                <th className="text-left py-2 font-semibold">State</th>
                <th className="text-left py-2 font-semibold">Type</th>
                <th className="text-left py-2 font-semibold">Result</th>
                <th className="text-left py-2 font-semibold">Metrics</th>
                <th className="text-left py-2 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentTests.map((test: any, idx: number) => (
                <tr key={test.id || idx} className="odd:bg-card even:bg-transparent hover:bg-muted/50 transition">
                  <td className="py-3">{test.mno}</td>
                  <td className="py-3">{test.state}</td>
                  <td className="py-3">{test.type}</td>
                  <td className={`py-3 ${test.result === 'Success' ? 'text-green-600' : 'text-red-600'} font-medium`}>{test.result}</td>
                  <td className="py-3 text-xs text-muted-foreground">
                    {test.metrics?.successRate}%{test.metrics?.speed ? ` • ${test.metrics.speed}` : ''}{test.metrics?.callSetupTime ? ` • ${test.metrics.callSetupTime}`: ''}
                  </td>
                  <td className="py-3 text-xs text-muted-foreground">{test.timestamp ? new Date(test.timestamp).toLocaleString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  )
}
