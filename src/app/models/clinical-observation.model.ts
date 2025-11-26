export interface ClinicalObservation {
  id: string;
  sessionId: string;
  patientId: number;
  therapistId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  therapistName: string;
  patientName: string;
}

export interface CreateObservationDto {
  sessionId: string;
  patientId: number;
  content: string;
  sessionDate: string;
  // ❌ NO incluir therapistId - se obtiene automáticamente del token JWT
}

export interface UpdateObservationDto {
  content: string;
  version: number;
}

export interface ObservationFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedObservationsResponse {
  observations: ClinicalObservation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}