"use client"

import { useState } from "react"
import type { TestRecord } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface ReportTableProps {
  records: TestRecord[]
}

const ITEMS_PER_PAGE = 10

export default function ReportTable({ records }: ReportTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRecord, setSelectedRecord] = useState<TestRecord | null>(null)
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
                  <tr 
                    key={idx} 
                    className="border-b border-border hover:bg-blue-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedRecord(record)}
                  >
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
      
      {/* Test Detail Modal */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Test Case:</strong> {selectedRecord.testCaseDescription}</div>
              <div><strong>Service:</strong> {selectedRecord.service}</div>
              <div><strong>Originator:</strong> {selectedRecord.originatorNumber}</div>
              <div><strong>Recipient:</strong> {selectedRecord.recipientNumber}</div>
              <div><strong>Origin Network:</strong> {selectedRecord.originatorNetwork}</div>
              <div><strong>Recipient Network:</strong> {selectedRecord.recipientNetwork}</div>
              <div><strong>Origin Location:</strong> {selectedRecord.originatorLocation}</div>
              <div><strong>Recipient Location:</strong> {selectedRecord.recipientLocation}</div>
              <div><strong>Status:</strong> {selectedRecord.status}</div>
              <div><strong>Duration:</strong> {selectedRecord.duration || 'N/A'}</div>
              <div><strong>Call Setup Time:</strong> {selectedRecord.callSetupTime || 'N/A'}</div>
              <div><strong>Timestamp:</strong> {new Date(selectedRecord.timestamp).toLocaleString()}</div>
              {selectedRecord.failureCause && <div className="col-span-2"><strong>Failure Cause:</strong> {selectedRecord.failureCause}</div>}
              {selectedRecord.dataSpeed && <div><strong>Data Speed:</strong> {selectedRecord.dataSpeed}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
