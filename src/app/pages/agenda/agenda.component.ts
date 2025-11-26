import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventService, EventResponse, CreateEventRequest } from '../../services/event.service';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.css'
})
export class AgendaComponent implements OnInit, OnDestroy {
  // ✅ PROPIEDADES ACTUALIZADAS
  events: EventResponse[] = [];
  isLoading = false;
  error: string | null = null;
  
  // Modal para crear/editar eventos
  showEventModal = false;
  isEditMode = false;
  selectedEventId: number | null = null;
  
  // Formulario de evento
  eventForm = {
    title: '',
    start: '',
    end: '',
    description: '',
    color: '#4285f4'
  };

  // Validación
  formValidation = {
    title: { valid: true, message: '' },
    dates: { valid: true, message: '' }
  };

  constructor(private eventService: EventService) {}

  // ✅ CONFIGURACIÓN DE FULLCALENDAR ACTUALIZADA
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    locale: 'es',
    height: 'auto',
    slotMinTime: '06:00:00',
    slotMaxTime: '22:00:00',
    allDaySlot: false,
    nowIndicator: true,
    weekends: true,
    businessHours: {
      daysOfWeek: [1, 2, 3, 4, 5], // Lunes a viernes
      startTime: '08:00',
      endTime: '18:00'
    },
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this),
    events: [] // Se actualizará dinámicamente
  };

  ngOnInit() {
    this.loadEvents();
  }

  ngOnDestroy() {
    // Limpiar estado
    this.events = [];
    this.error = null;
    this.showEventModal = false;
  }

  // ✅ CARGAR EVENTOS DEL BACKEND
  loadEvents() {
    this.isLoading = true;
    this.error = null;

    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        console.log('✅ Eventos cargados:', events);
        this.events = events;
        
        // ✅ Convertir eventos para FullCalendar
        const calendarEvents: EventInput[] = events.map(event => ({
          id: event.id.toString(),
          title: event.title,
          start: event.start,
          end: event.end,
          backgroundColor: event.color,
          borderColor: event.color,
          textColor: this.getTextColor(event.color),
          extendedProps: {
            description: event.description,
            userId: event.userId,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt
          }
        }));
        
        // ✅ Actualizar calendario
        this.calendarOptions = {
          ...this.calendarOptions,
          events: calendarEvents
        };
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error cargando eventos:', error);
        this.error = 'Error al cargar los eventos: ' + error.message;
        this.events = [];
        this.isLoading = false;
      }
    });
  }

  // ✅ MANEJAR SELECCIÓN DE FECHA (CREAR EVENTO)
  handleDateSelect(selectInfo: any) {
    console.log('📅 Fecha seleccionada:', selectInfo);
    
    // ✅ Preparar formulario para nuevo evento
    this.isEditMode = false;
    this.selectedEventId = null;
    this.eventForm = {
      title: '',
      start: this.eventService.formatDateForInput(new Date(selectInfo.start)),
      end: this.eventService.formatDateForInput(new Date(selectInfo.end)),
      description: '',
      color: '#4285f4'
    };
    
    this.showEventModal = true;
    selectInfo.view.calendar.unselect();
  }

  // ✅ MANEJAR CLICK EN EVENTO (EDITAR/ELIMINAR)
  handleEventClick(clickInfo: any) {
    console.log('🖱️ Evento clickeado:', clickInfo.event);
    
    const eventId = parseInt(clickInfo.event.id);
    const event = this.events.find(e => e.id === eventId);
    
    if (!event) {
      this.error = 'Evento no encontrado';
      return;
    }

    // ✅ Mostrar opciones: Editar o Eliminar
    const action = confirm(`Evento: "${event.title}"\n\n¿Qué deseas hacer?\n\nOK = Editar\nCancelar = Eliminar`);
    
    if (action) {
      // Editar evento
      this.editEvent(event);
    } else {
      // Eliminar evento
      this.deleteEvent(event);
    }
  }

  // ✅ MANEJAR ARRASTRAR Y SOLTAR EVENTO
  handleEventDrop(dropInfo: any) {
    console.log('🔄 Evento movido:', dropInfo);
    
    const eventId = parseInt(dropInfo.event.id);
    const updateData = {
      start: dropInfo.event.startStr,
      end: dropInfo.event.endStr
    };
    
    this.updateEventDates(eventId, updateData);
  }

  // ✅ MANEJAR REDIMENSIONAR EVENTO
  handleEventResize(resizeInfo: any) {
    console.log('📏 Evento redimensionado:', resizeInfo);
    
    const eventId = parseInt(resizeInfo.event.id);
    const updateData = {
      start: resizeInfo.event.startStr,
      end: resizeInfo.event.endStr
    };
    
    this.updateEventDates(eventId, updateData);
  }

  // ✅ CREAR NUEVO EVENTO
  createEvent() {
    if (!this.validateForm()) {
      return;
    }

    const eventData: CreateEventRequest = {
      title: this.eventForm.title.trim(),
      start: this.eventForm.start,
      end: this.eventForm.end
      // ✅ NO enviar description, color, ni userId - se asignan automáticamente
    };

    this.isLoading = true;
    this.error = null;

    this.eventService.createEvent(eventData).subscribe({
      next: (createdEvent) => {
        console.log('✅ Evento creado:', createdEvent);
        this.showEventModal = false;
        this.resetForm();
        this.loadEvents(); // Recargar eventos
      },
      error: (error) => {
        console.error('❌ Error creando evento:', error);
        this.error = 'Error al crear el evento: ' + error.message;
        this.isLoading = false;
      }
    });
  }

  // ✅ EDITAR EVENTO EXISTENTE
  editEvent(event: EventResponse) {
    this.isEditMode = true;
    this.selectedEventId = event.id;
    this.eventForm = {
      title: event.title,
      start: this.eventService.formatDateForInput(new Date(event.start)),
      end: this.eventService.formatDateForInput(new Date(event.end)),
      description: event.description || '',
      color: event.color
    };
    
    this.showEventModal = true;
  }

  // ✅ ACTUALIZAR EVENTO
  updateEvent() {
    if (!this.validateForm() || !this.selectedEventId) {
      return;
    }

    const updateData = {
      title: this.eventForm.title.trim(),
      start: this.eventForm.start,
      end: this.eventForm.end,
      description: this.eventForm.description.trim() || undefined,
      color: this.eventForm.color
    };

    this.isLoading = true;
    this.error = null;

    this.eventService.updateEvent(this.selectedEventId, updateData).subscribe({
      next: (updatedEvent) => {
        console.log('✅ Evento actualizado:', updatedEvent);
        this.showEventModal = false;
        this.resetForm();
        this.loadEvents(); // Recargar eventos
      },
      error: (error) => {
        console.error('❌ Error actualizando evento:', error);
        this.error = 'Error al actualizar el evento: ' + error.message;
        this.isLoading = false;
      }
    });
  }

  // ✅ ACTUALIZAR SOLO FECHAS (PARA DRAG & DROP)
  updateEventDates(eventId: number, dateData: { start: string; end: string }) {
    this.eventService.updateEvent(eventId, dateData).subscribe({
      next: (updatedEvent) => {
        console.log('✅ Fechas del evento actualizadas:', updatedEvent);
        // No necesitamos recargar todo, FullCalendar ya actualizó la vista
      },
      error: (error) => {
        console.error('❌ Error actualizando fechas:', error);
        this.error = 'Error al mover el evento: ' + error.message;
        // Revertir cambio visual
        this.loadEvents();
      }
    });
  }

  // ✅ ELIMINAR EVENTO
  deleteEvent(event: EventResponse) {
    const confirmMessage = `¿Estás seguro de que quieres eliminar el evento "${event.title}"?\n\nEsta acción no se puede deshacer.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.eventService.deleteEvent(event.id).subscribe({
      next: () => {
        console.log('✅ Evento eliminado:', event.id);
        this.loadEvents(); // Recargar eventos
      },
      error: (error) => {
        console.error('❌ Error eliminando evento:', error);
        this.error = 'Error al eliminar el evento: ' + error.message;
        this.isLoading = false;
      }
    });
  }

  // ✅ CREAR EVENTOS DE PRUEBA
  createTestEvents() {
    this.isLoading = true;
    this.error = null;

    this.eventService.createTestEvents().subscribe({
      next: (response) => {
        console.log('✅ Eventos de prueba creados:', response);
        this.loadEvents(); // Recargar eventos
      },
      error: (error) => {
        console.error('❌ Error creando eventos de prueba:', error);
        this.error = 'Error al crear eventos de prueba: ' + error.message;
        this.isLoading = false;
      }
    });
  }

  // ✅ VALIDAR FORMULARIO
  validateForm(): boolean {
    let isValid = true;

    // Validar título
    if (!this.eventForm.title.trim()) {
      this.formValidation.title = {
        valid: false,
        message: 'El título es requerido'
      };
      isValid = false;
    } else {
      this.formValidation.title = {
        valid: true,
        message: ''
      };
    }

    // Validar fechas
    const dateValidation = this.eventService.validateEventDates(
      this.eventForm.start,
      this.eventForm.end
    );
    
    this.formValidation.dates = dateValidation;
    if (!dateValidation.valid) {
      isValid = false;
    }

    return isValid;
  }

  // ✅ RESETEAR FORMULARIO
  resetForm() {
    this.eventForm = {
      title: '',
      start: '',
      end: '',
      description: '',
      color: '#4285f4'
    };
    
    this.formValidation = {
      title: { valid: true, message: '' },
      dates: { valid: true, message: '' }
    };
    
    this.isEditMode = false;
    this.selectedEventId = null;
  }

  // ✅ CERRAR MODAL
  closeModal() {
    this.showEventModal = false;
    this.resetForm();
  }

  // ✅ LIMPIAR ERROR
  clearError() {
    this.error = null;
  }

  // ✅ UTILIDADES

  getTextColor(backgroundColor: string): string {
    // Determinar si usar texto blanco o negro basado en el color de fondo
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  }

  formatEventDate(dateString: string): string {
    return this.eventService.formatDateForDisplay(dateString);
  }

  getTotalEvents(): number {
    return this.events.length;
  }

  getEventsToday(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.events.filter(event => 
      event.start.startsWith(today)
    ).length;
  }
}
