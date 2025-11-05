"use client"

import type { TestRecord } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { useMemo } from "react"

export default function RecentTests({ records }: { records: TestRecord[] }) {
  const recentTests = useMemo(() => {
    return records.slice(-8).reverse()
  }, [records])

  return (
    <Card className="bg-card border-border">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Tests</h2>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {recentTests.map((test, idx) => (
            <div key={idx} className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition">
              <div className="flex items-start justify-between mb-1">
                <span className="text-sm font-semibold text-foreground">{test.originatorNetwork}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    test.status === "Success" || test.status?.includes("DELIVERED")
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {test.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {test.originatorLocation} → {test.recipientLocation}
              </p>
              <p className="text-xs text-muted-foreground">{new Date(test.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
