"use client"

import { useMemo, useState, useEffect } from "react"
import { parseCSV, aggregateMetricsByMNO } from "@/lib/csv-parser"
import KPICards from "./dashboard/kpi-cards"
import TrendChart from "./dashboard/trend-chart"
import FailureRates from "./dashboard/failure-rates"
import RecentTests from "./dashboard/recent-tests"
import NigeriaMap from "./dashboard/nigeria-map-hc"
import DashboardFilters from './dashboard/filters'
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Dashboard({ csvData }: { csvData: string }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time for skeleton display
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [csvData])

  const parsedData = useMemo(() => {
    try {
      const records = parseCSV(csvData)
      return records
    } catch (e) {
      const msg = e && (e as any).message ? (e as any).message : String(e)
      import('@/lib/utils/logger').then(({ default: logger }) => logger.error('Failed to parse CSV:', msg)).catch(() => {})
      return []
    }
  }, [csvData])

  const metrics = useMemo(() => {
    return aggregateMetricsByMNO(parsedData)
  }, [parsedData])

  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-4 dashboard-grid">
        {/* Header skeleton */}
        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>

        {/* First Row: KPI Cards + Trend Chart Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 space-y-3">
            {[1, 2].map(i => (
              <Card key={i} className="bg-card border-border">
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-2 w-full" />
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="lg:col-span-3">
            <Card className="bg-card border-border h-full">
              <div className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-64 w-full" />
              </div>
            </Card>
          </div>
        </div>

        {/* Second Row: Failure Rates + Recent Tests + Nigeria Map Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <Card className="bg-card border-border">
            <div className="p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
          </Card>
          <Card className="bg-card border-border">
            <div className="p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </Card>
          <Card className="bg-card border-border">
            <div className="p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-64 w-full" />
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 dashboard-grid">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground leading-none">Network Performance</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time VeSS Testing metrics across Nigeria</p>
        </div>
        <div>
          <DashboardFilters onChange={(s, e) => { setStartDate(s); setEndDate(e) }} />
        </div>
      </div>

      {/* First Row: KPI Cards + Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-2">
          <KPICards startDate={startDate} endDate={endDate} />
        </div>
        <div className="lg:col-span-3">
          <TrendChart records={parsedData} startDate={startDate} endDate={endDate} />
        </div>
      </div>

      {/* Second Row: Failure Rates + Recent Tests + Nigeria Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <FailureRates records={parsedData} metrics={metrics} startDate={startDate} endDate={endDate} />
        <RecentTests records={parsedData} startDate={startDate} endDate={endDate} />
        <NigeriaMap records={parsedData} startDate={startDate} endDate={endDate} />
      </div>
    </div>
  )
}
