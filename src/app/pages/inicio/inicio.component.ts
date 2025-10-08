import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
  totalPatients = 0;
  totalSessions = 0;

  ngOnInit() {
    // Simular carga de estadísticas
    // En una implementación real, estos datos vendrían de servicios
    this.loadStats();
  }

  private loadStats() {
    // Simular datos - reemplazar con llamadas reales a servicios
    setTimeout(() => {
      this.totalPatients = Math.floor(Math.random() * 20) + 5; // 5-25 pacientes
      this.totalSessions = Math.floor(Math.random() * 50) + 10; // 10-60 sesiones
    }, 500);
  }
}
