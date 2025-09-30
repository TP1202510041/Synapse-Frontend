import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../services/session.service';
import { MonitoringService, MonitoringRecord } from '../../services/monitoring.service';
import { PatientService } from '../../services/patient.service';
import { Session } from '../../models/session.model';
import { HeartRate } from '../../models/heartrate.model';
import { Patient } from '../../models/patient.model';

interface SessionAnalytics {
  totalMonitoringSessions: number;
  totalDuration: number;
  totalRecords: number;
  avgHeartRateOverall: number;
  minHeartRateOverall: number;
  maxHeartRateOverall: number;
  mostRecentMonitoring?: MonitoringRecord;
  longestSession?: MonitoringRecord;
  healthStatus: 'normal' | 'attention' | 'concern';
  trends: {
    avgTrend: 'stable' | 'increasing' | 'decreasing';
    sessionsThisWeek: number;
  };
}

interface TimeAnalysis {
  morningRecords: HeartRate[];
  afternoonRecords: HeartRate[];
  eveningRecords: HeartRate[];
  avgByTimeOfDay: {
    morning: number;
    afternoon: number;
    evening: number;
  };
}

interface MonitoringRecordWithDetails extends MonitoringRecord {
  showDetails?: boolean;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {
  sessionId!: string;
  session!: Session;
  patient!: Patient;
  patientName = '';
  monitoringRecords: MonitoringRecordWithDetails[] = [];
  analytics!: SessionAnalytics;
  timeAnalysis!: TimeAnalysis;
  loading = true;
  error = '';
  now: Date = new Date();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService,
    private monitoringService: MonitoringService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.sessionId = params.get('id') || '';
      this.loadSessionData();
    });

    this.route.queryParams.subscribe(params => {
      if (params['name']) {
        this.patientName = params['name'];
      }
    });

    setInterval(() => {
      this.now = new Date();
    }, 1000);
  }

  // ========== FUNCIONES DE FECHA/HORA ==========

  convertUTCToPeruTimestamp(utcTimestamp: number): number {
    return utcTimestamp - (5 * 60 * 60 * 1000);
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    });
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC'
    });
  }

  formatTimeForRecord(hr: HeartRate): string {
    if (hr.localTimestamp) {
      return this.formatTime(hr.localTimestamp);
    }
    const timestamp = this.getTimestampForAnalysis(hr);
    const peruTimestamp = this.convertUTCToPeruTimestamp(timestamp);
    return this.formatTime(peruTimestamp);
  }

  getPeruHour(hr: HeartRate): number {
    let timestamp: number;
    if (hr.localTimestamp) {
      timestamp = hr.localTimestamp;
      return new Date(timestamp).getUTCHours();
    } else {
      const utcTimestamp = this.getTimestampForAnalysis(hr);
      timestamp = this.convertUTCToPeruTimestamp(utcTimestamp);
      return new Date(timestamp).getUTCHours();
    }
  }

  // ========== FUNCIONES DE CARGA DE DATOS ==========

  loadSessionData(): void {
    this.loading = true;
    this.error = '';

    this.sessionService.getSession(this.sessionId).subscribe({
      next: (session) => {
        this.session = session;
        this.loadPatientData(session.patientId.toString());
        this.loadMonitoringData();
      },
      error: (err) => {
        this.error = 'Error al cargar la sesión';
        this.loading = false;
        console.error('Error loading session:', err);
      }
    });
  }

  loadPatientData(patientId: string): void {
    if (!patientId) {
      console.error('ID de paciente no proporcionado');
      this.patientName = 'Paciente desconocido';
      return;
    }

    const patientIdNumber = Number(patientId);

    if (isNaN(patientIdNumber)) {
      console.error('ID de paciente inválido:', patientId);
      this.patientName = 'Paciente desconocido';
      return;
    }

    this.patientService.getPatient(patientIdNumber).subscribe({
      next: (patient) => {
        this.patient = patient;
        this.patientName = patient?.patientName || `Paciente ${patientId}`;
      },
      error: (err) => {
        console.error('Error loading patient data:', err);
        this.patientName = this.route.snapshot.queryParams['name'] || `Paciente ${patientId}`;
      }
    });
  }

  loadMonitoringData(): void {
    this.monitoringService.getMonitoringRecordsBySession(this.sessionId).subscribe({
      next: (records) => {
        console.log('✅ Registros cargados:', records);

        this.monitoringRecords = records
          .map(record => ({ ...record, showDetails: false }))
          .sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            const timestampA = new Date(a.createdAt).getTime();
            const timestampB = new Date(b.createdAt).getTime();
            return timestampB - timestampA;
          });

        // NOTA: heartRateRecords estará vacío porque el backend no lo devuelve
        console.log('⚠️ NOTA: Los registros detallados (heartRateRecords) no están disponibles desde el backend');

        this.calculateAnalytics();
        this.calculateTimeAnalysisFromSummary();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los datos de monitoreo';
        this.loading = false;
        console.error('Error loading monitoring data:', err);
      }
    });
  }

  // ========== FUNCIONES DE ANÁLISIS ==========

  calculateAnalytics(): void {
    if (this.monitoringRecords.length === 0) {
      this.analytics = {
        totalMonitoringSessions: 0,
        totalDuration: 0,
        totalRecords: 0,
        avgHeartRateOverall: 0,
        minHeartRateOverall: 0,
        maxHeartRateOverall: 0,
        healthStatus: 'normal',
        trends: {
          avgTrend: 'stable',
          sessionsThisWeek: 0
        }
      };
      return;
    }

    const totalRecords = this.monitoringRecords.reduce((sum, r) => sum + r.totalRecords, 0);
    const totalDuration = this.monitoringRecords.reduce((sum, r) => sum + r.duration, 0);

    // Usar los valores agregados del backend en lugar de iterar sobre heartRateRecords
    const avgRates = this.monitoringRecords.map(r => r.avgHeartRate);
    const minRates = this.monitoringRecords.map(r => r.minHeartRate);
    const maxRates = this.monitoringRecords.map(r => r.maxHeartRate);

    const avgOverall = avgRates.length > 0 ?
      Math.round(avgRates.reduce((sum, rate) => sum + rate, 0) / avgRates.length) : 0;

    const avgTrend = this.calculateTrend();

    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const sessionsThisWeek = this.monitoringRecords.filter(record => {
      if (!record.createdAt) return false;
      const recordTimestamp = new Date(record.createdAt).getTime();
      return recordTimestamp > oneWeekAgo;
    }).length;

    this.analytics = {
      totalMonitoringSessions: this.monitoringRecords.length,
      totalDuration,
      totalRecords,
      avgHeartRateOverall: avgOverall,
      minHeartRateOverall: minRates.length > 0 ? Math.min(...minRates) : 0,
      maxHeartRateOverall: maxRates.length > 0 ? Math.max(...maxRates) : 0,
      mostRecentMonitoring: this.monitoringRecords[0],
      longestSession: this.monitoringRecords.reduce((longest, current) =>
        current.duration > longest.duration ? current : longest
      ),
      healthStatus: this.determineHealthStatus(avgOverall),
      trends: {
        avgTrend,
        sessionsThisWeek
      }
    };
  }

  /**
   * Análisis temporal simplificado basado en startTimeLocal
   * Como no tenemos heartRateRecords detallados, usamos los timestamps de inicio
   */
  calculateTimeAnalysisFromSummary(): void {
    const morningRecords: MonitoringRecord[] = [];
    const afternoonRecords: MonitoringRecord[] = [];
    const eveningRecords: MonitoringRecord[] = [];

    this.monitoringRecords.forEach(record => {
      const hour = new Date(record.startTimeLocal).getUTCHours();

      if (hour >= 6 && hour < 12) {
        morningRecords.push(record);
      } else if (hour >= 12 && hour < 18) {
        afternoonRecords.push(record);
      } else {
        eveningRecords.push(record);
      }
    });

    const calculateAvg = (records: MonitoringRecord[]) => {
      if (records.length === 0) return 0;
      return Math.round(records.reduce((sum, r) => sum + r.avgHeartRate, 0) / records.length);
    };

    // Crear registros dummy para mantener compatibilidad con la interfaz
    this.timeAnalysis = {
      morningRecords: [],
      afternoonRecords: [],
      eveningRecords: [],
      avgByTimeOfDay: {
        morning: calculateAvg(morningRecords),
        afternoon: calculateAvg(afternoonRecords),
        evening: calculateAvg(eveningRecords)
      }
    };

    console.log('✅ Análisis temporal (basado en resúmenes):', {
      morning: { count: morningRecords.length, avg: this.timeAnalysis.avgByTimeOfDay.morning },
      afternoon: { count: afternoonRecords.length, avg: this.timeAnalysis.avgByTimeOfDay.afternoon },
      evening: { count: eveningRecords.length, avg: this.timeAnalysis.avgByTimeOfDay.evening }
    });
  }

  private getTimestampForAnalysis(hr: HeartRate): number {
    if (hr.localTimestamp) return hr.localTimestamp;
    if (hr.recordedAt) return hr.recordedAt;
    if (hr.syncTimestamp) return hr.syncTimestamp;
    console.warn('No se encontró timestamp válido para el registro:', hr);
    return Date.now();
  }

  calculateTrend(): 'stable' | 'increasing' | 'decreasing' {
    if (this.monitoringRecords.length < 2) return 'stable';

    const recentRecords = this.monitoringRecords.slice(0, 3);
    const avgRates = recentRecords.map(r => r.avgHeartRate || 0);

    const firstHalf = avgRates.slice(0, Math.ceil(avgRates.length / 2));
    const secondHalf = avgRates.slice(Math.ceil(avgRates.length / 2));

    const firstAvg = firstHalf.reduce((sum, rate) => sum + rate, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, rate) => sum + rate, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;

    if (Math.abs(difference) < 5) return 'stable';
    return difference > 0 ? 'increasing' : 'decreasing';
  }

  // ========== FUNCIONES DE UTILIDAD ==========

  determineHealthStatus(avgRate: number): 'normal' | 'attention' | 'concern' {
    if (avgRate >= 60 && avgRate <= 100) return 'normal';
    if ((avgRate >= 50 && avgRate < 60) || (avgRate > 100 && avgRate <= 120)) return 'attention';
    return 'concern';
  }

  getHealthStatusText(): string {
    switch (this.analytics.healthStatus) {
      case 'normal': return 'Normal';
      case 'attention': return 'Requiere atención';
      case 'concern': return 'Preocupante';
      default: return 'Sin datos';
    }
  }

  getHealthStatusColor(): string {
    switch (this.analytics.healthStatus) {
      case 'normal': return '#10b981';
      case 'attention': return '#f59e0b';
      case 'concern': return '#ef4444';
      default: return '#6b7280';
    }
  }

  getTrendIcon(): string {
    switch (this.analytics.trends.avgTrend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      default: return '📊';
    }
  }

  getTrendText(): string {
    switch (this.analytics.trends.avgTrend) {
      case 'increasing': return 'Tendencia al alza';
      case 'decreasing': return 'Tendencia a la baja';
      default: return 'Estable';
    }
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  }

  // ========== FUNCIONES DE NAVEGACIÓN Y ACCIONES ==========

  goBack(): void {
    this.router.navigate(['/paciente', this.session.patientId, 'sesiones'], {
      queryParams: { name: this.patientName }
    });
  }

  deleteMonitoringRecord(recordId: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este registro de monitoreo?')) {
      this.monitoringService.deleteMonitoringRecord(recordId).subscribe({
        next: () => {
          console.log('✅ Registro eliminado');
          this.loadMonitoringData();
        },
        error: (err) => {
          console.error('Error deleting monitoring record:', err);
          alert('Error al eliminar el registro');
        }
      });
    }
  }
}
