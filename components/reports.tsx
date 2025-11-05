"use client"

import { useState, useMemo } from "react"
import { parseCSV, aggregateMetricsByMNO } from "@/lib/csv-parser"
import type { MNO, ServiceType } from "@/lib/types"
import ReportFilters from "./reports/report-filters"
import ReportTable from "./reports/report-table"
import ReportStats from "./reports/report-stats"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

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
      console.error("Failed to parse CSV:", e)
      return []
    }
  }, [csvData])

  const filteredData = useMemo(() => {
    return parsedData.filter((record) => {
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
