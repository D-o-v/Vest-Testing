"use client"

import TestResults from "@/components/test-results"

const sampleData = {
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "b516c46f-a968-4048-b503-3a077cd5ed9a",
      "test_case_description": "IB2KAD",
      "originator_number": "2348030001235",
      "originator_location": "50d71d34-3760-48d2-b19d-10ca36f87d0d",
      "originator_location_detail": {
        "id": "50d71d34-3760-48d2-b19d-10ca36f87d0d",
        "name": "Ibadan",
        "state": "oyo",
        "state_display": "Oyo",
        "created_at": "2025-11-12T15:16:34.838156Z"
      },
      "originator_network": "MTN",
      "recipient_number": "2348023001234",
      "recipient_location": "8d104747-7d21-492e-aaef-fb9928f18ce5",
      "recipient_location_detail": {
        "id": "8d104747-7d21-492e-aaef-fb9928f18ce5",
        "name": "Kaduna",
        "state": "kaduna",
        "state_display": "Kaduna",
        "created_at": "2025-11-12T15:16:34.839604Z"
      },
      "recipient_network": "Airtel",
      "receipt_number_format": "National",
      "service": "SMS",
      "time_of_call": "2025-10-09T03:25:34.834231Z",
      "duration": null,
      "call_setup_time": null,
      "status": "submitted and delivered",
      "data_speed": "",
      "url": "",
      "url_redirect": "",
      "created_at": "2025-11-12T15:16:34.854337Z"
    }
  ]
}

export default function TestResultsDemo() {
  return (
    <div className="container mx-auto p-6">
      <TestResults data={sampleData} />
    </div>
  )
}