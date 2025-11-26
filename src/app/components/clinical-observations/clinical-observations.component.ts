import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicalObservationService } from '../../services/clinical-observation.service';
import { ClinicalObservation, CreateObservationDto } from '../../models/clinical-observation.model';
// import { AuthService } from '../../User/services/auth.service';

@Component({
  selector: 'app-clinical-observations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="clinical-observations">
      <div class="observations-header">
        <h3>📝 Observaciones Clínicas ({{ observations.length }})</h3>
        <button 
          class="btn-add-observation" 
          (click)="showAddForm = !showAddForm"
          *ngIf="canAddObservation">
          {{ showAddForm ? 'Cancelar' : '+ Nueva Observación' }}
        </button>
      </div>

      <!-- ✅ Formulario con auto-guardado y validación en tiempo real -->
      <div class="add-observation-form" *ngIf="showAddForm">
        <div class="form-header">
          <span class="auto-save-status" [class]="autoSaveStatus">
            {{ getAutoSaveMessage() }}
          </span>
        </div>
        <textarea 
          [(ngModel)]="newObservationContent"
          (input)="onContentChange()"
          placeholder="Escribe tu observación clínica aquí... (mínimo 10 caracteres)"
          rows="4"
          maxlength="2000">
        </textarea>
        <div class="form-actions">
          <button 
            class="btn-save" 
            (click)="addObservation()"
            [disabled]="!isContentValid() || isLoading">
            {{ isLoading ? 'Guardando...' : 'Guardar Ahora' }}
          </button>
          <div class="validation-info">
            <span class="char-count" [class.invalid]="!isContentValid()">
              {{ newObservationContent.length }}/2000
            </span>
            <span class="validation-message" [class.error]="!contentValidation.valid">
              {{ contentValidation.message }}
            </span>
          </div>
        </div>
      </div>

      <!-- ✅ Lista de MÚLTIPLES observaciones -->
      <div class="observations-list">
        <div 
          class="observation-item" 
          *ngFor="let observation of observations; trackBy: trackByObservation; let i = index">
          <div class="observation-header">
            <div class="observation-number">
              <strong>Observación #{{ i + 1 }}</strong>
            </div>
            <div class="observation-meta">
              <span class="therapist-name">👨‍⚕️ {{ observation.therapistName }}</span>
              <span class="observation-date">📅 {{ formatDate(observation.createdAt) }}</span>
            </div>
          </div>
          <div class="observation-content">{{ observation.content }}</div>
          <div class="observation-actions" *ngIf="canEditObservation(observation)">
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
              maxlength="2000">
            </textarea>
            <div class="form-actions">
              <button 
                class="btn-save" 
                (click)="saveEdit(observation)"
                [disabled]="!editContent.trim() || isLoading">
                Guardar
              </button>
              <button 
                class="btn-cancel" 
                (click)="cancelEdit()">
                Cancelar
              </button>
            </div>
          </div>
        </div>
        
        <div class="no-observations" *ngIf="observations.length === 0 && !isLoading">
          No hay observaciones clínicas para esta sesión.
        </div>
        
        <div class="loading" *ngIf="isLoading">
          Cargando observaciones...
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./clinical-observations.component.css']
})
export class ClinicalObservationsComponent implements OnInit, OnDestroy {
  @Input() sessionId!: string;
  @Input() patientId!: number;

  observations: ClinicalObservation[] = [];
  showAddForm = false;
  newObservationContent = '';
  editingObservationId: string | null = null;
  editContent = '';
  isLoading = false;
  canAddObservation = true;

  // ✅ NUEVAS PROPIEDADES PARA AUTO-GUARDADO
  autoSaveTimer: any;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error' = 'idle';
  contentValidation = { valid: false, message: '', charCount: 0 };
  lastSavedContent = '';
  autoSaveInterval = 30000; // 30 segundos

  constructor(
    private observationService: ClinicalObservationService
    // private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadObservations();
  }

  ngOnDestroy() {
    // ✅ Limpiar timer al destruir componente
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
  }

  // ✅ CARGA DE MÚLTIPLES OBSERVACIONES - BACKEND ACTUALIZADO
  loadObservations() {
    if (!this.sessionId) return;
    
    this.isLoading = true;
    this.observationService.getObservationsBySession(this.sessionId).subscribe({
      next: (response) => {
        // ✅ Ahora el backend devuelve MÚLTIPLES observaciones
        const responseData = (response as any).data || response;
        this.observations = Array.isArray(responseData) ? responseData : [responseData];
        
        console.log(`📝 Encontradas ${this.observations.length} observaciones para la sesión ${this.sessionId}`);
        this.observations.forEach((obs, index) => {
          console.log(`  📋 Observación #${index + 1}: ${obs.content.substring(0, 50)}...`);
        });
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading observations:', error);
        this.observations = [];
        this.isLoading = false;
      }
    });
  }

