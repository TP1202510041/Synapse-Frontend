import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Session } from '../../models/session.model';
import { HeartRate } from '../../models/heartrate.model';
import { Subscription, interval } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SessionService } from '../../services/session.service';
import {MonitoringService, MonitoringRecord, CreateMonitoringDto} from '../../services/monitoring.service';

@Component({
  selector: 'app-realtime',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './realtime.component.html',
  styleUrls: ['./realtime.component.css'],
})
export class RealtimeComponent implements OnInit, OnDestroy {
  sessionId!: string;
  session!: Session;
  patientName = '';
  monitoring = false;
  startTime = 0; // Timestamp UTC de inicio del monitoreo
  startTimeLocal = 0; // Hora de inicio en zona horaria local para mostrar
  records: HeartRate[] = [];
  allRecords: HeartRate[] = []; // Todos los registros para debugging
  sub?: Subscription;
  monitoringDuration = 0; // Duración del monitoreo en segundos
  lastProcessedTimestamp = 0; // Timestamp del último registro procesado (en lugar de ID)

  currentTime: Date = new Date(); // Tiempo actual
  currentTimeLocal: Date = new Date(); // Tiempo actual en Perú

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private sessionService: SessionService,
    private monitoringService: MonitoringService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.sessionId = params.get('sessionId') || '';
      this.loadSession();
    });

    // Actualiza la hora actual cada segundo
    setInterval(() => {
      this.currentTime = new Date();
      this.currentTimeLocal = this.getPeruCurrentTime();

      // Actualizar duración del monitoreo si está activo
      if (this.monitoring && this.startTime > 0) {
        this.monitoringDuration = Math.floor((Date.now() - this.startTime) / 1000);
      }
    }, 1000);
  }

  /**
   * Obtiene la hora actual de Perú (UTC-5)
   */
  getPeruCurrentTime(): Date {
    const now = new Date();
    // Perú está en UTC-5 (5 horas atrás de UTC)
    const peruTime = new Date(now.getTime() - (5 * 60 * 60 * 1000));
    return peruTime;
  }

  /**
   * Convierte timestamp UTC a hora local de Perú
   */
  convertToPeruTime(timestamp: number): Date {
    const utcTime = new Date(timestamp);
    return new Date(utcTime.getTime() - (5 * 60 * 60 * 1000));
  }

  /**
   * Formatea la duración en formato HH:MM:SS
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  loadSession(): void {
    this.sessionService.getSession(this.sessionId).subscribe(s => {
      this.session = s;
      this.patientName = this.patientName; // Puedes cambiar por nombre real si lo tienes
      console.log('Sesión cargada:', this.session);
    });
  }

  startMonitoring(): void {
    this.monitoring = true;
    this.startTime = Date.now(); // Timestamp UTC para comparaciones
    this.startTimeLocal = this.getPeruCurrentTime().getTime(); // Hora local para mostrar
    this.records = [];
    this.allRecords = [];
    this.monitoringDuration = 0;
    this.lastProcessedTimestamp = this.startTime; // Usar timestamp en lugar de ID

    console.log('=== INICIANDO MONITOREO ===');
    console.log('Timestamp UTC de inicio:', this.startTime);
    console.log('Fecha/hora UTC de inicio:', new Date(this.startTime).toISOString());
    console.log('Hora local de inicio:', new Date(this.startTimeLocal).toISOString());
    console.log('Hora Perú de inicio:', this.getPeruCurrentTime().toISOString());

    // Cargar datos inmediatamente al iniciar
    this.fetchData();

    // Luego cargar cada 6 segundos
    this.sub = interval(6000).subscribe(() => this.fetchData());
  }

  /**
   * Obtiene el timestamp más relevante de un registro
   */
  private getRecordTimestamp(record: HeartRate): number {
    // Priorizar syncTimestamp, luego recordedAt, luego timestamp genérico
    return record.syncTimestamp || record.recordedAt || record.timestamp || 0;
  }

  fetchData(): void {
    console.log('=== FETCHING DATA ===');
    console.log('Timestamp inicio monitoreo:', this.startTime);
    console.log('Último timestamp procesado:', this.lastProcessedTimestamp);

    this.http.get<HeartRate[]>('https://heartrate-api.wonderfulforest-e77213bb.brazilsouth.azurecontainerapps.io/heartRateData')
      .subscribe({
        next: (data) => {
          console.log('📥 Datos recibidos desde API:', data.length, 'registros');

          this.allRecords = data; // Guardar todos los datos para debugging

          // CORRECCIÓN CRÍTICA: Filtrar por timestamp en lugar de ID
          // Solo incluir registros cuyo timestamp sea MAYOR al inicio del monitoreo
          const newRecords = data.filter(record => {
            const recordTimestamp = this.getRecordTimestamp(record);

            // Registro es nuevo si:
            // 1. Su timestamp es posterior al inicio del monitoreo
            // 2. Su timestamp es posterior al último registro que procesamos
            const isAfterMonitoringStart = recordTimestamp > this.startTime;
            const isNewerThanLastProcessed = recordTimestamp > this.lastProcessedTimestamp;

            if (isAfterMonitoringStart && isNewerThanLastProcessed) {
              console.log(`✅ Registro NUEVO detectado:`, {
                id: record.id,
                deviceId: record.deviceId,
                avgHeartRate: record.avgHeartRate,
                recordedAt: recordTimestamp,
                recordedAtDate: new Date(recordTimestamp).toISOString(),
                startTime: this.startTime,
                difference: recordTimestamp - this.startTime,
                differenceSeconds: (recordTimestamp - this.startTime) / 1000
              });
              return true;
            } else {
              // Debug para registros ignorados
              if (!isAfterMonitoringStart) {
                console.log(`⏪ Registro anterior al inicio:`, {
                  id: record.id,
                  recordedAt: recordTimestamp,
                  startTime: this.startTime,
                  difference: recordTimestamp - this.startTime
                });
              }
              return false;
            }
          });

          console.log(`📊 Resumen de filtrado:`, {
            totalRecibidos: data.length,
            nuevosEncontrados: newRecords.length,
            totalEnMonitoreo: this.records.length,
            startTime: this.startTime,
            startTimeFormatted: new Date(this.startTime).toISOString()
          });

          // Agregar solo los nuevos registros
          if (newRecords.length > 0) {
            // Actualizar el último timestamp procesado
            const latestTimestamp = Math.max(...newRecords.map(r => this.getRecordTimestamp(r)));
            this.lastProcessedTimestamp = latestTimestamp;

            // Agregar nuevos registros al inicio (más recientes primero)
            this.records = [...newRecords, ...this.records];

            // Ordenar por timestamp más reciente primero
            this.records.sort((a, b) => {
              const timeA = this.getRecordTimestamp(a);
              const timeB = this.getRecordTimestamp(b);
              return timeB - timeA;
            });

            console.log(`✅ ${newRecords.length} nuevos registros agregados`);
            console.log('Total registros en monitoreo:', this.records.length);
            console.log('Último timestamp procesado:', this.lastProcessedTimestamp);
            console.log('Último timestamp procesado (fecha):', new Date(this.lastProcessedTimestamp).toISOString());
          } else {
            console.log('⏸️ No se encontraron registros nuevos en esta consulta');
          }
        },
        error: (error) => {
          console.error('❌ Error al obtener datos:', error);
        }
      });
  }

  stopMonitoring(): void {
    console.log('=== DETENIENDO MONITOREO ===');
    console.log('Registros capturados:', this.records.length);
    console.log('Duración total:', this.formatDuration(this.monitoringDuration));

    if (this.records.length === 0) {
      alert('No se capturaron registros durante el monitoreo. Verifica que el dispositivo esté enviando datos.');
      this.monitoring = false;
      this.sub?.unsubscribe();
      return;
    }

    this.monitoring = false;
    this.sub?.unsubscribe();

    // Calcular estadísticas para el registro
    const stats = this.getStatistics();

    // Preparar payload para enviar al backend
    const monitoringRecord: CreateMonitoringDto = {
      sessionId: this.sessionId,
      patientId: this.session.patientId,
      startTime: this.startTime,
      endTime: Date.now(),
      startTimeLocal: this.startTimeLocal,
      endTimeLocal: this.getPeruCurrentTime().getTime(),
      duration: this.monitoringDuration,
      totalRecords: this.records.length,
      avgHeartRate: stats?.avgHeartRate || 0,
      minHeartRate: stats?.minHeartRate || 0,
      maxHeartRate: stats?.maxHeartRate || 0,
      heartRateRecords: this.records.map(r => ({
        ...r,
        localTimestamp: this.convertToPeruTime(this.getRecordTimestamp(r)).getTime()
      }))
    };

    console.log('📤 Enviando registro de monitoreo:', monitoringRecord);

    // Usar el servicio de monitoreo
    this.monitoringService.createMonitoringRecord(monitoringRecord)
      .subscribe({
        next: (response) => {
          console.log('✅ Registro guardado exitosamente:', response);
          this.router.navigate(
            ['/paciente', this.session.patientId, 'sesiones'],
            { queryParams: { name: this.patientName } }
          );
        },
        error: (error) => {
          console.error('❌ Error al guardar registro:', error);
          alert('Hubo un error al guardar los datos del monitoreo. Por favor, inténtalo de nuevo.');
        }
      });
  }

  /**
   * Obtiene el color del estado del corazón basado en la frecuencia cardíaca
   */
  getHeartRateColor(avgHeartRate: number): string {
    if (avgHeartRate < 60) return '#3b82f6'; // Azul - Bradicardia
    if (avgHeartRate >= 60 && avgHeartRate <= 100) return '#10b981'; // Verde - Normal
    if (avgHeartRate > 100 && avgHeartRate <= 120) return '#f59e0b'; // Amarillo - Levemente elevado
    return '#ef4444'; // Rojo - Taquicardia
  }

  /**
   * Obtiene el estado de la frecuencia cardíaca
   */
  getHeartRateStatus(avgHeartRate: number): string {
    if (avgHeartRate < 60) return 'Bradicardia';
    if (avgHeartRate >= 60 && avgHeartRate <= 100) return 'Normal';
    if (avgHeartRate > 100 && avgHeartRate <= 120) return 'Levemente elevado';
    return 'Taquicardia';
  }

  /**
   * Calcula estadísticas de los registros
   */
  getStatistics() {
    if (this.records.length === 0) return null;

    const avgRates = this.records.map(r => r.avgHeartRate);
    const minRates = this.records.map(r => r.minHeartRate);
    const maxRates = this.records.map(r => r.maxHeartRate);

    return {
      totalRecords: this.records.length,
      avgHeartRate: Math.round(avgRates.reduce((a, b) => a + b, 0) / avgRates.length),
      minHeartRate: Math.min(...minRates),
      maxHeartRate: Math.max(...maxRates),
      lastRecord: this.records[0] // El más reciente
    };
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
