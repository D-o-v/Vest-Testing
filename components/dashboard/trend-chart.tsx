import type { TestRecord } from "@lib/types"
import { Card } from "@components/ui/card"
import React, { useMemo, lazy, Suspense } from "react"

const Chart = lazy(() => import("react-apexcharts"))

export default function TrendChart({ records }: { records: TestRecord[] }) {
  const { chartData, options } = useMemo(() => {
    const dataByDate = new Map<string, any>()

    // Use fallback data if no records
    const recordsToUse = records?.length > 0 ? records : generateFallbackData()

    recordsToUse.forEach((record) => {
      if (!record.timestamp) return

      const date = new Date(record.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      if (!dataByDate.has(date)) {
        dataByDate.set(date, {
          date,
          MTN: { total: 0, success: 0 },
          GLO: { total: 0, success: 0 },
          AIRTEL: { total: 0, success: 0 },
          T2: { total: 0, success: 0 },
        })
      }

      const data = dataByDate.get(date)
      const mno = record.originatorNetwork
      const isSuccess = record.status === "Success" || record.status?.includes("DELIVERED")

      data[mno].total++
      if (isSuccess) data[mno].success++
    })

    const sortedDates = Array.from(dataByDate.keys()).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  const series = [
      {
        name: "MTN",
        data: sortedDates.map((date) => {
          const entry = dataByDate.get(date)
          return entry.MTN.total > 0 ? (entry.MTN.success / entry.MTN.total) * 100 : 0
        }),
      },
      {
        name: "Glo",
        data: sortedDates.map((date) => {
          const entry = dataByDate.get(date)
          return entry.GLO.total > 0 ? (entry.GLO.success / entry.GLO.total) * 100 : 0
        }),
      },
      {
        name: "Airtel",
        data: sortedDates.map((date) => {
          const entry = dataByDate.get(date)
          return entry.AIRTEL.total > 0 ? (entry.AIRTEL.success / entry.AIRTEL.total) * 100 : 0
        }),
      },
      {
        name: "9Mobile",
        data: sortedDates.map((date) => {
          const entry = dataByDate.get(date)
          return entry.T2.total > 0 ? (entry.T2.success / entry.T2.total) * 100 : 0
        }),
      },
    ]

  // compute y-axis bounds from data rather than relying on hardcoded constants
  const flattened = series.flatMap((s) => s.data as number[])
  const maxValue = flattened.length ? Math.max(...flattened) : 0
  const suggestedMax = Math.ceil((maxValue || 100) * 1.05) // small padding
  const yMax = Math.max(suggestedMax, 100) // ensure percent chart caps at least 100

  const options = {
      chart: {
        type: "area" as const,
        toolbar: { show: false },
        sparkline: { enabled: false },
        animations: { enabled: true, speed: 800, animateGradually: { enabled: true, delay: 150 } },
      },
      colors: ["#fbbf24", "#22c55e", "#ef4444", "#f97316"],
      stroke: {
        curve: "smooth" as const,
        width: 2,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [20, 100, 100, 100],
        },
      },
      xaxis: {
        categories: sortedDates,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: "var(--muted-foreground)", fontSize: "12px" } },
      },
      yaxis: {
        min: 0,
        max: yMax,
        // choose ticks dynamically from data range
        tickAmount: Math.min(6, Math.max(3, Math.ceil(yMax / 20))),
        decimalsInFloat: 2,
        labels: {
          style: { colors: "var(--muted-foreground)", fontSize: "12px" },
          formatter: function (val: number) {
            // show two decimal places and a percent sign
            try { return `${Number(val).toFixed(2)}%` } catch { return String(val) }
          }
        },
      },
      grid: {
        borderColor: "var(--border)",
        strokeDashArray: 4,
      },
      tooltip: {
        theme: "dark",
        style: { fontSize: "12px" },
        shared: true,
        intersect: false,
        y: {
          formatter: function (val: number) {
            try { return `${Number(val).toFixed(2)}%` } catch { return String(val) }
          }
        }
      },
      dataLabels: { enabled: false },
      markers: { size: 3, hover: { size: 5 } },
      legend: {
        position: "bottom" as const,
        labels: { colors: "var(--foreground)" },
      },
    }

    return { chartData: series, options }
  }, [records])

  // Generate fallback data for demonstration (dates are relative to today to avoid hardcoded years)
  function generateFallbackData() {
    const days = 7
    const fallbackRecords: TestRecord[] = []
    const mnos = ['MTN', 'GLO', 'AIRTEL', 'T2'] as const
    const base = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(base.getTime() - i * 24 * 60 * 60 * 1000)
      for (const mno of mnos) {
        // push a small set per day
        for (let j = 0; j < 20; j++) {
          fallbackRecords.push({
            timestamp: d.toISOString(),
            originatorNetwork: mno,
            status: Math.random() > 0.2 ? 'Success' : 'Failed'
          } as TestRecord)
        }
      }
    }

    return fallbackRecords
  }

  return (
    <Card className="bg-card border-border h-full">
      <div className="p-6">
        <h2 className="text-lg font-bold tracking-tight text-foreground mb-6">Success Rate Trend</h2>
        <Suspense fallback={<div>Loading chart...</div>}>
          {/* @ts-ignore - react-apexcharts dynamic import */}
          <Chart type="area" series={chartData} options={options} height={280} />
        </Suspense>
      </div>
    </Card>
  )
}
