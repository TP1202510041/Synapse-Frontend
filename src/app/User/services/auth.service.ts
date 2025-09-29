import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  id?: number;
  email: string;
  userName: string;
  role?: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    email: string;
    userName: string;
    role: string;
  };
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  userName: string;
  password: string;
}

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
            email: response.data.email,
            userName: response.data.userName,
            role: response.data.role
          };

          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          console.log('✅ Usuario guardado:', user);

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
    const user = this.currentUserValue;
    return user?.id?.toString() || '';
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
}
