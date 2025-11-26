import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestDataService } from '../../services/test-data.service';

@Component({
  selector: 'app-test-data-manager',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-data-manager">
      <div class="header">
        <h3>🧪 Gestor de Datos de Prueba</h3>
        <p>Crea y gestiona datos de ejemplo para probar las funcionalidades</p>
      </div>

      <div class="actions-section">
        <h4>Acciones Disponibles</h4>
        
        <div class="action-card">
          <div class="action-info">
            <h5>📝 Crear Observaciones de Prueba</h5>
            <p>Genera observaciones clínicas de ejemplo para probar la funcionalidad</p>
          </div>
          <button 
            class="btn-action" 
            (click)="createSampleObservations()"
            [disabled]="isLoading">
            {{ isLoading ? 'Creando...' : 'Crear Observaciones' }}
          </button>
        </div>

        <div class="action-card">
          <div class="action-info">
            <h5>📊 Ver Información de Datos</h5>
            <p>Muestra estadísticas de los datos disponibles en el sistema</p>
          </div>
          <button 
            class="btn-action secondary" 
            (click)="getDataInfo()"
            [disabled]="isLoading">
            Ver Información
          </button>
        </div>
      </div>

      <div class="results-section" *ngIf="lastResult">
        <h4>Resultado</h4>
        <div class="result-box" [class]="resultType">
          <pre>{{ lastResult }}</pre>
        </div>
      </div>

      <div class="info-section">
        <h4>ℹ️ Información</h4>
        <ul>
          <li><strong>Observaciones de Prueba:</strong> Crea 3 observaciones de ejemplo</li>
          <li><strong>Datos Realistas:</strong> Incluye contenido clínico apropiado</li>
          <li><strong>Asociación Automática:</strong> Se vinculan a sesiones existentes</li>
          <li><strong>Token JWT:</strong> Usa tu sesión actual para crear los datos</li>
        </ul>
      </div>

      <div class="connection-status">
        <div class="status-indicator" [class]="isConnected ? 'connected' : 'disconnected'">
          {{ isConnected ? '🟢 Backend conectado' : '🔴 Backend desconectado' }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .test-data-manager {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .header {
      margin-bottom: 30px;
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #e0e0e0;
    }

    .header h3 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .header p {
      margin: 0;
      color: #6c757d;
    }

    .actions-section {
      margin-bottom: 30px;
    }

    .actions-section h4 {
      color: #333;
      margin-bottom: 20px;
    }

    .action-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 15px;
      background: #f8f9fa;
    }

    .action-info {
      flex: 1;
    }

    .action-info h5 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .action-info p {
      margin: 0;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .btn-action {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: background-color 0.2s;
      min-width: 140px;
    }

    .btn-action:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-action:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .btn-action.secondary {
      background: #6c757d;
    }

    .btn-action.secondary:hover:not(:disabled) {
      background: #545b62;
    }

    .results-section {
      margin-bottom: 30px;
    }

    .results-section h4 {
      color: #333;
      margin-bottom: 15px;
    }

    .result-box {
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #007bff;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      white-space: pre-wrap;
    }

    .result-box.success {
      background: #d4edda;
      color: #155724;
      border-left-color: #28a745;
    }

    .result-box.error {
      background: #f8d7da;
      color: #721c24;
      border-left-color: #dc3545;
    }

    .result-box.info {
      background: #d1ecf1;
      color: #0c5460;
      border-left-color: #17a2b8;
    }

    .info-section {
      background: #e3f2fd;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #2196f3;
      margin-bottom: 20px;
    }

    .info-section h4 {
      color: #333;
      margin-bottom: 15px;
    }

    .info-section ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .info-section li {
      padding: 5px 0;
      color: #333;
      font-size: 0.9rem;
    }

    .connection-status {
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
      .action-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }
      
      .btn-action {
        width: 100%;
      }
    }
  `]
})
export class TestDataManagerComponent {
  isLoading = false;
  lastResult = '';
  resultType: 'success' | 'error' | 'info' = 'info';
  isConnected = false;

  constructor(private testDataService: TestDataService) {
    this.checkConnection();
  }

  private checkConnection() {
    this.isConnected = !!localStorage.getItem('token');
  }

  createSampleObservations() {
    if (!this.isConnected) {
      this.showResult('❌ No hay conexión con el backend. Inicia sesión primero.', 'error');
      return;
    }

    this.isLoading = true;
    this.showResult('🔄 Creando observaciones de prueba...', 'info');

    this.testDataService.createSampleObservations().subscribe({
      next: (result) => {
        console.log('✅ Observaciones creadas:', result);
        this.showResult(`✅ ${result}`, 'success');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error creando observaciones:', error);
        this.showResult(`❌ Error: ${error.error || error.message}`, 'error');
        this.isLoading = false;
      }
    });
  }

  getDataInfo() {
    if (!this.isConnected) {
      this.showResult('❌ No hay conexión con el backend. Inicia sesión primero.', 'error');
      return;
    }

    this.isLoading = true;
    this.showResult('🔄 Obteniendo información de datos...', 'info');

    this.testDataService.getDataInfo().subscribe({
      next: (info) => {
        console.log('📊 Información de datos:', info);
        this.showResult(`📊 Información del Sistema:\n\n${info}`, 'info');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error obteniendo información:', error);
        this.showResult(`❌ Error: ${error.error || error.message}`, 'error');
        this.isLoading = false;
      }
    });
  }

  private showResult(message: string, type: 'success' | 'error' | 'info') {
    this.lastResult = message;
    this.resultType = type;
  }
}