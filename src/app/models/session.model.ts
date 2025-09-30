// src/app/models/session.model.ts
export interface Session {
  idSession: string;
  sessionDate: string;
  description: string;
  patientId: number;
  patientName?: string;
  estado?: string | null;
}

export interface CreateSessionDto {
  sessionDate: string;
  description: string;
  patientId: number;
}
