import type { TestRecord } from "@lib/types"
import { Card } from "@components/ui/card"
import React, { useMemo, lazy, Suspense } from "react"
import { useNetworkAnalytics } from "@lib/hooks/use-portal"

const Chart = lazy(() => import("react-apexcharts"))

export default function TrendChart({ records, startDate, endDate }: { records: TestRecord[], startDate?: string | null, endDate?: string | null }) {
  // call hook (it safely returns early if dates aren't provided)
  const { data: networkAnalytics } = useNetworkAnalytics(startDate || '', endDate || '')

  const { chartData, options } = useMemo(() => {
    const dataByDate = new Map<string, any>()

  // Do not use dummy fallback data — prefer real records or networkAnalytics only
  const recordsToUse = records?.length > 0 ? records : []

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

    // If we have network analytics from the API, use it for the trend chart
    if (networkAnalytics?.successRate?.networks) {
      const networks = networkAnalytics.successRate.networks
      const dateLabel = startDate && endDate ? `${startDate} — ${endDate}` : 'Current Period'

      const series = networks.map((network: any) => ({
        name: network.network === 'T2' ? '9Mobile' : network.network === 'AIRTEL' ? 'Airtel' : network.network,
        data: [network.success_rate || 0]
      }))

      const flattened = series.flatMap(s => s.data)
      const maxValue = flattened.length ? Math.max(...flattened) : 0
      const yMax = Math.max(Math.ceil(maxValue * 1.1), 100)

      const options = {
        chart: { type: 'area' as const, toolbar: { show: false }, animations: { enabled: true, speed: 800 } },
        colors: ['#fbbf24', '#22c55e', '#ef4444', '#f97316'],
        stroke: { curve: 'smooth' as const, width: 2 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [20, 100] } },
        xaxis: { categories: [dateLabel], axisBorder: { show: false }, labels: { style: { colors: 'var(--muted-foreground)', fontSize: '12px' } } },
        yaxis: {
          min: 0, max: yMax, decimalsInFloat: 1,
          labels: { style: { colors: 'var(--muted-foreground)', fontSize: '12px' }, formatter: (val: number) => `${val.toFixed(1)}%` }
        },
        grid: { borderColor: 'var(--border)', strokeDashArray: 4 },
        tooltip: { theme: 'dark', y: { formatter: (val: number) => `${val.toFixed(1)}%` } },
        dataLabels: { enabled: false },
        markers: { size: 4, hover: { size: 6 } },
        legend: { position: 'bottom' as const, labels: { colors: 'var(--foreground)' } }
      }

      return { chartData: series, options }
    }





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
  }, [records, networkAnalytics, startDate, endDate])

  // No dummy fallback data: when no records and no networkAnalytics, the chart will render empty

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
