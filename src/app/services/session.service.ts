import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Session, CreateSessionDto, SessionFilters, FilteredSessionsResponse } from '../models/session.model';
import { MonitoringService } from './monitoring.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private apiUrl = 'https://synapse-backend--0000001.wonderfulforest-e77213bb.brazilsouth.azurecontainerapps.io/api/sessions';

  constructor(
    private http: HttpClient,
    private monitoringService: MonitoringService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('Token usado en sessions:', token ? token.substring(0, 20) + '...' : 'NO HAY TOKEN');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // SIN userId - el backend lo obtiene del token
  getSessionsByPatient(patientId: number): Observable<Session[]> {
    return this.http.get<Session[]>(
      `${this.apiUrl}/patient/${patientId}`,
      { headers: this.getHeaders() }
    );
  }

  // SIN userId en la URL
  createSession(session: CreateSessionDto): Observable<Session> {
    console.log('Creando sesión con datos:', session);
    return this.http.post<Session>(
      this.apiUrl,
      session,
      { headers: this.getHeaders() }
    );
  }

  getSession(id: string): Observable<Session> {
    return this.http.get<Session>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  deleteSession(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  deleteSessionComplete(sessionId: string): Observable<void> {
    return this.monitoringService.getMonitoringRecordsBySession(sessionId).pipe(
      switchMap(monitoringRecords => {
        if (monitoringRecords.length === 0) {
          return this.deleteSession(sessionId);
        }

        const deleteObservables = monitoringRecords.map(record =>
          this.monitoringService.deleteMonitoringRecord(record.id!)
        );

        return forkJoin(deleteObservables).pipe(
          switchMap(() => this.deleteSession(sessionId))
        );
      })
    );
  }

  // NUEVOS MÉTODOS AGREGADOS

  // Obtener sesiones con filtros avanzados
  getFilteredSessions(patientId: number, filters: SessionFilters): Observable<FilteredSessionsResponse> {
    let params = new HttpParams();
    
    if (filters.exposureLevel && filters.exposureLevel.length > 0) {
      filters.exposureLevel.forEach(level => {
        params = params.append('exposureLevel', level);
      });
    }
    
    if (filters.dateFrom) {
      params = params.append('dateFrom', filters.dateFrom);
    }
    
    if (filters.dateTo) {
      params = params.append('dateTo', filters.dateTo);
    }
    
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

    return this.http.get<FilteredSessionsResponse>(
      `${this.apiUrl}/patient/${patientId}/filtered`,
      { 
        headers: this.getHeaders(),
        params: params
      }
    );
  }

  // Obtener sesión de hoy para un paciente
  getTodaySession(patientId: number): Observable<Session> {
    return this.http.get<Session>(
      `${this.apiUrl}/patient/${patientId}/today`,
      { headers: this.getHeaders() }
    );
  }

  // Obtener última sesión de un paciente
  getLatestSession(patientId: number): Observable<Session> {
    return this.http.get<Session>(
      `${this.apiUrl}/patient/${patientId}/latest`,
      { headers: this.getHeaders() }
    );
  }

  // Obtener sesiones para el calendario
  getCalendarSessions(startDate?: string, endDate?: string): Observable<any[]> {
    let params = new HttpParams();
    
    if (startDate) {
      params = params.append('startDate', startDate);
    }
    
    if (endDate) {
      params = params.append('endDate', endDate);
    }

    return this.http.get<any[]>(
      `${this.apiUrl}/calendar`,
      { 
        headers: this.getHeaders(),
        params: params
      }
    );
  }

  // ✅ NUEVO MÉTODO - Actualizar sesión existente
  updateSession(sessionId: string, updateData: UpdateSessionRequest): Observable<Session> {
    console.log('🔄 Actualizando sesión:', sessionId, updateData);
    return this.http.put<Session>(
      `${this.apiUrl}/${sessionId}`,
      updateData,
      { headers: this.getHeaders() }
    );
  }
}



// ✅ NUEVA INTERFAZ - Request para actualizar sesión
export interface UpdateSessionRequest {
  sessionDate?: string;  // Formato: 'YYYY-MM-DD'
  description?: string;  // Nueva descripción/nombre de la sesión
}
