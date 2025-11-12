"use client"

import { useState, useCallback, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FileText, Image, FileSpreadsheet, ChevronRight } from "lucide-react"
import testingService from '@/lib/services/testing-service'
import type { MNO } from '@/lib/types'
import { useNavigate } from 'react-router-dom'

interface ServiceGroup {
  service: string
  count: number
  success_count: number
  success_rate: number
  examples: any[]
}

interface GroupedReportsProps {
  selectedMNO: MNO | "All"
  selectedState: string | "All"
  dateRange: { start: string; end: string }
}

export default function GroupedReports({ selectedMNO, selectedState, dateRange }: GroupedReportsProps) {
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [totalRecords, setTotalRecords] = useState(0)
  const navigate = useNavigate()

  const fetchGroupedData = useCallback(() => {
    setLoading(true)
    let mounted = true
    
    const params: any = { page_size: 1000 }
    if (selectedMNO !== "All") params.originator_network = selectedMNO
    if (selectedState !== "All") params.originator_location = selectedState
    if (dateRange.start) params.start_date = dateRange.start
    if (dateRange.end) params.end_date = dateRange.end
    
    testingService.getRecords(params)
      .then((res: any) => {
        if (!mounted) return
        
        if (res?.services) {
          const groups: ServiceGroup[] = Object.entries(res.services).map(([service, data]: [string, any]) => ({
            service: service || 'Data/URL Tests',
            count: data.count,
            success_count: data.success_count,
            success_rate: data.success_rate,
            examples: data.examples || []
          }))
          setServiceGroups(groups)
          setTotalRecords(res.total_records || 0)
        }
      })
      .catch((e) => {
        const msg = e && (e as any).message ? (e as any).message : String(e)
        console.error('Failed to load grouped reports:', msg)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [selectedMNO, selectedState, dateRange])
  
  useEffect(() => {
    fetchGroupedData()
  }, [fetchGroupedData])

  const exportAllAsCSV = () => {
    if (serviceGroups.length === 0) return
    const allRecords = serviceGroups.flatMap(group => group.examples)
    const headers = ["Service", "ID", "Test Case", "Originator", "Origin Location", "Origin Network", "Recipient", "Recipient Location", "Recipient Network", "Status", "Duration", "Call Setup Time", "Data Speed", "URL", "URL Redirect", "Timestamp"]
    const rows = allRecords.map((record) => [
      record.service || 'Data/URL',
      record.id || '',
      record.test_case_description || '',
      record.originator_number || '',
      record.originator_location_detail?.name || '',
      record.originator_network || '',
      record.recipient_number || '',
      record.recipient_location_detail?.name || '',
      record.recipient_network || '',
      record.status || '',
      record.duration || '',
      record.call_setup_time || '',
      record.data_speed || '',
      record.url || '',
      record.url_redirect || '',
      record.time_of_call || ''
    ])
    const csv = [headers, ...rows].map((row) => row.map(cell => `"${cell}"`).join(",")).join("\\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `grouped-reports-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleServiceClick = (service: string) => {
    const encodedService = encodeURIComponent(service)
    const queryParams = new URLSearchParams()
    if (selectedMNO !== "All") queryParams.set('network', selectedMNO)
    if (selectedState !== "All") queryParams.set('state', selectedState)
    if (dateRange.start) queryParams.set('start_date', dateRange.start)
    if (dateRange.end) queryParams.set('end_date', dateRange.end)
    
    const queryString = queryParams.toString()
    navigate(`/reports/service/${encodedService}${queryString ? `?${queryString}` : ''}`)
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return "text-green-600"
    if (rate >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Service Reports</h1>
          <p className="text-sm text-muted-foreground">View test results grouped by service type</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" disabled={serviceGroups.length === 0}>
              <Download className="w-3 h-3 mr-1" />
              Export All
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={exportAllAsCSV}>
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

      {loading && <div className="text-center py-8 text-muted-foreground">Loading service groups...</div>}

      {!loading && (
        <div className="grid gap-4">
          <div className="text-sm text-muted-foreground mb-4">
            Total Records: {totalRecords} | Service Groups: {serviceGroups.length}
          </div>
          
          {serviceGroups.map((group) => (
            <Card 
              key={group.service} 
              className="p-6 bg-white border hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleServiceClick(group.service)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-xl font-semibold text-blue-600">
                      {group.service || 'Data/URL Tests'}
                    </h3>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Tests:</span>
                      <div className="font-semibold text-lg">{group.count}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Successful:</span>
                      <div className="font-semibold text-lg text-green-600">{group.success_count}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Failed:</span>
                      <div className="font-semibold text-lg text-red-600">{group.count - group.success_count}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Success Rate:</span>
                      <div className={`font-semibold text-lg ${getSuccessRateColor(group.success_rate)}`}>
                        {group.success_rate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {serviceGroups.length === 0 && !loading && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No service groups found for the selected filters.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}