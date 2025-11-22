"use client"

/**
 * Reports Page Component
 * 
 * API Endpoints Used:
 * 1. reports-by-service/ (GET) - Fetches all reports grouped by service
 *    - Called when "Fetch Reports" button is clicked
 *    - Filters: network, service, state, date range
 * 
 * 2. records-by-service/ (GET) - Fetches individual records for a specific service
 *    - Called when user clicks on a service row in the report table
 *    - Used to display detailed records for that service
 */

import { useState, useMemo, useCallback } from "react"
import { parseCSV, aggregateMetricsByMNO } from "@/lib/csv-parser"
import type { MNO, ServiceType } from "@/lib/types"
import ReportFilters from "./reports/report-filters"
import ReportTable from "./reports/report-table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FileText, Image, FileSpreadsheet } from "lucide-react"
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

  const [apiRecords, setApiRecords] = useState<TestRecord[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)
  
  const fetchRecords = useCallback(() => {
    setLoading(true)
    setHasFetched(true)
    let mounted = true
    
    const params: any = { page_size: 1000 }
    if (selectedMNO !== "All") params.originator_network = selectedMNO
    if (selectedService !== "All") params.service = selectedService
    if (selectedState !== "All") params.originator_location = selectedState
    if (dateRange.start) params.start_date = dateRange.start
    if (dateRange.end) params.end_date = dateRange.end
    
    testingService.getReportsByService(params)
      .then((res: any) => {
        if (!mounted) return
        
        // Handle new API structure with services grouped data
        let allRecords: any[] = []
        if (res?.services) {
          Object.values(res.services).forEach((serviceData: any) => {
            if (serviceData.examples) {
              allRecords = allRecords.concat(serviceData.examples)
            }
          })
        } else if (Array.isArray(res)) {
          // If response is directly an array
          allRecords = res
        } else {
          // Fallback for other structures
          allRecords = res?.results ?? []
        }
        
        const normalize = (t: any): TestRecord => {
          const originLoc = t.originator_location_detail?.name ?? t.originator_location ?? t.originatorLocation ?? ''
          const recipLoc = t.recipient_location_detail?.name ?? t.recipient_location ?? t.recipientLocation ?? ''
          return {
            id: t.id,
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
            url: t.url ?? '',
            urlRedirect: t.url_redirect ?? '',
          } as TestRecord
        }

          setApiRecords(allRecords.map(normalize))
      })
      .catch((e) => {
        const msg = e && (e as any).message ? (e as any).message : String(e)
        import('@/lib/utils/logger').then(({ default: logger }) => logger.error('Failed to load records from API for reports:', msg)).catch(() => {})
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [selectedMNO, selectedService, selectedState, dateRange])
  

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
  }, [sourceData, selectedMNO, selectedService, selectedState, dateRange])

  const metrics = useMemo(() => {
    return aggregateMetricsByMNO(filteredData)
  }, [filteredData])

  const exportToCSV = () => {
    if (filteredData.length === 0) return
    const headers = ["ID", "Test Case", "Service", "Originator", "Origin Location", "Origin Network", "Recipient", "Recipient Location", "Recipient Network", "Status", "Duration", "Call Setup Time", "Data Speed", "URL", "URL Redirect", "Timestamp", "Failure Cause"]
    const rows = filteredData.map((record) => [
      record.id || '',
      record.testCaseDescription,
      record.service,
      record.originatorNumber,
      record.originatorLocation,
      record.originatorNetwork,
      record.recipientNumber || '',
      record.recipientLocation || '',
      record.recipientNetwork || '',
      record.status,
      record.duration || '',
      record.callSetupTime || '',
      record.dataSpeed || '',
      record.url || '',
      record.urlRedirect || '',
      record.timestamp,
      record.failureCause || ''
    ])
    const csv = [headers, ...rows].map((row) => row.map(cell => `"${cell}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `network-report-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const exportToPDF = () => {
    if (filteredData.length === 0) return
    window.print()
  }

  const exportToImage = () => {
    if (filteredData.length === 0) return
    alert('Image export feature coming soon')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Network Reports</h1>
        <p className="text-sm text-muted-foreground">Generate and export detailed performance reports</p>
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
        onFetchReports={fetchRecords}
        loading={loading}
      />
      {hasFetched && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                  <div className="h-8 w-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                </div>
                <p className="text-muted-foreground">Loading report data...</p>
              </div>
            </div>
          ) : (
            <>
          
          <div className="flex items-center justify-end mb-4">
            {hasFetched && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" disabled={filteredData.length === 0}>
                    <Download className="w-3 h-3 mr-1" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={exportToCSV}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToPDF}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToImage}>
                    <Image className="w-4 h-4 mr-2" />
                    Export as Image
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <ReportTable 
            records={filteredData} 
            queryParams={{
              selectedMNO,
              selectedService,
              selectedState,
              dateRange
            }}
          />
            </>
          )}
        </>
      )}
    </div>
  )
}
