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

  // friendly UI state for which preset is active
  const [activePreset, setActivePreset] = useState<'today' | '7' | '30' | 'all' | null>(null)

  useEffect(() => {
    onChange(start, end)
    // compute active preset automatically when dates change
    const now = formatDateInput(new Date())
    if (start === now && end === now) setActivePreset('today')
    else if (start && end && start === formatDateInput(new Date(new Date(end).getTime() - 6 * 24 * 60 * 60 * 1000))) setActivePreset('7')
    else if (start && end && start === formatDateInput(new Date(new Date(end).getTime() - 29 * 24 * 60 * 60 * 1000))) setActivePreset('30')
    else if (start == null && end == null) setActivePreset('all')
    else setActivePreset(null)
  }, [start, end])

  const applyPreset = (preset: 'today' | '7' | '30' | 'all') => {
    const now = new Date()
    if (preset === 'today') {
      const d = formatDateInput(now)
      setStart(d); setEnd(d)
      setActivePreset('today')
      return
    }
    if (preset === '7') {
      setStart(formatDateInput(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)))
      setEnd(formatDateInput(now))
      setActivePreset('7')
      return
    }
    if (preset === '30') {
      setStart(formatDateInput(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000)))
      setEnd(formatDateInput(now))
      setActivePreset('30')
      return
    }
    // all
    setStart(null); setEnd(null)
    setActivePreset('all')
  }

  return (
    <div className="flex items-center gap-4 bg-muted/10 p-2 rounded-lg">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => applyPreset('today')}
          className={`text-xs px-3 py-1 rounded-md transition-colors ${activePreset === 'today' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}>
          Today
        </button>
        <button
          type="button"
          onClick={() => applyPreset('7')}
          className={`text-xs px-3 py-1 rounded-md transition-colors ${activePreset === '7' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}>
          7d
        </button>
        <button
          type="button"
          onClick={() => applyPreset('30')}
          className={`text-xs px-3 py-1 rounded-md transition-colors ${activePreset === '30' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}>
          30d
        </button>
        <button
          type="button"
          onClick={() => applyPreset('all')}
          className={`text-xs px-3 py-1 rounded-md transition-colors ${activePreset === 'all' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}>
          All
        </button>
      </div>

      <div className="flex items-center gap-2 bg-background border border-border rounded-md px-2 py-1">
        <input value={start ?? ''} onChange={(e) => setStart(e.target.value || null)} type="date" className="text-sm p-1 bg-transparent outline-none" />
        <span className="text-sm text-muted-foreground">—</span>
        <input value={end ?? ''} onChange={(e) => setEnd(e.target.value || null)} type="date" className="text-sm p-1 bg-transparent outline-none" />
      </div>
    </div>
  )
}
