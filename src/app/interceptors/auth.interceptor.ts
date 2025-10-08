import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtener token del localStorage
    const token = localStorage.getItem('token');
    
    // Clonar la request y agregar el token si existe
    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Procesar la request y manejar errores
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si es error 401, limpiar sesión y redirigir al login
        if (error.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          this.router.navigate(['/login']);
        }
        
        return throwError(() => error);
      })
    );
  }
}