import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    FormsModule,
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
  filteredPatients: Patient[] = [];
  searchTerm: string = '';
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
      this.filteredPatients = data;
      console.log('✅ Pacientes cargados:', data.length);
    });
  }

  filterPatients(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPatients = this.patients;
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredPatients = this.patients.filter(patient =>
        patient.patientName.toLowerCase().includes(term)
      );
      console.log(`🔍 Filtrado: ${this.filteredPatients.length} de ${this.patients.length} pacientes`);
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredPatients = this.patients;
  }

  onPatientAdded(): void {
    console.log('🔄 Paciente agregado, recargando lista...');
    this.loadPatients();
  }

  onPatientSelected(patient: Patient): void {
    this.selectedPatient = patient;
    this.selectedSessionId = null;
    this.showAnalytics = false;
    this.showExport = false;
  }

  onEditPatient(patient: Patient): void {
    console.log('✏️ Editando paciente:', patient);
    // TODO: Implementar modal o navegación para editar paciente
    alert(`Funcionalidad de edición en desarrollo.\nPaciente: ${patient.patientName}`);
  }

  onDeletePatient(patientId: number): void {
    console.log('🗑️ Eliminando paciente ID:', patientId);
    this.patientService.deletePatient(patientId).subscribe({
      next: () => {
        console.log('✅ Paciente eliminado exitosamente');
        this.loadPatients();
      },
      error: (error) => {
        console.error('❌ Error al eliminar paciente:', error);
        alert('Error al eliminar el paciente. Por favor, intenta de nuevo.');
      }
    });
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
