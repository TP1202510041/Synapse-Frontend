import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../User/services/auth.service';
import { PatientService } from '../../services/patient.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
  userName = '';
  totalPatients = 0;
  totalSessions = 0;

  constructor(
    private authService: AuthService,
    private patientService: PatientService,
    private sessionService: SessionService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    this.loadStats();
  }

  private loadUserInfo() {
    const user = this.authService.currentUserValue;
    this.userName = user?.userName || 'Usuario';
  }

  private loadStats() {
    // Cargar total de pacientes del usuario
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.totalPatients = patients.length;
        console.log('✅ Total de pacientes:', this.totalPatients);
        
        // Cargar total de sesiones de todos los pacientes
        let totalSessionsCount = 0;
        let patientsProcessed = 0;
        
        if (patients.length === 0) {
          this.totalSessions = 0;
          return;
        }
        
        patients.forEach(patient => {
          this.sessionService.getSessionsByPatient(patient.patientId).subscribe({
            next: (sessions) => {
              totalSessionsCount += sessions.length;
              patientsProcessed++;
              
              if (patientsProcessed === patients.length) {
                this.totalSessions = totalSessionsCount;
                console.log('✅ Total de sesiones:', this.totalSessions);
              }
            },
            error: (err) => {
              console.error('Error loading sessions for patient:', patient.patientId, err);
              patientsProcessed++;
              
              if (patientsProcessed === patients.length) {
                this.totalSessions = totalSessionsCount;
              }
            }
          });
        });
      },
      error: (err) => {
        console.error('Error loading patients:', err);
        this.totalPatients = 0;
        this.totalSessions = 0;
      }
    });
  }
}
