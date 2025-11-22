"use client"

import { useMemo, useState, useCallback } from "react"
import { useNavigate } from 'react-router-dom'
import type { TestRecord } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, BarChart3, Check, AlertCircle } from "lucide-react"
import testingService from '@/lib/services/testing-service'

interface ReportTableProps {
  records: TestRecord[]
  queryParams?: {
    selectedMNO?: string
    selectedService?: string
    selectedState?: string
    dateRange?: { start?: string; end?: string }
  }
}

export default function ReportTable({ records, queryParams = {} }: ReportTableProps) {
  const navigate = useNavigate()
  const [loadingService, setLoadingService] = useState<string | null>(null)

  const groups = useMemo(() => {
    const map: Record<string, TestRecord[]> = {}
    records.forEach((r) => {
      const key = r.service || 'Unknown'
      if (!map[key]) map[key] = []
      map[key].push(r)
    })
    return map
  }, [records])

  const groupKeys = Object.keys(groups).sort()

  // Fetch detailed records for a service when user clicks on it
  const handleServiceClick = useCallback(async (serviceKey: string) => {
    setLoadingService(serviceKey)
    try {
      // Build URL query string with all filters
      const urlParams = new URLSearchParams()
      if (queryParams.selectedMNO && queryParams.selectedMNO !== 'All') urlParams.append('mno', queryParams.selectedMNO)
      if (queryParams.selectedService && queryParams.selectedService !== 'All') urlParams.append('service_type', queryParams.selectedService)
      if (queryParams.selectedState && queryParams.selectedState !== 'All') urlParams.append('state', queryParams.selectedState)
      if (queryParams.dateRange?.start) urlParams.append('start_date', queryParams.dateRange.start)
      if (queryParams.dateRange?.end) urlParams.append('end_date', queryParams.dateRange.end)
      
      const queryString = urlParams.toString()
      navigate(`/reports/service/${encodeURIComponent(serviceKey)}${queryString ? `?${queryString}` : ''}`)
    } catch (error) {
      console.error('Failed to navigate to service:', error)
    } finally {
      setLoadingService(null)
    }
  }, [navigate, queryParams])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Services Summary</h3>
      </div>

      {groupKeys.length === 0 ? (
        <Card className="bg-card border-border">
          <div className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground text-sm">No records found</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupKeys.map((serviceKey) => {
            const items = groups[serviceKey]
            const successCount = items.filter(i => (i.status || '').toLowerCase().includes('success') || (i.status || '').toLowerCase().includes('delivered')).length
            const failCount = items.length - successCount
            const successRate = items.length ? Math.round((successCount / items.length) * 100) : 0
            
            // Display label: empty string becomes "Unknown"
            const displayLabel = serviceKey || 'Unknown'
            // Pass the actual service key (including empty string) to the handler
            const apiServiceKey = serviceKey || ''

            return (
              <Card
                key={serviceKey || 'unknown'}
                className="bg-card border-border hover:border-primary/50 transition-all duration-200 hover:shadow-md cursor-pointer group"
                onClick={() => handleServiceClick(apiServiceKey)}
              >
                <div className="p-4">
                  {/* Header with title and count */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {displayLabel}
                      </h4>
                      <p className="text-xs text-muted-foreground">{items.length} tests</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all transform group-hover:translate-x-0.5 ml-2 shrink-0" />
                  </div>

                  {/* Compact stats in a grid */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-0.5">Success Rate</p>
                      <p className="text-sm font-bold text-green-600">{successRate}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-0.5">Passed</p>
                      <p className="text-sm font-bold text-green-600">{successCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-0.5">Failed</p>
                      <p className="text-sm font-bold text-red-600">{failCount}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden mb-2">
                    <div
                      className="bg-linear-to-r from-green-500 to-green-600 h-full transition-all duration-300"
                      style={{ width: `${successRate}%` }}
                    ></div>
                  </div>

                  {/* Status Badge - centered */}
                  <div className="flex justify-center">
                    {loadingService === serviceKey ? (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs py-0.5 px-2">
                        Loading...
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className={`text-xs py-0.5 px-2 ${
                          successRate >= 80
                            ? 'bg-green-500/10 text-green-600 border-green-500/20'
                            : successRate >= 50
                            ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                            : 'bg-red-500/10 text-red-600 border-red-500/20'
                        }`}
                      >
                        {successRate >= 80 ? 'Good' : successRate >= 50 ? 'Fair' : 'Poor'}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
