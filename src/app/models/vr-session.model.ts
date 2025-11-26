export interface VrSession {
  sessionId: string;
  sessionDate: string;
  description: string;
  exposureLevel: string;
  duration: number;
  status: string;
  patientId: number;
  patientName: string;
  vrSessionId: string;
  vrScenario: string;
  vrDevice: string;
  immersionDuration: number;
  movementTrackingData: string;
  environmentSettings: string;
}

export interface CreateVrSessionDto {
  patientId: number;
  sessionDate: string;
  description: string;
  vrScenario: string;
  vrDevice?: string;
  immersionDuration?: number;
  exposureLevel?: string;
  movementTrackingData?: string;
  environmentSettings?: string;
}

export interface VrSessionFilters {
  scenario?: string;
  device?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}