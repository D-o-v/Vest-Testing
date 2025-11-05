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
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Filters</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* MNO Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Network</label>
            <select
              value={selectedMNO}
              onChange={(e) => onMNOChange(e.target.value as MNO | "All")}
              className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground text-sm"
            >
              <option value="All">All Networks</option>
              <option value="MTN">MTN</option>
              <option value="GLO">Glo</option>
              <option value="AIRTEL">Airtel</option>
              <option value="T2">9Mobile</option>
            </select>
          </div>

          {/* Service Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Service Type</label>
            <select
              value={selectedService}
              onChange={(e) => onServiceChange(e.target.value as ServiceType | "All")}
              className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground text-sm"
            >
              <option value="All">All Services</option>
              <option value="Voice">Voice</option>
              <option value="SMS">SMS</option>
              <option value="Data">Data</option>
            </select>
          </div>

          {/* State Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">State</label>
            <select
              value={selectedState}
              onChange={(e) => onStateChange(e.target.value)}
              className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground text-sm"
            >
              {STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-2">
            <label className="block text-sm font-medium text-foreground mb-2">Date Range</label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                className="flex-1 text-sm"
              />
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                className="flex-1 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
