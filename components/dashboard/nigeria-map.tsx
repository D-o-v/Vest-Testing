"use client"

import { useState, useMemo } from "react"
import type { TestRecord } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { aggregateMetricsByState } from "@/lib/csv-parser"

// Nigeria States GeoJSON - Simplified coordinates for react-simple-maps
const NIGERIA_GEO = {
  type: "FeatureCollection",
  features: [
    // Southwest Region
    {
      type: "Feature",
      properties: { name: "Lagos", region: "Southwest" },
      geometry: { type: "Point", coordinates: [3.9, 6.5] },
    },
    {
      type: "Feature",
      properties: { name: "Ogun", region: "Southwest" },
      geometry: { type: "Point", coordinates: [3.6, 6.9] },
    },
    {
      type: "Feature",
      properties: { name: "Oyo", region: "Southwest" },
      geometry: { type: "Point", coordinates: [3.9, 8.0] },
    },
    {
      type: "Feature",
      properties: { name: "Osun", region: "Southwest" },
      geometry: { type: "Point", coordinates: [4.5, 7.8] },
    },
    {
      type: "Feature",
      properties: { name: "Ondo", region: "Southwest" },
      geometry: { type: "Point", coordinates: [5.2, 6.5] },
    },
    {
      type: "Feature",
      properties: { name: "Ekiti", region: "Southwest" },
      geometry: { type: "Point", coordinates: [5.2, 8.0] },
    },

    // South-South Region
    {
      type: "Feature",
      properties: { name: "Edo", region: "South-South" },
      geometry: { type: "Point", coordinates: [5.8, 6.5] },
    },
    {
      type: "Feature",
      properties: { name: "Delta", region: "South-South" },
      geometry: { type: "Point", coordinates: [6.0, 5.5] },
    },
    {
      type: "Feature",
      properties: { name: "Rivers", region: "South-South" },
      geometry: { type: "Point", coordinates: [7.0, 4.8] },
    },
    {
      type: "Feature",
      properties: { name: "Bayelsa", region: "South-South" },
      geometry: { type: "Point", coordinates: [6.0, 4.8] },
    },
    {
      type: "Feature",
      properties: { name: "Cross River", region: "South-South" },
      geometry: { type: "Point", coordinates: [9.0, 5.0] },
    },
    {
      type: "Feature",
      properties: { name: "Akwa Ibom", region: "South-South" },
      geometry: { type: "Point", coordinates: [8.2, 5.0] },
    },

    // Southeast Region
    {
      type: "Feature",
      properties: { name: "Abia", region: "Southeast" },
      geometry: { type: "Point", coordinates: [7.3, 5.3] },
    },
    {
      type: "Feature",
      properties: { name: "Imo", region: "Southeast" },
      geometry: { type: "Point", coordinates: [7.0, 5.5] },
    },
    {
      type: "Feature",
      properties: { name: "Enugu", region: "Southeast" },
      geometry: { type: "Point", coordinates: [7.5, 6.4] },
    },
    {
      type: "Feature",
      properties: { name: "Ebonyi", region: "Southeast" },
      geometry: { type: "Point", coordinates: [8.3, 6.3] },
    },
    {
      type: "Feature",
      properties: { name: "Anambra", region: "Southeast" },
      geometry: { type: "Point", coordinates: [6.8, 6.0] },
    },

    // North-Central Region
    {
      type: "Feature",
      properties: { name: "Kwara", region: "North-Central" },
      geometry: { type: "Point", coordinates: [4.5, 9.2] },
    },
    {
      type: "Feature",
      properties: { name: "Niger", region: "North-Central" },
      geometry: { type: "Point", coordinates: [5.5, 9.8] },
    },
    {
      type: "Feature",
      properties: { name: "Kogi", region: "North-Central" },
      geometry: { type: "Point", coordinates: [6.7, 7.9] },
    },
    {
      type: "Feature",
      properties: { name: "Nasarawa", region: "North-Central" },
      geometry: { type: "Point", coordinates: [8.5, 8.9] },
    },
    {
      type: "Feature",
      properties: { name: "Plateau", region: "North-Central" },
      geometry: { type: "Point", coordinates: [9.0, 9.2] },
    },
    {
      type: "Feature",
      properties: { name: "FCT", region: "North-Central" },
      geometry: { type: "Point", coordinates: [7.4, 9.1] },
    },

    // North-East Region
    {
      type: "Feature",
      properties: { name: "Benue", region: "North-East" },
      geometry: { type: "Point", coordinates: [8.4, 7.8] },
    },
    {
      type: "Feature",
      properties: { name: "Taraba", region: "North-East" },
      geometry: { type: "Point", coordinates: [9.7, 7.3] },
    },
    {
      type: "Feature",
      properties: { name: "Adamawa", region: "North-East" },
      geometry: { type: "Point", coordinates: [10.8, 9.2] },
    },
    {
      type: "Feature",
      properties: { name: "Gombe", region: "North-East" },
      geometry: { type: "Point", coordinates: [10.3, 10.3] },
    },

    // North-West Region
    {
      type: "Feature",
      properties: { name: "Bauchi", region: "North-West" },
      geometry: { type: "Point", coordinates: [9.8, 10.3] },
    },
    {
      type: "Feature",
      properties: { name: "Kaduna", region: "North-West" },
      geometry: { type: "Point", coordinates: [7.3, 10.5] },
    },
    {
      type: "Feature",
      properties: { name: "Kano", region: "North-West" },
      geometry: { type: "Point", coordinates: [8.5, 11.7] },
    },
    {
      type: "Feature",
      properties: { name: "Katsina", region: "North-West" },
      geometry: { type: "Point", coordinates: [7.6, 12.7] },
    },
    {
      type: "Feature",
      properties: { name: "Jigawa", region: "North-West" },
      geometry: { type: "Point", coordinates: [9.5, 12.3] },
    },
    {
      type: "Feature",
      properties: { name: "Yobe", region: "North-West" },
      geometry: { type: "Point", coordinates: [10.8, 11.8] },
    },
    {
      type: "Feature",
      properties: { name: "Borno", region: "North-West" },
      geometry: { type: "Point", coordinates: [12.8, 11.5] },
    },
    {
      type: "Feature",
      properties: { name: "Sokoto", region: "North-West" },
      geometry: { type: "Point", coordinates: [5.2, 12.7] },
    },
    {
      type: "Feature",
      properties: { name: "Zamfara", region: "North-West" },
      geometry: { type: "Point", coordinates: [6.4, 11.9] },
    },
    {
      type: "Feature",
      properties: { name: "Kebbi", region: "North-West" },
      geometry: { type: "Point", coordinates: [4.2, 11.5] },
    },
  ],
}

