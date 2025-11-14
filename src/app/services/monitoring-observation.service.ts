import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MonitoringObservation {
  id: string;
  monitoringId: string;
  patientId: number;
  therapistId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  therapistName: string;
  patientName: string;
  monitoringInfo: {
    duration: number;
    avgHeartRate: number;
    maxHeartRate: number;
    minHeartRate: number;
    totalRecords: number;
    monitoringCreatedAt: string;
  };
}

export interface MonitoringObservationRequest {
  monitoringId: string;
  patientId: number;
  content: string;
  observationDate?: string;
}

export interface MonitoringObservationResponse {
  success: boolean;
  message: string;
  data: MonitoringObservation | MonitoringObservation[];
  count?: number;
}

export interface PaginatedMonitoringObservations {
  success: boolean;
  message: string;
  data: {
    observations: MonitoringObservation[];
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class MonitoringObservationService {
  private apiUrl = 'https://synapse-backend--0000001.wonderfulforest-e77213bb.brazilsouth.azurecontainerapps.io/api/monitoring-observations';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ✅ ENDPOINT FUNCIONAL - Crear observación de monitoreo
  createObservation(data: MonitoringObservationRequest): Observable<MonitoringObservationResponse> {
    console.log('🔄 Creando observación de monitoreo:', data);
    return this.http.post<MonitoringObservationResponse>(
      this.apiUrl,
      data,
      { headers: this.getHeaders() }
    );
  }

  // ✅ ENDPOINT FUNCIONAL - Obtener observaciones por ID de monitoreo
  getByMonitoring(monitoringId: string): Observable<MonitoringObservationResponse> {
    console.log('🔄 Obteniendo observaciones de monitoreo:', monitoringId);
    return this.http.get<MonitoringObservationResponse>(
      `${this.apiUrl}/monitoring/${monitoringId}`,
      { headers: this.getHeaders() }
    );
  }

  // ✅ ENDPOINT FUNCIONAL - Obtener observaciones por paciente (paginado)
  getByPatient(
    patientId: number, 
    page = 1, 
    limit = 10, 
    sortBy = 'createdAt', 
    sortOrder = 'desc'
  ): Observable<PaginatedMonitoringObservations> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder
    });

    console.log('🔄 Obteniendo observaciones de monitoreo del paciente:', patientId);
    return this.http.get<PaginatedMonitoringObservations>(
      `${this.apiUrl}/patient/${patientId}?${params}`,
      { headers: this.getHeaders() }
    );
  }

  // ✅ ENDPOINT FUNCIONAL - Obtener observaciones del terapeuta actual
  getByTherapist(): Observable<MonitoringObservationResponse> {
    console.log('🔄 Obteniendo observaciones de monitoreo del terapeuta');
    return this.http.get<MonitoringObservationResponse>(
      `${this.apiUrl}/therapist`,
      { headers: this.getHeaders() }
    );
  }

  // ✅ ENDPOINT FUNCIONAL - Actualizar observación existente
  updateObservation(
    observationId: string, 
    data: MonitoringObservationRequest
  ): Observable<MonitoringObservationResponse> {
    console.log('🔄 Actualizando observación de monitoreo:', observationId);
    return this.http.put<MonitoringObservationResponse>(
      `${this.apiUrl}/${observationId}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  // ✅ ENDPOINT FUNCIONAL - Eliminar observación (soft delete)
  deleteObservation(observationId: string): Observable<MonitoringObservationResponse> {
    console.log('🔄 Eliminando observación de monitoreo:', observationId);
    return this.http.delete<MonitoringObservationResponse>(
      `${this.apiUrl}/${observationId}`,
      { headers: this.getHeaders() }
    );
  }

  // ✅ FUNCIONALIDAD NUEVA - Validar contenido de observación
  validateContent(content: string): { valid: boolean; message: string; charCount: number } {
    const charCount = content.length;
    
    if (charCount < 10) {
      return {
        valid: false,
        message: `Faltan ${10 - charCount} caracteres (mínimo 10)`,
        charCount
      };
    }
    
    if (charCount > 2000) {
      return {
        valid: false,
        message: `Excede por ${charCount - 2000} caracteres (máximo 2000)`,
        charCount
      };
    }
    
    return {
      valid: true,
      message: 'Contenido válido',
      charCount
    };
  }

  // ✅ FUNCIONALIDAD NUEVA - Crear datos de prueba (solo para desarrollo)
  createTestData(): Observable<MonitoringObservationResponse> {
    console.log('🔄 Creando datos de prueba de observaciones de monitoreo');
    return this.http.post<MonitoringObservationResponse>(
      'https://synapse-backend--0000001.wonderfulforest-e77213bb.brazilsouth.azurecontainerapps.io/api/test-data/create-monitoring-observations',
      {},
      { headers: this.getHeaders() }
    );
  }
}