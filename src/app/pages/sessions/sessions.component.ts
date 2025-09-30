import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../services/session.service';
import { Session, CreateSessionDto } from '../../models/session.model';
import { AuthService } from '../../User/services/auth.service';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.css']
})
export class SessionsComponent implements OnInit {
  patientId!: number;  // Cambio de string a number
  patientName: string = 'Paciente';
  sessions: Session[] = [];
  now: Date = new Date();
  todaySession: Session | null = null;
  latestSession: Session | null = null;

  newDate = '';
  newDescription = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const patientIdStr = params.get('id') || '';
      this.patientId = Number(patientIdStr);  // Convertir a number
      this.patientName = this.route.snapshot.queryParamMap.get('name') || 'Paciente';

      this.sessions = [];
      this.newDate = '';
      this.newDescription = '';
      this.todaySession = null;
      this.latestSession = null;

      setInterval(() => {
        this.now = this.getPeruCurrentTime();
      }, 1000);

      this.loadSessions();
    });
  }

  getPeruCurrentTime(): Date {
    const now = new Date();
    const peruTimeString = now.toLocaleString('en-CA', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    return new Date(peruTimeString);
  }

  getPeruTodayString(): string {
    const now = new Date();
    return now.toLocaleDateString('en-CA', {
      timeZone: 'America/Lima'
    });
  }

  loadSessions(): void {
    this.sessionService.getSessionsByPatient(this.patientId).subscribe({
      next: (data) => {
        // Ordenar por sessionDate ascendente
        this.sessions = data.sort((a, b) => a.sessionDate.localeCompare(b.sessionDate));

        const todayPeru = this.getPeruTodayString();

        // Buscar sesión de hoy
        this.todaySession = this.sessions.find(s => s.sessionDate === todayPeru) || null;

        // Última sesión
        this.latestSession = this.sessions.length > 0 ? this.sessions[this.sessions.length - 1] : null;

        console.log('Sesiones cargadas:', this.sessions);
        console.log('Fecha actual en Perú:', todayPeru);
        console.log('Sesión de hoy:', this.todaySession);
      },
      error: (error) => {
        console.error('Error al cargar sesiones:', error);
      }
    });
  }

  isToday(dateStr: string): boolean {
    const todayPeru = this.getPeruTodayString();
    return dateStr === todayPeru;
  }

  addSession(): void {
    if (this.newDate && this.newDescription) {
      const newSession: CreateSessionDto = {
        sessionDate: this.newDate,
        description: this.newDescription,
        patientId: this.patientId  // Ya es number
      };

      console.log('Creando nueva sesión:', newSession);

      this.sessionService.createSession(newSession).subscribe({
        next: () => {
          this.loadSessions();
          this.newDate = '';
          this.newDescription = '';
        },
        error: (error) => {
          console.error('Error al crear sesión:', error);
          alert('Error al crear la sesión');
        }
      });
    }
  }

  deleteSession(idSession: string): void {
    const confirmed = confirm('¿Estás seguro de que quieres eliminar esta sesión? Se eliminarán también todos los datos de monitoreo asociados.');

    if (!confirmed) {
      return;
    }

    this.sessionService.deleteSessionComplete(idSession).subscribe({
      next: () => {
        this.loadSessions();
      },
      error: (error) => {
        console.error('Error al eliminar sesión:', error);
        alert('Error al eliminar la sesión. Por favor, inténtalo de nuevo.');
      }
    });
  }

  startMonitoring(session: Session): void {
    this.router.navigate([`/monitoring/${session.idSession}`]);  // Cambio de id a idSession
  }

  viewSession(session: Session): void {
    this.router.navigate([`/session/${session.idSession}/analytics`]);  // Cambio de id a idSession
  }

  formatDateInSpanish(date: Date): string {
    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Lima'
    });
  }

  formatTimeInSpanish(date: Date): string {
    return date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Lima'
    });
  }
}
