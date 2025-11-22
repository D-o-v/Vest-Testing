"use client"

import { useState, useCallback, useEffect } from "react"
import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, FileSpreadsheet, FileText, Image } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import testingService from '@/lib/services/testing-service'
import RecordDetailModal from "./record-detail-modal"
import type { TestRecord } from "@/lib/types"

export default function ServiceDetailPage() {
  const { service } = useParams<{ service: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [records, setRecords] = useState<TestRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<TestRecord | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const decodedService = service ? decodeURIComponent(service) : ''

  const fetchServiceRecords = useCallback(() => {
    setLoading(true)
    let mounted = true
    
    const params: any = { page_size: 1000 }
    if (searchParams.get('network')) params.originator_network = searchParams.get('network')
    if (searchParams.get('state')) params.originator_location = searchParams.get('state')
    if (searchParams.get('start_date')) params.start_date = searchParams.get('start_date')
    if (searchParams.get('end_date')) params.end_date = searchParams.get('end_date')
    
    testingService.getRecords(params)
      .then((res: any) => {
        if (!mounted) return
        
        if (res?.services && res.services[decodedService]) {
          const serviceData = res.services[decodedService]
          const normalizedRecords = serviceData.examples.map((record: any): TestRecord => ({
            id: record.id,
            testCaseDescription: record.test_case_description || '',
            originatorNumber: record.originator_number || '',
            originatorLocation: record.originator_location_detail?.name || '',
            originatorNetwork: (record.originator_network || '').toUpperCase(),
            originatorServiceType: '',
            recipientNumber: record.recipient_number || '',
            recipientLocation: record.recipient_location_detail?.name || '',
            recipientNetwork: (record.recipient_network || '').toUpperCase(),
            recipientServiceType: '',
            service: (record.service || decodedService).toUpperCase(),
            timestamp: record.time_of_call || record.created_at || '',
            duration: record.duration?.toString() || '',
            callSetupTime: record.call_setup_time?.toString() || '',
            status: record.status || '',
            failureCause: '',
            dataSpeed: record.data_speed || '',
            url: record.url || '',
            urlRedirect: record.url_redirect || '',
          }))
          setRecords(normalizedRecords)
        }
      })
      .catch((e) => {
        console.error('Failed to load service records:', e)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [decodedService, searchParams])
  
  useEffect(() => {
    fetchServiceRecords()
  }, [fetchServiceRecords])

  const exportToCSV = () => {
    if (records.length === 0) return
    const headers = ["ID", "Test Case", "Service", "Originator", "Origin Location", "Origin Network", "Recipient", "Recipient Location", "Recipient Network", "Status", "Duration", "Call Setup Time", "Data Speed", "URL", "URL Redirect", "Timestamp"]
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
      record.urlRedirect || '',
      record.timestamp
    ])
    const csv = [headers, ...rows].map((row) => row.map(cell => `"${cell}"`).join(",")).join("\\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${decodedService}-records-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedRecords = records.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase()
    if (lowerStatus.includes('success') || lowerStatus.includes('delivered')) {
      return "bg-green-100 text-green-700 border-green-200"
    }
    if (lowerStatus.includes('failed') || lowerStatus.includes('error')) {
      return "bg-red-100 text-red-700 border-red-200"
    }
    if (lowerStatus.includes('submitted')) {
      return "bg-blue-100 text-blue-700 border-blue-200"
    }
    return "bg-gray-100 text-gray-700 border-gray-200"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-blue-600">{decodedService || 'Data/URL Tests'} Records</h1>
            <p className="text-sm text-muted-foreground">Detailed view of all {decodedService} test records</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" disabled={records.length === 0}>
              <Download className="w-3 h-3 mr-1" />
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
            <DropdownMenuItem onClick={() => alert('Image export feature coming soon')}>
              <Image className="w-4 h-4 mr-2" />
              Export as Image
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {loading && <div className="text-center py-8 text-muted-foreground">Loading records...</div>}

      {!loading && (
        <Card className="bg-white border">
          <div className="p-4">
            <h3 className="text-base font-semibold text-foreground mb-3">Test Records ({records.length})</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-2 py-2 text-xs font-medium uppercase tracking-wide">Date/Time</th>
                    <th className="text-left px-2 py-2 text-xs font-medium uppercase tracking-wide">Test Case</th>
                    <th className="text-left px-2 py-2 text-xs font-medium uppercase tracking-wide">MNO</th>
                    <th className="text-left px-2 py-2 text-xs font-medium uppercase tracking-wide">Origin</th>
                    <th className="text-left px-2 py-2 text-xs font-medium uppercase tracking-wide">Destination</th>
                    <th className="text-left px-2 py-2 text-xs font-medium uppercase tracking-wide">Status</th>
                    <th className="text-left px-2 py-2 text-xs font-medium uppercase tracking-wide">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-2 py-6 text-center text-muted-foreground text-sm">
                        No records found
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((record, idx) => (
                      <tr 
                        key={record.id || idx} 
                        className="border-b border-border hover:bg-blue-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedRecord(record)}
                      >
                        <td className="px-2 py-2 text-xs">{new Date(record.timestamp).toLocaleDateString()} {new Date(record.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</td>
                        <td className="px-2 py-2 text-xs font-medium">{record.testCaseDescription}</td>
                        <td className="px-2 py-2 text-xs font-medium">{record.originatorNetwork}</td>
                        <td className="px-2 py-2 text-xs text-muted-foreground">{record.originatorLocation}</td>
                        <td className="px-2 py-2 text-xs text-muted-foreground">{record.recipientLocation || 'N/A'}</td>
                        <td className="px-2 py-2">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${getStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-xs">{record.duration || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-3 border-t bg-muted/20">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, records.length)} of {records.length}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="h-7 px-2 text-xs"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="h-7 px-2 text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      <RecordDetailModal 
        record={selectedRecord} 
        open={!!selectedRecord} 
        onOpenChange={() => setSelectedRecord(null)} 
      />
    </div>
  )
}