export default function NigeriaMap({ records }: { records: TestRecord[] }) {
  const [hoveredState, setHoveredState] = useState<string | null>(null)
  const [selectedState, setSelectedState] = useState<string | null>(null)

  const stateMetrics = useMemo(() => {
    const metrics = aggregateMetricsByState(records)
    const stateMap = new Map<string, number>()

    metrics.forEach((metric) => {
      const current = stateMap.get(metric.state) || 0
      const avg = (current + metric.successRate) / 2
      stateMap.set(metric.state, avg)
    })

    return stateMap
  }, [records])

  const getStateColor = (stateName: string): string => {
    const rate = stateMetrics.get(stateName)
    if (!rate) return "#e5e7eb"

    if (rate >= 90) return "#10b981" // Green
    if (rate >= 75) return "#84cc16" // Lime
    if (rate >= 60) return "#f59e0b" // Amber
    return "#ef4444" // Red
  }

  return (
    <Card className="bg-card border-border h-full">
      <div className="p-6 h-full flex flex-col">
        <h2 className="text-lg font-semibold text-foreground mb-1">Network Performance by State</h2>
        <p className="text-xs text-muted-foreground mb-4">Click states to view details</p>

        <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg p-4 overflow-auto">
          <svg
            viewBox="0 0 16 14"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full"
            style={{ minHeight: "300px" }}
          >
            <defs>
              <filter id="shadow">
                <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3" />
              </filter>
              <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.05)" />
                <stop offset="100%" stopColor="rgba(30, 64, 175, 0.05)" />
              </linearGradient>
            </defs>

            {/* Background */}
            <rect width="16" height="14" fill="url(#mapGrad)" />

            {/* Nigeria outline reference */}
            <path d="M 2 4 L 14 4 L 14 13 L 2 13 Z" fill="none" stroke="#d1d5db" strokeWidth="0.05" opacity="0.3" />

            {/* State circles */}
            {NIGERIA_GEO.features.map((feature, idx) => {
              const stateName = feature.properties.name
              const [lng, lat] = feature.geometry.coordinates
              const color = getStateColor(stateName)
              const isHovered = hoveredState === stateName
              const isSelected = selectedState === stateName
              const rate = stateMetrics.get(stateName) || 0

              return (
                <g key={idx}>
                  {/* Circle background */}
                  <circle
                    cx={lng}
                    cy={lat}
                    r={isHovered || isSelected ? 0.35 : 0.3}
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth="0.08"
                    opacity={0.85}
                    filter="url(#shadow)"
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredState(stateName)}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={() => setSelectedState(isSelected ? null : stateName)}
                  />

                  {/* State label */}
                  <text
                    x={lng}
                    y={lat}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="0.22"
                    fill="#ffffff"
                    fontWeight="bold"
                    pointerEvents="none"
                    className="select-none"
                  >
                    {rate > 0 ? `${Math.round(rate)}%` : "N/A"}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 text-xs mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#10b981" }} />
            <span className="text-muted-foreground">90%+</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#84cc16" }} />
            <span className="text-muted-foreground">75-90%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
            <span className="text-muted-foreground">60-75%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#ef4444" }} />
            <span className="text-muted-foreground">&lt;60%</span>
          </div>
        </div>

        {/* State details panel */}
        {selectedState && (
          <div className="border-t border-border pt-3 mt-3">
            <p className="text-sm font-semibold text-foreground">{selectedState}</p>
            <p className="text-xs text-muted-foreground">
              Success Rate: {Math.round(stateMetrics.get(selectedState) || 0)}%
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
