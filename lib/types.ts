export type MNO = "MTN" | "GLO" | "AIRTEL" | "T2"
export type ServiceType = "Voice" | "SMS" | "Data"

export interface TestRecord {
  testCaseDescription: string
  originatorNumber: string
  originatorLocation: string
  originatorNetwork: MNO
  originatorServiceType: string
  recipientNumber: string
  recipientLocation: string
  recipientNetwork: MNO
  recipientServiceType: string
  service: ServiceType
  timestamp: string
  duration: string
  callSetupTime: string
  status: "Success" | "Failed" | "SUBMITTED" | "SUBMITTED AND DELIVERED"
  failureCause: string
  dataSpeed: string
}

export interface AggregatedMetrics {
  mno: MNO
  totalAttempts: number
  totalSuccesses: number
  totalFailures: number
  successRate: number
  failureRate: number
  avgDuration: number
  avgCallSetupTime: number
}

export interface StateMetrics {
  state: string
  mno: MNO
  serviceType: ServiceType
  attempts: number
  successes: number
  failures: number
  successRate: number
}

export interface DashboardData {
  timestamp: Date
  metrics: Record<MNO, AggregatedMetrics>
  stateMetrics: StateMetrics[]
  recentTests: TestRecord[]
}

export const MNO_COLORS: Record<MNO, string> = {
  MTN: "#ffd700",
  GLO: "#ff6b00",
  AIRTEL: "#e20000",
  T2: "#00d4ff",
}

export const MNO_NAMES: Record<MNO, string> = {
  MTN: "MTN",
  GLO: "Glo",
  AIRTEL: "Airtel",
  T2: "9Mobile",
}
