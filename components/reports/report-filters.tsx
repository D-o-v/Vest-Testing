"use client"

import type { MNO, ServiceType } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

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

interface ReportFiltersProps {
  selectedMNO: MNO | "All"
  onMNOChange: (mno: MNO | "All") => void
  selectedService: ServiceType | "All"
  onServiceChange: (service: ServiceType | "All") => void
  selectedState: string | "All"
  onStateChange: (state: string | "All") => void
  dateRange: { start: string; end: string }
  onDateRangeChange: (range: { start: string; end: string }) => void
}

export default function ReportFilters({
  selectedMNO,
  onMNOChange,
  selectedService,
  onServiceChange,
  selectedState,
  onStateChange,
  dateRange,
  onDateRangeChange,
}: ReportFiltersProps) {
  return (
    <Card className="bg-card border-border">
      <div className="p-3">
        <h3 className="text-sm font-semibold text-foreground mb-2">Filters</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {/* MNO Filter */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Network</label>
            <select
              value={selectedMNO}
              onChange={(e) => onMNOChange(e.target.value as MNO | "All")}
              className="w-full px-2 py-1 bg-muted border border-border rounded text-foreground text-xs"
            >
              <option value="All">All Networks</option>
              <option value="MTN">MTN</option>
              <option value="GLO">Glo</option>
              <option value="AIRTEL">Airtel</option>
              <option value="T2">T2</option>
            </select>
          </div>

          {/* Service Filter */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Service</label>
            <select
              value={selectedService}
              onChange={(e) => onServiceChange(e.target.value as ServiceType | "All")}
              className="w-full px-2 py-1 bg-muted border border-border rounded text-foreground text-xs"
            >
              <option value="All">All Services</option>
              <option value="Voice">Voice</option>
              <option value="SMS">SMS</option>
              <option value="Data">Data</option>
            </select>
          </div>

          {/* Origin Filter */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Origin</label>
            <select
              value={selectedState}
              onChange={(e) => onStateChange(e.target.value)}
              className="w-full px-2 py-1 bg-muted border border-border rounded text-foreground text-xs"
            >
              {STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Filter */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Destination</label>
            <select
              value={selectedState}
              onChange={(e) => onStateChange(e.target.value)}
              className="w-full px-2 py-1 bg-muted border border-border rounded text-foreground text-xs"
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
            <label className="block text-xs font-medium text-foreground mb-1">From</label>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
              className="text-xs h-7"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">To</label>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
              className="text-xs h-7"
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
