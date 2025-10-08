import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService, SessionAnalytics, SessionTrends } from '../../services/analytics.service';

@Component({
  selector: 'app-session-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="session-analytics">
      <div class="analytics-header">
        <h3>📊 Monitoreo de Sesión</h3>
        <div class="refresh-controls">
          <button 
            class="btn-refresh" 
            (click)="loadSessionAnalytics()"
            [disabled]="isLoading">
            {{ isLoading ? '🔄 Cargando...' : '🔄 Actualizar' }}
          </button>
          <div class="auto-refresh-toggle">
            <label>
              <input 
                type="checkbox" 
                [(ngModel)]="autoRefreshEnabled"
                (change)="toggleAutoRefresh()">
              Auto-actualizar (30s)
            </label>
          </div>
        </div>
      </div>

      <!-- ✅ MÉTRICAS PRINCIPALES CON DATOS REALES -->
      <div class="metrics-grid" *ngIf="sessionData && !isLoading">
        <div class="metric-card bpm-avg">
          <div class="metric-icon">💓</div>
          <div class="metric-content">
            <div class="metric-value">{{ sessionData.avgBPM?.toFixed(1) }}</div>
            <div class="metric-label">BPM Promedio</div>
            <div class="metric-status" [class]="getBPMStatus(sessionData.avgBPM)">
              {{ getBPMStatusText(sessionData.avgBPM) }}
            </div>
          </div>
        </div>

        <div class="metric-card bpm-max">
          <div class="metric-icon">⚡</div>
          <div class="metric-content">
            <div class="metric-value">{{ sessionData.maxBPM?.toFixed(1) }}</div>
            <div class="metric-label">BPM Máximo</div>
            <div class="metric-alert" *ngIf="sessionData.maxBPM > 120">
              ⚠️ Valor elevado
            </div>
          </div>
        </div>

        <div class="metric-card duration">
          <div class="metric-icon">⏱️</div>
          <div class="metric-content">
            <div class="metric-value">{{ sessionData.duration }}</div>
            <div class="metric-label">Minutos</div>
            <div class="metric-detail">Duración total</div>
          </div>
        </div>

        <div class="metric-card exposure">
          <div class="metric-icon">🎯</div>
          <div class="metric-content">
            <div class="metric-value exposure-level" [class]="'level-' + sessionData.exposureLevel?.toLowerCase()">
              {{ sessionData.exposureLevel }}
            </div>
            <div class="metric-label">Nivel de Exposición</div>
          </div>
        </div>
      </div>

      <!-- ✅ ANÁLISIS DE TENDENCIAS -->
      <div class="trends-section" *ngIf="trendsData && !isLoading">
        <h4>📈 Análisis de Tendencias</h4>
        <div class="trends-grid">
          <div class="trend-card bpm-trend">
            <div class="trend-header">
              <span class="trend-label">Tendencia BPM</span>
              <span class="trend-icon">{{ getTrendIcon(trendsData.bpmTrend) }}</span>
            </div>
            <div class="trend-value" [class]="getTrendClass(trendsData.bpmTrend)">
              {{ getTrendText(trendsData.bpmTrend) }}
            </div>
            <div class="trend-detail" *ngIf="trendsData.bpmReduction">
              Reducción: {{ trendsData.bpmReduction?.toFixed(1) }}%
            </div>
          </div>

          <div class="trend-card exposure-trend">
            <div class="trend-header">
              <span class="trend-label">Progreso Exposición</span>
              <span class="trend-icon">{{ getTrendIcon(trendsData.exposureTrend) }}</span>
            </div>
            <div class="trend-value" [class]="getTrendClass(trendsData.exposureTrend)">
              {{ getTrendText(trendsData.exposureTrend) }}
            </div>
          </div>
        </div>
      </div>

      <!-- ✅ OBSERVACIONES CLÍNICAS INTEGRADAS -->
      <div class="observations-section" *ngIf="sessionData?.observations && !isLoading">
        <h4>📝 Observaciones Clínicas</h4>
        <div class="observations-content">
          <p>{{ sessionData?.observations }}</p>
        </div>
      </div>

      <!-- ✅ ALERTAS Y RECOMENDACIONES -->
      <div class="alerts-section" *ngIf="getAlerts().length > 0 && !isLoading">
        <h4>⚠️ Alertas y Recomendaciones</h4>
        <div class="alerts-list">
          <div 
            class="alert-item" 
            *ngFor="let alert of getAlerts()"
            [class]="'alert-' + alert.type">
            <div class="alert-icon">{{ alert.icon }}</div>
            <div class="alert-content">
              <div class="alert-title">{{ alert.title }}</div>
              <div class="alert-message">{{ alert.message }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ✅ GRÁFICA SIMPLE DE BPM (OPCIONAL) -->
      <div class="bpm-chart" *ngIf="sessionData && showChart && !isLoading">
        <h4>📊 Visualización BPM</h4>
        <div class="simple-chart">
          <div class="chart-bar">
            <div class="bar-label">Promedio</div>
            <div class="bar-container">
              <div 
                class="bar-fill avg-bar" 
                [style.width.%]="getBPMPercentage(sessionData.avgBPM)">
              </div>
              <span class="bar-value">{{ sessionData.avgBPM?.toFixed(1) }}</span>
            </div>
          </div>
          <div class="chart-bar">
            <div class="bar-label">Máximo</div>
            <div class="bar-container">
              <div 
                class="bar-fill max-bar" 
                [style.width.%]="getBPMPercentage(sessionData.maxBPM)">
              </div>
              <span class="bar-value">{{ sessionData.maxBPM?.toFixed(1) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Estados de carga y error -->
      <div class="loading-state" *ngIf="isLoading">
        <div class="loading-spinner">🔄</div>
        <p>Cargando analytics de sesión...</p>
      </div>

      <div class="error-state" *ngIf="error && !isLoading">
        <div class="error-icon">❌</div>
        <p>{{ error }}</p>
        <button class="btn-retry" (click)="loadSessionAnalytics()">
          Reintentar
        </button>
      </div>

      <div class="empty-state" *ngIf="!sessionData && !isLoading && !error">
        <div class="empty-icon">📊</div>
        <p>No hay datos de analytics disponibles para esta sesión.</p>
      </div>
    </div>
  `,
  styles: [`
    .session-analytics {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .analytics-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #f0f0f0;
    }

    .refresh-controls {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .btn-refresh {
      background: #007bff;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-refresh:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .metric-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-left: 4px solid #007bff;
    }

    .metric-icon {
      font-size: 24px;
    }

    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }

    .metric-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }

    .metric-status, .metric-detail {
      font-size: 11px;
      margin-top: 4px;
    }

    .metric-status.normal { color: #28a745; }
    .metric-status.elevated { color: #ffc107; }
    .metric-status.high { color: #dc3545; }

    .exposure-level.level-bajo { color: #28a745; }
    .exposure-level.level-medio { color: #ffc107; }
    .exposure-level.level-alto { color: #fd7e14; }
    .exposure-level.level-muy_alto { color: #dc3545; }

    .trends-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .trend-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
    }

    .trend-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .trend-value {
      font-size: 18px;
      font-weight: bold;
    }

    .trend-value.trend-positive { color: #28a745; }
    .trend-value.trend-negative { color: #dc3545; }
    .trend-value.trend-neutral { color: #6c757d; }

    .observations-section, .alerts-section {
      margin-bottom: 24px;
    }

    .observations-content {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #17a2b8;
    }

    .alerts-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .alert-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      border-left: 4px solid;
    }

    .alert-warning {
      background: #fff3cd;
      border-left-color: #ffc107;
    }

    .alert-danger {
      background: #f8d7da;
      border-left-color: #dc3545;
    }

    .alert-info {
      background: #d1ecf1;
      border-left-color: #17a2b8;
    }

    .simple-chart {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
    }

    .chart-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .bar-label {
      width: 80px;
      font-size: 12px;
      color: #666;
    }

    .bar-container {
      flex: 1;
      height: 24px;
      background: #e9ecef;
      border-radius: 12px;
      position: relative;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 12px;
      transition: width 0.3s ease;
    }

    .avg-bar { background: #007bff; }
    .max-bar { background: #dc3545; }

    .bar-value {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 11px;
      color: white;
      font-weight: bold;
    }

    .loading-state, .error-state, .empty-state {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .loading-spinner {
      font-size: 32px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class SessionAnalyticsComponent implements OnInit, OnDestroy {
  @Input() sessionId!: string;
  @Input() showChart: boolean = true;
  @Input() autoRefreshEnabled: boolean = false;

  sessionData: SessionAnalytics | null = null;
  trendsData: SessionTrends | null = null;
  isLoading = false;
  error: string | null = null;
  
  private refreshTimer: any;
  private refreshInterval = 30000; // 30 segundos

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit() {
    this.loadSessionAnalytics();
    if (this.autoRefreshEnabled) {
      this.startAutoRefresh();
    }
  }

  ngOnDestroy() {
    this.stopAutoRefresh();
  }

  // ✅ CARGAR ANALYTICS DE SESIÓN INDIVIDUAL
  loadSessionAnalytics() {
    if (!this.sessionId) {
      this.error = 'ID de sesión no proporcionado';
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.analyticsService.getSessionAnalytics(this.sessionId).subscribe({
      next: (response) => {
        console.log('✅ Analytics de sesión cargados:', response);
        
        // ✅ El backend devuelve { sessions: [...], trends: {...} }
        const responseData = (response as any).data || response;
        this.sessionData = responseData.sessions?.[0] || null;
        this.trendsData = responseData.trends || null;
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error cargando analytics:', error);
        this.error = 'Error al cargar los analytics de la sesión';
        this.isLoading = false;
      }
    });
  }

  toggleAutoRefresh() {
    if (this.autoRefreshEnabled) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }

  private startAutoRefresh() {
    this.stopAutoRefresh(); // Limpiar timer existente
    this.refreshTimer = setInterval(() => {
      this.loadSessionAnalytics();
    }, this.refreshInterval);
  }

  private stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // ✅ MÉTODOS DE UTILIDAD PARA LA UI

  getBPMStatus(bpm: number): string {
    if (bpm < 70) return 'normal';
    if (bpm < 90) return 'elevated';
    return 'high';
  }

  getBPMStatusText(bpm: number): string {
    if (bpm < 70) return 'Normal';
    if (bpm < 90) return 'Elevado';
    return 'Alto';
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'improving':
      case 'progressing':
        return '📈';
      case 'worsening':
      case 'regressing':
        return '📉';
      default:
        return '➡️';
    }
  }

  getTrendClass(trend: string): string {
    switch (trend) {
      case 'improving':
      case 'progressing':
        return 'trend-positive';
      case 'worsening':
      case 'regressing':
        return 'trend-negative';
      default:
        return 'trend-neutral';
    }
  }

  getTrendText(trend: string): string {
    switch (trend) {
      case 'improving':
        return 'Mejorando';
      case 'worsening':
        return 'Requiere atención';
      case 'progressing':
        return 'Progresando';
      case 'regressing':
        return 'Retrocediendo';
      default:
        return 'Estable';
    }
  }

  getBPMPercentage(bpm: number): number {
    // Normalizar BPM para la barra (60-150 BPM = 0-100%)
    const min = 60;
    const max = 150;
    return Math.min(100, Math.max(0, ((bpm - min) / (max - min)) * 100));
  }

  getAlerts(): Array<{type: string, icon: string, title: string, message: string}> {
    const alerts = [];

    if (this.sessionData) {
      // Alerta por BPM alto
      if (this.sessionData.maxBPM > 120) {
        alerts.push({
          type: 'warning',
          icon: '⚠️',
          title: 'BPM Elevado',
          message: `BPM máximo de ${this.sessionData.maxBPM.toFixed(1)} detectado. Considerar reducir intensidad.`
        });
      }

      // Alerta por tendencia negativa
      if (this.trendsData?.bpmTrend === 'worsening') {
        alerts.push({
          type: 'danger',
          icon: '🚨',
          title: 'Tendencia Negativa',
          message: 'Se detecta empeoramiento en las métricas. Revisar protocolo de tratamiento.'
        });
      }

      // Recomendación por progreso
      if (this.trendsData?.bpmTrend === 'improving' && this.trendsData?.bpmReduction > 15) {
        alerts.push({
          type: 'info',
          icon: '✅',
          title: 'Excelente Progreso',
          message: `Reducción del ${this.trendsData.bpmReduction.toFixed(1)}% en BPM. Considerar avanzar al siguiente nivel.`
        });
      }
    }

    return alerts;
  }
}