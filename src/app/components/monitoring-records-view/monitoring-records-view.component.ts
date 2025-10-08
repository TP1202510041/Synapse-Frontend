import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonitoringService, MonitoringRecord } from '../../services/monitoring.service';
import { MonitoringObservationsModalComponent } from '../monitoring-observations-modal/monitoring-observations-modal.component';

@Component({
  selector: 'app-monitoring-records-view',
  standalone: true,
  imports: [CommonModule, FormsModule, MonitoringObservationsModalComponent],
  template: `
    <div class="monitoring-records-view">
      <div class="records-header">
        <h3>📊 Registros de Monitoreo de la Sesión</h3>
        <button class="btn-refresh" (click)="loadMonitoringRecords()" [disabled]="isLoading">
          {{ isLoading ? '🔄 Cargando...' : '🔄 Actualizar' }}
        </button>
      </div>

      <!-- Error Message -->
      <div class="error-message" *ngIf="error">
        <span class="error-icon">❌</span>
        {{ error }}
        <button class="error-close" (click)="clearError()">×</button>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading && monitoringRecords.length === 0">
        <div class="loading-spinner">🔄</div>
        <p>Cargando registros de monitoreo...</p>
      </div>

      <!-- No Records State -->
      <div class="no-records" *ngIf="!isLoading && monitoringRecords.length === 0 && !error">
        <div class="no-records-icon">📊</div>
        <h4>No hay registros de monitoreo</h4>
        <p>Esta sesión aún no tiene registros de monitoreo cardíaco.</p>
        <p class="no-records-subtitle">Los registros aparecerán aquí después de realizar un monitoreo en tiempo real.</p>
      </div>

      <!-- Records List -->
      <div class="records-list" *ngIf="monitoringRecords.length > 0">
        <div class="records-summary">
          <span class="summary-item">
            <strong>{{ monitoringRecords.length }}</strong> registro(s) de monitoreo
          </span>
          <span class="summary-item" *ngIf="getTotalDuration() > 0">
            <strong>{{ formatDuration(getTotalDuration()) }}</strong> duración total
          </span>
        </div>

        <div class="records-grid">
          <div 
            class="monitoring-record-card" 
            *ngFor="let record of monitoringRecords; let i = index"
            [class.latest]="i === 0">
            
            <!-- Record Header -->
            <div class="record-header">
              <div class="record-title">
                <h4>🔍 Monitoreo #{{ i + 1 }}</h4>
                <span class="record-id">ID: {{ record.monitoringId?.substring(0, 8) }}...</span>
                <span class="latest-badge" *ngIf="i === 0">MÁS RECIENTE</span>
              </div>
              <div class="record-date">
                📅 {{ formatDateTime(record.startTimeLocal) }}
              </div>
            </div>

            <!-- Record Stats -->
            <div class="record-stats">
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-icon">⏱️</span>
                  <div class="stat-content">
                    <span class="stat-label">Duración</span>
                    <span class="stat-value">{{ formatDuration(record.duration) }}</span>
                  </div>
                </div>
                
                <div class="stat-item">
                  <span class="stat-icon">💓</span>
                  <div class="stat-content">
                    <span class="stat-label">BPM Promedio</span>
                    <span class="stat-value" [style.color]="getHeartRateColor(record.avgHeartRate)">
                      {{ record.avgHeartRate }}
                    </span>
                  </div>
                </div>
                
                <div class="stat-item">
                  <span class="stat-icon">📈</span>
                  <div class="stat-content">
                    <span class="stat-label">BPM Máximo</span>
                    <span class="stat-value">{{ record.maxHeartRate }}</span>
                  </div>
                </div>
                
                <div class="stat-item">
                  <span class="stat-icon">📉</span>
                  <div class="stat-content">
                    <span class="stat-label">BPM Mínimo</span>
                    <span class="stat-value">{{ record.minHeartRate }}</span>
                  </div>
                </div>
                
                <div class="stat-item">
                  <span class="stat-icon">📊</span>
                  <div class="stat-content">
                    <span class="stat-label">Total Registros</span>
                    <span class="stat-value">{{ record.totalRecords }}</span>
                  </div>
                </div>
                
                <div class="stat-item">
                  <span class="stat-icon">❤️</span>
                  <div class="stat-content">
                    <span class="stat-label">Estado</span>
                    <span class="stat-value" [style.color]="getHeartRateColor(record.avgHeartRate)">
                      {{ getHeartRateStatus(record.avgHeartRate) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Record Actions -->
            <div class="record-actions">
              <button 
                class="btn-observations" 
                (click)="openObservationsModal(record)"
                title="Ver y agregar observaciones específicas de este monitoreo">
                <span class="btn-icon">📝</span>
                Observaciones de Monitoreo
              </button>
              
              <button 
                class="btn-delete" 
                (click)="deleteRecord(record)"
                [disabled]="isLoading"
                title="Eliminar este registro de monitoreo">
                <span class="btn-icon">🗑️</span>
                Eliminar
              </button>
            </div>

            <!-- Additional Info -->
            <div class="record-details">
              <div class="detail-item">
                <span class="detail-label">🕐 Inicio:</span>
                <span class="detail-value">{{ formatTime(record.startTimeLocal) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">🕑 Fin:</span>
                <span class="detail-value">{{ formatTime(record.endTimeLocal) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">👤 Paciente:</span>
                <span class="detail-value">{{ record.patientName || 'N/A' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Observaciones de Monitoreo -->
      <app-monitoring-observations-modal
        [isOpen]="isModalOpen"
        [monitoringId]="selectedMonitoringId"
        [patientId]="selectedPatientId"
        (closeEvent)="closeObservationsModal()"
        (observationAdded)="onObservationAdded($event)"
        (observationDeleted)="onObservationDeleted($event)">
      </app-monitoring-observations-modal>
    </div>
  `,
  styles: [`
    .monitoring-records-view {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .records-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e9ecef;
    }

    .records-header h3 {
      margin: 0;
      color: #2c3e50;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-refresh {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background-color 0.2s ease;
    }

    .btn-refresh:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-refresh:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .error-message {
      background-color: #f8d7da;
      color: #721c24;
      padding: 0.75rem 1rem;
      border: 1px solid #f5c6cb;
      border-radius: 8px;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .error-close {
      background: none;
      border: none;
      color: #721c24;
      font-size: 1.2rem;
      cursor: pointer;
      margin-left: auto;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loading-state {
      text-align: center;
      padding: 3rem 1rem;
      color: #6c757d;
    }

    .loading-spinner {
      font-size: 2rem;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .no-records {
      text-align: center;
      padding: 3rem 1rem;
      color: #6c757d;
      background: #f8f9fa;
      border-radius: 12px;
      border: 2px dashed #dee2e6;
    }

    .no-records-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .no-records h4 {
      margin: 0 0 0.5rem 0;
      color: #495057;
    }

    .no-records p {
      margin: 0.5rem 0;
    }

    .no-records-subtitle {
      font-size: 0.9rem;
      opacity: 0.7;
    }

    .records-summary {
      display: flex;
      gap: 2rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #007bff;
    }

    .summary-item {
      color: #495057;
      font-size: 0.95rem;
    }

    .records-grid {
      display: grid;
      gap: 1.5rem;
    }

    .monitoring-record-card {
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.3s ease;
      position: relative;
    }

    .monitoring-record-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .monitoring-record-card.latest {
      border-color: #007bff;
      background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
    }

    .record-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .record-title {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .record-title h4 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .record-id {
      font-size: 0.8rem;
      color: #6c757d;
      font-family: 'Courier New', monospace;
      background: #e9ecef;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    .latest-badge {
      background: #007bff;
      color: white;
      font-size: 0.7rem;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .record-date {
      color: #6c757d;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .record-stats {
      margin-bottom: 1.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: white;
      padding: 0.75rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      font-size: 1.2rem;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .stat-label {
      font-size: 0.8rem;
      color: #6c757d;
      font-weight: 500;
    }

    .stat-value {
      font-size: 1rem;
      font-weight: bold;
      color: #2c3e50;
    }

    .record-actions {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .btn-observations {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2);
    }

    .btn-observations:hover {
      background: linear-gradient(135deg, #218838 0%, #1e7e34 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
    }

    .btn-delete {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-delete:hover:not(:disabled) {
      background: #c82333;
      transform: translateY(-1px);
    }

    .btn-delete:disabled {
      background: #6c757d;
      cursor: not-allowed;
      transform: none;
    }

    .btn-icon {
      font-size: 1rem;
    }

    .record-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid #dee2e6;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
    }

    .detail-label {
      color: #6c757d;
      font-weight: 500;
    }

    .detail-value {
      color: #2c3e50;
      font-weight: 500;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .monitoring-records-view {
        padding: 1rem;
      }

      .records-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .records-summary {
        flex-direction: column;
        gap: 0.5rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .record-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .record-actions {
        flex-direction: column;
      }

      .btn-observations, .btn-delete {
        width: 100%;
        justify-content: center;
      }

      .record-details {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MonitoringRecordsViewComponent implements OnInit, OnDestroy {
  @Input() sessionId: string | null = null;
  @Input() patientId: number | null = null;

  monitoringRecords: MonitoringRecord[] = [];
  isLoading = false;
  error: string | null = null;

  // Modal state
  isModalOpen = false;
  selectedMonitoringId: string | null = null;
  selectedPatientId: number | null = null;

  constructor(private monitoringService: MonitoringService) {}

  ngOnInit() {
    if (this.sessionId) {
      this.loadMonitoringRecords();
    }
  }

  ngOnDestroy() {
    // Limpiar estado
    this.monitoringRecords = [];
    this.error = null;
    this.isModalOpen = false;
  }

  // ✅ CARGAR REGISTROS DE MONITOREO DE LA SESIÓN
  loadMonitoringRecords() {
    if (!this.sessionId) {
      this.error = 'ID de sesión no proporcionado';
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.monitoringService.getMonitoringRecordsBySession(this.sessionId).subscribe({
      next: (records) => {
        console.log('✅ Registros de monitoreo cargados:', records);
        
        // Ordenar por fecha de creación (más reciente primero)
        this.monitoringRecords = records.sort((a, b) => {
          const timeA = a.startTimeLocal || a.startTime;
          const timeB = b.startTimeLocal || b.startTime;
          return timeB - timeA;
        });
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error cargando registros de monitoreo:', error);
        this.error = 'Error al cargar los registros de monitoreo';
        this.monitoringRecords = [];
        this.isLoading = false;
      }
    });
  }

  // ✅ ELIMINAR REGISTRO DE MONITOREO
  deleteRecord(record: MonitoringRecord) {
    if (!record.monitoringId) {
      this.error = 'ID de monitoreo no válido';
      return;
    }

    const confirmMessage = `¿Estás seguro de que quieres eliminar este registro de monitoreo?

Datos del registro:
• Duración: ${this.formatDuration(record.duration)}
• BPM Promedio: ${record.avgHeartRate}
• Total Registros: ${record.totalRecords}

Esta acción no se puede deshacer.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.monitoringService.deleteMonitoringRecord(record.monitoringId).subscribe({
      next: () => {
        console.log('✅ Registro de monitoreo eliminado:', record.monitoringId);
        
        // Recargar registros
        this.loadMonitoringRecords();
      },
      error: (error) => {
        console.error('❌ Error eliminando registro de monitoreo:', error);
        this.error = 'Error al eliminar el registro de monitoreo';
        this.isLoading = false;
      }
    });
  }

  // ✅ ABRIR MODAL DE OBSERVACIONES DE MONITOREO
  openObservationsModal(record: MonitoringRecord) {
    console.log('🔄 Abriendo modal de observaciones para monitoreo:', record.monitoringId);
    
    this.selectedMonitoringId = record.monitoringId || null;
    this.selectedPatientId = record.patientId;
    this.isModalOpen = true;
  }

  // ✅ CERRAR MODAL DE OBSERVACIONES
  closeObservationsModal() {
    this.isModalOpen = false;
    this.selectedMonitoringId = null;
    this.selectedPatientId = null;
  }

  // ✅ EVENTOS DEL MODAL
  onObservationAdded(observation: any) {
    console.log('✅ Nueva observación de monitoreo agregada:', observation);
    // Opcional: mostrar notificación de éxito
  }

  onObservationDeleted(observationId: string) {
    console.log('✅ Observación de monitoreo eliminada:', observationId);
    // Opcional: mostrar notificación de éxito
  }

  // ✅ MÉTODOS DE UTILIDAD

  getTotalDuration(): number {
    return this.monitoringRecords.reduce((total, record) => total + record.duration, 0);
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

  formatDateTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getHeartRateColor(avgHeartRate: number): string {
    if (avgHeartRate < 60) return '#3b82f6'; // Azul - Bradicardia
    if (avgHeartRate >= 60 && avgHeartRate <= 100) return '#10b981'; // Verde - Normal
    if (avgHeartRate > 100 && avgHeartRate <= 120) return '#f59e0b'; // Amarillo - Levemente elevado
    return '#ef4444'; // Rojo - Taquicardia
  }

  getHeartRateStatus(avgHeartRate: number): string {
    if (avgHeartRate < 60) return 'Bradicardia';
    if (avgHeartRate >= 60 && avgHeartRate <= 100) return 'Normal';
    if (avgHeartRate > 100 && avgHeartRate <= 120) return 'Elevado';
    return 'Taquicardia';
  }

  clearError() {
    this.error = null;
  }

  // ✅ WATCH PARA CAMBIOS EN INPUTS
  ngOnChanges() {
    if (this.sessionId) {
      this.loadMonitoringRecords();
    }
  }
}