  // ✅ CREAR NUEVA OBSERVACIÓN - MÚLTIPLES PERMITIDAS
  addObservation() {
    if (!this.isContentValid()) return;

    const newObservation: CreateObservationDto = {
      sessionId: this.sessionId,
      patientId: this.patientId,
      content: this.newObservationContent.trim(),
      sessionDate: new Date().toISOString().split('T')[0]
    };

    this.isLoading = true;
    this.autoSaveStatus = 'saving';
    
    console.log('🆕 Creando nueva observación (múltiples permitidas):', newObservation);
    
    this.observationService.createObservation(newObservation).subscribe({
      next: (response) => {
        console.log('✅ Nueva observación creada:', response);
        
        // ✅ El backend devuelve la nueva observación
        const savedObservation = (response as any).data || response;
        
        // ✅ SIEMPRE agregar como nueva observación (no reemplazar)
        this.observations.unshift(savedObservation);
        
        console.log(`📝 Total de observaciones ahora: ${this.observations.length}`);
        
        this.newObservationContent = '';
        this.lastSavedContent = '';
        this.showAddForm = false;
        this.isLoading = false;
        this.autoSaveStatus = 'saved';
        
        // Limpiar status después de 3 segundos
        setTimeout(() => this.autoSaveStatus = 'idle', 3000);
      },
      error: (error) => {
        console.error('❌ Error creating observation:', error);
        this.isLoading = false;
        this.autoSaveStatus = 'error';
        
        // Limpiar status de error después de 5 segundos
        setTimeout(() => this.autoSaveStatus = 'idle', 5000);
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
      next: (updatedObservation) => {
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
      },
      error: (error) => {
        console.error('Error deleting observation:', error);
      }
    });
  }

  isEditing(observationId: string): boolean {
    return this.editingObservationId === observationId;
  }

  canEditObservation(observation: ClinicalObservation): boolean {
    // const currentUser = this.authService.currentUserValue;
    // return currentUser?.id === observation.therapistId;
    return true; // Temporalmente permitir editar todas las observaciones
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

  // ✅ NUEVOS MÉTODOS PARA AUTO-GUARDADO Y VALIDACIÓN

  onContentChange() {
    // Validar contenido en tiempo real
    this.contentValidation = this.observationService.validateContent(this.newObservationContent);
    
    // Cancelar timer anterior
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    
    // Solo auto-guardar si el contenido es válido y ha cambiado
    if (this.contentValidation.valid && 
        this.newObservationContent.trim() !== this.lastSavedContent.trim()) {
      
      this.autoSaveStatus = 'idle';
      
      // Configurar nuevo timer para auto-guardado
      this.autoSaveTimer = setTimeout(() => {
        this.autoSaveObservation();
      }, this.autoSaveInterval);
    }
  }

  autoSaveObservation() {
    if (!this.isContentValid() || this.isLoading) return;
    
    console.log('🔄 Auto-guardando observación...');
    this.autoSaveStatus = 'saving';
    
    try {
      this.observationService.autoSaveObservation(
        this.sessionId, 
        this.patientId, 
        this.newObservationContent.trim()
      ).subscribe({
        next: (response) => {
          console.log('✅ Auto-guardado exitoso:', response);
          this.lastSavedContent = this.newObservationContent.trim();
          this.autoSaveStatus = 'saved';
          
          // ✅ Agregar nueva observación (múltiples permitidas)
          const savedObservation = (response as any).data || response;
          
          // ✅ SIEMPRE agregar como nueva observación
          this.observations.unshift(savedObservation);
          
          console.log(`📝 Auto-guardado: Total observaciones ahora: ${this.observations.length}`);
          
          // Limpiar status después de 3 segundos
          setTimeout(() => this.autoSaveStatus = 'idle', 3000);
        },
        error: (error) => {
          console.error('❌ Error en auto-guardado:', error);
          this.autoSaveStatus = 'error';
          
          // Limpiar status de error después de 5 segundos
          setTimeout(() => this.autoSaveStatus = 'idle', 5000);
        }
      });
    } catch (error) {
      console.error('❌ Error de validación en auto-guardado:', error);
      this.autoSaveStatus = 'error';
      setTimeout(() => this.autoSaveStatus = 'idle', 5000);
    }
  }

  isContentValid(): boolean {
    return this.contentValidation.valid && this.newObservationContent.trim().length >= 10;
  }

  getAutoSaveMessage(): string {
    switch (this.autoSaveStatus) {
      case 'saving':
        return '💾 Guardando...';
      case 'saved':
        return '✅ Guardado automáticamente';
      case 'error':
        return '❌ Error al guardar';
      default:
        return this.contentValidation.valid ? 
          '🔄 Auto-guardado en 30s' : 
          '⏳ Esperando contenido válido';
    }
  }
}