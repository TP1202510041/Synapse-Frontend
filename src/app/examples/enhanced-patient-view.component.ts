import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalObservationsComponent } from '../components/clinical-observations/clinical-observations.component';
import { PatientAnalyticsComponent } from '../components/patient-analytics/patient-analytics.component';
import { ExportPdfComponent } from '../components/export-pdf/export-pdf.component';

@Component({
  selector: 'app-enhanced-patient-view',
  standalone: true,
  imports: [
    CommonModule,
    ClinicalObservationsComponent,
    PatientAnalyticsComponent,
    ExportPdfComponent
  ],
  template: `
    <div class="enhanced-patient-view">
      <!-- Header del paciente -->
      <div class="patient-header">
        <div class="patient-info">
          <h2>{{ patientName }}</h2>
          <p>ID: {{ patientId }}</p>
        </div>
        <div class="action-buttons">
          <button 
            class="btn-tab" 
            [class.active]="activeTab === 'observations'"
            (click)="activeTab = 'observations'">
            Observaciones
          </button>
          <button 
            class="btn-tab" 
            [class.active]="activeTab === 'analytics'"
            (click)="activeTab = 'analytics'">
            Analytics
          </button>
          <button 
            class="btn-tab" 
            [class.active]="activeTab === 'export'"
            (click)="activeTab = 'export'">
            Exportar
          </button>
        </div>
      </div>

      <!-- Contenido de las tabs -->
      <div class="tab-content">
        <!-- Tab de Observaciones -->
        <div *ngIf="activeTab === 'observations'">
          <app-clinical-observations
            [sessionId]="currentSessionId"
            [patientId]="patientId">
          </app-clinical-observations>
        </div>

        <!-- Tab de Analytics -->
        <div *ngIf="activeTab === 'analytics'">
          <app-patient-analytics
            [patientId]="patientId">
          </app-patient-analytics>
        </div>

        <!-- Tab de Export -->
        <div *ngIf="activeTab === 'export'">
          <app-export-pdf
            [patientId]="patientId"
            [patientName]="patientName">
          </app-export-pdf>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .enhanced-patient-view {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .patient-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .patient-info h2 {
      margin: 0 0 5px 0;
      color: #333;
    }

    .patient-info p {
      margin: 0;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
    }

    .btn-tab {
      background: #f8f9fa;
      border: 1px solid #ddd;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }

    .btn-tab:hover {
      background: #e9ecef;
    }

    .btn-tab.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .tab-content {
      min-height: 400px;
    }

    @media (max-width: 768px) {
      .patient-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }
      
      .action-buttons {
        width: 100%;
        justify-content: space-between;
      }
      
      .btn-tab {
        flex: 1;
        text-align: center;
      }
    }
  `]
})
export class EnhancedPatientViewComponent {
  @Input() patientId!: number;
  @Input() patientName: string = '';
  @Input() currentSessionId: string = '';

  activeTab: 'observations' | 'analytics' | 'export' = 'observations';
}