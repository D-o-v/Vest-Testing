"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import testingService from '@/lib/services/testing-service'
import ReportTable from './report-table'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import type { TestRecord } from '@/lib/types'

export default function ServiceDetail() {
  const { service } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [records, setRecords] = useState<TestRecord[]>([])
  const [loading, setLoading] = useState(false)

  const decodedService = service ? decodeURIComponent(service) : ''

  const fetchGroup = useCallback(() => {
    setLoading(true)
    let mounted = true

    const params: any = { page_size: 1000 }
    const qs = new URLSearchParams(location.search)
    const network = qs.get('network')
    const state = qs.get('state')
    const start_date = qs.get('start_date')
    const end_date = qs.get('end_date')
    if (network) params.originator_network = network
    if (state) params.originator_location = state
    if (start_date) params.start_date = start_date
    if (end_date) params.end_date = end_date

    testingService.getRecords(params)
      .then((res: any) => {
        if (!mounted) return
        let examples: any[] = []
        if (res?.services) {
          // Try to find the matching service key by comparing the displayed label
          const serviceKey = Object.keys(res.services).find((k) => ((k || 'Data/URL Tests') === decodedService)) || Object.keys(res.services).find(k => k === decodedService) || decodedService
          const groupData = res.services && (res.services[serviceKey] || res.services[decodedService] || res.services[''])
          if (groupData && groupData.examples) {
            examples = groupData.examples
          } else {
            // fallback: attempt to find by matching the display label
            const foundKey = Object.keys(res.services).find(k => (k || 'Data/URL Tests') === decodedService)
            if (foundKey && res.services[foundKey]?.examples) examples = res.services[foundKey].examples
          }
        }

        const normalize = (t: any): TestRecord => {
          const originLoc = t.originator_location_detail?.name ?? t.originator_location ?? t.originatorLocation ?? ''
          const recipLoc = t.recipient_location_detail?.name ?? t.recipient_location ?? t.recipientLocation ?? ''
          return {
            id: t.id,
            testCaseDescription: t.test_case_description ?? t.testCaseDescription ?? '',
            originatorNumber: t.originator_number ?? t.originatorNumber ?? '',
            originatorLocation: originLoc,
            originatorNetwork: (t.originator_network ?? t.originatorNetwork ?? '').toUpperCase(),
            originatorServiceType: t.originator_service_type ?? t.originatorServiceType ?? '',
            recipientNumber: t.recipient_number ?? t.recipientNumber ?? '',
            recipientLocation: recipLoc,
            recipientNetwork: (t.recipient_network ?? t.recipientNetwork ?? '').toUpperCase(),
            recipientServiceType: t.recipient_service_type ?? t.recipientServiceType ?? '',
            service: (t.service ?? t.type ?? '').toUpperCase(),
            timestamp: t.time_of_call ?? t.timestamp ?? t.created_at ?? '',
            duration: t.duration ?? '',
            callSetupTime: t.call_setup_time ?? t.callSetupTime ?? '',
            status: t.status ?? t.result ?? '',
            failureCause: t.failure_cause ?? t.failureCause ?? '',
            dataSpeed: t.data_speed ?? t.dataSpeed ?? '',
            url: t.url ?? '',
            urlRedirect: t.url_redirect ?? '',
          } as TestRecord
        }

        setRecords(examples.map(normalize))
      })
      .catch((e) => {
        const msg = e && (e as any).message ? (e as any).message : String(e)
        console.error('Failed to load service detail:', msg)
      })
      .finally(() => { if (mounted) setLoading(false) })

    return () => { mounted = false }
  }, [decodedService, location.search])

  useEffect(() => {
    fetchGroup()
  }, [fetchGroup])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div>
            <h2 className="text-xl font-semibold">Service: {decodedService || 'Data/URL Tests'}</h2>
            <p className="text-sm text-muted-foreground">Showing grouped examples for this service</p>
          </div>
        </div>
      </div>

      {loading ? (
        <Card className="p-6 text-center">Loading records...</Card>
      ) : (
        <ReportTable records={records} />
      )}
    </div>
  )
}
