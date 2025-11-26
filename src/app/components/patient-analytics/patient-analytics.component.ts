import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';
import { ProgressAnalytics, PatientMetrics } from '../../models/analytics.model';

@Component({
  selector: 'app-patient-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="patient-analytics">
      <div class="analytics-header">
        <h3>Analytics del Paciente</h3>
        <div class="analytics-tabs">
          <button 
            class="tab-button" 
            [class.active]="activeTab === 'progress'"
            (click)="activeTab = 'progress'; loadProgress()">
            Progreso
          </button>
          <button 
            class="tab-button" 
            [class.active]="activeTab === 'metrics'"
            (click)="activeTab = 'metrics'; loadMetrics()">
            Métricas
          </button>
        </div>
      </div>

      <!-- Tab de Progreso -->
      <div class="tab-content" *ngIf="activeTab === 'progress'">
        <div class="loading" *ngIf="isLoadingProgress">
          Cargando progreso...
        </div>
        
        <div class="progress-content" *ngIf="progressData && !isLoadingProgress">
          <!-- Tendencias -->
          <div class="trends-section">
            <h4>Tendencias</h4>
            <div class="trends-grid">
              <div class="trend-item">
                <span class="trend-label">BPM:</span>
                <span class="trend-value" [class]="getTrendClass(progressData.trends.bpmTrend)">
                  {{ getTrendText(progressData.trends.bpmTrend) }}
                </span>
                <span class="trend-detail" *ngIf="progressData.trends.bpmReduction">
                  ({{ progressData.trends.bpmReduction }}% reducción)
                </span>
              </div>
              <div class="trend-item">
                <span class="trend-label">Exposición:</span>
                <span class="trend-value" [class]="getTrendClass(progressData.trends.exposureTrend)">
                  {{ getTrendText(progressData.trends.exposureTrend) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Progresión de Exposición -->
          <div class="exposure-progression" *ngIf="progressData.trends.exposureProgression.length > 0">
            <h4>Progresión de Exposición</h4>
            <div class="exposure-levels">
              <span 
                class="exposure-level" 
                *ngFor="let level of progressData.trends.exposureProgression; let i = index"
                [class]="'level-' + level.toLowerCase()">
                {{ level }}
                <span class="level-arrow" *ngIf="i < progressData.trends.exposureProgression.length - 1">→</span>
              </span>
            </div>
          </div>

          <!-- Sesiones Recientes -->
          <div class="recent-sessions">
            <h4>Sesiones Recientes</h4>
            <div class="sessions-list">
              <div 
                class="session-item" 
                *ngFor="let session of progressData.sessions.slice(0, 5)">
                <div class="session-date">{{ formatDate(session.date) }}</div>
                <div class="session-metrics">
                  <span class="metric">
                    <strong>BPM Promedio:</strong> {{ session.avgBPM }}
                  </span>
                  <span class="metric">
                    <strong>BPM Máximo:</strong> {{ session.maxBPM }}
                  </span>
                  <span class="metric">
                    <strong>Duración:</strong> {{ session.duration }} min
                  </span>
                  <span class="metric exposure-badge" [class]="'level-' + session.exposureLevel.toLowerCase()">
                    {{ session.exposureLevel }}
                  </span>
                </div>
                <div class="session-observations" *ngIf="session.observations">
                  <strong>Observaciones:</strong> {{ session.observations }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab de Métricas -->
      <div class="tab-content" *ngIf="activeTab === 'metrics'">
        <div class="loading" *ngIf="isLoadingMetrics">
          Cargando métricas...
        </div>
        
        <div class="metrics-content" *ngIf="metricsData && !isLoadingMetrics">
          <!-- Métricas Agregadas -->
          <div class="aggregated-metrics">
            <h4>Métricas Generales</h4>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value">{{ metricsData.aggregatedMetrics.totalSessions }}</div>
                <div class="metric-label">Total Sesiones</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">{{ metricsData.aggregatedMetrics.avgBPM }}</div>
                <div class="metric-label">BPM Promedio</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">{{ metricsData.aggregatedMetrics.avgSessionDuration }}</div>
                <div class="metric-label">Duración Promedio (min)</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">{{ metricsData.aggregatedMetrics.bpmReduction }}%</div>
                <div class="metric-label">Reducción BPM</div>
              </div>
            </div>
          </div>

          <!-- Análisis de Tendencias -->
          <div class="trend-analysis">
            <h4>Análisis de Tendencias</h4>
            <div class="trend-summary">
              <div class="trend-indicator" [class]="getTrendClass(metricsData.trendAnalysis.bpmTrend)">
                <strong>Tendencia BPM:</strong> 
                {{ getTrendText(metricsData.trendAnalysis.bpmTrend) }}
                ({{ metricsData.trendAnalysis.trendPercentage }}%)
              </div>
            </div>
          </div>

          <!-- Hitos -->
          <div class="milestones" *ngIf="metricsData.trendAnalysis.milestones.length > 0">
            <h4>Hitos Importantes</h4>
            <div class="milestones-list">
              <div 
                class="milestone-item" 
                *ngFor="let milestone of metricsData.trendAnalysis.milestones"
                [class]="'milestone-' + milestone.type">
                <div class="milestone-date">{{ formatDate(milestone.date) }}</div>
                <div class="milestone-description">{{ milestone.description }}</div>
                <div class="milestone-type">{{ getMilestoneTypeText(milestone.type) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div class="empty-state" *ngIf="!isLoadingProgress && !isLoadingMetrics && !progressData && !metricsData">
        No hay datos de analytics disponibles para este paciente.
      </div>
    </div>
  `,
  styleUrls: ['./patient-analytics.component.css']
})
export class PatientAnalyticsComponent implements OnInit {
  @Input() patientId!: number;

  activeTab: 'progress' | 'metrics' = 'progress';
  progressData: ProgressAnalytics | null = null;
  metricsData: PatientMetrics | null = null;
  isLoadingProgress = false;
  isLoadingMetrics = false;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit() {
    this.loadProgress();
  }

  loadProgress() {
    if (!this.patientId) return;
    
    this.isLoadingProgress = true;
    this.analyticsService.getPatientProgress(this.patientId).subscribe({
      next: (data) => {
        this.progressData = data;
        this.isLoadingProgress = false;
      },
      error: (error) => {
        console.error('Error loading progress:', error);
        this.isLoadingProgress = false;
      }
    });
  }

  loadMetrics() {
    if (!this.patientId) return;
    
    this.isLoadingMetrics = true;
    this.analyticsService.getPatientMetrics(this.patientId).subscribe({
      next: (data) => {
        this.metricsData = data;
        this.isLoadingMetrics = false;
      },
      error: (error) => {
        console.error('Error loading metrics:', error);
        this.isLoadingMetrics = false;
      }
    });
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
        return 'Empeorando';
      case 'progressing':
        return 'Progresando';
      case 'regressing':
        return 'Retrocediendo';
      default:
        return 'Estable';
    }
  }

  getMilestoneTypeText(type: string): string {
    switch (type) {
      case 'improvement':
        return 'Mejora';
      case 'setback':
        return 'Retroceso';
      case 'milestone':
        return 'Hito';
      default:
        return type;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}