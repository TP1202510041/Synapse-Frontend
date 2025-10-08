import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-simple-export',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="simple-export">
      <div class="export-header">
        <h3>📄 Exportar Reporte PDF</h3>
        <p>Genera reportes completos del paciente {{ patientName }}</p>
      </div>

      <div class="export-options">
        <h4>⚙️ Opciones de Exportación</h4>
        
        <div class="option-group">
          <label class="checkbox-label">
            <input type="checkbox" [(ngModel)]="includeGraphs">
            <span class="checkmark"></span>
            Incluir gráficos y visualizaciones
          </label>
        </div>

        <div class="option-group">
          <label class="checkbox-label">
            <input type="checkbox" [(ngModel)]="includeObservations">
            <span class="checkmark"></span>
            Incluir observaciones clínicas
          </label>
        </div>

        <div class="option-group">
          <label class="checkbox-label">
            <input type="checkbox" [(ngModel)]="includeAnalytics">
            <span class="checkmark"></span>
            Incluir análisis y métricas
          </label>
        </div>

        <div class="date-range">
          <h5>📅 Rango de Fechas</h5>
          <div class="date-inputs">
            <div class="date-input-group">
              <label>Desde:</label>
              <input type="date" [(ngModel)]="dateFrom" class="date-input">
            </div>
            <div class="date-input-group">
              <label>Hasta:</label>
              <input type="date" [(ngModel)]="dateTo" class="date-input">
            </div>
          </div>
        </div>
      </div>

      <div class="export-preview">
        <h4>📋 Vista Previa del Contenido</h4>
        <div class="preview-sections">
          <div class="preview-section">
            <span class="section-icon">👤</span>
            <span class="section-name">Información del Paciente</span>
            <span class="section-status included">✅ Incluido</span>
          </div>
          
          <div class="preview-section">
            <span class="section-icon">📅</span>
            <span class="section-name">Historial de Sesiones</span>
            <span class="section-status included">✅ Incluido</span>
          </div>
          
          <div class="preview-section">
            <span class="section-icon">📊</span>
            <span class="section-name">Gráficos y Visualizaciones</span>
            <span class="section-status" [class]="includeGraphs ? 'included' : 'excluded'">
              {{ includeGraphs ? '✅ Incluido' : '❌ Excluido' }}
            </span>
          </div>
          
          <div class="preview-section">
            <span class="section-icon">📝</span>
            <span class="section-name">Observaciones Clínicas</span>
            <span class="section-status" [class]="includeObservations ? 'included' : 'excluded'">
              {{ includeObservations ? '✅ Incluido' : '❌ Excluido' }}
            </span>
          </div>
          
          <div class="preview-section">
            <span class="section-icon">📈</span>
            <span class="section-name">Análisis y Métricas</span>
            <span class="section-status" [class]="includeAnalytics ? 'included' : 'excluded'">
              {{ includeAnalytics ? '✅ Incluido' : '❌ Excluido' }}
            </span>
          </div>
        </div>
      </div>

      <div class="export-actions">
        <button 
          class="btn-export" 
          (click)="generatePDF()"
          [disabled]="isGenerating">
          <span class="btn-icon">{{ isGenerating ? '⏳' : '📄' }}</span>
          {{ isGenerating ? 'Generando PDF...' : 'Generar Reporte PDF' }}
        </button>
      </div>

      <div class="export-status" *ngIf="exportMessage">
        <div class="status-message" [class]="exportSuccess ? 'success' : 'info'">
          {{ exportMessage }}
        </div>
        
        <button 
          *ngIf="exportSuccess && !isGenerating"
          class="btn-download"
          (click)="downloadPDF()">
          <span class="btn-icon">⬇️</span>
          Descargar PDF
        </button>
      </div>

      <div class="export-info">
        <h4>ℹ️ Información del Reporte</h4>
        <ul>
          <li><strong>Formato:</strong> PDF de alta calidad</li>
          <li><strong>Idioma:</strong> Español</li>
          <li><strong>Período:</strong> {{ formatDateRange() }}</li>
          <li><strong>Generación:</strong> Automática con datos actualizados</li>
          <li><strong>Validez:</strong> El enlace de descarga expira en 24 horas</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .simple-export {
      padding: 20px;
    }

    .export-header {
      margin-bottom: 30px;
      text-align: center;
    }

    .export-header h3 {
      color: #333;
      margin-bottom: 10px;
    }

    .export-header p {
      color: #6c757d;
      margin: 0;
    }

    .export-options {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      border-left: 4px solid #007bff;
    }

    .export-options h4 {
      color: #333;
      margin-bottom: 15px;
    }

    .option-group {
      margin-bottom: 15px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 0.95rem;
      color: #333;
    }

    .checkbox-label input[type="checkbox"] {
      margin-right: 10px;
      transform: scale(1.2);
    }

    .date-range {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }

    .date-range h5 {
      color: #333;
      margin-bottom: 10px;
    }

    .date-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    .date-input-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #333;
      font-size: 0.9rem;
    }

    .date-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    .export-preview {
      background: white;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      margin-bottom: 20px;
    }

    .export-preview h4 {
      color: #333;
      margin-bottom: 15px;
    }

    .preview-sections {
      display: grid;
      gap: 10px;
    }

    .preview-section {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .section-icon {
      font-size: 1.2rem;
    }

    .section-name {
      flex: 1;
      color: #333;
      font-weight: 500;
    }

    .section-status.included {
      color: #28a745;
      font-weight: 600;
    }

    .section-status.excluded {
      color: #dc3545;
      font-weight: 600;
    }

    .export-actions {
      text-align: center;
      margin-bottom: 20px;
    }

    .btn-export {
      background: #007bff;
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1.1rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      transition: background-color 0.2s;
      min-width: 200px;
      justify-content: center;
    }

    .btn-export:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-export:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .export-status {
      text-align: center;
      margin-bottom: 20px;
    }

    .status-message {
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 15px;
      font-weight: 500;
    }

    .status-message.success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .status-message.info {
      background: #d1ecf1;
      color: #0c5460;
      border: 1px solid #bee5eb;
    }

    .btn-download {
      background: #28a745;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background-color 0.2s;
    }

    .btn-download:hover {
      background: #218838;
    }

    .export-info {
      background: #e3f2fd;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #2196f3;
    }

    .export-info h4 {
      color: #333;
      margin-bottom: 15px;
    }

    .export-info ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .export-info li {
      padding: 5px 0;
      color: #333;
      font-size: 0.9rem;
    }

    .btn-icon {
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .date-inputs {
        grid-template-columns: 1fr;
      }
      
      .preview-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      
      .btn-export {
        width: 100%;
      }
    }
  `]
})
export class SimpleExportComponent {
  @Input() patientId!: number;
  @Input() patientName: string = '';

  includeGraphs = true;
  includeObservations = true;
  includeAnalytics = true;
  dateFrom = '';
  dateTo = '';
  
  isGenerating = false;
  exportMessage = '';
  exportSuccess = false;
  currentExportId = ''; // Agregar propiedad faltante

  constructor() {
    // Establecer fechas por defecto (último mes)
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    this.dateTo = this.formatDateForInput(today);
    this.dateFrom = this.formatDateForInput(lastMonth);
  }

  generatePDF() {
    if (!this.shouldUseRealAPI()) {
      this.simulateGeneration();
      return;
    }

    this.isGenerating = true;
    this.exportMessage = 'Iniciando generación del reporte PDF...';
    this.exportSuccess = false;

    // Usar el servicio real de exportación
    const exportRequest = {
      includeGraphs: this.includeGraphs,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo
    };

    console.log('📄 Generando PDF real:', exportRequest);

    // Llamar al backend real
    fetch(`http://localhost:5000/api/exports/patient/${this.patientId}/pdf`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(exportRequest)
    })
    .then(response => response.json())
    .then(data => {
      console.log('📄 Export response:', data);
      
      if (data.success) {
        this.currentExportId = data.data.exportId;
        this.exportMessage = '✅ ¡Reporte PDF generado exitosamente con gráficas!';
        this.exportSuccess = true;
      } else {
        throw new Error(data.message || 'Error generando PDF');
      }
    })
    .catch(error => {
      console.error('❌ Error generando PDF:', error);
      this.exportMessage = '❌ Error generando PDF: ' + error.message;
      this.exportSuccess = false;
    })
    .finally(() => {
      this.isGenerating = false;
    });
  }

  private shouldUseRealAPI(): boolean {
    return !!localStorage.getItem('token') && this.patientId > 0;
  }

  private simulateGeneration() {
    this.isGenerating = true;
    this.exportMessage = 'Simulando generación del reporte PDF...';
    this.exportSuccess = false;

    setTimeout(() => {
      this.exportMessage = '✅ ¡Reporte PDF simulado generado!';
      this.exportSuccess = true;
      this.isGenerating = false;
      this.currentExportId = 'simulated-export-id';
    }, 2000);
  }

  downloadPDF() {
    if (!this.currentExportId) {
      console.error('No hay exportId disponible');
      return;
    }

    if (this.currentExportId === 'simulated-export-id') {
      this.simulateDownload();
      return;
    }

    // Descargar PDF real del backend
    const downloadUrl = `http://localhost:5000/api/exports/${this.currentExportId}/download`;
    console.log('📥 Descargando PDF desde:', downloadUrl);

    // Abrir en nueva ventana para descargar
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.style.display = 'none';
    
    // Agregar headers de autorización (si es necesario)
    const token = localStorage.getItem('token');
    if (token) {
      // Para descargas, es mejor usar window.open con headers
      window.open(downloadUrl + `?token=${token}`, '_blank');
    } else {
      window.open(downloadUrl, '_blank');
    }

    this.exportMessage = '📥 Descarga iniciada - El PDF incluye gráficas de analytics';
  }

  private simulateDownload() {
    const filename = `reporte_${this.patientName.replace(/\s+/g, '_')}_${this.formatDateForFilename(new Date())}.pdf`;
    
    // Crear un blob simulado y descargarlo
    const content = `Reporte PDF de ${this.patientName}\nGenerado el: ${new Date().toLocaleDateString()}\nPeríodo: ${this.formatDateRange()}\n\nEste es un PDF simulado.\nEn el backend real incluirá gráficas de analytics.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    this.exportMessage = '📥 Archivo simulado descargado exitosamente';
  }

  formatDateRange(): string {
    if (this.dateFrom && this.dateTo) {
      return `${this.dateFrom} a ${this.dateTo}`;
    }
    return 'Todas las fechas disponibles';
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatDateForFilename(date: Date): string {
    return date.toISOString().split('T')[0].replace(/-/g, '');
  }
}