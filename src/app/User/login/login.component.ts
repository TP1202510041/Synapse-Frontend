import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['../styles/auth.styles.css']  // <- Añade esta línea
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: string = '';
  warningMessage: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.error = '';
    this.warningMessage = '';
    this.isLoading = true;

    console.log('🔐 Intentando login con:', this.email);

    this.authService.login(this.email, this.password)
      .subscribe({
        next: (response) => {
          console.log('✅ Login exitoso:', response);
          this.isLoading = false;
          this.router.navigate(['/inicio']);
        },
        error: (err) => {
          console.error('❌ Error completo en login:', err);
          console.error('Status:', err.status);
          console.error('Error response:', err.error);
          this.isLoading = false;
          
          // Manejar diferentes tipos de errores
          if (err.status === 401 || err.status === 403) {
            let errorMessage = '';
            
            // Intentar obtener el mensaje del backend
            if (err.error?.message) {
              errorMessage = err.error.message;
            } else if (typeof err.error === 'string') {
              errorMessage = err.error;
            } else {
              errorMessage = 'Credenciales inválidas';
            }
            
            console.log('💬 Mensaje del backend:', errorMessage);
            
            // Detectar mensajes de advertencia vs errores críticos
            if (errorMessage.includes('⚠️') || errorMessage.includes('Te quedan')) {
              this.warningMessage = errorMessage;
            } else if (errorMessage.includes('🚨') || errorMessage.includes('Solo te quedan')) {
              this.error = errorMessage;
            } else if (errorMessage.includes('🔒') || errorMessage.includes('bloqueada')) {
              this.error = errorMessage;
            } else {
              this.error = errorMessage;
            }
          } else if (err.status === 400) {
            // Errores de validación
            if (err.error?.errors && Array.isArray(err.error.errors)) {
              const errorMessages = err.error.errors.map((e: any) => e.message);
              this.error = errorMessages.join('. ');
            } else if (err.error?.message) {
              this.error = err.error.message;
            } else {
              this.error = 'Datos inválidos. Por favor verifica tu email y contraseña.';
            }
          } else if (err.status === 0) {
            this.error = 'No se puede conectar al servidor. Verifica tu conexión a internet.';
          } else {
            this.error = err.error?.message || 'Error al iniciar sesión. Por favor intenta nuevamente.';
          }
          
          console.log('💬 Mensaje mostrado:', this.error || this.warningMessage);
        }
      });
  }
}
