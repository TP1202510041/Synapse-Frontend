import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExportRequest, ExportResponse } from '../models/export.model';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private apiUrl = 'http://localhost:5000/api/exports';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Generar PDF del paciente
  generatePatientPDF(patientId: number, options: ExportRequest = {}): Observable<ExportResponse> {
    console.log('Generando PDF para paciente:', patientId, options);
    return this.http.post<ExportResponse>(
      `${this.apiUrl}/patient/${patientId}/pdf`,
      options,
      { headers: this.getHeaders() }
    );
  }

  // Descargar PDF generado
  downloadPDF(exportId: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${exportId}/download`,
      { 
        headers: this.getHeaders(),
        responseType: 'blob'
      }
    );
  }

  // Método auxiliar para descargar archivo
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}