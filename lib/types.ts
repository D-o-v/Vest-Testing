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
  MTN: "#fcd116", // MTN Yellow
  GLO: "#50b848", // Glo Green
  AIRTEL: "#ff0000", // Airtel Red
  T2: "#ff6b01", // T2/T2 Orange
}

export const MNO_NAMES: Record<MNO, string> = {
  MTN: "MTN",
  GLO: "Glo",
  AIRTEL: "Airtel",
  T2: "T2",
}
