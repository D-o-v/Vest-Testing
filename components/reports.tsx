"use client"

import { useState, useMemo } from "react"
import { parseCSV, aggregateMetricsByMNO } from "@/lib/csv-parser"
import type { MNO, ServiceType } from "@/lib/types"
import ReportFilters from "./reports/report-filters"
import ReportTable from "./reports/report-table"
import ReportStats from "./reports/report-stats"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import testingService from '@/lib/services/testing-service'
import type { TestRecord } from '@/lib/types'
import { useEffect } from 'react'

export default function Reports({ csvData }: { csvData: string }) {
  const [selectedMNO, setSelectedMNO] = useState<MNO | "All">("All")
  const [selectedService, setSelectedService] = useState<ServiceType | "All">("All")
  const [selectedState, setSelectedState] = useState<string | "All">("All")
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  })

  const parsedData = useMemo(() => {
    try {
      return parseCSV(csvData)
    } catch (e) {
      const msg = e && (e as any).message ? (e as any).message : String(e)
      import('@/lib/utils/logger').then(({ default: logger }) => logger.error('Failed to parse CSV:', msg)).catch(() => {})
      return []
    }
  }, [csvData])

  // Try to fetch records from backend if available and prefer that structured data
  const [apiRecords, setApiRecords] = useState<TestRecord[] | null>(null)
  useEffect(() => {
    let mounted = true
    testingService.getRecords({ page_size: 1000 })
      .then((res: any) => {
        if (!mounted) return
        const arr = Array.isArray(res) ? res : (res?.results ?? [])
        const normalize = (t: any): TestRecord => {
          const get = (k1: string, k2?: string) => t[k1] ?? (k2 ? t[k2] : undefined)
          const originLoc = t.originator_location_detail?.name ?? t.originator_location ?? t.originatorLocation ?? ''
          const recipLoc = t.recipient_location_detail?.name ?? t.recipient_location ?? t.recipientLocation ?? ''
          return {
            testCaseDescription: t.test_case_description ?? t.testCaseDescription ?? '',
            originatorNumber: t.originator_number ?? t.originatorNumber ?? '',
            originatorLocation: originLoc,
            originatorNetwork: (t.originator_network ?? t.originatorNetwork ?? '').toUpperCase(),
            originatorServiceType: t.originator_service_type ?? t.originatorServiceType ?? '',
            recipientNumber: t.recipient_number ?? t.recipientNumber ?? '',
            recipientLocation: recipLoc,
            recipientNetwork: (t.recipient_network ?? t.recipientNetwork ?? '').toUpperCase(),
            recipientServiceType: t.recipient_service_type ?? t.recipientServiceType ?? '',
            service: (t.service ?? t.type ?? '').toUpperCase(),
            timestamp: t.time_of_call ?? t.timestamp ?? t.created_at ?? '',
            duration: t.duration ?? '',
            callSetupTime: t.call_setup_time ?? t.callSetupTime ?? '',
            status: t.status ?? t.result ?? '',
            failureCause: t.failure_cause ?? t.failureCause ?? '',
            dataSpeed: t.data_speed ?? t.dataSpeed ?? '',
          } as TestRecord
        }

        setApiRecords(arr.map(normalize))
      })
      .catch((e) => {
        const msg = e && (e as any).message ? (e as any).message : String(e)
        import('@/lib/utils/logger').then(({ default: logger }) => logger.error('Failed to load records from API for reports:', msg)).catch(() => {})
      })
    return () => { mounted = false }
  }, [])

  // prefer API records when available, otherwise fall back to CSV-parsed data
  const sourceData = apiRecords && apiRecords.length > 0 ? apiRecords : parsedData

  const filteredData = useMemo(() => {
    return sourceData.filter((record) => {
      if (selectedMNO !== "All" && record.originatorNetwork !== selectedMNO) return false
      if (selectedService !== "All" && record.service !== selectedService) return false
      if (selectedState !== "All" && record.originatorLocation !== selectedState) return false

      if (dateRange.start) {
        const recordDate = new Date(record.timestamp)
        const startDate = new Date(dateRange.start)
        if (recordDate < startDate) return false
      }

      if (dateRange.end) {
        const recordDate = new Date(record.timestamp)
        const endDate = new Date(dateRange.end)
        endDate.setHours(23, 59, 59, 999)
        if (recordDate > endDate) return false
      }

      return true
    })
  }, [parsedData, selectedMNO, selectedService, selectedState, dateRange])

  const metrics = useMemo(() => {
    return aggregateMetricsByMNO(filteredData)
  }, [filteredData])

  const exportToCSV = () => {
    if (filteredData.length === 0) {
      alert("No data to export")
      return
    }

    const headers = [
      "Test Case",
      "Originator",
      "Originator Location",
      "Originator Network",
      "Service Type",
      "Recipient",
      "Recipient Location",
      "Recipient Network",
      "Status",
      "Timestamp",
      "Duration",
      "Call Setup Time",
      "Failure Cause",
      "Data Speed",
    ]

    const rows = filteredData.map((record) => [
      record.testCaseDescription,
      record.originatorNumber,
      record.originatorLocation,
      record.originatorNetwork,
      record.service,
      record.recipientNumber,
      record.recipientLocation,
      record.recipientNetwork,
      record.status,
      record.timestamp,
      record.duration,
      record.callSetupTime,
      record.failureCause,
      record.dataSpeed,
    ])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `network-report-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Network Reports</h1>
          <p className="text-muted-foreground">Generate and export detailed performance reports</p>
        </div>
        <Button onClick={exportToCSV} className="gap-2" disabled={filteredData.length === 0}>
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <ReportFilters
        selectedMNO={selectedMNO}
        onMNOChange={setSelectedMNO}
        selectedService={selectedService}
        onServiceChange={setSelectedService}
        selectedState={selectedState}
        onStateChange={setSelectedState}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <ReportStats metrics={metrics} filteredCount={filteredData.length} totalCount={parsedData.length} />

      <ReportTable records={filteredData} />
    </div>
  )
}
