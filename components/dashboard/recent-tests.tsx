"use client"

import { useEffect, useMemo, useState } from "react"
import type { TestRecord } from "@/lib/types"
import { MNO_COLORS } from "@/lib/constants"
import { Card } from "@/components/ui/card"
import testingService from '@/lib/services/testing-service'
import logger from '@/lib/utils/logger'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'

export default function RecentTests({ records, startDate, endDate }: { records?: TestRecord[], startDate?: string | null, endDate?: string | null }) {
  const [dashboardData, setDashboardData] = useState<any>(null)

  // Small helper moved outside map to avoid recreating per-item (performance)
  const fmtDuration = (d: any) => {
    if (d == null || d === '') return null
    const n = Number(d)
    if (Number.isNaN(n)) return String(d)
    if (n >= 60) return `${Math.floor(n / 60)}m ${n % 60}s`
    return `${n}s`
  }

  useEffect(() => {
    if (records && records.length > 0) {
      return // Use provided records
    }

    // Try backend first (Postman: GET /testing/recent-tests/)
    let mounted = true
    const params: Record<string, any> = {}
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate

    testingService.getRecentTests(Object.keys(params).length ? params : undefined)
      .then(data => {
        if (!mounted) return
        // normalize API shape to the UI-friendly shape used below
        const normalize = (t: any) => {
          const mnoRaw = t.originator_network || t.mno || t.originatorNetwork || ''
          const mno = String(mnoRaw).toUpperCase()
          const state = t.originator_location_detail?.state_display || t.originator_location_detail?.state || t.state || t.originator_location || ''
          const status = t.status || t.result || ''
          const service = t.service || t.type || t.test_type || ''
          const timestamp = t.time_of_call || t.timestamp || t.created_at || null
          const durationRaw = t.duration ?? t.duration_seconds ?? null
          const callSetupRaw = t.call_setup_time ?? t.callSetupTime ?? null

          return {
            id: t.id,
            mno,
            state,
            status,
            service,
            timestamp,
            duration: fmtDuration(durationRaw),
            callSetupTime: callSetupRaw != null ? String(callSetupRaw) : null,
            // keep original for debugging if needed
            __raw: t,
          }
        }

        setDashboardData({ recentTests: Array.isArray(data) ? data.map(normalize) : [] })
      })
      .catch((err: unknown) => {
        const sanitizedMsg = err instanceof Error ? err.message : String(err || 'API request failed')
        logger.error('Failed to load recent tests from API:', sanitizedMsg)
      })
    return () => { mounted = false }
  }, [records, startDate, endDate])

    const [open, setOpen] = useState(false)
    const [selectedTest, setSelectedTest] = useState<any | null>(null)

  const recentTests = useMemo(() => {
    // if parent passed records, try to normalize them too (they may be API-shaped)
    const normalizeIfNeeded = (t: any) => {
      if (!t) return t
      // already normalized if it has mno and timestamp
      if (t.mno && (t.timestamp || t.time_of_call)) return t
      const mnoRaw = t.originator_network || t.mno || t.originatorNetwork || ''
      const mno = String(mnoRaw).toUpperCase()
      const state = t.originator_location_detail?.state_display || t.originator_location_detail?.state || t.state || t.originator_location || ''
      const status = t.status || t.result || ''
      const service = t.service || t.type || t.test_type || ''
      const timestamp = t.time_of_call || t.timestamp || t.created_at || null
      const durationRaw = t.duration ?? t.duration_seconds ?? null
      const callSetupRaw = t.call_setup_time ?? t.callSetupTime ?? null
      const fmtDuration = (d: any) => {
        if (d == null || d === '') return null
        const n = Number(d)
        if (Number.isNaN(n)) return String(d)
        if (n >= 60) return `${Math.floor(n / 60)}m ${n % 60}s`
        return `${n}s`
      }
      return {
        id: t.id,
        mno,
        state,
        status,
        service,
        timestamp,
        duration: fmtDuration(durationRaw),
        callSetupTime: callSetupRaw != null ? String(callSetupRaw) : null,
        __raw: t,
      }
    }

    if (records && records.length > 0) {
      return records.map(normalizeIfNeeded).slice(-8).reverse()
    }

    return dashboardData?.recentTests || []
  }, [records, dashboardData])

  const recentTestsItems = recentTests.map((test: any, idx: number) => {
    const mnoKey = String(test.mno || '').toUpperCase()
    const color = (MNO_COLORS as any)[mnoKey] || MNO_COLORS.MTN
    return (
      <div key={test.id || idx}>
        <button
          onClick={() => { setSelectedTest(test); setOpen(true) }}
          className="w-full text-left bg-muted/20 border border-border/50 rounded-lg p-3 hover:bg-muted/40 hover:border-border transition-all">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm font-bold text-foreground">{test.mno}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{test.state}</span>
          </div>
          <span className={`text-xs font-bold ${
            test.result === 'Success' || test.status === 'Success'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {test.result || test.status}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-muted-foreground">
            <span>{test.type || test.service}</span>
            {test.duration && <span>• {test.duration}</span>}
            {test.callSetupTime && <span>• {test.callSetupTime}</span>}
          </div>
          <span className="text-muted-foreground">
            {test.timestamp ? new Date(test.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
          </span>
        </div>
        </button>
      </div>
    )
  })

  return (
    <Card className="bg-card border-border">
      <div className="p-4">
        <h2 className="text-sm font-bold tracking-tight text-foreground mb-4">Recent Tests</h2>

        <div className="space-y-2 overflow-auto h-[400px] pr-1">
          {recentTestsItems}
        </div>

        {/* Details dialog */}
        {/* dialog is controlled so it can be opened by clicking an item */}
        {typeof window !== 'undefined' && (
          <Dialog open={open} onOpenChange={(v: boolean) => { if (!v) setSelectedTest(null); setOpen(v) }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Test details</DialogTitle>
                <DialogDescription>Full details for the selected test</DialogDescription>
              </DialogHeader>

              {selectedTest ? (
                <div className="grid grid-cols-1 gap-3 mt-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span className="font-medium">Test ID</span>
                    <span className="text-right">{selectedTest.id}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Originator</div>
                      <div className="font-medium">{selectedTest.__raw?.originator_number || selectedTest.originator_number || '—'}</div>
                      <div className="text-xs text-muted-foreground">{selectedTest.__raw?.originator_location_detail?.name || selectedTest.__raw?.originator_location || selectedTest.state || ''} — {selectedTest.__raw?.originator_location_detail?.state_display || ''}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Recipient</div>
                      <div className="font-medium">{selectedTest.__raw?.recipient_number || selectedTest.recipient_number || '—'}</div>
                      <div className="text-xs text-muted-foreground">{selectedTest.__raw?.recipient_location_detail?.name || ''} — {selectedTest.__raw?.recipient_location_detail?.state_display || ''}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>
                      <div className="text-xs">Originator network</div>
                      <div className="font-medium text-foreground">{selectedTest.mno || selectedTest.__raw?.originator_network}</div>
                    </div>
                    <div>
                      <div className="text-xs">Recipient network</div>
                      <div className="font-medium text-foreground">{selectedTest.__raw?.recipient_network || selectedTest.recipient_network}</div>
                    </div>
                    <div>
                      <div className="text-xs">Service</div>
                      <div className="font-medium text-foreground">{selectedTest.service || selectedTest.type}</div>
                    </div>
                    <div>
                      <div className="text-xs">Status</div>
                      <div className="font-medium text-foreground">{selectedTest.status || selectedTest.result}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>
                      <div className="text-xs">Time of call</div>
                      <div className="font-medium text-foreground">{selectedTest.timestamp ? new Date(selectedTest.timestamp).toLocaleString() : (selectedTest.__raw?.time_of_call ? new Date(selectedTest.__raw.time_of_call).toLocaleString() : 'N/A')}</div>
                    </div>
                    <div>
                      <div className="text-xs">Duration / Setup</div>
                      <div className="font-medium text-foreground">{(selectedTest.duration || selectedTest.__raw?.duration) ? `${selectedTest.duration || selectedTest.__raw?.duration} ${typeof selectedTest.duration === 'string' ? '' : 's'}` : 'N/A'} {selectedTest.callSetupTime ? ` / ${selectedTest.callSetupTime}s` : ''}</div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-xs text-muted-foreground">Raw payload</div>
                    <pre className="max-h-48 overflow-auto p-2 bg-muted rounded text-xs">{(() => {
                      const raw = selectedTest?.__raw || selectedTest || {}
                      try {
                        const s = JSON.stringify(raw, null, 2)
                        // Truncate long payloads for performance
                        return s.length > 2000 ? s.slice(0, 2000) + '\n…(truncated)' : s
                      } catch {
                        return String(raw)
                      }
                    })()}</pre>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No test selected</div>
              )}

              <DialogFooter>
                <DialogClose className="inline-flex items-center px-3 py-1 rounded-md bg-accent text-accent-foreground">Close</DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Card>
  )
}
