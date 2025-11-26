import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

export interface ApiError {
  message: string;
  status: number;
  error?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ApiResponseService {

  constructor() {}

  // Manejar errores de API de forma consistente
  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error inesperado';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Manejar códigos de estado específicos
      switch (error.status) {
        case 401:
          errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
          // Aquí podrías redirigir al login
          break;
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción.';
          break;
        case 404:
          errorMessage = 'El recurso solicitado no fue encontrado.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
          break;
      }
    }

    const apiError: ApiError = {
      message: errorMessage,
      status: error.status,
      error: error.error
    };

    console.error('API Error:', apiError);
    return throwError(() => apiError);
  }

  // Validar respuesta exitosa
  isSuccessResponse(response: any): boolean {
    return response && response.success === true;
  }

  // Extraer datos de respuesta
  extractData<T>(response: any): T {
    if (this.isSuccessResponse(response)) {
      return response.data;
    }
    return response;
  }

  // Formatear fecha para API
  formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Formatear fecha y hora para API
  formatDateTimeForApi(date: Date): string {
    return date.toISOString();
  }
}