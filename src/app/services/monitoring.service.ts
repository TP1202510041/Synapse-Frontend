import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HeartRate } from '../models/heartrate.model';

// Interfaz para la respuesta del backend (GET)
export interface MonitoringRecordResponse {
  monitoringId: string;
  sessionId: string;
  patientId: number;
  patientName: string;
  userId: number;
  startTime: number;
  endTime: number;
  startTimeLocal: number;
  endTimeLocal: number;
  duration: number;
  totalRecords: number;
  avgHeartRate: number;
  minHeartRate: number;
  maxHeartRate: number;
  mongoDocumentId: string | null;
  createdAt: string;
}

// Interfaz para usar en el frontend (con heartRateRecords)
export interface MonitoringRecord {
  id?: string; // Mapeado desde monitoringId
  monitoringId?: string;
  sessionId: string;
  patientId: number;
  patientName?: string;
  userId?: number;
  startTime: number;
  endTime: number;
  startTimeLocal: number;
  endTimeLocal: number;
  duration: number;
  totalRecords: number;
  avgHeartRate: number;
  minHeartRate: number;
  maxHeartRate: number;
  heartRateRecords?: HeartRate[]; // Opcional porque el backend no lo devuelve en GET
  mongoDocumentId?: string | null;
  createdAt?: string;
}

// DTO para crear un nuevo registro (POST)
export interface CreateMonitoringDto {
  sessionId: string;
  patientId: number;
  startTime: number;
  endTime: number;
  startTimeLocal: number;
  endTimeLocal: number;
  duration: number;
  totalRecords: number;
  avgHeartRate: number;
  minHeartRate: number;
  maxHeartRate: number;
  heartRateRecords: HeartRate[];
}

@Injectable({
  providedIn: 'root'
})
export class MonitoringService {
  private apiUrl = 'http://localhost:5000/api/monitoring';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Convierte la respuesta del backend al formato usado en el frontend
   */
  private mapResponseToRecord(response: MonitoringRecordResponse): MonitoringRecord {
    return {
      id: response.monitoringId,
      monitoringId: response.monitoringId,
      sessionId: response.sessionId,
      patientId: response.patientId,
      patientName: response.patientName,
      userId: response.userId,
      startTime: response.startTime,
      endTime: response.endTime,
      startTimeLocal: response.startTimeLocal,
      endTimeLocal: response.endTimeLocal,
      duration: response.duration,
      totalRecords: response.totalRecords,
      avgHeartRate: response.avgHeartRate,
      minHeartRate: response.minHeartRate,
      maxHeartRate: response.maxHeartRate,
      mongoDocumentId: response.mongoDocumentId,
      createdAt: response.createdAt,
      heartRateRecords: [] // El backend no devuelve los registros detallados en GET
    };
  }

  /**
   * Crea un nuevo registro de monitoreo
   */
  createMonitoringRecord(record: CreateMonitoringDto): Observable<MonitoringRecord> {
    console.log('📤 Guardando registro de monitoreo:', record);
    console.log('📤 URL completa:', this.apiUrl);
    console.log('📤 Headers:', this.getHeaders());
    
    return this.http.post<MonitoringRecordResponse>(
      this.apiUrl,
      record,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        console.log('✅ Respuesta del servidor:', response);
        return this.mapResponseToRecord(response);
      })
    );
  }

  /**
   * Obtiene todos los registros de monitoreo del usuario actual
   */
  getMonitoringRecordsByUser(): Observable<MonitoringRecord[]> {
    return this.http.get<MonitoringRecordResponse[]>(
      `${this.apiUrl}/user`,
      { headers: this.getHeaders() }
    ).pipe(
      map(responses => responses.map(r => this.mapResponseToRecord(r)))
    );
  }

  /**
   * Obtiene todos los registros de monitoreo de una sesión específica
   */
  getMonitoringRecordsBySession(sessionId: string): Observable<MonitoringRecord[]> {
    console.log('🔄 Solicitando registros de monitoreo para sesión:', sessionId);
    console.log('🔄 URL completa:', `${this.apiUrl}/session/${sessionId}`);
    console.log('🔄 Headers:', this.getHeaders());
    
    return this.http.get<MonitoringRecordResponse[]>(
      `${this.apiUrl}/session/${sessionId}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(responses => {
        console.log('📥 Registros recibidos del servidor:', responses);
        return responses.map(r => this.mapResponseToRecord(r));
      })
    );
  }

  /**
   * Obtiene un registro de monitoreo específico por ID
   * NOTA: El backend espera monitoringId (UUID) como parámetro
   */
  getMonitoringRecord(monitoringId: string): Observable<MonitoringRecord> {
    return this.http.get<MonitoringRecordResponse>(
      `${this.apiUrl}/${monitoringId}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => this.mapResponseToRecord(response))
    );
  }

  /**
   * Elimina un registro de monitoreo
   * NOTA: El backend espera monitoringId (UUID) como parámetro
   */
  deleteMonitoringRecord(monitoringId: string): Observable<void> {
    console.log('🗑️ Eliminando registro:', monitoringId);
    return this.http.delete<void>(
      `${this.apiUrl}/${monitoringId}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * NOTA IMPORTANTE: El backend NO devuelve heartRateRecords en los endpoints GET.
   * Si necesitas los registros detallados de frecuencia cardíaca, tendrás que:
   *
   * 1. Obtenerlos del mongoDocumentId si está disponible
   * 2. Almacenarlos localmente cuando creas el registro
   * 3. Solicitarlos desde un endpoint separado en MongoDB
   *
   * Por ahora, heartRateRecords estará vacío en los registros obtenidos del servidor.
   */
}
