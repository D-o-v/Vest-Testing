"use client"

import { useEffect, useState } from "react"
import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"
import HC_map from "highcharts/modules/map"
import type { TestRecord } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { aggregateMetricsByState } from "@/lib/csv-parser"

// Initialize the map module for Highcharts (module may be a namespace with a default export)
try {
  const mapModule: any = (HC_map as any)?.default ?? HC_map
  if (typeof mapModule === "function") {
    mapModule(Highcharts)
  } else {
    // fallback: try dynamic import (shouldn't normally be needed)
    import("highcharts/modules/map").then((m) => {
      const fn = (m as any)?.default ?? m
      if (typeof fn === "function") fn(Highcharts)
    }).catch(() => {
      // ignore
    })
  }
} catch (err) {
  // Safe fallback to dynamic import
  import("highcharts/modules/map").then((m) => {
    const fn = (m as any)?.default ?? m
    if (typeof fn === "function") fn(Highcharts)
  }).catch((e) => console.warn("Failed to initialize Highcharts map module", e))
}

const GEO_URL = "https://code.highcharts.com/mapdata/countries/ng/ng-all.geo.json"

export default function NigeriaMapHighcharts({ records }: { records: TestRecord[] }) {
  const [mapData, setMapData] = useState<any | null>(null)

  useEffect(() => {
    let mounted = true
    fetch(GEO_URL)
      .then((r) => r.json())
      .then((geo) => {
        if (!mounted) return
        setMapData(geo)
      })
      .catch((err) => {
        console.error("Failed to load map data", err)
      })

    return () => {
      mounted = false
    }
  }, [])

  const [stateMetrics, setStateMetrics] = useState<Map<string, number>>(() => new Map())

  useEffect(() => {
    // First try to use aggregated records passed in
    const metrics = aggregateMetricsByState(records)
    if (metrics && metrics.length > 0) {
      const map = new Map<string, number>()
      for (const m of metrics) map.set(m.state, Math.round(m.successRate))
      setStateMetrics(map)
      return
    }

    // Fallback: fetch the local dummy data file if present
    let mounted = true
    fetch('/data/state-metrics.json')
      .then((r) => r.json())
      .then((arr: any[]) => {
        if (!mounted || !Array.isArray(arr)) return
        const grouped = new Map<string, number[]>()
        for (const item of arr) {
          const s = item.state
          const v = typeof item.successRate === 'number' ? item.successRate : Number(item.successRate)
          if (!grouped.has(s)) grouped.set(s, [])
          grouped.get(s)!.push(v)
        }
        const map = new Map<string, number>()
        for (const [state, vals] of grouped.entries()) {
          const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
          map.set(state, avg)
        }
        setStateMetrics(map)
      })
      .catch(() => {
        // ignore - we'll just show empty values
      })

    return () => {
      mounted = false
    }
  }, [records])

  if (!mapData) {
    return (
      <Card className="bg-card border-border h-full">
        <div className="p-6">Loading map…</div>
      </Card>
    )
  }

  // Prepare data array for Highcharts: match by 'name' property in geo json
  const data = mapData.features.map((f: any) => {
    const props = f.properties || {}
    const name = props.name || props.NAME || props['hc-a2'] || props.postal || props['hc-key'] || 'Unknown'
    const val = stateMetrics.get(name) ?? null
    return {
      'hc-key': props['hc-key'],
      name,
      value: val,
    }
  })

  const options: Highcharts.Options = {
    chart: {
      map: mapData as any,
      backgroundColor: undefined,
    },
    title: { text: undefined },
    mapNavigation: { enabled: true },
    colorAxis: {
      min: 0,
      max: 100,
      stops: [
        [0, '#ef4444'],
        [0.6, '#f59e0b'],
        [0.75, '#84cc16'],
        [0.9, '#10b981'],
      ],
    },
    series: [
      {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - highcharts typing for map series
        type: 'map',
        data,
        mapData: mapData,
        joinBy: ['hc-key', 'hc-key'],
        name: 'Success Rate',
        states: {
          hover: {
            color: '#2b6cb0',
          },
        },
        tooltip: {
          pointFormatter: function (this: any) {
            // 'this' refers to point
            return `<b>${this.name || 'Unknown'}</b><br/>Success Rate: ${this.value ?? 'N/A'}%`
          },
        },
        events: {
          click: function (e: any) {
            // Highcharts sends point as e.point
            const name = e.point && (e.point.name || e.point.properties && e.point.properties.name)
            const value = e.point && e.point.value
            // For now, just log. You can replace with context/state to show sidebar
            console.log('State clicked', name, value)
            // You may want to dispatch a custom event so parent components can read it
            window.dispatchEvent(new CustomEvent('vess:state-click', { detail: { name, value } }))
          },
        },
      } as any,
    ],
    credits: { enabled: false },
  }

  return (
    <Card className="bg-card border-border h-full">
      <div className="p-4 h-full flex flex-col">
        <div className="flex-1">
          <HighchartsReact highcharts={Highcharts} constructorType={'mapChart'} options={options} />
        </div>
        <div className="mt-3 text-xs grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#10b981]"/> <span className="text-muted-foreground">90%+</span></div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#84cc16]"/> <span className="text-muted-foreground">75-90%</span></div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#f59e0b]"/> <span className="text-muted-foreground">60-75%</span></div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#ef4444]"/> <span className="text-muted-foreground">&lt;60%</span></div>
        </div>
      </div>
    </Card>
  )
}
