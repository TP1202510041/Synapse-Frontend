import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Session } from '../../models/session.model';
import { MonitoringService, MonitoringRecord } from '../../services/monitoring.service';

interface SessionWithMonitoring {
  session: Session;
  monitoring: MonitoringRecord | null;
  isLoading: boolean;
}

@Component({
  selector: 'app-session-comparison',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-comparison.component.html',
  styleUrls: ['./session-comparison.component.css']
})
export class SessionComparisonComponent implements OnInit {
  @Input() sessions: Session[] = [];
  @Input() patientId!: number;

  availableSessions: Session[] = [];
  selectedSession1: SessionWithMonitoring | null = null;
  selectedSession2: SessionWithMonitoring | null = null;
  showComparison = false;

  constructor(private monitoringService: MonitoringService) {}

  ngOnInit(): void {
    this.availableSessions = [...this.sessions];
  }

  selectSession1(session: Session): void {
    this.selectedSession1 = {
      session,
      monitoring: null,
      isLoading: true
    };
    this.loadMonitoringData(1, session.idSession);
  }

  selectSession2(session: Session): void {
    this.selectedSession2 = {
      session,
      monitoring: null,
      isLoading: true
    };
    this.loadMonitoringData(2, session.idSession);
  }

  loadMonitoringData(sessionNumber: 1 | 2, sessionId: string): void {
    this.monitoringService.getMonitoringRecordsBySession(sessionId).subscribe({
      next: (records) => {
        const monitoring = records.length > 0 ? records[0] : null;
        if (sessionNumber === 1 && this.selectedSession1) {
          this.selectedSession1.monitoring = monitoring;
          this.selectedSession1.isLoading = false;
        } else if (sessionNumber === 2 && this.selectedSession2) {
          this.selectedSession2.monitoring = monitoring;
          this.selectedSession2.isLoading = false;
        }
        this.checkIfReadyToCompare();
      },
      error: (err) => {
        console.error('Error loading monitoring data:', err);
        if (sessionNumber === 1 && this.selectedSession1) {
          this.selectedSession1.isLoading = false;
        } else if (sessionNumber === 2 && this.selectedSession2) {
          this.selectedSession2.isLoading = false;
        }
        this.checkIfReadyToCompare();
      }
    });
  }

  checkIfReadyToCompare(): void {
    this.showComparison = 
      this.selectedSession1 !== null && 
      this.selectedSession2 !== null &&
      !this.selectedSession1.isLoading &&
      !this.selectedSession2.isLoading;
  }

  clearSelection(sessionNumber: 1 | 2): void {
    if (sessionNumber === 1) {
      this.selectedSession1 = null;
    } else {
      this.selectedSession2 = null;
    }
    this.showComparison = false;
  }

  clearAll(): void {
    this.selectedSession1 = null;
    this.selectedSession2 = null;
    this.showComparison = false;
  }

  calculateDifference(value1: number | undefined, value2: number | undefined): number {
    if (value1 === undefined || value2 === undefined) return 0;
    return value2 - value1;
  }

  calculatePercentageChange(value1: number | undefined, value2: number | undefined): number {
    if (!value1 || !value2) return 0;
    return ((value2 - value1) / value1) * 100;
  }

  getDifferenceClass(diff: number): string {
    if (diff > 0) return 'positive';
    if (diff < 0) return 'negative';
    return 'neutral';
  }

  formatDifference(diff: number): string {
    if (diff > 0) return `+${diff.toFixed(1)}`;
    return diff.toFixed(1);
  }

  formatPercentage(percentage: number): string {
    if (percentage > 0) return `+${percentage.toFixed(1)}%`;
    return `${percentage.toFixed(1)}%`;
  }
}
