"use client"

import { useEffect, useState } from "react"
import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"
import HC_map from "highcharts/modules/map"
import type { TestRecord } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { aggregateMetricsByState } from "@/lib/csv-parser"
import testingService from '@/lib/services/testing-service'
import logger from '@/lib/utils/logger'

// Initialize the Highcharts map module
try {
  const mapModule: any = (HC_map as any)?.default ?? HC_map
  if (typeof mapModule === "function") mapModule(Highcharts)
} catch (e) {
  // best-effort initialization; log sanitized message
  const msg = e instanceof Error ? e.message : String(e)
  logger.warn('Failed to initialize Highcharts map module:', msg)
}

const GEO_URL = "https://code.highcharts.com/mapdata/countries/ng/ng-all.geo.json"

type StateEntry = { percent: number; totalHits: number; topNetworks: string[]; topNetworksHtml?: string }

export default function NigeriaMapHighcharts({ records, startDate, endDate }: { records: TestRecord[], startDate?: string | null, endDate?: string | null }) {
  const [mapData, setMapData] = useState<any | null>(null)
  const [stateDetails, setStateDetails] = useState<Map<string, StateEntry>>(() => new Map())

  useEffect(() => {
    let mounted = true
    fetch(GEO_URL)
      .then(r => r.json())
      .then(geo => { if (!mounted) return; setMapData(geo) })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : String(e)
        logger.error('Failed to load map geojson:', msg)
      })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    // Query the hits-per-state endpoint (preferred). If it fails, fall back to aggregating provided records.
    let mounted = true
    const params: Record<string, any> = {}
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate
    const hitsParams = Object.keys(params).length ? params : { filter: 'today' }

    testingService.getHitsPerState(hitsParams as any)
      .then((res: any) => {
        if (!mounted) return

        // Accept multiple shapes: an array, or { states: [...] }
        const arr = Array.isArray(res) ? res : (res?.states ?? res?.data?.states ?? [])
        const overallTotal = Number(res?.overall_total_hits ?? res?.overallTotalHits ?? 0) || (arr.reduce((s: number, r: any) => s + (Number(r.total_hits ?? r.totalHits ?? 0) || 0), 0) || 0)

        const map = new Map<string, StateEntry>()
        for (const item of arr) {
          const name = String(item.state ?? item.state_display ?? item.name ?? '').trim()
          if (!name) continue
          const totalHits = Number(item.total_hits ?? item.totalHits ?? item.originator_hits ?? item.recipient_hits ?? 0) || 0
          const percent = Number(item.percent_of_overall ?? item.percentOfOverall ?? item.percent ?? (overallTotal ? (totalHits / overallTotal) * 100 : 0)) || 0
          const topNetworksRaw = (item.top_networks ?? item.topNetworks ?? [])
          const topNetworks = topNetworksRaw.map((n: any) => String(n.network ?? n.name ?? n).toUpperCase())
          const topNetworksHtml = topNetworksRaw.map((n: any) => `${String(n.network ?? n.name ?? n)}: ${Number(n.count ?? n.value ?? 0)}`).join('<br/>')
          map.set(name, { percent: Math.round(percent * 10) / 10, totalHits, topNetworks, topNetworksHtml })
        }

        setStateDetails(map)
        if (process.env.NODE_ENV !== 'production') (window as any).__vess_state_hits = { params: hitsParams, overallTotal, states: Array.from(map.entries()) }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        logger.error('Failed to fetch hits-per-state:', msg)

        // fallback: aggregate provided `records` into state metrics
        const metrics = aggregateMetricsByState(records)
        if (metrics && metrics.length > 0) {
          const map = new Map<string, StateEntry>()
          const total = metrics.reduce((s, m) => s + (m.attempts ?? 0), 0) || 0
          for (const m of metrics) {
            const percent = total ? (m.successRate || 0) : 0
            map.set(m.state, { percent: Math.round(percent * 10) / 10, totalHits: m.attempts || 0, topNetworks: [] })
          }
          setStateDetails(map)
        }
      })

    return () => { mounted = false }
  }, [records, startDate, endDate])

  if (!mapData) {
    return (
      <Card className="bg-card border-border h-full">
        <div className="p-6">Loading map…</div>
      </Card>
    )
  }

  // Mapping helpers: try exact match, fallback to common name variations
  const stateNameMap: Record<string, string> = {
    'Federal Capital Territory': 'Federal Capital Territory',
    'FCT': 'Federal Capital Territory',
    'Abuja': 'Federal Capital Territory',
    'Cross River': 'Cross River',
    'Akwa Ibom': 'Akwa Ibom'
  }

  const findStateEntry = (name: string) : StateEntry | undefined => {
    if (!name) return undefined
    // exact
    if (stateDetails.has(name)) return stateDetails.get(name)
    // mapped
    const mapped = stateNameMap[name]
    if (mapped && stateDetails.has(mapped)) return stateDetails.get(mapped)
    // reverse lookup
    const reverse = Object.keys(stateNameMap).find(k => stateNameMap[k] === name)
    if (reverse && stateDetails.has(reverse)) return stateDetails.get(reverse)
    // try case-insensitive match
    const key = Array.from(stateDetails.keys()).find(k => k.toLowerCase() === name.toLowerCase())
    return key ? stateDetails.get(key) : undefined
  }

  // Build series data for Highcharts, attaching extra metadata for tooltip
  const data = mapData.features.map((f: any) => {
    const props = f.properties || {}
    const name = props.name || props.NAME || props['hc-a2'] || props.postal || props['hc-key'] || 'Unknown'
    const entry = findStateEntry(name)
    const value = entry ? entry.percent : 0
    const totalHits = entry ? entry.totalHits : 0
    const topNetworks = entry ? entry.topNetworks.join(', ') : ''
    const topNetworksHtml = entry ? entry.topNetworksHtml : ''
    return {
      'hc-key': props['hc-key'],
      name,
      value,
      totalHits,
      topNetworks,
      topNetworksHtml,
    }
  })

  const options: Highcharts.Options = {
    chart: { map: mapData as any, backgroundColor: undefined },
    title: { text: "Network Hits by State", align: 'left', margin: 24, style: { fontWeight: '600', fontSize: '16px', color: '#111827' } },
    mapNavigation: { enabled: true },
    colorAxis: { min: 0, max: 100, stops: [[0, '#ef4444'], [0.6, '#f59e0b'], [0.75, '#84cc16'], [0.9, '#10b981']] },
    series: [
      {
        // @ts-ignore - map series
        type: 'map',
        data,
        mapData: mapData,
        joinBy: ['hc-key', 'hc-key'],
        name: 'Hits Share (%)',
        states: { hover: { color: '#2b6cb0' } },
        tooltip: {
          useHTML: true,
          pointFormatter: function (this: any) {
            const val = (this.value != null) ? `${Number(this.value).toFixed(1)}%` : 'N/A'
            const hits = this.totalHits != null ? String(this.totalHits) : 'N/A'
            const topHtml = this.topNetworksHtml || this.topNetworks || '—'
            return `<div style="font-size:13px"><strong>${this.name}</strong><br/>Share: ${val}<br/>Hits: ${hits}<br/><div style="margin-top:6px"><strong>Top networks</strong><br/>${topHtml}</div></div>`
          }
        },
        events: {
          click: function (e: any) {
            const name = e.point && (e.point.name || e.point.properties && e.point.properties.name)
            const detail = { name, value: e.point && e.point.value, hits: e.point && e.point.totalHits }
            window.dispatchEvent(new CustomEvent('vess:state-click', { detail }))
          }
        }
      } as any
    ],
    credits: { enabled: false }
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
