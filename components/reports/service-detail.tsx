"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useParams, useNavigate } from 'react-router-dom'
import type { TestRecord } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { ArrowLeft, Download, FileSpreadsheet, FileText, Check, AlertCircle } from "lucide-react"
import testingService from '@/lib/services/testing-service'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function ServiceDetail() {
  const { service } = useParams<{ service: string }>()
  const navigate = useNavigate()
  const [records, setRecords] = useState<TestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch records for this service
  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true)
      setError(null)
      try {
        // Decode service parameter - if it's empty string or not provided, it remains empty
        const decodedService = service ? decodeURIComponent(service) : ''
        
        // Get query parameters from URL
        const params: any = { service: decodedService, page_size: 1000 }
        
        // Add filters from query string
        const searchParams = new URLSearchParams(window.location.search)
        if (searchParams.get('mno')) params.originator_network = searchParams.get('mno')
        if (searchParams.get('service_type')) params.service_type = searchParams.get('service_type')
        if (searchParams.get('state')) params.originator_location = searchParams.get('state')
        if (searchParams.get('start_date')) params.start_date = searchParams.get('start_date')
        if (searchParams.get('end_date')) params.end_date = searchParams.get('end_date')
        
        const response = await testingService.getRecordsByService(params)

        let allRecords: any[] = []
        // Handle the new API response structure with service and records array
        if (response?.records && Array.isArray(response.records)) {
          allRecords = response.records
        } else if (response?.services) {
          Object.values(response.services).forEach((serviceData: any) => {
            if (serviceData.examples) {
              allRecords = allRecords.concat(serviceData.examples)
            }
          })
        } else if (Array.isArray(response)) {
          allRecords = response
        } else {
          allRecords = response?.results ?? []
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
            service: (t.service ?? t.type ?? '').toUpperCase() || 'DATA',
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

        setRecords(allRecords.map(normalize))
      } catch (err) {
        const msg = err && (err as any).message ? (err as any).message : String(err)
        setError(`Failed to load records: ${msg}`)
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [service])

  // Calculate stats
  const stats = useMemo(() => {
    const total = records.length
    const success = records.filter(r => (r.status || '').toLowerCase().includes('success') || (r.status || '').toLowerCase().includes('delivered')).length
    const failed = total - success
    const successRate = total ? Math.round((success / total) * 100) : 0

    return { total, success, failed, successRate }
  }, [records])

  // Export functions
  const exportToCSV = useCallback(() => {
    if (records.length === 0) return
    const headers = ["ID", "Test Case", "Service", "Originator", "Origin Location", "Origin Network", "Recipient", "Recipient Location", "Recipient Network", "Status", "Duration", "Call Setup Time", "Data Speed", "URL", "Timestamp"]
    const rows = records.map((record) => [
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
      record.timestamp,
    ])
    const csv = [headers, ...rows].map((row) => row.map(cell => `"${cell}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${service}-service-report-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }, [records, service])

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-700"
    const s = status.toLowerCase()
    if (s.includes("success") || s.includes("delivered")) return "bg-green-100 text-green-700"
    if (s.includes("failed") || s.includes("error")) return "bg-red-100 text-red-700"
    return "bg-blue-100 text-blue-700"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate('/reports')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Button>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Spinner className="h-8 w-8 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading records...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/reports')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{service ? decodeURIComponent(service) || 'Unknown' : 'Unknown'}</h1>
            <p className="text-sm text-muted-foreground mt-1">Service Performance Details</p>
          </div>
        </div>

        {/* Export dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" disabled={records.length === 0}>
              <Download className="w-3 h-3 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={exportToCSV}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.print()}>
              <FileText className="w-4 h-4 mr-2" />
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <div className="p-4 text-sm text-red-800">{error}</div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <div className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Total Tests</p>
            <p className="text-3xl font-bold text-foreground">{stats.total}</p>
          </div>
        </Card>

        <Card className="bg-card border-border">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-4 w-4 text-green-600" />
              <p className="text-xs font-medium text-muted-foreground">Passed</p>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.success}</p>
          </div>
        </Card>

        <Card className="bg-card border-border">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-xs font-medium text-muted-foreground">Failed</p>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
          </div>
        </Card>

        <Card className="bg-card border-border">
          <div className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Success Rate</p>
            <p className="text-3xl font-bold text-blue-600">{stats.successRate}%</p>
          </div>
        </Card>
      </div>

      {/* Records Table */}
      <Card className="bg-card border-border">
        <div className="p-4">
          <h3 className="text-base font-semibold text-foreground mb-4">All Records ({records.length})</h3>

          {records.length === 0 ? (
            <div className="py-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground text-sm">No records found for this service</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-3 py-3 text-xs font-semibold uppercase tracking-wide">Date/Time</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold uppercase tracking-wide">Test Case</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold uppercase tracking-wide">Originator</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold uppercase tracking-wide">Origin Location</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold uppercase tracking-wide">Recipient</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold uppercase tracking-wide">Destination</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold uppercase tracking-wide">Status</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold uppercase tracking-wide">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, idx) => (
                    <tr key={record.id || idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-3 py-3 text-xs whitespace-nowrap">
                        {new Date(record.timestamp).toLocaleDateString()} <br />
                        {new Date(record.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                      </td>
                      <td className="px-3 py-3 text-xs font-medium">{record.testCaseDescription || '-'}</td>
                      <td className="px-3 py-3 text-xs">
                        <Badge variant="outline">{record.originatorNumber}</Badge>
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">{record.originatorLocation}</td>
                      <td className="px-3 py-3 text-xs">
                        {record.recipientNumber ? <Badge variant="outline">{record.recipientNumber}</Badge> : '-'}
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">{record.recipientLocation || '-'}</td>
                      <td className="px-3 py-3 text-xs">
                        <Badge className={getStatusColor(record.status)}>
                          {record.status || 'Pending'}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">
                        {record.duration ? `${record.duration}s` : record.dataSpeed || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
