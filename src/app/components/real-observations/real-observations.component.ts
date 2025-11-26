import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicalObservationService } from '../../services/clinical-observation.service';
import { ClinicalObservation, CreateObservationDto } from '../../models/clinical-observation.model';

@Component({
  selector: 'app-real-observations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="real-observations">
      <div class="observations-header">
        <h3>📝 Observaciones Clínicas - Múltiples ({{ observations.length }})</h3>
        <div class="session-info" *ngIf="sessionDate">
          <strong>Sesión:</strong> {{ sessionDate }} | <strong>Paciente ID:</strong> {{ patientId }}
        </div>
      </div>

      <!-- Formulario para agregar observación -->
      <div class="add-observation-form">
        <h4>Agregar Nueva Observación</h4>
        <textarea 
          [(ngModel)]="newObservationContent"
          placeholder="Escribe tu observación clínica aquí..."
          rows="4"
          maxlength="2000"
          class="observation-textarea">
        </textarea>
        <div class="form-actions">
          <button 
            class="btn-save" 
            (click)="addObservation()"
            [disabled]="!newObservationContent.trim() || isLoading">
            {{ isLoading ? 'Guardando...' : 'Guardar Observación' }}
          </button>
          <span class="char-count">{{ newObservationContent.length }}/2000</span>
        </div>
      </div>

      <!-- ✅ Lista de MÚLTIPLES observaciones -->
      <div class="observations-list">
        <h4>📋 Todas las Observaciones ({{ observations.length }})</h4>
        
        <div class="loading" *ngIf="isLoadingList">
          Cargando observaciones...
        </div>
        
        <div 
          class="observation-item" 
          *ngFor="let observation of observations; trackBy: trackByObservation">
          <div class="observation-header">
            <span class="therapist-name">{{ observation.therapistName || 'Terapeuta' }}</span>
            <span class="observation-date">{{ formatDate(observation.createdAt) }}</span>
          </div>
          <div class="observation-content">{{ observation.content }}</div>
          <div class="observation-meta">
            <small>Paciente: {{ observation.patientName }}</small>
            <small>Versión: {{ observation.version }}</small>
          </div>
          <div class="observation-actions">
            <button 
              class="btn-edit" 
              (click)="startEdit(observation)"
              *ngIf="!isEditing(observation.id)">
              Editar
            </button>
            <button 
              class="btn-delete" 
              (click)="deleteObservation(observation.id)">
              Eliminar
            </button>
          </div>
          
          <!-- Formulario de edición -->
          <div class="edit-form" *ngIf="isEditing(observation.id)">
            <textarea 
              [(ngModel)]="editContent"
              rows="4"
              maxlength="2000"
              class="observation-textarea">
            </textarea>
            <div class="form-actions">
              <button 
                class="btn-save" 
                (click)="saveEdit(observation)"
                [disabled]="!editContent.trim() || isLoading">
                Guardar Cambios
              </button>
              <button 
                class="btn-cancel" 
                (click)="cancelEdit()">
                Cancelar
              </button>
            </div>
          </div>
        </div>
        
        <div class="no-observations" *ngIf="observations.length === 0 && !isLoadingList">
          No hay observaciones registradas para esta sesión.
        </div>
      </div>

      <!-- Estado de conexión -->
      <div class="connection-status">
        <div class="status-indicator" [class]="isConnected ? 'connected' : 'disconnected'">
          {{ isConnected ? '🟢 Conectado al backend' : '🔴 Modo offline' }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .real-observations {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .observations-header {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e0e0e0;
    }

    .observations-header h3 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .session-info {
      background: #e3f2fd;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 0.9rem;
      color: #1976d2;
    }

    .add-observation-form {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      border-left: 4px solid #007bff;
    }

    .add-observation-form h4 {
      margin: 0 0 15px 0;
      color: #333;
    }

    .observation-textarea {
      width: 100%;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 12px;
      font-family: inherit;
      font-size: 0.95rem;
      resize: vertical;
      min-height: 100px;
    }

    .observation-textarea:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 15px;
    }

    .btn-save {
      background: #28a745;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .btn-save:hover:not(:disabled) {
      background: #218838;
    }

    .btn-save:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .btn-cancel {
      background: #6c757d;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      margin-left: 10px;
    }

    .btn-cancel:hover {
      background: #545b62;
    }

    .char-count {
      font-size: 0.8rem;
      color: #6c757d;
    }

    .observations-list h4 {
      color: #333;
      margin-bottom: 20px;
    }

    .observation-item {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      background: #fafafa;
      transition: box-shadow 0.2s;
    }

    .observation-item:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .observation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .therapist-name {
      font-weight: 600;
      color: #007bff;
    }

    .observation-date {
      font-size: 0.85rem;
      color: #6c757d;
    }

    .observation-content {
      color: #333;
      line-height: 1.6;
      margin-bottom: 15px;
      white-space: pre-wrap;
      background: white;
      padding: 15px;
      border-radius: 4px;
      border-left: 4px solid #007bff;
    }

    .observation-meta {
      display: flex;
      gap: 20px;
      margin-bottom: 15px;
    }

    .observation-meta small {
      color: #6c757d;
      font-size: 0.8rem;
    }

    .observation-actions {
      display: flex;
      gap: 10px;
    }

    .btn-edit {
      background: #ffc107;
      color: #212529;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .btn-edit:hover {
      background: #e0a800;
    }

    .btn-delete {
      background: #dc3545;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .btn-delete:hover {
      background: #c82333;
    }

    .edit-form {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
    }

    .no-observations {
      text-align: center;
      color: #6c757d;
      font-style: italic;
      padding: 40px 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .loading {
      text-align: center;
      color: #6c757d;
      padding: 20px;
      font-style: italic;
    }

    .connection-status {
      margin-top: 20px;
      text-align: center;
    }

    .status-indicator {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .status-indicator.connected {
      background: #d4edda;
      color: #155724;
    }

    .status-indicator.disconnected {
      background: #f8d7da;
      color: #721c24;
    }

    @media (max-width: 768px) {
      .observation-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      
      .observation-meta {
        flex-direction: column;
        gap: 5px;
      }
      
      .form-actions {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
    }
  `]
})
export class RealObservationsComponent implements OnInit {
  @Input() sessionId!: string;
  @Input() patientId!: number;
  @Input() sessionDate?: string;

  observations: ClinicalObservation[] = [];
  newObservationContent = '';
  editingObservationId: string | null = null;
  editContent = '';
  isLoading = false;
  isLoadingList = false;
  isConnected = false;

  constructor(private observationService: ClinicalObservationService) {}

  ngOnInit() {
    this.checkConnection();
    this.loadObservations();
  }

  private checkConnection() {
    this.isConnected = !!localStorage.getItem('token') && 
                     !!this.sessionId && 
                     this.sessionId !== 'test-session-uuid';
  }

  loadObservations() {
    if (!this.isConnected) {
      console.log('🔄 Modo offline - no se cargan observaciones reales');
      return;
    }

    console.log('🔄 Cargando observaciones para sesión:', this.sessionId);
    this.isLoadingList = true;
    
    this.observationService.getObservationsBySession(this.sessionId).subscribe({
      next: (response: any) => {
        console.log('📝 Response de observaciones:', response);
        
        // ✅ El backend ahora devuelve MÚLTIPLES observaciones
        if (response.success && response.data) {
          this.observations = Array.isArray(response.data) ? response.data : [response.data];
          console.log(`📝 Múltiples observaciones cargadas: ${this.observations.length} para sesión ${this.sessionId}`);
          
          // Log detallado de cada observación
          this.observations.forEach((obs, index) => {
            console.log(`  📋 #${index + 1}: ${obs.content.substring(0, 50)}... (${obs.therapistName})`);
          });
        } else if (Array.isArray(response)) {
          // Fallback si el backend devuelve array directo
          this.observations = response;
          console.log('✅ Observaciones cargadas (array directo):', this.observations.length);
        } else {
          this.observations = [];
          console.log('⚠️ No se encontraron observaciones para esta sesión');
        }
        
        this.isLoadingList = false;
      },
      error: (error) => {
        console.error('❌ Error loading observations:', error);
        this.observations = [];
        this.isLoadingList = false;
        
        // No desconectar automáticamente, solo mostrar error
        console.log('⚠️ Error cargando observaciones, pero manteniendo conexión');
      }
    });
  }

  addObservation() {
    if (!this.newObservationContent.trim()) return;

    if (!this.isConnected) {
      alert('No hay conexión con el backend. Las observaciones no se guardarán.');
      return;
    }

    const observationData = {
      sessionId: this.sessionId,
      patientId: this.patientId,
      content: this.newObservationContent.trim(),
      sessionDate: new Date().toISOString().split('T')[0] // Agregar fecha actual
    };

    console.log('🔄 Guardando observación (comportamiento upsert):', observationData);
    this.isLoading = true;
    
    this.observationService.createObservation(observationData).subscribe({
      next: (response: any) => {
        console.log('✅ Response completa:', response);
        
        if (response.success && response.data) {
          const observation = response.data;
          
          // ✅ SIEMPRE agregar como nueva observación (múltiples permitidas)
          this.observations.unshift(observation);
          console.log(`✅ Nueva observación creada. Total ahora: ${this.observations.length}`);
          console.log('📋 Observación:', {
            id: observation.id,
            content: observation.content.substring(0, 50) + '...',
            therapist: observation.therapistName,
            created: observation.createdAt
          });
          
          this.newObservationContent = '';
        } else {
          console.error('❌ Response sin data:', response);
          alert('Error: Respuesta del servidor sin datos');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error saving observation:', error);
        this.isLoading = false;
        
        let errorMessage = 'Error desconocido';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        }
        
        alert('Error al guardar la observación: ' + errorMessage);
      }
    });
  }

  startEdit(observation: ClinicalObservation) {
    this.editingObservationId = observation.id;
    this.editContent = observation.content;
  }

  saveEdit(observation: ClinicalObservation) {
    if (!this.editContent.trim()) return;

    this.isLoading = true;
    this.observationService.updateObservation(observation.id, {
      content: this.editContent.trim(),
      version: observation.version
    }).subscribe({
      next: (response: any) => {
        const updatedObservation = response.data || response;
        const index = this.observations.findIndex(obs => obs.id === observation.id);
        if (index !== -1) {
          this.observations[index] = updatedObservation;
        }
        this.cancelEdit();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating observation:', error);
        this.isLoading = false;
        alert('Error al actualizar la observación: ' + (error.error?.message || error.message));
      }
    });
  }

  cancelEdit() {
    this.editingObservationId = null;
    this.editContent = '';
  }

  deleteObservation(observationId: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta observación?')) return;

    this.observationService.deleteObservation(observationId).subscribe({
      next: () => {
        this.observations = this.observations.filter(obs => obs.id !== observationId);
        console.log('Observación eliminada');
      },
      error: (error) => {
        console.error('Error deleting observation:', error);
        alert('Error al eliminar la observación: ' + (error.error?.message || error.message));
      }
    });
  }

  isEditing(observationId: string): boolean {
    return this.editingObservationId === observationId;
  }

  trackByObservation(index: number, observation: ClinicalObservation): string {
    return observation.id;
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
}