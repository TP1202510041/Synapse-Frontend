import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-simple-observations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="simple-observations">
      <h3>📝 Observaciones Clínicas - Múltiples ({{ observations.length }})</h3>
      
      <div class="add-observation">
        <textarea 
          [(ngModel)]="newObservation"
          placeholder="Agregar nueva observación..."
          rows="3">
        </textarea>
        <button (click)="addObservation()" [disabled]="!newObservation.trim()">
          Agregar
        </button>
      </div>

      <div class="observations-list">
        <div class="observation-item" *ngFor="let obs of observations; let i = index">
          <div class="observation-header">
            <strong>Observación #{{ i + 1 }}</strong>
            <span class="observation-date">{{ obs.date }}</span>
          </div>
          <div class="observation-content">{{ obs.content }}</div>
          <div class="observation-meta">
            <span class="therapist">👨‍⚕️ {{ obs.therapist || 'Terapeuta' }}</span>
            <button (click)="removeObservation(i)" class="btn-remove">🗑️ Eliminar</button>
          </div>
        </div>
        
        <div *ngIf="observations.length === 0" class="no-observations">
          📋 No hay observaciones registradas. ¡Agrega la primera!
        </div>
      </div>
    </div>
  `,
  styles: [`
    .simple-observations {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .add-observation {
      margin-bottom: 20px;
    }

    .add-observation textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-bottom: 10px;
      font-family: inherit;
    }

    .add-observation button {
      background: #007bff;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }

    .add-observation button:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .observation-item {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 10px;
      border-left: 4px solid #007bff;
    }

    .observation-content {
      margin-bottom: 10px;
      line-height: 1.5;
    }

    .observation-date {
      font-size: 0.8rem;
      color: #6c757d;
      margin-bottom: 10px;
    }

    .btn-remove {
      background: #dc3545;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
    }

    .no-observations {
      text-align: center;
      color: #6c757d;
      font-style: italic;
      padding: 20px;
    }
  `]
})
export class SimpleObservationsComponent {
  @Input() sessionId: string = '';
  @Input() patientId: number = 0;

  newObservation = '';
  observations: Array<{content: string, date: string, therapist?: string, id?: string}> = [];

  addObservation() {
    if (this.newObservation.trim()) {
      // Si tenemos acceso al servicio real, usar la API
      if (this.shouldUseRealAPI()) {
        this.createRealObservation();
      } else {
        // Versión local/simulada - múltiples observaciones
        this.observations.unshift({
          content: this.newObservation.trim(),
          date: new Date().toLocaleDateString('es-ES'),
          therapist: 'Terapeuta Demo',
          id: 'local-' + Date.now()
        });
        console.log(`📝 Nueva observación agregada. Total: ${this.observations.length}`);
        this.newObservation = '';
      }
    }
  }

  private shouldUseRealAPI(): boolean {
    // Verificar si tenemos token y sessionId válido
    return !!localStorage.getItem('token') && !!this.sessionId && this.sessionId !== 'test-session-uuid';
  }

  private createRealObservation() {
    // Aquí integraríamos con el servicio real
    console.log('Creando observación real para sesión:', this.sessionId);
    
    // Por ahora, simular la creación
    this.observations.unshift({
      content: this.newObservation.trim(),
      date: new Date().toLocaleDateString('es-ES')
    });
    this.newObservation = '';
  }

  removeObservation(index: number) {
    if (confirm('¿Estás seguro de eliminar esta observación?')) {
      this.observations.splice(index, 1);
    }
  }
}