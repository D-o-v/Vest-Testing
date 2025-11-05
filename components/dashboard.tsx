"use client"

import { useMemo } from "react"
import { parseCSV, aggregateMetricsByMNO } from "@/lib/csv-parser"
import KPICards from "./dashboard/kpi-cards"
import TrendChart from "./dashboard/trend-chart"
import FailureRates from "./dashboard/failure-rates"
import RecentTests from "./dashboard/recent-tests"
import NigeriaMap from "./dashboard/nigeria-map"

export default function Dashboard({ csvData }: { csvData: string }) {
  const parsedData = useMemo(() => {
    try {
      const records = parseCSV(csvData)
      return records
    } catch (e) {
      console.error("Failed to parse CSV:", e)
      return []
    }
  }, [csvData])

  const metrics = useMemo(() => {
    return aggregateMetricsByMNO(parsedData)
  }, [parsedData])

  return (
    <div className="space-y-4 dashboard-grid">
      <div>
        <h1 className="text-2xl font-bold text-foreground leading-none">Network Performance</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time VeSS Testing metrics across Nigeria</p>
      </div>

      {/* First Row: KPI Cards + Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-2">
          <KPICards metrics={metrics} />
        </div>
        <div className="lg:col-span-3">
          <TrendChart records={parsedData} />
        </div>
      </div>

      {/* Second Row: Failure Rates + Recent Tests + Nigeria Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <FailureRates records={parsedData} metrics={metrics} />
        <RecentTests records={parsedData} />
        <NigeriaMap records={parsedData} />
      </div>
    </div>
  )
}
