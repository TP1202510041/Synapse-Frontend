import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Patient } from '../../../../models/patient.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-card.component.html',
  styleUrls: ['./patient-card.component.css']
})
export class PatientCardComponent {
  @Input() patient!: Patient;
  @Output() onEdit = new EventEmitter<Patient>();
  @Output() onDelete = new EventEmitter<number>();

  showOptions = false;

  constructor(private router: Router) {}

  toggleOptions(): void {
    this.showOptions = !this.showOptions;
  }

  goToSessions(): void {
    this.router.navigate(['/paciente', this.patient.patientId, 'sesiones'], {
      queryParams: { name: this.patient.patientName }
    });
  }

  editPatient(): void {
    this.showOptions = false;
    this.onEdit.emit(this.patient);
  }

  deletePatient(): void {
    this.showOptions = false;
    if (confirm(`¿Estás seguro de que deseas eliminar al paciente ${this.patient.patientName}?`)) {
      this.onDelete.emit(this.patient.patientId);
    }
  }
}
