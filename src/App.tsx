import React, { useEffect, useState } from 'react'
import { useTheme } from '../components/theme-provider'
import { BarChart3, LayoutDashboard, Menu, Moon, Sun } from 'lucide-react'
import Dashboard from '@components/dashboard'
import Reports from '@components/reports'
import { generateDummyData } from '@lib/dummy-data'
import type { TestRecord } from '@lib/types'

function generateCSVFromData(): string {
  const records = generateDummyData()
  const headers = [
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'testCaseDescription',
    'Originator Number',
    'Originator Location',
    'Originator Network',
    'Originator Service Type',
    'Recipient Number',
    'Recipient Location',
    'Recipient Network',
    'Recipient Service Type',
    'Service',
    'Timestamp',
    'Duration',
    'Call Setup Time',
    'Status',
    'Failure Cause',
    'Data Speed',
  ]

  const rows = records.map((r: TestRecord) => [
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    r.testCaseDescription,
    r.originatorNumber,
    r.originatorLocation,
    r.originatorNetwork,
    r.originatorServiceType,
    r.recipientNumber,
    r.recipientLocation,
    r.recipientNetwork,
    r.recipientServiceType,
    r.service,
    r.timestamp,
    r.duration,
    r.callSetupTime,
    r.status,
    r.failureCause,
    r.dataSpeed,
  ])

  return [headers, ...rows].map((row) => row.join(',')).join('\n')
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'reports'>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [csvData, setCSVData] = useState<string>('')
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    const dummyCSV = generateCSVFromData()
    setCSVData(dummyCSV)
  }, [])

  return (
    <div className={`font-sans antialiased`}>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} bg-card border-r border-border transition-all duration-300 flex flex-col shadow-sm`}>
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              {sidebarOpen && (
                <div className="flex flex-col justify-center">
                  <span className="font-bold text-foreground text-sm">VeSS Testing</span>
                  <span className="text-xs text-muted-foreground">Analytics Dashboard</span>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 py-2 px-2">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md transition text-sm ${
                currentPage === 'dashboard'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              {sidebarOpen && <span>Dashboard</span>}
            </button>

            <button
              onClick={() => setCurrentPage('reports')}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md transition text-sm mt-1 ${
                currentPage === 'reports'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              {sidebarOpen && <span>Reports</span>}
            </button>
          </nav>

          <div className="border-t border-border p-2">
            {sidebarOpen && mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-foreground hover:bg-muted transition"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center px-3 py-1.5 hover:bg-muted rounded-md transition mt-1"
            >
              <Menu className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 max-w-7xl mx-auto w-full dashboard-grid">
            {currentPage === 'dashboard' && csvData && <Dashboard csvData={csvData} />}
            {currentPage === 'reports' && csvData && <Reports csvData={csvData} />}
            {!csvData && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="mb-3 inline-block p-3 bg-primary/10 rounded-lg surface-smooth">
                    <BarChart3 className="w-10 h-10 text-primary mx-auto" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-1">Loading dashboard...</h2>
                  <p className="text-sm text-muted-foreground">Initializing with sample data</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
