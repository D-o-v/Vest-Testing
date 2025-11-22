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

import { useState } from "react"
import type { MNO } from "@/lib/types"
import ReportFilters from "./reports/report-filters"
import GroupedReports from "./reports/grouped-reports"

export default function Reports({ csvData }: { csvData: string }) {
  const [selectedMNO, setSelectedMNO] = useState<MNO | "All">("All")
  const [selectedState, setSelectedState] = useState<string | "All">("All")
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  })



  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Network Reports</h1>
        <p className="text-sm text-muted-foreground">Generate and export detailed performance reports</p>
      </div>

      <ReportFilters
        selectedMNO={selectedMNO}
        onMNOChange={setSelectedMNO}
        selectedState={selectedState}
        onStateChange={setSelectedState}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <GroupedReports
        selectedMNO={selectedMNO}
        selectedState={selectedState}
        dateRange={dateRange}
      />

    </div>
  )
}
