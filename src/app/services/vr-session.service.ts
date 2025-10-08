import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VrSession, CreateVrSessionDto, VrSessionFilters } from '../models/vr-session.model';

@Injectable({
  providedIn: 'root'
})
export class VrSessionService {
  private apiUrl = 'http://localhost:5000/api/sessions/vr';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Crear nueva sesión VR
  createVrSession(vrSession: CreateVrSessionDto): Observable<VrSession> {
    console.log('Creando sesión VR:', vrSession);
    return this.http.post<VrSession>(
      this.apiUrl,
      vrSession,
      { headers: this.getHeaders() }
    );
  }

  // Obtener historial VR de un paciente
  getVrSessionsByPatient(patientId: number, filters: VrSessionFilters = {}): Observable<VrSession[]> {
    let params = new HttpParams();
    
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

    return this.http.get<VrSession[]>(
      `${this.apiUrl}/patient/${patientId}`,
      { 
        headers: this.getHeaders(),
        params: params
      }
    );
  }

  // Obtener sesiones VR por escenario
  getVrSessionsByScenario(scenario: string, filters: VrSessionFilters = {}): Observable<VrSession[]> {
    let params = new HttpParams();
    
    if (filters.dateFrom) {
      params = params.append('dateFrom', filters.dateFrom);
    }
    
    if (filters.dateTo) {
      params = params.append('dateTo', filters.dateTo);
    }

    return this.http.get<VrSession[]>(
      `${this.apiUrl}/scenario/${scenario}`,
      { 
        headers: this.getHeaders(),
        params: params
      }
    );
  }

  // Obtener sesiones VR por dispositivo
  getVrSessionsByDevice(device: string, filters: VrSessionFilters = {}): Observable<VrSession[]> {
    let params = new HttpParams();
    
    if (filters.dateFrom) {
      params = params.append('dateFrom', filters.dateFrom);
    }
    
    if (filters.dateTo) {
      params = params.append('dateTo', filters.dateTo);
    }

    return this.http.get<VrSession[]>(
      `${this.apiUrl}/device/${device}`,
      { 
        headers: this.getHeaders(),
        params: params
      }
    );
  }
}