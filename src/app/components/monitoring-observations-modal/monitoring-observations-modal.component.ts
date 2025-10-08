import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  MonitoringObservationService, 
  MonitoringObservation, 
  MonitoringObservationRequest 
} from '../../services/monitoring-observation.service';

@Component({
  selector: 'app-monitoring-observations-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Modal Backdrop -->
    <div class="modal-backdrop" *ngIf="isOpen" (click)="closeModal()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="modal-title">
            <h3>📝 Observaciones de Monitoreo</h3>
            <p class="modal-subtitle">
              Monitoreo ID: <code>{{ monitoringId?.substring(0, 8) }}...</code>
            </p>
          </div>
          <button class="btn-close" (click)="closeModal()" title="Cerrar">
            ✕
          </button>
        </div>

        <!-- Error Message -->
        <div class="error-message" *ngIf="error">
          <span class="error-icon">❌</span>
          {{ error }}
          <button class="error-close" (click)="clearError()">×</button>
        </div>

        <!-- Información del Monitoreo -->
        <div class="monitoring-info" *ngIf="observations.length > 0 && observations[0].monitoringInfo">
          <h4>📊 Datos del Monitoreo:</h4>
          <div class="monitoring-stats">
            <div class="stat-item">
              <span class="stat-icon">⏱️</span>
              <span class="stat-label">Duración:</span>
              <span class="stat-value">{{ observations[0].monitoringInfo.duration }} min</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">💓</span>
              <span class="stat-label">BPM Promedio:</span>
              <span class="stat-value">{{ observations[0].monitoringInfo.avgHeartRate }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">📈</span>
              <span class="stat-label">BPM Máximo:</span>
              <span class="stat-value">{{ observations[0].monitoringInfo.maxHeartRate }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">📉</span>
              <span class="stat-label">BPM Mínimo:</span>
              <span class="stat-value">{{ observations[0].monitoringInfo.minHeartRate }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">👤</span>
              <span class="stat-label">Paciente:</span>
              <span class="stat-value">{{ observations[0].patientName }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">📅</span>
              <span class="stat-label">Fecha:</span>
              <span class="stat-value">{{ formatDate(observations[0].monitoringInfo.monitoringCreatedAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          
          <!-- Lista de Observaciones Existentes -->
          <div class="observations-section">
            <h4>📋 Observaciones Existentes ({{ observations.length }})</h4>
            
            <div class="observations-list" *ngIf="observations.length > 0; else noObservations">
              <div class="observation-item" *ngFor="let obs of observations; let i = index">
                <div class="observation-header">
                  <div class="observation-title">
                    <strong>Observación #{{ i + 1 }}</strong>
                    <span class="observation-author">por {{ obs.therapistName }}</span>
                  </div>
                  <div class="observation-actions">
                    <span class="observation-date">{{ formatDate(obs.createdAt) }}</span>
                    <button 
                      class="btn-edit" 
                      (click)="startEdit(obs)"
                      *ngIf="!isEditing(obs.id)"
                      [disabled]="isLoading"
                      title="Editar observación">
                      ✏️
                    </button>
                    <button 
                      class="btn-delete" 
                      (click)="deleteObservation(obs.id)"
                      [disabled]="isLoading"
                      title="Eliminar observación">
                      🗑️
                    </button>
                  </div>
                </div>

                <div class="observation-content">
                  <div *ngIf="!isEditing(obs.id)">
                    <p>{{ obs.content }}</p>
                  </div>
                  
                  <!-- Formulario de Edición -->
                  <div class="edit-form" *ngIf="isEditing(obs.id)">
                    <textarea 
                      [(ngModel)]="editContent"
                      class="edit-textarea"
                      rows="4"
                      [disabled]="isLoading"
                      placeholder="Editar observación...">
                    </textarea>
                    <div class="edit-actions">
                      <button 
                        class="btn-save" 
                        (click)="saveEdit(obs.id)"
                        [disabled]="isLoading || !isEditContentValid()">
                        {{ isLoading ? 'Guardando...' : 'Guardar' }}
                      </button>
                      <button 
                        class="btn-cancel" 
                        (click)="cancelEdit()"
                        [disabled]="isLoading">
                        Cancelar
                      </button>
                      <small class="char-count" [class.invalid]="!isEditContentValid()">
                        {{ editContent.length }}/2000
                      </small>
                    </div>
                  </div>
                </div>

                <div class="observation-version" *ngIf="obs.version > 1">
                  <small>✏️ Editado {{ obs.version - 1 }} vez(es) - Última actualización: {{ formatDate(obs.updatedAt) }}</small>
                </div>
              </div>
            </div>

            <ng-template #noObservations>
              <div class="no-observations">
                <div class="no-observations-icon">📝</div>
                <p>No hay observaciones para este monitoreo aún.</p>
                <p class="no-observations-subtitle">Agrega la primera observación usando el formulario de abajo.</p>
              </div>
            </ng-template>
          </div>

          <!-- Formulario para Nueva Observación -->
          <div class="new-observation-section">
            <h4>➕ Agregar Nueva Observación de Monitoreo</h4>
            <div class="new-observation-form">
              <textarea 
                [(ngModel)]="newObservationContent"
                (input)="validateNewContent()"
                class="observation-textarea"
                rows="4"
                [disabled]="isLoading"
                placeholder="Escribe tus observaciones específicas sobre este monitoreo (BPM, duración, comportamiento del paciente, etc.)...">
              </textarea>
              
              <div class="form-footer">
                <button 
                  class="btn-add-observation" 
                  (click)="addObservation()"
                  [disabled]="isLoading || !isNewContentValid()">
                  <span class="btn-icon">{{ isLoading ? '⏳' : '💾' }}</span>
                  {{ isLoading ? 'Guardando...' : 'Agregar Observación de Monitoreo' }}
                </button>
                
                <div class="validation-info">
                  <div class="char-counter" [class.invalid]="!isNewContentValid()">
                    <small>{{ newObservationContent.length }}/2000 caracteres</small>
                  </div>
                  <div class="validation-message" [class.error]="!contentValidation.valid">
                    <small>{{ contentValidation.message }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button class="btn-close-modal" (click)="closeModal()">
            Cerrar
          </button>
          <div class="modal-info">
            <small>💡 Las observaciones de monitoreo son específicas para este registro de BPM y duración</small>
          </div>
        </div>

        <!-- Loading Overlay -->
        <div class="loading-overlay" *ngIf="isLoading">
          <div class="loading-spinner">🔄</div>
          <p>Procesando...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-container {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      position: relative;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.5rem;
      border-bottom: 2px solid #e9ecef;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 16px 16px 0 0;
    }

    .modal-title h3 {
      margin: 0;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .modal-subtitle {
      margin: 0.5rem 0 0 0;
      opacity: 0.9;
      font-size: 0.9rem;
    }

    .modal-subtitle code {
      background: rgba(255, 255, 255, 0.2);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
    }

    .btn-close {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      font-size: 1.5rem;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;
    }

    .btn-close:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .error-message {
      background-color: #f8d7da;
      color: #721c24;
      padding: 0.75rem 1rem;
      margin: 1rem 1.5rem;
      border: 1px solid #f5c6cb;
      border-radius: 8px;
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

    .monitoring-info {
      margin: 1.5rem;
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1.5rem;
      border-left: 4px solid #007bff;
    }

    .monitoring-info h4 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .monitoring-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.75rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: white;
      padding: 0.75rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      font-size: 1.1rem;
    }

    .stat-label {
      font-weight: 500;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .stat-value {
      font-weight: bold;
      color: #2c3e50;
      margin-left: auto;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .observations-section {
      margin-bottom: 2rem;
    }

    .observations-section h4 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .observations-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .observation-item {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      padding: 1.25rem;
      transition: all 0.2s ease;
    }

    .observation-item:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .observation-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .observation-title {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .observation-title strong {
      color: #2c3e50;
      font-size: 1rem;
    }

    .observation-author {
      color: #6c757d;
      font-size: 0.85rem;
    }

    .observation-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .observation-date {
      color: #6c757d;
      font-size: 0.8rem;
      white-space: nowrap;
    }

    .btn-edit, .btn-delete {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      transition: background-color 0.2s ease;
      font-size: 1rem;
    }

    .btn-edit:hover:not(:disabled) {
      background-color: #e3f2fd;
    }

    .btn-delete:hover:not(:disabled) {
      background-color: #ffebee;
    }

    .btn-edit:disabled, .btn-delete:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .observation-content p {
      margin: 0;
      line-height: 1.6;
      color: #495057;
      white-space: pre-wrap;
    }

    .edit-form {
      width: 100%;
    }

    .edit-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #007bff;
      border-radius: 8px;
      resize: vertical;
      font-family: inherit;
      font-size: 0.9rem;
      line-height: 1.5;
      margin-bottom: 0.75rem;
    }

    .edit-textarea:focus {
      outline: none;
      border-color: #0056b3;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    .edit-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .btn-save, .btn-cancel {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .btn-save {
      background-color: #28a745;
      color: white;
    }

    .btn-save:hover:not(:disabled) {
      background-color: #218838;
    }

    .btn-save:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    .btn-cancel {
      background-color: #6c757d;
      color: white;
    }

    .btn-cancel:hover:not(:disabled) {
      background-color: #5a6268;
    }

    .char-count {
      color: #6c757d;
      font-size: 0.8rem;
      margin-left: auto;
    }

    .char-count.invalid {
      color: #dc3545;
      font-weight: 500;
    }

    .observation-version {
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid #dee2e6;
    }

    .observation-version small {
      color: #6c757d;
      font-size: 0.8rem;
    }

    .no-observations {
      text-align: center;
      padding: 2rem;
      color: #6c757d;
      background: white;
      border: 2px dashed #dee2e6;
      border-radius: 12px;
    }

    .no-observations-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .no-observations p {
      margin: 0.5rem 0;
    }

    .no-observations-subtitle {
      font-size: 0.9rem;
      opacity: 0.7;
    }

    .new-observation-section h4 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .new-observation-form {
      background: white;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 1.25rem;
    }

    .observation-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #ced4da;
      border-radius: 8px;
      resize: vertical;
      font-family: inherit;
      font-size: 0.9rem;
      line-height: 1.5;
      transition: border-color 0.2s ease;
      margin-bottom: 0.75rem;
    }

    .observation-textarea:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    .observation-textarea:disabled {
      background-color: #e9ecef;
      opacity: 0.6;
    }

    .form-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .btn-add-observation {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
    }

    .btn-add-observation:hover:not(:disabled) {
      background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
    }

    .btn-add-observation:disabled {
      background: #6c757d;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .validation-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
    }

    .char-counter {
      font-size: 0.8rem;
      color: #6c757d;
    }

    .char-counter.invalid {
      color: #dc3545;
      font-weight: 500;
    }

    .validation-message {
      font-size: 0.8rem;
      color: #6c757d;
    }

    .validation-message.error {
      color: #dc3545;
      font-weight: 500;
    }

    .modal-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-top: 2px solid #e9ecef;
      background: #f8f9fa;
      border-radius: 0 0 16px 16px;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .btn-close-modal {
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .btn-close-modal:hover {
      background: #5a6268;
    }

    .modal-info {
      color: #6c757d;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border-radius: 16px;
      z-index: 10;
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

    /* Responsive Design */
    @media (max-width: 768px) {
      .modal-container {
        margin: 0.5rem;
        max-height: 95vh;
      }

      .monitoring-stats {
        grid-template-columns: 1fr;
      }

      .observation-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .observation-actions {
        width: 100%;
        justify-content: space-between;
      }

      .form-footer {
        flex-direction: column;
        align-items: stretch;
      }

      .btn-add-observation {
        width: 100%;
        justify-content: center;
      }

      .modal-footer {
        flex-direction: column;
        align-items: stretch;
      }

      .btn-close-modal {
        width: 100%;
        text-align: center;
      }
    }
  `]
})
export class MonitoringObservationsModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() monitoringId: string | null = null;
  @Input() patientId: number | null = null;
  @Output() closeEvent = new EventEmitter<void>();
  @Output() observationAdded = new EventEmitter<MonitoringObservation>();
  @Output() observationDeleted = new EventEmitter<string>();

  observations: MonitoringObservation[] = [];
  newObservationContent = '';
  editingObservationId: string | null = null;
  editContent = '';
  isLoading = false;
  error: string | null = null;
  contentValidation = { valid: false, message: '', charCount: 0 };

  constructor(private monitoringObservationService: MonitoringObservationService) {}

  ngOnInit() {
    if (this.isOpen && this.monitoringId) {
      this.loadObservations();
    }
  }

  ngOnDestroy() {
    // Limpiar estado al destruir componente
    this.observations = [];
    this.newObservationContent = '';
    this.editingObservationId = null;
    this.editContent = '';
    this.error = null;
  }

  // ✅ CARGAR OBSERVACIONES DEL MONITOREO
  loadObservations() {
    if (!this.monitoringId) return;

    this.isLoading = true;
    this.error = null;

    this.monitoringObservationService.getByMonitoring(this.monitoringId).subscribe({
      next: (response) => {
        console.log('✅ Observaciones de monitoreo cargadas:', response);
        
        if (response.success) {
          // ✅ El backend puede devolver array directo o wrapped en data
          this.observations = Array.isArray(response.data) ? response.data : [response.data];
          
          // Filtrar observaciones válidas
          this.observations = this.observations.filter(obs => obs && obs.id);
          
          console.log('✅ Observaciones procesadas:', this.observations.length);
        } else {
          this.error = response.message || 'Error cargando observaciones de monitoreo';
          this.observations = [];
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error cargando observaciones de monitoreo:', error);
        this.error = 'Error de conexión al cargar observaciones de monitoreo';
        this.observations = [];
        this.isLoading = false;
      }
    });
  }

  // ✅ AGREGAR NUEVA OBSERVACIÓN DE MONITOREO
  addObservation() {
    if (!this.isNewContentValid() || !this.monitoringId || !this.patientId) {
      this.error = 'Datos incompletos para crear la observación';
      return;
    }

    const request: MonitoringObservationRequest = {
      monitoringId: this.monitoringId,
      patientId: this.patientId,
      content: this.newObservationContent.trim(),
      observationDate: new Date().toISOString().split('T')[0]
    };

    this.isLoading = true;
    this.error = null;

    this.monitoringObservationService.createObservation(request).subscribe({
      next: (response) => {
        console.log('✅ Observación de monitoreo creada:', response);
        
        if (response.success) {
          this.newObservationContent = '';
          this.contentValidation = { valid: false, message: '', charCount: 0 };
          
          // Recargar observaciones
          this.loadObservations();
          
          // Emitir evento
          if (!Array.isArray(response.data)) {
            this.observationAdded.emit(response.data);
          }
        } else {
          this.error = response.message || 'Error creando observación de monitoreo';
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error creando observación de monitoreo:', error);
        this.error = 'Error de conexión al crear observación de monitoreo';
        this.isLoading = false;
      }
    });
  }

  // ✅ INICIAR EDICIÓN
  startEdit(observation: MonitoringObservation) {
    this.editingObservationId = observation.id;
    this.editContent = observation.content;
  }

  // ✅ CANCELAR EDICIÓN
  cancelEdit() {
    this.editingObservationId = null;
    this.editContent = '';
  }

  // ✅ GUARDAR EDICIÓN
  saveEdit(observationId: string) {
    if (!this.isEditContentValid() || !this.monitoringId || !this.patientId) {
      this.error = 'Contenido inválido para actualizar la observación';
      return;
    }

    const request: MonitoringObservationRequest = {
      monitoringId: this.monitoringId,
      patientId: this.patientId,
      content: this.editContent.trim()
    };

    this.isLoading = true;
    this.error = null;

    this.monitoringObservationService.updateObservation(observationId, request).subscribe({
      next: (response) => {
        console.log('✅ Observación de monitoreo actualizada:', response);
        
        if (response.success) {
          this.cancelEdit();
          this.loadObservations(); // Recargar observaciones
        } else {
          this.error = response.message || 'Error actualizando observación de monitoreo';
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error actualizando observación de monitoreo:', error);
        this.error = 'Error de conexión al actualizar observación de monitoreo';
        this.isLoading = false;
      }
    });
  }

  // ✅ ELIMINAR OBSERVACIÓN
  deleteObservation(observationId: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta observación de monitoreo?')) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.monitoringObservationService.deleteObservation(observationId).subscribe({
      next: (response) => {
        console.log('✅ Observación de monitoreo eliminada:', response);
        
        if (response.success) {
          this.loadObservations(); // Recargar observaciones
          this.observationDeleted.emit(observationId);
        } else {
          this.error = response.message || 'Error eliminando observación de monitoreo';
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error eliminando observación de monitoreo:', error);
        this.error = 'Error de conexión al eliminar observación de monitoreo';
        this.isLoading = false;
      }
    });
  }

  // ✅ MÉTODOS DE VALIDACIÓN Y UTILIDAD

  validateNewContent() {
    this.contentValidation = this.monitoringObservationService.validateContent(this.newObservationContent);
  }

  isNewContentValid(): boolean {
    return this.contentValidation.valid && this.newObservationContent.trim().length >= 10;
  }

  isEditContentValid(): boolean {
    const validation = this.monitoringObservationService.validateContent(this.editContent);
    return validation.valid && this.editContent.trim().length >= 10;
  }

  isEditing(observationId: string): boolean {
    return this.editingObservationId === observationId;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  clearError() {
    this.error = null;
  }

  closeModal() {
    this.closeEvent.emit();
  }

  // ✅ WATCH PARA CAMBIOS EN INPUTS
  ngOnChanges() {
    if (this.isOpen && this.monitoringId) {
      this.loadObservations();
    }
  }
}