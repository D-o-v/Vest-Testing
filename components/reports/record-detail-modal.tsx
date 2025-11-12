"use client"

import { TestRecord } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, FileText, FileSpreadsheet, Image, Copy, ExternalLink } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface RecordDetailModalProps {
  record: TestRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function RecordDetailModal({ record, open, onOpenChange }: RecordDetailModalProps) {
  if (!record) return null

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportRecordAsCSV = () => {
    const headers = ["Field", "Value"]
    const rows = [
      ["ID", record.id || ""],
      ["Test Case", record.testCaseDescription],
      ["Service", record.service],
      ["Originator Number", record.originatorNumber],
      ["Originator Location", record.originatorLocation],
      ["Originator Network", record.originatorNetwork],
      ["Recipient Number", record.recipientNumber || ""],
      ["Recipient Location", record.recipientLocation || ""],
      ["Recipient Network", record.recipientNetwork || ""],
      ["Status", record.status],
      ["Duration", record.duration || ""],
      ["Call Setup Time", record.callSetupTime || ""],
      ["Data Speed", record.dataSpeed || ""],
      ["URL", record.url || ""],
      ["URL Redirect", record.urlRedirect || ""],
      ["Timestamp", record.timestamp],
      ["Failure Cause", record.failureCause || ""]
    ]
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `test-record-${record.id || 'details'}.csv`
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const exportRecordAsPDF = () => {
    window.print()
  }

  const exportRecordAsImage = () => {
    alert('Image export feature coming soon')
  }

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase()
    if (lowerStatus.includes('success') || lowerStatus.includes('delivered')) {
      return "bg-green-100 text-green-700 border-green-200"
    }
    if (lowerStatus.includes('failed') || lowerStatus.includes('error')) {
      return "bg-red-100 text-red-700 border-red-200"
    }
    if (lowerStatus.includes('submitted')) {
      return "bg-blue-100 text-blue-700 border-blue-200"
    }
    return "bg-gray-100 text-gray-700 border-gray-200"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">Test Record Details</DialogTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportRecordAsCSV}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportRecordAsPDF}>
                <FileText className="w-4 h-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportRecordAsImage}>
                <Image className="w-4 h-4 mr-2" />
                Export as Image
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="p-4 bg-white border">
            <h3 className="text-lg font-medium mb-4 text-blue-600">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Test Case Description</label>
                <div className="flex items-center gap-2">
                  <p className="text-sm bg-gray-50 p-2 rounded border flex-1">{record.testCaseDescription}</p>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(record.testCaseDescription)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Service Type</label>
                <p className="text-sm bg-gray-50 p-2 rounded border">{record.service || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Status</label>
                <span className={`inline-block px-3 py-1 rounded text-sm font-medium border ${getStatusColor(record.status)}`}>
                  {record.status}
                </span>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Timestamp</label>
                <p className="text-sm bg-gray-50 p-2 rounded border">{new Date(record.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </Card>

          {/* Network Information */}
          <Card className="p-4 bg-white border">
            <h3 className="text-lg font-medium mb-4 text-blue-600">Network Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Originator</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Number</label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm bg-gray-50 p-2 rounded border flex-1">{record.originatorNumber}</p>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(record.originatorNumber)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Location</label>
                    <p className="text-sm bg-gray-50 p-2 rounded border">{record.originatorLocation}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Network</label>
                    <p className="text-sm bg-gray-50 p-2 rounded border font-medium">{record.originatorNetwork}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Recipient</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Number</label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm bg-gray-50 p-2 rounded border flex-1">{record.recipientNumber || 'N/A'}</p>
                      {record.recipientNumber && (
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(record.recipientNumber)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Location</label>
                    <p className="text-sm bg-gray-50 p-2 rounded border">{record.recipientLocation || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Network</label>
                    <p className="text-sm bg-gray-50 p-2 rounded border font-medium">{record.recipientNetwork || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Performance Metrics */}
          <Card className="p-4 bg-white border">
            <h3 className="text-lg font-medium mb-4 text-blue-600">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Duration</label>
                <p className="text-sm bg-gray-50 p-2 rounded border">{record.duration ? `${record.duration}s` : 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Call Setup Time</label>
                <p className="text-sm bg-gray-50 p-2 rounded border">{record.callSetupTime ? `${record.callSetupTime}s` : 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Data Speed</label>
                <p className="text-sm bg-gray-50 p-2 rounded border">{record.dataSpeed || 'N/A'}</p>
              </div>
            </div>
          </Card>

          {/* Additional Information */}
          {(record.url || record.urlRedirect || record.failureCause) && (
            <Card className="p-4 bg-white border">
              <h3 className="text-lg font-medium mb-4 text-blue-600">Additional Information</h3>
              <div className="space-y-4">
                {record.url && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">URL</label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm bg-gray-50 p-2 rounded border flex-1">{record.url}</p>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(record.url!)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => window.open(record.url, '_blank')}>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
                {record.urlRedirect && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">URL Redirect</label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm bg-gray-50 p-2 rounded border flex-1">{record.urlRedirect}</p>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(record.urlRedirect!)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => window.open(record.urlRedirect, '_blank')}>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
                {record.failureCause && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Failure Cause</label>
                    <p className="text-sm bg-red-50 p-2 rounded border border-red-200 text-red-700">{record.failureCause}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}