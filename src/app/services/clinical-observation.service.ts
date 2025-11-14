import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ClinicalObservation,
  CreateObservationDto,
  UpdateObservationDto,
  ObservationFilters,
  PaginatedObservationsResponse
} from '../models/clinical-observation.model';

@Injectable({
  providedIn: 'root'
})
export class ClinicalObservationService {
  private apiUrl = 'https://synapse-backend--0000001.wonderfulforest-e77213bb.brazilsouth.azurecontainerapps.io/api/observations';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ✅ ENDPOINT FUNCIONAL - Crear/actualizar observación (comportamiento upsert)
  createObservation(observation: CreateObservationDto): Observable<any> {
    console.log('🔄 Creando/actualizando observación (upsert):', observation);

    // ✅ El backend obtiene el therapistId del token JWT automáticamente
    // ✅ Comportamiento upsert: una observación por terapeuta/sesión
    const observationPayload = {
      sessionId: observation.sessionId,
      patientId: observation.patientId,
      content: observation.content,
      sessionDate: observation.sessionDate
      // ✅ NO enviar therapistId - se obtiene del token JWT
    };

    console.log('✅ Payload enviado (upsert automático):', observationPayload);

    return this.http.post<any>(
      this.apiUrl,
      observationPayload,
      { headers: this.getHeaders() }
    );
  }

  // ✅ ENDPOINT FUNCIONAL - Actualizar observación específica con control de versiones
  updateObservation(id: string, observation: UpdateObservationDto): Observable<ClinicalObservation> {
    console.log('🔄 Actualizando observación con control de versiones:', id, observation);
    return this.http.put<ClinicalObservation>(
      `${this.apiUrl}/${id}`,
      observation,
      { headers: this.getHeaders() }
    );
  }

  // ✅ ENDPOINT FUNCIONAL - Obtener observaciones de una sesión
  getObservationsBySession(sessionId: string): Observable<ClinicalObservation[]> {
    console.log('🔄 Obteniendo observaciones de sesión:', sessionId);
    return this.http.get<ClinicalObservation[]>(
      `${this.apiUrl}/session/${sessionId}`,
      { headers: this.getHeaders() }
    );
  }

  // Obtener observaciones por paciente (paginado)
  getObservationsByPatient(
    patientId: number,
    filters: ObservationFilters = {}
  ): Observable<PaginatedObservationsResponse> {
    let params = new HttpParams();

    if (filters.page) {
      params = params.append('page', filters.page.toString());
    }

    if (filters.limit) {
      params = params.append('limit', filters.limit.toString());
    }

    if (filters.sortBy) {
      params = params.append('sortBy', filters.sortBy);
    }

    if (filters.sortOrder) {
      params = params.append('sortOrder', filters.sortOrder);
    }

    return this.http.get<PaginatedObservationsResponse>(
      `${this.apiUrl}/patient/${patientId}`,
      {
        headers: this.getHeaders(),
        params: params
      }
    );
  }

  // Eliminar observación (soft delete)
  deleteObservation(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  // ✅ FUNCIONALIDAD NUEVA - Auto-guardado con validación
  autoSaveObservation(sessionId: string, patientId: number, content: string): Observable<any> {
    // Validación de caracteres (10-2000)
    if (content.length < 10) {
      throw new Error('El contenido debe tener al menos 10 caracteres');
    }
    if (content.length > 2000) {
      throw new Error('El contenido no puede exceder 2000 caracteres');
    }

    console.log('🔄 Auto-guardando observación...');

    const observation: CreateObservationDto = {
      sessionId,
      patientId,
      content,
      sessionDate: new Date().toISOString().split('T')[0] // Fecha actual
    };

    return this.createObservation(observation);
  }

  // ✅ FUNCIONALIDAD NUEVA - Validar contenido en tiempo real
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
}