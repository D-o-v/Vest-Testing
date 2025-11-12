import { useAuth } from '@/lib/hooks/use-auth';
import { useTheme } from '@/components/theme-provider';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { BarChart3, LayoutDashboard, Menu, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Dashboard from '@/components/dashboard';
import Reports from '@/components/reports';
import { LoginPage } from '@/components/auth/login-page';
import { AuthGuard } from '@/components/auth/auth-guard';
import testingService from '@/lib/services/testing-service';
import type { TestRecord } from '@/lib/types';
import { useState, useEffect } from 'react';

export default function App() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [csvData, setCsvData] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch records from backend and build CSV for export/reporting features
    let mounted = true
    testingService.getRecords({ page_size: 1000 })
      .then((res: any) => {
        if (!mounted) return
        const records = (Array.isArray(res) ? res : (res?.results ?? [])) as TestRecord[]
        const headers = [
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
    ];

        const rows = records.map((r) => [
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
    ]);

        setCsvData([headers, ...rows].map((row) => row.join(',')).join('\n'))
      })
      .catch((err) => {
        console.error('Failed to fetch records for CSV', err)
        // leave csvData as empty string
      })
      .finally(() => { /* nothing */ })
    return () => { mounted = false }
  }, []);

  return (
    <div className="min-h-screen">
      {isAuthenticated && (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="flex h-14 items-center px-4">
            <Button
              variant="ghost"
              className="mr-2"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex flex-1 items-center justify-between">
              <h2 className="text-lg font-semibold">VeSS Testing Console</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                >
                  {theme === 'light' ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </Button>
                <Button variant="outline" onClick={logout}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {isAuthenticated && (
        <div className={`fixed top-14 left-0 bottom-0 w-48 border-r bg-background/95 backdrop-blur transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto py-3">
              <nav className="grid items-start px-3 text-sm font-medium gap-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-9 px-3"
                  onClick={() => navigate('/dashboard')}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-9 px-3"
                  onClick={() => navigate('/reports')}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Reports
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}

      <main className={`pt-14 ${isAuthenticated ? (sidebarOpen ? 'pl-48' : 'pl-0') : ''} transition-[padding] duration-200 ease-in-out`}>
        <div className="p-6">
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />
          } />
          <Route path="/dashboard" element={
            <AuthGuard>
              <Dashboard csvData={csvData} />
            </AuthGuard>
          } />
          <Route path="/reports" element={
            <AuthGuard>
              <Reports csvData={csvData} />
            </AuthGuard>
          } />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
        </div>
      </main>
    </div>
  );
}