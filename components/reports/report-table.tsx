"use client"

import { useMemo } from "react"
import { useNavigate } from 'react-router-dom'
import type { TestRecord } from "@/lib/types"
import { Card } from "@/components/ui/card"

interface ReportTableProps {
  records: TestRecord[]
}

export default function ReportTable({ records }: ReportTableProps) {
  const navigate = useNavigate()

  const groups = useMemo(() => {
    const map: Record<string, TestRecord[]> = {}
    records.forEach((r) => {
      const key = r.service || ''
      if (!map[key]) map[key] = []
      map[key].push(r)
    })
    return map
  }, [records])

  const groupKeys = Object.keys(groups)

  const getStatusClass = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-700 border border-gray-200"
    const s = status.toLowerCase()
    if (s.includes("success") || s.includes("delivered")) return "bg-green-100 text-green-700 border border-green-200"
    if (s.includes("failed") || s.includes("error")) return "bg-red-100 text-red-700 border border-red-200"
    return "bg-blue-100 text-blue-700 border border-blue-200"
  }

  return (
    <Card className="bg-card border-border">
      <div className="p-4">
        <h3 className="text-base font-semibold text-foreground mb-3">Test Records ({records.length})</h3>

        <div className="space-y-4 overflow-x-auto">
          {groupKeys.length === 0 ? (
            <div className="px-2 py-6 text-center text-muted-foreground text-sm">No records found</div>
          ) : (
            groupKeys.map((serviceKey) => {
              const items = groups[serviceKey]
              const successCount = items.filter(i => (i.status || '').toLowerCase().includes('success') || (i.status || '').toLowerCase().includes('delivered')).length
              const failCount = items.length - successCount
              const successRate = items.length ? Math.round((successCount / items.length) * 100) : 0

              return (
                <div key={serviceKey} className="border border-border rounded">
                  <div
                    className="flex items-center justify-between p-3 bg-muted/20 cursor-pointer"
                    onClick={() => navigate(`/reports/service/${encodeURIComponent(serviceKey)}`)}
                  >
                    <div className="flex items-center gap-4">
                      <h4 className="font-semibold">{serviceKey || 'Data/URL Tests'}</h4>
                      <div className="text-sm text-muted-foreground">{items.length} tests</div>
                    </div>
                    <div className="text-sm text-muted-foreground">Success: {successCount} • Failed: {failCount} • {successRate}%</div>
                  </div>

                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-2 py-2 text-xs font-medium uppercase tracking-wide">Date/Time</th>
                        <th className="text-left px-2 py-2 text-xs font-medium uppercase tracking-wide">MNO</th>
                        <th className="text-left px-2 py-2 text-xs font-medium uppercase tracking-wide">Origin</th>
                        <th className="text-left px-2 py-2 text-xs font-medium uppercase tracking-wide">Destination</th>
                        <th className="text-left px-2 py-2 text-xs font-medium uppercase tracking-wide">Status</th>
                        <th className="text-left px-2 py-2 text-xs font-medium uppercase tracking-wide">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((record, idx) => (
                        <tr key={record.id || idx} className="border-b border-border hover:bg-blue-50 transition-colors">
                          <td className="px-2 py-2 text-xs">{new Date(record.timestamp).toLocaleDateString()} {new Date(record.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</td>
                          <td className="px-2 py-2 text-xs font-medium">{record.originatorNetwork}</td>
                          <td className="px-2 py-2 text-xs text-muted-foreground">{record.originatorLocation}</td>
                          <td className="px-2 py-2 text-xs text-muted-foreground">{record.recipientLocation}</td>
                          <td className="px-2 py-2">
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getStatusClass(record.status)}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-xs">{record.duration || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })
          )}
        </div>
      </div>
    </Card>
  )
}
