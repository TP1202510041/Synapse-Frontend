import { Injectable } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import { SessionService } from './session.service';
import { ClinicalObservationService } from './clinical-observation.service';
import { VrSessionService } from './vr-session.service';
import { Session, SessionFilters } from '../models/session.model';
import { ClinicalObservation } from '../models/clinical-observation.model';
import { VrSession } from '../models/vr-session.model';

export interface EnhancedSession extends Session {
  observations?: ClinicalObservation[];
  vrData?: VrSession;
  hasObservations: boolean;
  hasVrData: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SessionUtilsService {

  constructor(
    private sessionService: SessionService,
    private observationService: ClinicalObservationService,
    private vrSessionService: VrSessionService
  ) {}

  // Obtener sesión con datos enriquecidos
  getEnhancedSession(sessionId: string): Observable<EnhancedSession> {
    return combineLatest([
      this.sessionService.getSession(sessionId),
      this.observationService.getObservationsBySession(sessionId)
    ]).pipe(
      map(([session, observations]) => {
        const enhancedSession: EnhancedSession = {
          ...session,
          observations,
          hasObservations: observations.length > 0,
          hasVrData: false
        };
        return enhancedSession;
      })
    );
  }

  // Obtener sesiones con filtros predefinidos
  getRecentSessions(patientId: number, days: number = 30): Observable<Session[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const filters: SessionFilters = {
      dateFrom: this.formatDate(startDate),
      dateTo: this.formatDate(endDate),
      sortBy: 'sessionDate',
      sortOrder: 'desc',
      limit: 10
    };

    return this.sessionService.getFilteredSessions(patientId, filters).pipe(
      map(response => response.sessions)
    );
  }

  // Obtener sesiones por nivel de exposición
  getSessionsByExposureLevel(
    patientId: number, 
    exposureLevels: string[]
  ): Observable<Session[]> {
    const filters: SessionFilters = {
      exposureLevel: exposureLevels,
      sortBy: 'sessionDate',
      sortOrder: 'desc'
    };

    return this.sessionService.getFilteredSessions(patientId, filters).pipe(
      map(response => response.sessions)
    );
  }

  // Obtener estadísticas rápidas de sesiones
  getSessionStats(patientId: number): Observable<{
    totalSessions: number;
    avgDuration: number;
    mostCommonExposureLevel: string;
    lastSessionDate: string;
  }> {
    return this.sessionService.getSessionsByPatient(patientId).pipe(
      map(sessions => {
        if (sessions.length === 0) {
          return {
            totalSessions: 0,
            avgDuration: 0,
            mostCommonExposureLevel: 'N/A',
            lastSessionDate: 'N/A'
          };
        }

        const totalDuration = sessions.reduce((sum, session) => 
          sum + (session.duration || 0), 0
        );
        
        const avgDuration = Math.round(totalDuration / sessions.length);

        // Encontrar el nivel de exposición más común
        const exposureCounts: { [key: string]: number } = {};
        sessions.forEach(session => {
          if (session.exposureLevel) {
            exposureCounts[session.exposureLevel] = 
              (exposureCounts[session.exposureLevel] || 0) + 1;
          }
        });

        const mostCommonExposureLevel = Object.keys(exposureCounts).reduce((a, b) => 
          exposureCounts[a] > exposureCounts[b] ? a : b, 'N/A'
        );

        // Última sesión
        const sortedSessions = sessions.sort((a, b) => 
          new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
        );
        const lastSessionDate = sortedSessions[0]?.sessionDate || 'N/A';

        return {
          totalSessions: sessions.length,
          avgDuration,
          mostCommonExposureLevel,
          lastSessionDate
        };
      })
    );
  }

  // Validar datos de sesión antes de crear
  validateSessionData(sessionData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!sessionData.patientId) {
      errors.push('ID de paciente es requerido');
    }

    if (!sessionData.sessionDate) {
      errors.push('Fecha de sesión es requerida');
    } else {
      const sessionDate = new Date(sessionData.sessionDate);
      const today = new Date();
      if (sessionDate > today) {
        errors.push('La fecha de sesión no puede ser futura');
      }
    }

    if (!sessionData.description || sessionData.description.trim().length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres');
    }

    if (sessionData.duration && (sessionData.duration < 1 || sessionData.duration > 300)) {
      errors.push('La duración debe estar entre 1 y 300 minutos');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Formatear fecha para API
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Formatear fecha para mostrar
  formatDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Obtener color para nivel de exposición
  getExposureLevelColor(level: string): string {
    switch (level?.toUpperCase()) {
      case 'BAJO':
        return '#28a745';
      case 'MEDIO':
        return '#ffc107';
      case 'ALTO':
        return '#fd7e14';
      case 'MUY_ALTO':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  }

  // Obtener texto amigable para nivel de exposición
  getExposureLevelText(level: string): string {
    switch (level?.toUpperCase()) {
      case 'BAJO':
        return 'Bajo';
      case 'MEDIO':
        return 'Medio';
      case 'ALTO':
        return 'Alto';
      case 'MUY_ALTO':
        return 'Muy Alto';
      default:
        return 'No especificado';
    }
  }
}