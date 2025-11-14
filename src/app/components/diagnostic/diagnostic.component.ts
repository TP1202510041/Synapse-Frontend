import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { QuickCheck } from '../../utils/quick-check';

@Component({
  selector: 'app-diagnostic',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="diagnostic">
      <h2>🔍 Diagnóstico del Sistema</h2>
      
      <div class="status-section">
        <h3>Estado de Servicios</h3>
        <div class="status-item">
          <span class="label">HttpClient:</span>
          <span class="status success">✅ Disponible</span>
        </div>
        <div class="status-item">
          <span class="label">Backend URL:</span>
          <span class="value">{{ backendUrl }}</span>
        </div>
        <div class="status-item">
          <span class="label">Timestamp:</span>
          <span class="value">{{ currentTime }}</span>
        </div>
      </div>

      <div class="test-section">
        <h3>Pruebas Básicas</h3>
        <button (click)="testBackendConnection()" [disabled]="testing">
          {{ testing ? 'Probando...' : 'Probar Conexión Backend' }}
        </button>
        
        <div *ngIf="testResult" class="test-result" [class]="testResult.success ? 'success' : 'error'">
          {{ testResult.message }}
        </div>
      </div>

      <div class="info-section">
        <h3>Información del Sistema</h3>
        <ul>
          <li>Angular: Versión 19+</li>
          <li>Standalone Components: ✅ Habilitado</li>
          <li>HTTP Client: ✅ Configurado</li>
          <li>Routing: ✅ Configurado</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .diagnostic {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .diagnostic h2 {
      color: #007bff;
      text-align: center;
      margin-bottom: 30px;
    }

    .status-section, .test-section, .info-section {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
    }

    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .status-item:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 600;
      color: #333;
    }

    .status.success {
      color: #28a745;
      font-weight: 600;
    }

    .value {
      color: #6c757d;
      font-family: monospace;
    }

    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }

    button:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .test-result {
      margin-top: 15px;
      padding: 10px;
      border-radius: 4px;
    }

    .test-result.success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .test-result.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .info-section ul {
      list-style-type: none;
      padding: 0;
    }

    .info-section li {
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }
  `]
})
export class DiagnosticComponent implements OnInit {
  backendUrl = 'https://synapse-backend--0000001.wonderfulforest-e77213bb.brazilsouth.azurecontainerapps.io';
  currentTime = new Date().toLocaleString();
  testing = false;
  testResult: {success: boolean, message: string} | null = null;

  environmentCheck = QuickCheck.checkEnvironment();
  servicesCheck = QuickCheck.checkServices();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Verificación automática al cargar
    this.testBackendConnection();
  }

  testBackendConnection() {
    this.testing = true;
    this.testResult = null;

    // Probar endpoint básico
    this.http.get(`${this.backendUrl}/api/auth/test`).subscribe({
      next: (response) => {
        this.testResult = {
          success: true,
          message: '✅ Conexión exitosa con el backend'
        };
        this.testing = false;
      },
      error: (error) => {
        this.testResult = {
          success: false,
          message: `❌ Error de conexión: ${error.message || 'No se pudo conectar al backend'}`
        };
        this.testing = false;
      }
    });
  }
}