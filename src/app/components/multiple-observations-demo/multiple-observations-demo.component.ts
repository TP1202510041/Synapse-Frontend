import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicalObservationService } from '../../services/clinical-observation.service';

@Component({
  selector: 'app-multiple-observations-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="multiple-observations-demo">
      <div class="demo-header">
        <h3>🧪 Demo: Múltiples Observaciones por Sesión</h3>
        <p>✅ <strong>Backend actualizado</strong> - Ahora permite múltiples observaciones por sesión</p>
      </div>

      <!-- Información de la sesión -->
      <div class="session-info">
        <div class="info-item">
          <strong>Sesión ID:</strong> {{ sessionId }}
        </div>
        <div class="info-item">
          <strong>Paciente ID:</strong> {{ patientId }}
        </div>
        <div class="info-item">
          <strong>Total Observaciones:</strong> {{ observations.length }}
        </div>
      </div>

      <!-- Botones de prueba -->
      <div class="test-actions">
        <button 
          class="btn-test" 
          (click)="createSampleObservations()"
          [disabled]="isLoading">
          🆕 Crear 3 Observaciones de Prueba
        </button>
        <button 
          class="btn-test" 
          (click)="loadAllObservations()"
          [disabled]="isLoading">
          🔄 Recargar Todas las Observaciones
        </button>
        <button 
          class="btn-test" 
          (click)="clearObservations()"
          [disabled]="isLoading">
          🗑️ Limpiar Lista Local
        </button>
      </div>

      <!-- Formulario para nueva observación -->
      <div class="add-observation">
        <h4>➕ Agregar Nueva Observación</h4>
        <textarea 
          [(ngModel)]="newObservationContent"
          placeholder="Escribe tu observación aquí (mínimo 10 caracteres)..."
          rows="3"
          maxlength="2000">
        </textarea>
        <div class="form-actions">
          <button 
            class="btn-save" 
            (click)="addObservation()"
            [disabled]="!isValidContent() || isLoading">
            {{ isLoading ? 'Guardando...' : 'Guardar Observación' }}
          </button>
          <span class="char-count" [class.invalid]="!isValidContent()">
            {{ newObservationContent.length }}/2000 
            {{ newObservationContent.length < 10 ? '(mín. 10)' : '' }}
          </span>
        </div>
      </div>

      <!-- Lista de observaciones -->
      <div class="observations-list">
        <h4>📋 Todas las Observaciones de la Sesión</h4>
        
        <div class="loading" *ngIf="isLoading">
          🔄 Procesando...
        </div>

        <div class="observations-container" *ngIf="!isLoading">
          <div 
            class="observation-card" 
            *ngFor="let obs of observations; let i = index; trackBy: trackByObservation">
            <div class="observation-header">
              <div class="observation-number">
                <strong>📝 Observación #{{ i + 1 }}</strong>
              </div>
              <div class="observation-meta">
                <span class="therapist">👨‍⚕️ {{ obs.therapistName || 'Terapeuta' }}</span>
                <span class="date">📅 {{ formatDate(obs.createdAt) }}</span>
              </div>
            </div>
            <div class="observation-content">
              {{ obs.content }}
            </div>
            <div class="observation-footer">
              <span class="observation-id">ID: {{ obs.id?.substring(0, 8) }}...</span>
              <span class="version">v{{ obs.version || 1 }}</span>
            </div>
          </div>

          <div class="no-observations" *ngIf="observations.length === 0">
            📋 No hay observaciones para esta sesión.
            <br>
            ¡Usa los botones de arriba para crear algunas de prueba!
          </div>
        </div>
      </div>

      <!-- Log de actividad -->
      <div class="activity-log">
        <h4>📊 Log de Actividad</h4>
        <div class="log-container">
          <div 
            class="log-entry" 
            *ngFor="let entry of activityLog; let i = index"
            [class]="'log-' + entry.type">
            <span class="log-time">{{ entry.time }}</span>
            <span class="log-message">{{ entry.message }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .multiple-observations-demo {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      max-width: 800px;
      margin: 0 auto;
    }

    .demo-header {
      text-align: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #e0e0e0;
    }

    .session-info {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #007bff;
    }

    .info-item {
      flex: 1;
      text-align: center;
    }

    .test-actions {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .btn-test {
      background: #28a745;
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.3s;
    }

    .btn-test:hover:not(:disabled) {
      background: #218838;
    }

    .btn-test:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .add-observation {
      margin-bottom: 24px;
      padding: 16px;
      background: #e3f2fd;
      border-radius: 8px;
      border-left: 4px solid #2196f3;
    }

    .add-observation textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-family: inherit;
      resize: vertical;
      margin-bottom: 12px;
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .btn-save {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
    }

    .btn-save:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .char-count {
      font-size: 12px;
      color: #666;
    }

    .char-count.invalid {
      color: #dc3545;
      font-weight: bold;
    }

    .observations-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .observation-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      border-left: 4px solid #17a2b8;
      transition: transform 0.2s;
    }

    .observation-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .observation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .observation-meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #666;
    }

    .observation-content {
      margin-bottom: 12px;
      line-height: 1.5;
      color: #333;
    }

    .observation-footer {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #999;
    }

    .no-observations {
      text-align: center;
      padding: 40px;
      color: #666;
      font-style: italic;
    }

    .activity-log {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 2px solid #e0e0e0;
    }

    .log-container {
      max-height: 200px;
      overflow-y: auto;
      background: #f8f9fa;
      border-radius: 6px;
      padding: 12px;
    }

    .log-entry {
      display: flex;
      gap: 12px;
      margin-bottom: 8px;
      font-size: 12px;
    }

    .log-time {
      color: #666;
      min-width: 60px;
    }

    .log-success { color: #28a745; }
    .log-error { color: #dc3545; }
    .log-info { color: #007bff; }

    .loading {
      text-align: center;
      padding: 20px;
      color: #666;
    }
  `]
})
export class MultipleObservationsDemoComponent implements OnInit {
  @Input() sessionId: string = '244bc0ab-4c5c-4b56-bf44-5e0bada57bd4';
  @Input() patientId: number = 1;

  observations: any[] = [];
  newObservationContent = '';
  isLoading = false;
  activityLog: Array<{time: string, message: string, type: string}> = [];

  constructor(private observationService: ClinicalObservationService) {}

  ngOnInit() {
    this.addLogEntry('Componente inicializado', 'info');
    this.loadAllObservations();
  }

  // ✅ Cargar todas las observaciones de la sesión
  loadAllObservations() {
    this.isLoading = true;
    this.addLogEntry('Cargando observaciones...', 'info');

    this.observationService.getObservationsBySession(this.sessionId).subscribe({
      next: (response) => {
        const responseData = (response as any).data || response;
        this.observations = Array.isArray(responseData) ? responseData : [responseData];
        
        this.addLogEntry(`✅ ${this.observations.length} observaciones cargadas`, 'success');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando observaciones:', error);
        this.addLogEntry('❌ Error cargando observaciones', 'error');
        this.observations = [];
        this.isLoading = false;
      }
    });
  }

  // ✅ Crear observaciones de prueba
  createSampleObservations() {
    this.isLoading = true;
    this.addLogEntry('Creando observaciones de prueba...', 'info');

    const sampleObservations = [
      'Primera observación de prueba: El paciente muestra signos de mejora en la exposición a alturas.',
      'Segunda observación: Se observa reducción en los niveles de ansiedad durante la sesión VR.',
      'Tercera observación: El paciente completa exitosamente el ejercicio de exposición gradual.'
    ];

    let completed = 0;
    const total = sampleObservations.length;

    sampleObservations.forEach((content, index) => {
      const observation = {
        sessionId: this.sessionId,
        patientId: this.patientId,
        content: content,
        sessionDate: new Date().toISOString().split('T')[0]
      };

      this.observationService.createObservation(observation).subscribe({
        next: (response) => {
          completed++;
          this.addLogEntry(`✅ Observación ${index + 1} creada`, 'success');
          
          if (completed === total) {
            this.addLogEntry(`🎉 ${total} observaciones de prueba creadas`, 'success');
            this.loadAllObservations();
          }
        },
        error: (error) => {
          completed++;
          this.addLogEntry(`❌ Error creando observación ${index + 1}`, 'error');
          
          if (completed === total) {
            this.isLoading = false;
          }
        }
      });
    });
  }

  // ✅ Agregar nueva observación
  addObservation() {
    if (!this.isValidContent()) return;

    this.isLoading = true;
    this.addLogEntry('Guardando nueva observación...', 'info');

    const observation = {
      sessionId: this.sessionId,
      patientId: this.patientId,
      content: this.newObservationContent.trim(),
      sessionDate: new Date().toISOString().split('T')[0]
    };

    this.observationService.createObservation(observation).subscribe({
      next: (response) => {
        this.addLogEntry('✅ Nueva observación guardada', 'success');
        this.newObservationContent = '';
        this.loadAllObservations();
      },
      error: (error) => {
        console.error('Error guardando observación:', error);
        this.addLogEntry('❌ Error guardando observación', 'error');
        this.isLoading = false;
      }
    });
  }

  // Utilidades
  isValidContent(): boolean {
    return this.newObservationContent.trim().length >= 10;
  }

  clearObservations() {
    this.observations = [];
    this.addLogEntry('🗑️ Lista local limpiada', 'info');
  }

  trackByObservation(index: number, obs: any): string {
    return obs.id || index.toString();
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  addLogEntry(message: string, type: string) {
    const time = new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    this.activityLog.unshift({ time, message, type });
    
    // Mantener solo los últimos 10 entries
    if (this.activityLog.length > 10) {
      this.activityLog = this.activityLog.slice(0, 10);
    }
  }
}