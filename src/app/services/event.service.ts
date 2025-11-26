import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// ✅ INTERFACES ACTUALIZADAS SEGÚN EL BACKEND
export interface EventResponse {
  id: number;
  userId: number;
  title: string;
  start: string; // LocalDateTime como string
  end: string;   // LocalDateTime como string
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  title: string;
  start: string; // Formato: "2025-10-05T10:00:00" (sin timezone)
  end: string;   // Formato: "2025-10-05T11:00:00" (sin timezone)
  // ✅ NO incluir description, color, ni userId - se asignan automáticamente
}

export interface UpdateEventRequest {
  title?: string;
  start?: string;
  end?: string;
  description?: string;
  color?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'https://synapse-backend--0000001.wonderfulforest-e77213bb.brazilsouth.azurecontainerapps.io/api/events';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ✅ ENDPOINT FUNCIONAL - Crear nuevo evento
  createEvent(eventData: CreateEventRequest): Observable<EventResponse> {
    console.log('🔄 Creando evento:', eventData);

    // ✅ Validar formato de fecha (sin timezone)
    const cleanEventData = {
      title: eventData.title,
      start: this.cleanDateFormat(eventData.start),
      end: this.cleanDateFormat(eventData.end)
      // ✅ NO enviar description, color, ni userId - se asignan automáticamente
    };

    console.log('✅ Datos enviados al backend:', cleanEventData);

    return this.http.post<EventResponse>(
      this.apiUrl,
      cleanEventData,
      { headers: this.getHeaders() }
    );
  }

  // ✅ ENDPOINT FUNCIONAL - Obtener todos los eventos del terapeuta actual
  getAllEvents(): Observable<EventResponse[]> {
    console.log('🔄 Obteniendo todos los eventos del terapeuta');
    return this.http.get<EventResponse[]>(
      this.apiUrl,
      { headers: this.getHeaders() }
    );
  }

  // ✅ ENDPOINT FUNCIONAL - Obtener evento por ID
  getEventById(eventId: number): Observable<EventResponse> {
    console.log('🔄 Obteniendo evento por ID:', eventId);
    return this.http.get<EventResponse>(
      `${this.apiUrl}/${eventId}`,
      { headers: this.getHeaders() }
    );
  }

  // ✅ ENDPOINT FUNCIONAL - Obtener eventos por rango de fechas
  getEventsByDateRange(startDate: string, endDate: string): Observable<EventResponse[]> {
    const params = new URLSearchParams({
      startDate: this.cleanDateFormat(startDate),
      endDate: this.cleanDateFormat(endDate)
    });

    console.log('🔄 Obteniendo eventos por rango:', { startDate, endDate });

    return this.http.get<EventResponse[]>(
      `${this.apiUrl}/range?${params}`,
      { headers: this.getHeaders() }
    );
  }

  // ✅ ENDPOINT FUNCIONAL - Actualizar evento existente
  updateEvent(eventId: number, eventData: UpdateEventRequest): Observable<EventResponse> {
    console.log('🔄 Actualizando evento:', eventId, eventData);

    // ✅ Limpiar formato de fechas si están presentes
    const cleanEventData = { ...eventData };
    if (cleanEventData.start) {
      cleanEventData.start = this.cleanDateFormat(cleanEventData.start);
    }
    if (cleanEventData.end) {
      cleanEventData.end = this.cleanDateFormat(cleanEventData.end);
    }

    return this.http.put<EventResponse>(
      `${this.apiUrl}/${eventId}`,
      cleanEventData,
      { headers: this.getHeaders() }
    );
  }

  // ✅ ENDPOINT FUNCIONAL - Eliminar evento
  deleteEvent(eventId: number): Observable<void> {
    console.log('🔄 Eliminando evento:', eventId);
    return this.http.delete<void>(
      `${this.apiUrl}/${eventId}`,
      { headers: this.getHeaders() }
    );
  }

  // ✅ ENDPOINT FUNCIONAL - Crear eventos de prueba (solo para desarrollo)
  createTestEvents(): Observable<any> {
    console.log('🔄 Creando eventos de prueba');
    return this.http.post<any>(
      'https://synapse-backend--0000001.wonderfulforest-e77213bb.brazilsouth.azurecontainerapps.io/api/test-data/create-sample-events',
      {},
      { headers: this.getHeaders() }
    );
  }

  // ✅ UTILIDAD - Limpiar formato de fecha (remover timezone)
  private cleanDateFormat(dateString: string): string {
    // Remover timezone si está presente
    // Ejemplo: "2025-10-05T10:00:00-05:00" → "2025-10-05T10:00:00"
    return dateString.replace(/[+-]\d{2}:\d{2}$/, '').replace('Z', '');
  }

  // ✅ UTILIDAD - Formatear fecha para input datetime-local
  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // ✅ UTILIDAD - Formatear fecha para mostrar
  formatDateForDisplay(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // ✅ UTILIDAD - Validar que la fecha de fin sea posterior a la de inicio
  validateEventDates(start: string, end: string): { valid: boolean; message: string } {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return {
        valid: false,
        message: 'Las fechas no tienen un formato válido'
      };
    }

    if (endDate <= startDate) {
      return {
        valid: false,
        message: 'La fecha de fin debe ser posterior a la fecha de inicio'
      };
    }

    return {
      valid: true,
      message: 'Fechas válidas'
    };
  }
}
