import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimpleObservationsComponent } from '../simple-observations/simple-observations.component';
import { TestDataManagerComponent } from '../test-data-manager/test-data-manager.component';

@Component({
  selector: 'app-test-new-features-simple',
  standalone: true,
  imports: [CommonModule, SimpleObservationsComponent, TestDataManagerComponent],
  template: `
    <div class="test-container">
      <h2>🧪 Prueba de Nuevas Funcionalidades</h2>
      
      <div class="tabs">
        <button 
          class="tab" 
          [class.active]="activeTab === 'demo'"
          (click)="activeTab = 'demo'">
          🎮 Demo
        </button>
        <button 
          class="tab" 
          [class.active]="activeTab === 'observations'"
          (click)="activeTab = 'observations'">
          📝 Observaciones
        </button>
        <button 
          class="tab" 
          [class.active]="activeTab === 'info'"
          (click)="activeTab = 'info'">
          ℹ️ Información
        </button>
        <button 
          class="tab" 
          [class.active]="activeTab === 'testdata'"
          (click)="activeTab = 'testdata'">
          🧪 Datos de Prueba
        </button>
      </div>

      <div class="content">
        <!-- Demo Tab -->
        <div *ngIf="activeTab === 'demo'" class="tab-content">
          <h3>🎮 Funcionalidades Disponibles</h3>
          <div class="feature-grid">
            <div class="feature-card">
              <h4>📊 Analytics Avanzados</h4>
              <p>Progreso terapéutico y métricas detalladas</p>
              <div class="status">✅ Implementado</div>
            </div>
            <div class="feature-card">
              <h4>📄 Exportación PDF</h4>
              <p>Reportes completos con gráficos</p>
              <div class="status">✅ Implementado</div>
            </div>
            <div class="feature-card">
              <h4>🥽 Sesiones VR</h4>
              <p>Manejo de realidad virtual</p>
              <div class="status">✅ Implementado</div>
            </div>
            <div class="feature-card">
              <h4>🔍 Filtros Avanzados</h4>
              <p>Búsqueda inteligente de sesiones</p>
              <div class="status">✅ Implementado</div>
            </div>
          </div>
        </div>

        <!-- Observations Tab -->
        <div *ngIf="activeTab === 'observations'" class="tab-content">
          <h3>📝 Prueba de Observaciones Clínicas</h3>
          <app-simple-observations
            [sessionId]="testSessionId"
            [patientId]="testPatientId">
          </app-simple-observations>
        </div>

        <!-- Info Tab -->
        <div *ngIf="activeTab === 'info'" class="tab-content">
          <h3>ℹ️ Información del Sistema</h3>
          <div class="info-grid">
            <div class="info-item">
              <strong>Backend URL:</strong> http://localhost:5000
            </div>
            <div class="info-item">
              <strong>Nuevos Servicios:</strong> 5 servicios creados
            </div>
            <div class="info-item">
              <strong>Nuevos Modelos:</strong> 7 modelos agregados
            </div>
            <div class="info-item">
              <strong>Nuevos Endpoints:</strong> 15+ endpoints disponibles
            </div>
          </div>
          
          <div class="endpoints">
            <h4>🔗 Principales Endpoints Nuevos:</h4>
            <ul>
              <li><code>POST /api/observations</code> - Crear observación (sin therapistId)</li>
              <li><code>GET /api/analytics/patient/1/progress</code> - Progreso mejorado</li>
              <li><code>POST /api/exports/patient/1/pdf</code> - PDF con gráficas</li>
              <li><code>POST /api/test-data/create-sample-observations</code> - Datos de prueba</li>
            </ul>
          </div>
        </div>

        <!-- Test Data Tab -->
        <div *ngIf="activeTab === 'testdata'" class="tab-content">
          <app-test-data-manager></app-test-data-manager>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .test-container {
      max-width: 1000px;
      margin: 20px auto;
      padding: 20px;
    }

    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 30px;
    }

    .tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 10px;
    }

    .tab {
      background: #f8f9fa;
      border: 1px solid #ddd;
      padding: 10px 20px;
      border-radius: 6px 6px 0 0;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tab:hover {
      background: #e9ecef;
    }

    .tab.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .content {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .feature-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #007bff;
    }

    .feature-card h4 {
      margin-bottom: 10px;
      color: #333;
    }

    .feature-card p {
      color: #6c757d;
      margin-bottom: 10px;
    }

    .status {
      background: #28a745;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      display: inline-block;
    }

    .info-grid {
      display: grid;
      gap: 10px;
      margin-bottom: 20px;
    }

    .info-item {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #17a2b8;
    }

    .endpoints {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
    }

    .endpoints h4 {
      margin-bottom: 15px;
      color: #333;
    }

    .endpoints ul {
      list-style: none;
      padding: 0;
    }

    .endpoints li {
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .endpoints code {
      background: #e9ecef;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
      font-size: 0.9rem;
    }
  `]
})
export class TestNewFeaturesSimpleComponent {
  activeTab: 'demo' | 'observations' | 'info' | 'testdata' = 'demo';
  testPatientId = 1;
  testSessionId = 'test-session-uuid';
}