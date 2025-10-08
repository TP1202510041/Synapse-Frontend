import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService, UpdateSessionRequest } from '../../services/session.service';
import { Session, CreateSessionDto } from '../../models/session.model';
import { AuthService } from '../../User/services/auth.service';
import { RealObservationsComponent } from '../../components/real-observations/real-observations.component';
import { SimpleAnalyticsComponent } from '../../components/simple-analytics/simple-analytics.component';
import { SimpleExportComponent } from '../../components/simple-export/simple-export.component';
import { MonitoringRecordsViewComponent } from '../../components/monitoring-records-view/monitoring-records-view.component';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RealObservationsComponent,
    SimpleAnalyticsComponent,
    SimpleExportComponent,
    MonitoringRecordsViewComponent
  ],
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
  
  // Nuevas propiedades para las funcionalidades
  selectedSession: Session | null = null;
  showObservations = false;
  showAnalytics = false;
  showExport = false;
  activeTab: 'sessions' | 'observations' | 'monitoring' | 'analytics' | 'export' = 'sessions';

  // ✅ NUEVAS PROPIEDADES PARA EDICIÓN DE SESIONES
  showEditModal = false;
  editingSession: Session | null = null;
  editForm = {
    sessionDate: '',
    description: ''
  };
  isEditLoading = false;
  editError: string | null = null;

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

  // NUEVOS MÉTODOS PARA LAS FUNCIONALIDADES

  selectSession(session: Session): void {
    this.selectedSession = session;
    console.log('Sesión seleccionada:', session);
  }

  setActiveTab(tab: 'sessions' | 'observations' | 'monitoring' | 'analytics' | 'export'): void {
    this.activeTab = tab;
    
    // Si seleccionamos observaciones, monitoring, analytics o export, necesitamos una sesión seleccionada
    if ((tab === 'observations' || tab === 'monitoring' || tab === 'analytics' || tab === 'export') && !this.selectedSession) {
      // Seleccionar la última sesión por defecto
      if (this.latestSession) {
        this.selectedSession = this.latestSession;
      } else if (this.sessions.length > 0) {
        this.selectedSession = this.sessions[this.sessions.length - 1];
      }
    }
  }

  toggleObservations(): void {
    this.showObservations = !this.showObservations;
    if (this.showObservations) {
      this.showAnalytics = false;
      this.showExport = false;
    }
  }

  toggleAnalytics(): void {
    this.showAnalytics = !this.showAnalytics;
    if (this.showAnalytics) {
      this.showObservations = false;
      this.showExport = false;
    }
  }

  toggleExport(): void {
    this.showExport = !this.showExport;
    if (this.showExport) {
      this.showObservations = false;
      this.showAnalytics = false;
    }
  }

  // ✅ NUEVOS MÉTODOS PARA EDICIÓN DE SESIONES

  openEditModal(session: Session): void {
    console.log('🔄 Abriendo modal de edición para sesión:', session);
    this.editingSession = session;
    this.editForm = {
      sessionDate: session.sessionDate,
      description: session.description
    };
    this.showEditModal = true;
    this.editError = null;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingSession = null;
    this.editForm = {
      sessionDate: '',
      description: ''
    };
    this.editError = null;
    this.isEditLoading = false;
  }

  validateEditForm(): boolean {
    if (!this.editForm.sessionDate.trim()) {
      this.editError = 'La fecha de la sesión es requerida';
      return false;
    }

    if (!this.editForm.description.trim()) {
      this.editError = 'La descripción de la sesión es requerida';
      return false;
    }

    if (this.editForm.description.trim().length < 3) {
      this.editError = 'La descripción debe tener al menos 3 caracteres';
      return false;
    }

    this.editError = null;
    return true;
  }

  saveSessionChanges(): void {
    if (!this.validateEditForm() || !this.editingSession) {
      return;
    }

    const updateData: UpdateSessionRequest = {
      sessionDate: this.editForm.sessionDate,
      description: this.editForm.description.trim()
    };

    this.isEditLoading = true;
    this.editError = null;

    console.log('🔄 Guardando cambios de sesión:', this.editingSession.idSession, updateData);

    this.sessionService.updateSession(this.editingSession.idSession, updateData).subscribe({
      next: (updatedSession) => {
        console.log('✅ Sesión actualizada exitosamente:', updatedSession);
        
        // Actualizar la sesión en la lista local
        const index = this.sessions.findIndex(s => s.idSession === updatedSession.idSession);
        if (index !== -1) {
          this.sessions[index] = updatedSession;
        }

        // Actualizar referencias especiales si es necesario
        if (this.todaySession?.idSession === updatedSession.idSession) {
          this.todaySession = updatedSession;
        }
        if (this.latestSession?.idSession === updatedSession.idSession) {
          this.latestSession = updatedSession;
        }
        if (this.selectedSession?.idSession === updatedSession.idSession) {
          this.selectedSession = updatedSession;
        }

        // Cerrar modal y mostrar éxito
        this.closeEditModal();
        
        // Opcional: Recargar todas las sesiones para asegurar consistencia
        // this.loadSessions();
      },
      error: (error) => {
        console.error('❌ Error actualizando sesión:', error);
        
        if (error.status === 400) {
          this.editError = 'No tienes permisos para editar esta sesión o los datos son inválidos';
        } else if (error.status === 404) {
          this.editError = 'La sesión no fue encontrada';
        } else {
          this.editError = 'Error al actualizar la sesión. Por favor, inténtalo de nuevo.';
        }
        
        this.isEditLoading = false;
      }
    });
  }

  clearEditError(): void {
    this.editError = null;
  }
}
