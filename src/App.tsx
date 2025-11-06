import React, { useEffect, useState } from 'react'
import { useTheme } from '../components/theme-provider'
import { BarChart3, LayoutDashboard, Menu, Moon, Sun, ChevronLeft, ChevronRight } from 'lucide-react'
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
    <div className="font-sans antialiased">
      <div className="flex flex-col h-screen bg-background">
        {/* Header */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 sticky top-0 z-50">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col justify-center">
              <span className="font-bold text-foreground text-lg">VeSS Testing</span>
              <span className="text-xs text-muted-foreground hidden sm:block">Analytics Dashboard</span>
            </div>
          </div>

          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 hover:bg-muted rounded-md transition-colors flex items-center gap-2 text-sm"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4" />
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  <span className="hidden sm:inline">Dark Mode</span>
                </>
              )}
            </button>
          )}
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - hidden on mobile by default */}
          <aside 
            className={`
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
              ${sidebarOpen ? 'lg:w-56' : 'lg:w-16'} 
              fixed lg:static top-14 bottom-0 w-56 bg-card border-r border-border 
              transition-all duration-300 transform flex flex-col shadow-sm z-40
            `}
          >
            {/* Sidebar Header - collapse button */}
            <div className="border-b border-border p-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex w-full items-center justify-center px-3 py-1.5 hover:bg-muted rounded-md transition-colors"
                title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                {sidebarOpen ? (
                  <ChevronLeft className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                )}
              </button>
            </div>

            <nav className="flex-1 py-3 px-2 space-y-2">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm group relative ${
                  currentPage === 'dashboard'
                    ? 'bg-primary/10 text-primary border border-primary/20 font-medium shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent'
                }`}
                title={!sidebarOpen ? "Dashboard" : undefined}
              >
                <LayoutDashboard className={`w-4 h-4 ${!sidebarOpen ? 'group-hover:scale-110 transition-transform' : ''}`} />
                {sidebarOpen && <span>Dashboard</span>}
                {currentPage === 'dashboard' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />}
              </button>

              <button
                onClick={() => setCurrentPage('reports')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm group relative ${
                  currentPage === 'reports'
                    ? 'bg-primary/10 text-primary border border-primary/20 font-medium shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent'
                }`}
                title={!sidebarOpen ? "Reports" : undefined}
              >
                <BarChart3 className={`w-4 h-4 ${!sidebarOpen ? 'group-hover:scale-110 transition-transform' : ''}`} />
                {sidebarOpen && <span>Reports</span>}
                {currentPage === 'reports' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />}
              </button>
            </nav>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/40 lg:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto relative">
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
    </div>
  )
}
