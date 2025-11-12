"use client"

import { useState, useEffect } from 'react'

type Props = {
  onChange: (startDate: string | null, endDate: string | null) => void
}

function formatDateInput(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default function DashboardFilters({ onChange }: Props) {
  const today = new Date()
  const [start, setStart] = useState<string | null>(formatDateInput(new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)))
  const [end, setEnd] = useState<string | null>(formatDateInput(today))

  useEffect(() => {
    onChange(start, end)
  }, [start, end])

  return (
    <div className="flex items-center gap-1 bg-muted/10 p-1 rounded">
      <div className="flex items-center gap-1 bg-background border border-border rounded px-1 py-0.5">
        <input value={start ?? ''} onChange={(e) => setStart(e.target.value || null)} type="date" className="text-xs p-0.5 bg-transparent outline-none w-24" />
        <span className="text-xs text-muted-foreground">—</span>
        <input value={end ?? ''} onChange={(e) => setEnd(e.target.value || null)} type="date" className="text-xs p-0.5 bg-transparent outline-none w-24" />
      </div>
    </div>
  )
}
