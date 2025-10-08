import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestDataService {
  private apiUrl = 'http://localhost:5000/api/test-data';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Crear observaciones de prueba
  createSampleObservations(): Observable<string> {
    console.log('Creando datos de prueba...');
    return this.http.post(
      `${this.apiUrl}/create-sample-observations`,
      {},
      { 
        headers: this.getHeaders(),
        responseType: 'text'
      }
    );
  }

  // Obtener información de datos disponibles
  getDataInfo(): Observable<string> {
    return this.http.get(
      `${this.apiUrl}/info`,
      { 
        headers: this.getHeaders(),
        responseType: 'text'
      }
    );
  }
}