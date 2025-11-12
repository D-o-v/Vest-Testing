"use client"

import { useState } from "react"
import type { TestRecord } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ReportTableProps {
  records: TestRecord[]
}

const ITEMS_PER_PAGE = 10

export default function ReportTable({ records }: ReportTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedRecords = records.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  return (
    <Card className="bg-card border-border">
      <div className="p-4">
        <h3 className="text-base font-semibold text-foreground mb-3">Test Records ({records.length})</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-2 py-2 text-xs font-medium uppercase tracking-wide">Date/Time</th>
                <th className="text-left px-2 py-2 text-xs font-medium uppercase tracking-wide">MNO</th>
                <th className="text-left px-2 py-2 text-xs font-medium uppercase tracking-wide">Service</th>
                <th className="text-left px-2 py-2 text-xs font-medium uppercase tracking-wide">Origin</th>
                <th className="text-left px-2 py-2 text-xs font-medium uppercase tracking-wide">Destination</th>
                <th className="text-left px-2 py-2 text-xs font-medium uppercase tracking-wide">Status</th>
                <th className="text-left px-2 py-2 text-xs font-medium uppercase tracking-wide">Duration</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-2 py-6 text-center text-muted-foreground text-sm">
                    No records found
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-2 py-2 text-xs">{new Date(record.timestamp).toLocaleDateString()} {new Date(record.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</td>
                    <td className="px-2 py-2 text-xs font-medium">{record.originatorNetwork}</td>
                    <td className="px-2 py-2 text-xs">{record.service}</td>
                    <td className="px-2 py-2 text-xs text-muted-foreground">{record.originatorLocation}</td>
                    <td className="px-2 py-2 text-xs text-muted-foreground">{record.recipientLocation}</td>
                    <td className="px-2 py-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          record.status === "Success" || record.status?.includes("DELIVERED") || record.status?.includes("delivered")
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-xs">{record.duration || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t bg-muted/20">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, records.length)} of {records.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-7 px-2 text-xs"
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-7 px-2 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
