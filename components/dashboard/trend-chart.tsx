import type { TestRecord } from "@lib/types"
import { Card } from "@components/ui/card"
import React, { useMemo, lazy, Suspense } from "react"

const Chart = lazy(() => import("react-apexcharts"))

export default function TrendChart({ records }: { records: TestRecord[] }) {
  const { chartData, options } = useMemo(() => {
    const dataByDate = new Map<string, any>()

    records.forEach((record) => {
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

    const options = {
      chart: {
        type: "area" as const,
        toolbar: { show: false },
        sparkline: { enabled: false },
        animations: { enabled: true, speed: 800, animateGradually: { enabled: true, delay: 150 } },
      },
      colors: ["#ffd700", "#ff6b00", "#e20000", "#00d4ff"],
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
        max: 100,
        labels: { style: { colors: "var(--muted-foreground)", fontSize: "12px" } },
      },
      grid: {
        borderColor: "var(--border)",
        strokeDashArray: 4,
      },
      tooltip: {
        theme: "dark",
        style: { fontSize: "12px" },
      },
      legend: {
        position: "bottom" as const,
        labels: { colors: "var(--foreground)" },
      },
    }

    return { chartData: series, options }
  }, [records])

  return (
    <Card className="bg-card border-border h-full">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Success Rate Trend</h2>
        <Suspense fallback={<div>Loading chart...</div>}>
          {/* @ts-ignore - react-apexcharts dynamic import */}
          <Chart type="area" series={chartData} options={options} height={280} />
        </Suspense>
      </div>
    </Card>
  )
}
