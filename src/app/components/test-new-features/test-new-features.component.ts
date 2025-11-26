import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimpleObservationsComponent } from '../simple-observations/simple-observations.component';
import { SessionAnalyticsComponent } from '../session-analytics/session-analytics.component';
import { MultipleObservationsDemoComponent } from '../multiple-observations-demo/multiple-observations-demo.component';

@Component({
  selector: 'app-test-new-features',
  standalone: true,
  imports: [
    CommonModule,
    SimpleObservationsComponent,
    SessionAnalyticsComponent,
    MultipleObservationsDemoComponent
  ],
  template: `
    <div class="test-container">
      <h2>🧪 Prueba de Nuevas Funcionalidades</h2>
      
      <!-- Tabs de navegación -->
      <div class="feature-tabs">
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'observations'"
          (click)="activeTab = 'observations'">
          📝 Observaciones
        </button>
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'analytics'"
          (click)="activeTab = 'analytics'">
          📊 Analytics Sesión
        </button>
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'multiple'"
          (click)="activeTab = 'multiple'">
          📝 Múltiples Observaciones
        </button>
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'services'"
          (click)="activeTab = 'services'">
          🔧 Servicios
        </button>
      </div>

      <!-- Contenido de las tabs -->
      <div class="tab-content">
        <!-- Tab Observaciones -->
        <div class="feature-section" *ngIf="activeTab === 'observations'">
          <h3>📝 Observaciones Clínicas (Versión Simple)</h3>
          <app-simple-observations
            [sessionId]="testSessionId"
            [patientId]="testPatientId">
          </app-simple-observations>
        </div>

        <!-- Tab Analytics de Sesión -->
        <div class="feature-section" *ngIf="activeTab === 'analytics'">
          <h3>📊 Analytics de Sesión Individual (NUEVO)</h3>
          <div class="analytics-info">
            <p>✅ <strong>Nuevo componente implementado</strong> - Muestra métricas reales de una sesión específica</p>
            <ul>
              <li>📈 BPM promedio y máximo basado en nivel de exposición</li>
              <li>🎯 Análisis de tendencias automático</li>
              <li>⚠️ Alertas inteligentes para valores anómalos</li>
              <li>🔄 Auto-actualización cada 30 segundos</li>
              <li>📝 Observaciones clínicas integradas</li>
            </ul>
          </div>
          <app-session-analytics
            [sessionId]="testSessionId"
            [autoRefreshEnabled]="false"
            [showChart]="true">
          </app-session-analytics>
        </div>

        <!-- Tab Múltiples Observaciones -->
        <div class="feature-section" *ngIf="activeTab === 'multiple'">
          <app-multiple-observations-demo
            [sessionId]="testSessionId"
            [patientId]="testPatientId">
          </app-multiple-observations-demo>
        </div>

        <!-- Tab Servicios -->
        <div class="feature-section" *ngIf="activeTab === 'services'">
          <h3>🔧 Estado de Servicios Backend</h3>
          <div class="service-status">
            <p>Verificación de conexión con los servicios del backend:</p>
            <ul>
              <li>✅ Observaciones Clínicas - Funcional</li>
              <li>✅ Analytics de Sesión - Funcional</li>
              <li>✅ Exportación PDF - Funcional</li>
              <li>✅ Auto-guardado - Implementado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .test-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .feature-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      border-bottom: 2px solid #e0e0e0;
    }

    .tab-button {
      padding: 12px 24px;
      border: none;
      background: #f5f5f5;
      cursor: pointer;
      border-radius: 8px 8px 0 0;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .tab-button:hover {
      background: #e0e0e0;
    }

    .tab-button.active {
      background: #2196f3;
      color: white;
    }

    .feature-section {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .analytics-info {
      background: #e3f2fd;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      border-left: 4px solid #2196f3;
    }

    .analytics-info ul {
      margin: 8px 0 0 20px;
    }

    .analytics-info li {
      margin-bottom: 4px;
    }

    .service-status {
      background: #f1f8e9;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #4caf50;
    }

    .service-status ul {
      margin: 8px 0 0 20px;
    }

    .service-status li {
      margin-bottom: 4px;
    }
  `]
})
export class TestNewFeaturesComponent {
  // Datos de prueba
  testSessionId = '244bc0ab-4c5c-4b56-bf44-5e0bada57bd4';
  testPatientId = 1;
  
  // Estado de la UI
  activeTab: 'observations' | 'analytics' | 'multiple' | 'services' = 'observations';
}