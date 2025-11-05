"use client"

import { MNO_COLORS, MNO_NAMES, type AggregatedMetrics } from "@/lib/types"
import { Card } from "@/components/ui/card"

export default function KPICards({ metrics }: { metrics: Record<string, AggregatedMetrics> }) {
  const mnos = Object.values(metrics)

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Network KPIs</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {mnos.map((metric) => (
          <Card
            key={metric.mno}
            className="bg-gradient-to-br border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-md"
            style={{
              backgroundImage: `linear-gradient(135deg, ${MNO_COLORS[metric.mno]}15 0%, transparent 100%)`,
            }}
          >
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: MNO_COLORS[metric.mno] }}
                />
                <p className="text-xs font-semibold text-muted-foreground">{MNO_NAMES[metric.mno]}</p>
              </div>

              <div className="mb-3">
                <span className="text-2xl font-bold text-foreground">{metric.successRate.toFixed(1)}%</span>
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </div>

              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full transition-all rounded-full"
                  style={{
                    width: `${metric.successRate}%`,
                    backgroundColor: MNO_COLORS[metric.mno],
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div>
                  <span className="text-muted-foreground block">Tests</span>
                  <span className="font-bold text-foreground">{metric.totalAttempts}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Pass</span>
                  <span className="font-bold text-green-500">{metric.totalSuccesses}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
