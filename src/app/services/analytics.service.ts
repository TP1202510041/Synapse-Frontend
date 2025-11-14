import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  ProgressAnalytics, 
  PatientMetrics, 
  CompareSessionsRequest 
} from '../models/analytics.model';

// ✅ NUEVAS INTERFACES PARA ANALYTICS DE SESIÓN INDIVIDUAL
export interface SessionAnalytics {
  sessionId: string;
  date: string;
  avgBPM: number;
  maxBPM: number;
  duration: number;
  exposureLevel: string;
  observations?: string;
}

export interface SessionTrends {
  bpmTrend: 'improving' | 'stable' | 'worsening';
  exposureTrend: 'progressing' | 'stable' | 'regressing';
  bpmReduction: number;
}

export interface SessionAnalyticsResponse {
  sessions: SessionAnalytics[];
  trends: SessionTrends;
}

// ✅ NUEVAS INTERFACES PARA COMPARACIÓN DE SESIONES
export interface SessionComparisonRequest {
  session1Id: string;
  session2Id: string;
}

export interface SessionComparisonResponse {
  session1: SessionData;
  session2: SessionData;
  comparison: ComparisonAnalysis;
}

export interface SessionData {
  sessionId: string;
  sessionDate: string;
  description: string;
  exposureLevel: string;
  patientId: number;
  patientName: string;
  monitoring: MonitoringData;
  observations: string[];
}

export interface MonitoringData {
  duration: number;
  avgHeartRate: number;
  maxHeartRate: number;
  minHeartRate: number;
  totalRecords: number;
  heartRateVariability: number;
  avgBPM: number;
  maxBPM: number;
  recoveryTime: number;
}

export interface ComparisonAnalysis {
  heartRate: HeartRateComparison;
  duration: DurationComparison;
  performance: PerformanceComparison;
  overallImprovement: string;
  insights: string[];
}

export interface HeartRateComparison {
  avgDifference: number;
  maxDifference: number;
  avgTrend: 'IMPROVED' | 'WORSENED' | 'STABLE';
  maxTrend: 'IMPROVED' | 'WORSENED' | 'STABLE';
  improvementPercentage: number;
}

export interface DurationComparison {
  difference: number;
  trend: 'LONGER' | 'SHORTER' | 'SAME';
  improvementPercentage: number;
}

export interface PerformanceComparison {
  overallTrend: 'IMPROVED' | 'WORSENED' | 'STABLE';
  stabilityImprovement: number;
  recordsComparison: number;
  enduranceImprovement: 'SIGNIFICANT' | 'MODERATE' | 'MINIMAL';
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = 'https://synapse-backend--0000001.wonderfulforest-e77213bb.brazilsouth.azurecontainerapps.io/api/analytics';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ✅ NUEVO ENDPOINT FUNCIONAL - Analytics de sesión específica
  getSessionAnalytics(sessionId: string): Observable<SessionAnalyticsResponse> {
    console.log('🔄 Obteniendo analytics de sesión individual:', sessionId);
    return this.http.get<SessionAnalyticsResponse>(
      `${this.apiUrl}/session/${sessionId}/analytics`,
      { headers: this.getHeaders() }
    );
  }

  // ✅ ENDPOINT ALTERNATIVO - Analytics por POST
  getSessionAnalyticsByPost(sessionId: string): Observable<SessionAnalyticsResponse> {
    console.log('🔄 Obteniendo analytics por POST para sesión:', sessionId);
    return this.http.post<SessionAnalyticsResponse>(
      `${this.apiUrl}/session-analytics`,
      { sessionId },
      { headers: this.getHeaders() }
    );
  }

  // ✅ ENDPOINT FUNCIONAL - Obtener progreso terapéutico del paciente
  getPatientProgress(patientId: number): Observable<ProgressAnalytics> {
    console.log('🔄 Obteniendo progreso del paciente:', patientId);
    return this.http.get<ProgressAnalytics>(
      `${this.apiUrl}/patient/${patientId}/progress`,
      { headers: this.getHeaders() }
    );
  }

  // ✅ ENDPOINT FUNCIONAL - Comparar sesiones (requiere mínimo 2 sesiones)
  compareSessions(sessionIds: string[]): Observable<any> {
    console.log('🔄 Comparando sesiones:', sessionIds);
    
    // Validación frontend para mínimo 2 sesiones
    if (sessionIds.length < 2) {
      throw new Error('Se requieren al menos 2 sesiones para comparar');
    }
    
    const request: CompareSessionsRequest = { sessionIds };
    return this.http.post<any>(
      `${this.apiUrl}/compare-sessions`,
      request,
      { headers: this.getHeaders() }
    );
  }

  // ✅ ENDPOINT FUNCIONAL - Obtener métricas agregadas del paciente
  getPatientMetrics(patientId: number): Observable<PatientMetrics> {
    console.log('🔄 Obteniendo métricas del paciente:', patientId);
    return this.http.get<PatientMetrics>(
      `${this.apiUrl}/patient/${patientId}/metrics`,
      { headers: this.getHeaders() }
    );
  }

  // ✅ NUEVO ENDPOINT - Comparar dos sesiones específicas
  compareSessionsDetailed(session1Id: string, session2Id: string): Observable<SessionComparisonResponse> {
    console.log('🔄 Comparando sesiones detalladamente:', session1Id, 'vs', session2Id);
    
    const request: SessionComparisonRequest = {
      session1Id,
      session2Id
    };

    return this.http.post<any>(
      `${this.apiUrl}/sessions/compare`,
      request,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data || response)
    );
  }
}