"use client"

import { useState, useMemo, useEffect } from "react"
import type { TestRecord } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { aggregateMetricsByState } from "@/lib/csv-parser"
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Feature, Geometry } from "geojson"

interface GeoFeature extends Feature<Geometry> {
  properties: {
    name?: string;
    NAME_1?: string;
    admin1Name?: string;
    [key: string]: any; // For any other properties
  };
  rsmKey: string;
}

const getStateName = (properties: GeoFeature["properties"]): string => {
  return properties.name || properties.NAME_1 || properties.admin1Name || "Unknown State"
}

// Use Highcharts' Nigeria states GeoJSON which is reliable and CORS-enabled
const GEO_URL =
  "https://code.highcharts.com/mapdata/countries/ng/ng-all.geo.json"

export default function NigeriaMap({ records }: { records: TestRecord[] }) {
  const [hoveredState, setHoveredState] = useState<string | null>(null)
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [geoData, setGeoData] = useState<any | null>(null)

  useEffect(() => {
    let mounted = true
    fetch(GEO_URL)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return
        setGeoData(data)
      })
      .catch(() => {
        // If fetch fails, we'll keep geoData null and fall back to the simpler renderer
        setGeoData(null)
      })

    return () => {
      mounted = false
    }
  }, [])

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

  const readGeoName = (props: any) => {
    return props?.NAME_1 || props?.name || props?.STATE_NAME || props?.NAME || "unknown"
  }

  return (
    <Card className="bg-card border-border h-full">
      <div className="p-6 h-full flex flex-col">
        <h2 className="text-lg font-semibold text-foreground mb-1">Network Performance by State</h2>
        <p className="text-xs text-muted-foreground mb-4">Click states to view details</p>

        <div className="flex-1 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg p-4 overflow-hidden">
          {geoData ? (
            <ComposableMap 
              projection="geoMercator" 
              projectionConfig={{ 
                scale: 3500,
                center: [8.6753, 9.0820] // Nigeria's center coordinates
              }}
              width={800} 
              height={800}
              style={{
                width: "100%",
                height: "auto"
              }}
            >
              <ZoomableGroup center={[8.6753, 9.0820]} zoom={1}>
                <Geographies geography={geoData}>
                  {({ geographies }: { geographies: GeoFeature[] }) => (
                    <TooltipProvider>
                      {geographies.map((geo: GeoFeature) => {
                        const name = getStateName(geo.properties)
                        const color = getStateColor(name)
                        const isHovered = hoveredState === name
                        const isSelected = selectedState === name
                        const successRate = Math.round(stateMetrics.get(name) || 0)

                        return (
                          <Tooltip key={geo.rsmKey}>
                            <TooltipTrigger asChild>
                              <g>
                                <Geography
                                  geography={geo}
                                  onMouseEnter={() => setHoveredState(name)}
                                  onMouseLeave={() => setHoveredState(null)}
                                  onClick={() => setSelectedState(isSelected ? null : name)}
                                  style={{
                                    default: {
                                      fill: color,
                                      stroke: "#ffffff",
                                      strokeWidth: 0.75,
                                      outline: "none",
                                      transition: "all 250ms",
                                    },
                                    hover: {
                                      fill: color,
                                      stroke: "#000000",
                                      strokeWidth: 1,
                                      filter: "brightness(95%)",
                                      cursor: "pointer",
                                    },
                                    pressed: {
                                      fill: color,
                                      stroke: "#000000",
                                      strokeWidth: 1,
                                      filter: "brightness(90%)",
                                    },
                                  }}
                                />
                              </g>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm font-medium">{name}</p>
                              <p className="text-xs text-muted-foreground">Success Rate: {successRate}%</p>
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </TooltipProvider>
                  )}
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
          ) : (
            // Fallback: simplified SVG point renderer (keeps existing visual if offline)
            <svg viewBox="0 0 16 14" preserveAspectRatio="xMidYMid meet" className="w-full h-full" style={{ minHeight: "300px" }}>
              <defs>
                <filter id="shadow">
                  <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3" />
                </filter>
                <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(59, 130, 246, 0.05)" />
                  <stop offset="100%" stopColor="rgba(30, 64, 175, 0.05)" />
                </linearGradient>
              </defs>
              <rect width="16" height="14" fill="url(#mapGrad)" />
              <path d="M 2 4 L 14 4 L 14 13 L 2 13 Z" fill="none" stroke="#d1d5db" strokeWidth="0.05" opacity="0.3" />
              {/* if no geo data, indicate offline/placeholder */}
              <text x="8" y="8" textAnchor="middle" fill="var(--muted-foreground)" fontSize="0.7">
                Map data unavailable
              </text>
            </svg>
          )}
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
            <p className="text-xs text-muted-foreground">Success Rate: {Math.round(stateMetrics.get(selectedState) || 0)}%</p>
          </div>
        )}
      </div>
    </Card>
  )
}
