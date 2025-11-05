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
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-card border-r border-border transition-all duration-300 flex flex-col shadow-sm`}>
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              {sidebarOpen && <span className="font-bold text-foreground text-lg">MNO Dashboard</span>}
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                currentPage === 'dashboard'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              {sidebarOpen && <span>Dashboard</span>}
            </button>

            <button
              onClick={() => setCurrentPage('reports')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                currentPage === 'reports'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              {sidebarOpen && <span>Reports</span>}
            </button>
          </nav>

          <div className="border-t border-border p-4 space-y-2">
            {sidebarOpen && mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-foreground hover:bg-muted transition"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-5 h-5" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center px-4 py-2 hover:bg-muted rounded-lg transition"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8 max-w-7xl mx-auto w-full">
            {currentPage === 'dashboard' && csvData && <Dashboard csvData={csvData} />}
            {currentPage === 'reports' && csvData && <Reports csvData={csvData} />}
            {!csvData && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="mb-4 inline-block p-4 bg-primary/10 rounded-lg">
                    <BarChart3 className="w-12 h-12 text-primary mx-auto" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Loading dashboard...</h2>
                  <p className="text-muted-foreground">Initializing with sample data</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
