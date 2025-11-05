"use client"

import type { TestRecord } from "@/lib/types"
import { Card } from "@/components/ui/card"

interface ReportTableProps {
  records: TestRecord[]
}

export default function ReportTable({ records }: ReportTableProps) {
  return (
    <Card className="bg-card border-border">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Test Records ({records.length})</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-foreground font-semibold">Date/Time</th>
                <th className="text-left px-4 py-3 text-foreground font-semibold">MNO</th>
                <th className="text-left px-4 py-3 text-foreground font-semibold">Service</th>
                <th className="text-left px-4 py-3 text-foreground font-semibold">Origin</th>
                <th className="text-left px-4 py-3 text-foreground font-semibold">Destination</th>
                <th className="text-left px-4 py-3 text-foreground font-semibold">Status</th>
                <th className="text-left px-4 py-3 text-foreground font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No records found
                  </td>
                </tr>
              ) : (
                records.map((record, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-muted/50 transition">
                    <td className="px-4 py-3 text-foreground">{new Date(record.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3 text-foreground font-medium">{record.originatorNetwork}</td>
                    <td className="px-4 py-3 text-foreground">{record.service}</td>
                    <td className="px-4 py-3 text-muted-foreground">{record.originatorLocation}</td>
                    <td className="px-4 py-3 text-muted-foreground">{record.recipientLocation}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          record.status === "Success" || record.status?.includes("DELIVERED")
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground">{record.duration}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  )
}
