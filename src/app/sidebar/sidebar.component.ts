import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../User/services/auth.service';
import { PatientService } from '../services/patient.service';
import { Patient } from '../models/patient.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  isExpanded = true;
  patients: Patient[] = [];

  constructor(
    private authService: AuthService,
    private patientService: PatientService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        console.log('Pacientes cargados:', this.patients);
      },
      error: (error) => {
        console.error('Error al cargar pacientes:', error);
      }
    });
  }

  toggleSidebar(): void {
    this.isExpanded = !this.isExpanded;
  }

  cerrarSesion(): void {
    this.authService.logout();
  }

  goToSessions(patientId: number, name: string): void {
    this.router.navigate(['/paciente', patientId, 'sesiones'], {
      queryParams: { name }
    });
  }
}
