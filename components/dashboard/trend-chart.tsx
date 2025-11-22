import type { TestRecord } from "@lib/types"
import { Card } from "@components/ui/card"
import React, { useMemo, lazy, Suspense, useEffect, useState } from "react"
import testingService from '@/lib/services/testing-service'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'

const Chart = lazy(() => import("react-apexcharts"))

export default function TrendChart({ records, startDate, endDate }: { records: TestRecord[], startDate?: string | null, endDate?: string | null }) {
  const [dailySuccessData, setDailySuccessData] = useState<any>(null)
  const [selectedService, setSelectedService] = useState<'Overall'|'SMS'|'Voice'|'Data'>('Overall')

  useEffect(() => {
    let mounted = true
    const params: Record<string, any> = {}
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate

    // Fetch the daily success rate with the filters
    testingService.getDailySuccessRate(Object.keys(params).length ? params : undefined)
      .then(data => {
        if (!mounted) return
        setDailySuccessData(data)
      })
      .catch(err => {
        const msg = err instanceof Error ? err.message : String(err)
        import('@/lib/utils/logger').then(({ default: logger }) => logger.error('Failed to fetch daily success rate:', msg)).catch(() => {})
      })

    return () => { mounted = false }
  }, [startDate, endDate])

  const { chartData, options } = useMemo(() => {
    const dataByDate = new Map<string, any>()

  // Do not use dummy fallback data — prefer real records or networkAnalytics only
  const recordsToUse = records?.length > 0 ? records : []

    recordsToUse.forEach((record) => {
      if (!record.timestamp) return
      // apply service filter when not 'Overall'
      if (selectedService !== 'Overall' && String(record.service ?? '').toLowerCase() !== selectedService.toLowerCase()) return

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

      // guard: if mno missing, skip
      if (!mno) return
      const key = String(mno).toUpperCase()
      if (!data[key]) return

      data[key].total++
      if (isSuccess) data[key].success++
    })

    // Use daily success rate data from API only for Overall view
    if (dailySuccessData?.daily && selectedService === 'Overall') {
      const dailyData = dailySuccessData.daily
      
      // Extract all unique dates and sort them
      const dates = dailyData.map((day: any) => day.date).sort()
      const categories = dates.map((date: string) => {
        try {
          return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        } catch {
          return date
        }
      })
      
      // Always show all 4 networks, even if missing from data
      const allNetworks = ['MTN', 'GLO', 'Airtel', 'T2']
      
      // Create series for each network
      const series = allNetworks.map(networkName => {
        
        const data = dates.map((date: string) => {
          const dayData = dailyData.find((day: any) => day.date === date)
          const networkData = dayData?.networks?.find((net: any) => net.network === networkName)
          return networkData?.success_rate ?? 0
        })
        
        return {
          name: networkName,
          data
        }
      })
      
      const flattened = series.flatMap(s => s.data)
      const maxValue = flattened.length ? Math.max(...flattened) : 0
      const yMax = Math.max(Math.ceil(maxValue * 1.1), 100)
      
      const options = {
        chart: { type: 'area' as const, toolbar: { show: false }, animations: { enabled: true, speed: 800 } },
        colors: ['#fbbf24', '#22c55e', '#ef4444', '#f97316'],
        stroke: { curve: 'smooth' as const, width: 2 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [20, 100] } },
        xaxis: { categories, axisBorder: { show: false }, labels: { style: { colors: 'var(--muted-foreground)', fontSize: '12px' } } },
        yaxis: {
          min: 0, max: yMax, decimalsInFloat: 1,
          labels: { style: { colors: 'var(--muted-foreground)', fontSize: '12px' }, formatter: (val: number) => `${val.toFixed(1)}%` }
        },
        grid: { borderColor: 'var(--border)', strokeDashArray: 4 },
        tooltip: { theme: 'dark', shared: true, intersect: false, y: { formatter: (val: number) => `${val.toFixed(1)}%` } },
        dataLabels: { enabled: false },
        markers: { size: 3, hover: { size: 5 } },
        legend: { position: 'bottom' as const, labels: { colors: 'var(--foreground)' } }
      }
      
      return { chartData: series, options }
    }

    // Handle service-specific filtering from API data
    if (dailySuccessData?.daily && selectedService !== 'Overall') {
      const dailyData = dailySuccessData.daily
      
      // Extract all unique dates and sort them
      const dates = dailyData.map((day: any) => day.date).sort()
      const categories = dates.map((date: string) => {
        try {
          return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        } catch {
          return date
        }
      })
      
      const allNetworks = ['MTN', 'GLO', 'Airtel', 'T2']
      
      // Create series for each network, filtering by service breakdown
      const series = allNetworks.map(networkName => {
        const data = dates.map((date: string) => {
          const dayData = dailyData.find((day: any) => day.date === date)
          const networkData = dayData?.networks?.find((net: any) => net.network === networkName)
          
          if (!networkData) return 0
          
          // Get service breakdown for the selected service
          const serviceBreakdown = networkData.service_breakdown
          const serviceData = serviceBreakdown?.[selectedService] || serviceBreakdown?.[selectedService.toUpperCase()]
          
          return serviceData?.success_rate ?? 0
        })
        
        return {
          name: networkName,
          data
        }
      })
      
      const flattened = series.flatMap(s => s.data)
      const maxValue = flattened.length ? Math.max(...flattened) : 0
      const yMax = Math.max(Math.ceil(maxValue * 1.1), 100)
      
      const options = {
        chart: { type: 'area' as const, toolbar: { show: false }, animations: { enabled: true, speed: 800 } },
        colors: ['#fbbf24', '#22c55e', '#ef4444', '#f97316'],
        stroke: { curve: 'smooth' as const, width: 2 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [20, 100] } },
        xaxis: { categories, axisBorder: { show: false }, labels: { style: { colors: 'var(--muted-foreground)', fontSize: '12px' } } },
        yaxis: {
          min: 0, max: yMax, decimalsInFloat: 1,
          labels: { style: { colors: 'var(--muted-foreground)', fontSize: '12px' }, formatter: (val: number) => `${val.toFixed(1)}%` }
        },
        grid: { borderColor: 'var(--border)', strokeDashArray: 4 },
        tooltip: { theme: 'dark', shared: true, intersect: false, y: { formatter: (val: number) => `${val.toFixed(1)}%` } },
        dataLabels: { enabled: false },
        markers: { size: 3, hover: { size: 5 } },
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
        name: "T2",
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
  }, [records, dailySuccessData, startDate, endDate, selectedService])

  // No dummy fallback data: when no records and no networkAnalytics, the chart will render empty

  return (
    <Card className="bg-card border-border h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Success Rate Trend</h2>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                {/* simple inline funnel svg */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
                  <path d="M3 5h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 19h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{selectedService}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {['Overall','SMS','Voice','Data'].map((s) => (
                  <DropdownMenuItem key={s} onSelect={() => setSelectedService(s as any)}>
                    {s}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Suspense fallback={<div>Loading chart...</div>}>
          {/* @ts-ignore - react-apexcharts dynamic import */}
          <Chart type="area" series={chartData} options={options} height={280} />
        </Suspense>
      </div>
    </Card>
  )
}
