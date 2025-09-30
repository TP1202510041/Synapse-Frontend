import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Session, CreateSessionDto } from '../models/session.model';
import { MonitoringService } from './monitoring.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private apiUrl = 'http://localhost:5000/api/sessions'; // ← URL CORREGIDA

  constructor(
    private http: HttpClient,
    private monitoringService: MonitoringService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('Token usado en sessions:', token ? token.substring(0, 20) + '...' : 'NO HAY TOKEN');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // SIN userId - el backend lo obtiene del token
  getSessionsByPatient(patientId: number): Observable<Session[]> {
    return this.http.get<Session[]>(
      `${this.apiUrl}/patient/${patientId}`,
      { headers: this.getHeaders() }
    );
  }

  // SIN userId en la URL
  createSession(session: CreateSessionDto): Observable<Session> {
    console.log('Creando sesión con datos:', session);
    return this.http.post<Session>(
      this.apiUrl,
      session,
      { headers: this.getHeaders() }
    );
  }

  getSession(id: string): Observable<Session> {
    return this.http.get<Session>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  deleteSession(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  deleteSessionComplete(sessionId: string): Observable<void> {
    return this.monitoringService.getMonitoringRecordsBySession(sessionId).pipe(
      switchMap(monitoringRecords => {
        if (monitoringRecords.length === 0) {
          return this.deleteSession(sessionId);
        }

        const deleteObservables = monitoringRecords.map(record =>
          this.monitoringService.deleteMonitoringRecord(record.id!)
        );

        return forkJoin(deleteObservables).pipe(
          switchMap(() => this.deleteSession(sessionId))
        );
      })
    );
  }
}
