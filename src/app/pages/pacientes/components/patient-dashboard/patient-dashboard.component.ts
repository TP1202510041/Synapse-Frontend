import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Patient } from '../../../../models/patient.model';
import { PatientService } from '../../../../services/patient.service';
import { AuthService } from '../../../../User/services/auth.service';
import { PatientCardComponent } from '../patient-card/patient-card.component';
import { AddPatientButtonComponent } from '../add-patient-button/add-patient-button.component';
// Imports comentados hasta que se usen en el template
// import { ClinicalObservationsComponent } from '../../../../components/clinical-observations/clinical-observations.component';
// import { PatientAnalyticsComponent } from '../../../../components/patient-analytics/patient-analytics.component';
// import { ExportPdfComponent } from '../../../../components/export-pdf/export-pdf.component';

@Component({
  selector: 'app-patient-dashboard-main',
  standalone: true,
  imports: [
    CommonModule, 
    PatientCardComponent, 
    AddPatientButtonComponent
    // ClinicalObservationsComponent,
    // PatientAnalyticsComponent,
    // ExportPdfComponent
  ],
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css']
})
export class PatientDashboardComponent implements OnInit {
  patients: Patient[] = [];
  selectedPatient: Patient | null = null;
  selectedSessionId: string | null = null;
  showAnalytics = false;
  showExport = false;

  constructor(
    private patientService: PatientService, 
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getPatients().subscribe((data) => {
      this.patients = data;
    });
  }

  onPatientSelected(patient: Patient): void {
    this.selectedPatient = patient;
    this.selectedSessionId = null;
    this.showAnalytics = false;
    this.showExport = false;
  }

  onSessionSelected(sessionId: string): void {
    this.selectedSessionId = sessionId;
  }

  toggleAnalytics(): void {
    this.showAnalytics = !this.showAnalytics;
    if (this.showAnalytics) {
      this.showExport = false;
    }
  }

  toggleExport(): void {
    this.showExport = !this.showExport;
    if (this.showExport) {
      this.showAnalytics = false;
    }
  }

  clearSelection(): void {
    this.selectedPatient = null;
    this.selectedSessionId = null;
    this.showAnalytics = false;
    this.showExport = false;
  }
}
