"use client"

import { useState, useMemo, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Filter, Download, Search, RefreshCw } from "lucide-react"
import { MNO_COLORS } from "@/lib/constants"

interface TestResult {
  id: string
  test_case_description: string
  originator_number: string
  originator_location_detail: { name: string; state_display: string } | null
  originator_network: string
  recipient_number: string | null
  recipient_location_detail: { name: string; state_display: string } | null
  recipient_network: string
  receipt_number_format: string
  service: string
  time_of_call: string
  duration: number | null
  call_setup_time: number | null
  status: string
  data_speed: string
  url: string
  url_redirect: string
}

interface TestResultsProps {
  data?: { results: TestResult[] }
}

export default function TestResults({ data }: TestResultsProps) {
  const [filters, setFilters] = useState({
    search: "",
    network: "all",
    service: "all",
    status: "all",
    location: "all",
    numberFormat: "all",
    dateFrom: "",
    dateTo: "",
  })

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const results = data?.results || []

  // Extract unique values for filters
  const uniqueNetworks = useMemo(() => 
    [...new Set(results.map(r => r.originator_network).filter(Boolean))].sort()
  , [results])

  const uniqueServices = useMemo(() => 
    [...new Set(results.map(r => r.service).filter(Boolean))].sort()
  , [results])

  const uniqueStatuses = useMemo(() => 
    [...new Set(results.map(r => r.status).filter(Boolean))].sort()
  , [results])

  const uniqueLocations = useMemo(() => 
    [...new Set(results.map(r => r.originator_location_detail?.name).filter(Boolean))].sort()
  , [results])

  const uniqueNumberFormats = useMemo(() => 
    [...new Set(results.map(r => r.receipt_number_format).filter(Boolean))].sort()
  , [results])

  // Filter data
  const filteredResults = useMemo(() => {
    return results.filter(result => {
      const matchesSearch = !filters.search || 
        result.test_case_description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        result.originator_number?.toLowerCase().includes(filters.search.toLowerCase()) ||
        result.recipient_number?.toLowerCase().includes(filters.search.toLowerCase())

      const matchesNetwork = filters.network === "all" || result.originator_network === filters.network
      const matchesService = filters.service === "all" || result.service === filters.service
      const matchesStatus = filters.status === "all" || result.status === filters.status
      const matchesLocation = filters.location === "all" || result.originator_location_detail?.name === filters.location
      const matchesNumberFormat = filters.numberFormat === "all" || result.receipt_number_format === filters.numberFormat

      const matchesDateFrom = !filters.dateFrom || new Date(result.time_of_call) >= new Date(filters.dateFrom)
      const matchesDateTo = !filters.dateTo || new Date(result.time_of_call) <= new Date(filters.dateTo + "T23:59:59")

      return matchesSearch && matchesNetwork && matchesService && matchesStatus && 
             matchesLocation && matchesNumberFormat && matchesDateFrom && matchesDateTo
    })
  }, [results, filters])

  // Pagination
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage)
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const clearFilters = () => {
    setFilters({
      search: "",
      network: "all",
      service: "all", 
      status: "all",
      location: "all",
      numberFormat: "all",
      dateFrom: "",
      dateTo: "",
    })
    setCurrentPage(1)
  }

  const exportToCSV = () => {
    const headers = [
      "Test Case", "Originator", "Orig Network", "Orig Location", 
      "Recipient", "Recip Network", "Recip Location", "Service",
      "Status", "Duration", "Setup Time", "Date/Time", "Number Format"
    ]

    const rows = filteredResults.map(r => [
      r.test_case_description,
      r.originator_number,
      r.originator_network,
      r.originator_location_detail?.name || "",
      r.recipient_number || "",
      r.recipient_network,
      r.recipient_location_detail?.name || "",
      r.service,
      r.status,
      r.duration || "",
      r.call_setup_time || "",
      new Date(r.time_of_call).toLocaleString(),
      r.receipt_number_format
    ])

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `test-results-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase()
    if (s.includes("success") || s.includes("delivered")) {
      return "bg-green-50 text-green-700 border-green-200"
    }
    if (s.includes("failed") || s.includes("fail")) {
      return "bg-red-50 text-red-700 border-red-200"
    }
    if (s.includes("submitted")) {
      return "bg-blue-50 text-blue-700 border-blue-200"
    }
    return "bg-gray-50 text-gray-700 border-gray-200"
  }

  const getNetworkColor = (network: string) => {
    const networkKey = network.toUpperCase() as keyof typeof MNO_COLORS
    return MNO_COLORS[networkKey] || "#6b7280"
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Test Results</h1>
          <p className="text-sm text-muted-foreground">
            {filteredResults.length} of {results.length} results
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Clear
          </Button>
          <Button size="sm" onClick={exportToCSV} disabled={!filteredResults.length}>
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-9 h-9"
            />
          </div>

          {/* Network */}
          <Select value={filters.network} onValueChange={(value) => setFilters(prev => ({ ...prev, network: value }))}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Network" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Networks</SelectItem>
              {uniqueNetworks.map(network => (
                <SelectItem key={network} value={network}>{network}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Service */}
          <Select value={filters.service} onValueChange={(value) => setFilters(prev => ({ ...prev, service: value }))}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {uniqueServices.map(service => (
                <SelectItem key={service} value={service}>{service}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status */}
          <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {uniqueStatuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Location */}
          <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {uniqueLocations.map(location => (
                <SelectItem key={location} value={location}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Number Format */}
          <Select value={filters.numberFormat} onValueChange={(value) => setFilters(prev => ({ ...prev, numberFormat: value }))}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              {uniqueNumberFormats.map(format => (
                <SelectItem key={format} value={format}>{format}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="flex gap-3 mt-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">to</span>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="h-9"
            />
          </div>
        </div>
      </Card>

      {/* Results Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="text-left p-2 font-medium text-xs uppercase tracking-wide">Test Case</th>
                <th className="text-left p-2 font-medium text-xs uppercase tracking-wide">Networks</th>
                <th className="text-left p-2 font-medium text-xs uppercase tracking-wide">Service</th>
                <th className="text-left p-2 font-medium text-xs uppercase tracking-wide">Route</th>
                <th className="text-left p-2 font-medium text-xs uppercase tracking-wide">Status</th>
                <th className="text-left p-2 font-medium text-xs uppercase tracking-wide">Performance</th>
                <th className="text-left p-2 font-medium text-xs uppercase tracking-wide">Date/Time</th>
              </tr>
            </thead>
            <tbody>
              {paginatedResults.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-muted-foreground">
                    No results found
                  </td>
                </tr>
              ) : (
                paginatedResults.map((result) => (
                  <tr key={result.id} className="border-b hover:bg-muted/30">
                    <td className="p-3">
                      <div className="font-medium">{result.test_case_description}</div>
                      <div className="text-xs text-muted-foreground">
                        {result.originator_number} → {result.recipient_number || "N/A"}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ borderColor: getNetworkColor(result.originator_network) }}
                        >
                          {result.originator_network}
                        </Badge>
                        {result.recipient_network && (
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                            style={{ borderColor: getNetworkColor(result.recipient_network) }}
                          >
                            {result.recipient_network}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-xs">
                        {result.service || "N/A"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="text-xs">
                        <div>{result.originator_location_detail?.name}</div>
                        {result.recipient_location_detail?.name && (
                          <div className="text-muted-foreground">
                            → {result.recipient_location_detail.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={`text-xs ${getStatusColor(result.status)}`}>
                        {result.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="text-xs">
                        {result.duration && <div>Duration: {result.duration}s</div>}
                        {result.call_setup_time && <div>Setup: {result.call_setup_time}s</div>}
                        {result.data_speed && <div>Speed: {result.data_speed}</div>}
                      </div>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {new Date(result.time_of_call).toLocaleDateString()}
                      <br />
                      {new Date(result.time_of_call).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}