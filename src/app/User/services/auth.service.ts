import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { 
  User, 
  LoginResponse, 
  LoginData, 
  RegisterData, 
  ForgotPasswordRequest, 
  ResetPasswordRequest, 
  LoginAttempt,
  ApiResponse 
} from '../../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject = new BehaviorSubject<User | null>(user);
      } catch {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        this.currentUserSubject = new BehaviorSubject<User | null>(null);
      }
    } else {
      this.currentUserSubject = new BehaviorSubject<User | null>(null);
    }
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<User> {
    const loginData: LoginData = { email, password };
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginData)
      .pipe(
        tap(response => {
          console.log('Login response completa:', response);

          // CRÍTICO: Guardar el TOKEN
          if (response.success && response.data.token) {
            localStorage.setItem('token', response.data.token);
            console.log('✅ Token guardado:', response.data.token.substring(0, 20) + '...');
          }
        }),
        map(response => {
          // Construir el objeto User desde response.data
          const user: User = {
            id: response.data.userId, // ← AGREGAR userId del backend
            email: response.data.email,
            userName: response.data.userName,
            role: response.data.role
          };

          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('userId', response.data.userId?.toString() || ''); // ← GUARDAR userId separado
          this.currentUserSubject.next(user);
          console.log('✅ Usuario guardado:', user);
          console.log('✅ UserId guardado:', response.data.userId);

          return user;
        })
      );
  }

  register(userData: RegisterData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const hasUser = this.currentUserValue !== null;
    const hasToken = !!localStorage.getItem('token');
    return hasUser && hasToken;
  }

  getCurrentUserId(): string {
    // Primero intentar obtener del localStorage
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      return storedUserId;
    }
    
    // Fallback al usuario actual
    const user = this.currentUserValue;
    return user?.id?.toString() || '';
  }

  getCurrentUserIdAsNumber(): number {
    const userId = this.getCurrentUserId();
    return userId ? parseInt(userId, 10) : 0;
  }

  updateUserProfile(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${user.id}`, user).pipe(
      map(updatedUser => {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);
        return updatedUser;
      })
    );
  }

  // NUEVOS MÉTODOS AGREGADOS

  // Solicitar recuperación de contraseña
  forgotPassword(email: string): Observable<ApiResponse> {
    const request: ForgotPasswordRequest = { email };
    return this.http.post<ApiResponse>(`${this.apiUrl}/forgot-password`, request);
  }

  // Restablecer contraseña
  resetPassword(token: string, newPassword: string): Observable<ApiResponse> {
    const request: ResetPasswordRequest = { token, newPassword };
    return this.http.post<ApiResponse>(`${this.apiUrl}/reset-password`, request);
  }

  // Verificar si un email existe (endpoint existente)
  checkEmailExists(email: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/check-email?email=${email}`);
  }

  // Obtener intentos de login (solo admin)
  getLoginAttempts(userId: number): Observable<LoginAttempt[]> {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    return this.http.get<LoginAttempt[]>(`${this.apiUrl}/login-attempts/${userId}`, { headers });
  }

  // Test endpoint (existente)
  testApi(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/test`);
  }
}
