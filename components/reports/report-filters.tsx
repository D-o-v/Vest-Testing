"use client"

import type { MNO } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const STATES = [
  "All",
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
  "FCT",
]

const SERVICES = ["All", "VOICE", "SMS", "DATA", "USSD"]

interface ReportFiltersProps {
  selectedMNO: MNO | "All"
  onMNOChange: (mno: MNO | "All") => void
  selectedState: string | "All"
  onStateChange: (state: string | "All") => void
  dateRange: { start: string; end: string }
  onDateRangeChange: (range: { start: string; end: string }) => void
}

export default function ReportFilters({
  selectedMNO,
  onMNOChange,
  selectedState,
  onStateChange,
  dateRange,
  onDateRangeChange,
}: ReportFiltersProps) {
  return (
    <Card className="bg-card border-border">
      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Network Filter */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Network</label>
            <select
              value={selectedMNO}
              onChange={(e) => onMNOChange(e.target.value as MNO | "All")}
              className="w-full px-2.5 py-1.5 bg-muted border border-border rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Networks</option>
              <option value="MTN">MTN</option>
              <option value="GLO">Glo</option>
              <option value="AIRTEL">Airtel</option>
              <option value="T2">T2</option>
            </select>
          </div>



          {/* Origin Filter */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Origin</label>
            <select
              value={selectedState}
              onChange={(e) => onStateChange(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-muted border border-border rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">From</label>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
              className="text-xs h-8 px-2.5 focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">To</label>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
              className="text-xs h-8 px-2.5 focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
