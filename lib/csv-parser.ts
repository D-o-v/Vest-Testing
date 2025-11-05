import type { TestRecord, MNO, ServiceType, AggregatedMetrics, StateMetrics } from "./types"

export function parseCSV(csvContent: string): TestRecord[] {
  const lines = csvContent.split("\n").filter((line) => line.trim())
  const records: TestRecord[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    const parts = line.split(",").map((p) => p.trim())

    // Handle CSV structure: skip empty initial columns
    const data = parts.filter(Boolean)
    if (data.length < 10) continue

    try {
      const record: TestRecord = {
        testCaseDescription: data[0],
        originatorNumber: data[1],
        originatorLocation: data[2],
        originatorNetwork: data[3] as MNO,
        originatorServiceType: data[4],
        recipientNumber: data[5],
        recipientLocation: data[6],
        recipientNetwork: data[8] as MNO,
        recipientServiceType: data[9],
        service: data[15]?.toUpperCase() as ServiceType,
        timestamp: data[16],
        duration: data[17],
        callSetupTime: data[18],
        status: data[19],
        failureCause: data[20],
        dataSpeed: data[21],
      }

      // Only include records with valid MNOs and timestamps
      if (isValidMNO(record.originatorNetwork) && record.timestamp) {
        records.push(record)
      }
    } catch (e) {
      // Skip malformed rows
      continue
    }
  }

  return records
}

function isValidMNO(mno: any): mno is MNO {
  return ["MTN", "GLO", "AIRTEL", "T2"].includes(mno)
}

export function aggregateMetricsByMNO(records: TestRecord[]): Record<MNO, AggregatedMetrics> {
  const mnos: MNO[] = ["MTN", "GLO", "AIRTEL", "T2"]
  const metrics: Record<MNO, AggregatedMetrics> = {
    MTN: createEmptyMetric("MTN"),
    GLO: createEmptyMetric("GLO"),
    AIRTEL: createEmptyMetric("AIRTEL"),
    T2: createEmptyMetric("T2"),
  }

  records.forEach((record) => {
    const mno = record.originatorNetwork
    if (!isValidMNO(mno)) return

    metrics[mno].totalAttempts++

    const isSuccess = record.status === "Success" || record.status?.includes("DELIVERED")
    if (isSuccess) {
      metrics[mno].totalSuccesses++
    } else {
      metrics[mno].totalFailures++
    }

    // Parse duration and setup time
    if (record.callSetupTime && record.callSetupTime !== "-") {
      const setupTime = Number.parseFloat(record.callSetupTime)
      if (!isNaN(setupTime)) {
        metrics[mno].avgCallSetupTime =
          (metrics[mno].avgCallSetupTime * (metrics[mno].totalAttempts - 1) + setupTime) / metrics[mno].totalAttempts
      }
    }
  })

  // Calculate rates
  Object.keys(metrics).forEach((mno) => {
    const m = metrics[mno as MNO]
    m.successRate = m.totalAttempts > 0 ? (m.totalSuccesses / m.totalAttempts) * 100 : 0
    m.failureRate = m.totalAttempts > 0 ? (m.totalFailures / m.totalAttempts) * 100 : 0
  })

  return metrics
}

export function aggregateMetricsByState(records: TestRecord[]): StateMetrics[] {
  const stateMap = new Map<string, StateMetrics>()

  records.forEach((record) => {
    const key = `${record.originatorLocation}-${record.originatorNetwork}-${record.service}`

    if (!stateMap.has(key)) {
      stateMap.set(key, {
        state: record.originatorLocation,
        mno: record.originatorNetwork,
        serviceType: record.service,
        attempts: 0,
        successes: 0,
        failures: 0,
        successRate: 0,
      })
    }

    const metrics = stateMap.get(key)!
    metrics.attempts++

    const isSuccess = record.status === "Success" || record.status?.includes("DELIVERED")
    if (isSuccess) {
      metrics.successes++
    } else {
      metrics.failures++
    }

    metrics.successRate = (metrics.successes / metrics.attempts) * 100
  })

  return Array.from(stateMap.values())
}

function createEmptyMetric(mno: MNO): AggregatedMetrics {
  return {
    mno,
    totalAttempts: 0,
    totalSuccesses: 0,
    totalFailures: 0,
    successRate: 0,
    failureRate: 0,
    avgDuration: 0,
    avgCallSetupTime: 0,
  }
}
