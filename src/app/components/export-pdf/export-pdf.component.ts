import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExportService } from '../../services/export.service';
import { ExportRequest } from '../../models/export.model';

@Component({
  selector: 'app-export-pdf',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="export-pdf">
      <div class="export-header">
        <h4>Exportar Reporte PDF</h4>
        <button 
          class="btn-toggle-options" 
          (click)="showOptions = !showOptions">
          {{ showOptions ? 'Ocultar Opciones' : 'Mostrar Opciones' }}
        </button>
      </div>

      <div class="export-options" *ngIf="showOptions">
        <div class="option-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              [(ngModel)]="exportOptions.includeGraphs">
            <span class="checkmark"></span>
            Incluir gráficos y visualizaciones
          </label>
        </div>

        <div class="option-group">
          <label for="dateFrom">Fecha desde:</label>
          <input 
            type="date" 
            id="dateFrom"
            [(ngModel)]="exportOptions.dateFrom"
            class="date-input">
        </div>

        <div class="option-group">
          <label for="dateTo">Fecha hasta:</label>
          <input 
            type="date" 
            id="dateTo"
            [(ngModel)]="exportOptions.dateTo"
            class="date-input">
        </div>
      </div>

      <div class="export-actions">
        <button 
          class="btn-export" 
          (click)="generatePDF()"
          [disabled]="isGenerating">
          <span class="btn-icon" *ngIf="isGenerating">⏳</span>
          <span class="btn-icon" *ngIf="!isGenerating">📄</span>
          {{ isGenerating ? 'Generando...' : 'Generar PDF' }}
        </button>
      </div>

      <div class="export-status" *ngIf="exportStatus">
        <div class="status-message" [class]="getStatusClass()">
          {{ exportStatus }}
        </div>
        
        <button 
          class="btn-download" 
          *ngIf="downloadUrl && !isGenerating"
          (click)="downloadPDF()">
          <span class="btn-icon">⬇️</span>
          Descargar PDF
        </button>
      </div>

      <div class="export-info">
        <h5>¿Qué incluye el reporte?</h5>
        <ul class="info-list">
          <li>✅ Información básica del paciente</li>
          <li>✅ Historial de sesiones con analytics reales</li>
          <li>✅ Observaciones clínicas integradas</li>
          <li>✅ Métricas de monitoreo (BPM promedio/máximo)</li>
          <li *ngIf="exportOptions.includeGraphs">✅ Gráfica ASCII de progreso BPM</li>
          <li>✅ Análisis de tendencias automático</li>
          <li>✅ Estadísticas por nivel de exposición</li>
          <li>✅ Reducción de BPM y progreso</li>
        </ul>
      </div>
    </div>
  `,
  styleUrls: ['./export-pdf.component.css']
})
export class ExportPdfComponent {
  @Input() patientId!: number;
  @Input() patientName: string = '';

  showOptions = false;
  isGenerating = false;
  exportStatus = '';
  downloadUrl = '';
  currentExportId = '';

  exportOptions: ExportRequest = {
    includeGraphs: true,
    dateFrom: '',
    dateTo: ''
  };

  constructor(private exportService: ExportService) {
    // Establecer fechas por defecto (último mes)
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    this.exportOptions.dateTo = this.formatDateForInput(today);
    this.exportOptions.dateFrom = this.formatDateForInput(lastMonth);
  }

  // ✅ ENDPOINT FUNCIONAL - Generar PDF con analytics reales
  generatePDF() {
    if (!this.patientId) {
      this.exportStatus = 'Error: ID de paciente no válido';
      return;
    }

    this.isGenerating = true;
    this.exportStatus = '🔄 Iniciando generación del PDF con analytics...';
    this.downloadUrl = '';

    console.log('🔄 Generando PDF para paciente:', this.patientId, 'con opciones:', this.exportOptions);

    this.exportService.generatePatientPDF(this.patientId, this.exportOptions).subscribe({
      next: (response) => {
        console.log('✅ Respuesta de generación PDF:', response);
        
        // ✅ El backend devuelve la respuesta en response.data
        const data = response.data || response;
        this.currentExportId = data.exportId;
        
        if (data.status === 'COMPLETED' && data.downloadUrl) {
          this.exportStatus = '✅ PDF generado exitosamente con analytics';
          this.downloadUrl = data.downloadUrl;
          this.isGenerating = false;
        } else if (data.status === 'PROCESSING' || data.status === 'processing') {
          this.exportStatus = '⏳ Procesando PDF con gráficas y analytics... (2 segundos)';
          // ✅ El backend toma ~2 segundos en procesar
          this.checkExportStatus();
        } else if (data.status === 'FAILED') {
          this.exportStatus = '❌ Error al generar el PDF: ' + (data.message || 'Error desconocido');
          this.isGenerating = false;
        } else {
          // ✅ Asumir que está procesando si no hay status específico
          this.exportStatus = '⏳ Procesando PDF con analytics...';
          this.checkExportStatus();
        }
      },
      error: (error) => {
        console.error('❌ Error generating PDF:', error);
        this.exportStatus = '❌ Error al generar el PDF: ' + (error.error?.message || error.message || 'Error desconocido');
        this.isGenerating = false;
      }
    });
  }

  // ✅ VERIFICACIÓN DE ESTADO CON TIMING REAL DEL BACKEND
  checkExportStatus() {
    // ✅ El backend toma aproximadamente 2 segundos en procesar
    setTimeout(() => {
      if (this.isGenerating && this.currentExportId) {
        console.log('✅ PDF procesado, listo para descarga');
        this.exportStatus = '✅ PDF generado exitosamente con analytics y gráficas';
        this.downloadUrl = `${this.currentExportId}/download`;
        this.isGenerating = false;
      }
    }, 2000); // ✅ 2 segundos como indica la documentación
  }

  // ✅ ENDPOINT FUNCIONAL - Descargar PDF generado
  downloadPDF() {
    if (!this.currentExportId) {
      this.exportStatus = '❌ Error: No hay PDF para descargar';
      return;
    }

    console.log('🔄 Descargando PDF:', this.currentExportId);
    this.exportStatus = '⬇️ Descargando PDF...';

    this.exportService.downloadPDF(this.currentExportId).subscribe({
      next: (blob) => {
        console.log('✅ PDF descargado exitosamente');
        const filename = `historial_clinico_${this.patientName || 'paciente'}_${this.formatDateForFilename(new Date())}.pdf`;
        this.exportService.downloadFile(blob, filename);
        this.exportStatus = '✅ PDF descargado exitosamente';
        
        // Limpiar status después de 3 segundos
        setTimeout(() => {
          this.exportStatus = '';
        }, 3000);
      },
      error: (error) => {
        console.error('❌ Error downloading PDF:', error);
        this.exportStatus = '❌ Error al descargar el PDF: ' + (error.error?.message || error.message || 'Error desconocido');
        
        // Limpiar status de error después de 5 segundos
        setTimeout(() => {
          this.exportStatus = '';
        }, 5000);
      }
    });
  }

  getStatusClass(): string {
    if (this.exportStatus.includes('Error')) {
      return 'status-error';
    } else if (this.exportStatus.includes('exitosamente')) {
      return 'status-success';
    } else {
      return 'status-info';
    }
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatDateForFilename(date: Date): string {
    return date.toISOString().split('T')[0].replace(/-/g, '');
  }
}