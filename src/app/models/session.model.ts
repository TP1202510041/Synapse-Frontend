// src/app/models/session.model.ts
export interface Session {
  idSession: string;
  sessionDate: string;
  description: string;
  patientId: number;
  userId: number;
  patientName?: string;
  estado?: string | null;
  // NUEVOS CAMPOS AGREGADOS
  exposureLevel?: 'BAJO' | 'MEDIO' | 'ALTO' | 'MUY_ALTO';
  duration?: number;
  status?: string;
}

export interface CreateSessionDto {
  sessionDate: string;
  description: string;
  patientId: number;
  exposureLevel?: 'BAJO' | 'MEDIO' | 'ALTO' | 'MUY_ALTO';
  duration?: number;
  status?: string;
}

export interface SessionFilters {
  exposureLevel?: string[];
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilteredSessionsResponse {
  sessions: Session[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    exposureLevel?: string[];
    dateRange?: string;
  };
}
