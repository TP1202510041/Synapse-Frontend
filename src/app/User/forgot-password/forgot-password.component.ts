import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['../styles/auth.styles.css']
})
export class ForgotPasswordComponent {
  // Estados del flujo
  step: 'email' | 'code' | 'success' = 'email';
  
  // Datos del formulario
  email: string = '';
  verificationCode: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  
  // UI
  error: string = '';
  success: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  
  // Temporizador
  codeExpiresIn: number = 15 * 60; // 15 minutos en segundos
  timerInterval: any;
  canResend: boolean = false;
  resendCooldown: number = 120; // 2 minutos en segundos

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  // Paso 1: Solicitar código
  requestCode() {
    this.error = '';
    this.success = '';
    
    if (!this.email) {
      this.error = 'Por favor ingresa tu correo electrónico';
      return;
    }

    this.isLoading = true;
    console.log('📧 Solicitando código para:', this.email);

    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        console.log('✅ Código enviado:', response);
        this.success = response.message || 'Código enviado a tu correo electrónico';
        this.step = 'code';
        this.startTimer();
        this.startResendCooldown();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error al solicitar código:', err);
        this.isLoading = false;
        
        if (err.status === 429) {
          this.error = err.error?.message || 'Demasiados intentos. Por favor espera antes de intentar nuevamente.';
        } else if (err.status === 0) {
          this.error = 'No se puede conectar al servidor. Verifica que el backend esté corriendo.';
        } else {
          this.error = err.error?.message || 'Error al enviar el código. Por favor intenta nuevamente.';
        }
      }
    });
  }

  // Paso 2: Resetear contraseña con código
  resetPassword() {
    this.error = '';
    this.success = '';

    // Validaciones
    if (!this.verificationCode || this.verificationCode.length !== 6) {
      this.error = 'El código debe tener 6 dígitos';
      return;
    }

    if (!this.newPassword || this.newPassword.length < 8) {
      this.error = 'La contraseña debe tener al menos 8 caracteres';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.isLoading = true;
    console.log('🔐 Reseteando contraseña...');

    const resetData = {
      email: this.email,
      verificationCode: this.verificationCode,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    };

    this.authService.resetPasswordWithEmail(resetData).subscribe({
      next: (response) => {
        console.log('✅ Contraseña cambiada:', response);
        this.success = response.message || 'Contraseña cambiada exitosamente';
        this.step = 'success';
        this.isLoading = false;
        
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
        }
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        console.error('❌ Error al resetear contraseña:', err);
        this.isLoading = false;
        
        if (err.status === 400) {
          if (err.error?.errors && Array.isArray(err.error.errors)) {
            const errorMessages = err.error.errors.map((e: any) => e.message);
            this.error = errorMessages.join('. ');
          } else {
            this.error = err.error?.message || 'Código inválido o expirado';
          }
        } else if (err.status === 0) {
          this.error = 'No se puede conectar al servidor.';
        } else {
          this.error = err.error?.message || 'Error al cambiar la contraseña. Por favor intenta nuevamente.';
        }
      }
    });
  }

  // Reenviar código
  resendCode() {
    if (!this.canResend) {
      return;
    }
    
    this.verificationCode = '';
    this.step = 'email';
    this.requestCode();
  }

  // Temporizador de expiración del código
  startTimer() {
    this.codeExpiresIn = 15 * 60;
    
    this.timerInterval = setInterval(() => {
      this.codeExpiresIn--;
      
      if (this.codeExpiresIn <= 0) {
        clearInterval(this.timerInterval);
        this.error = 'El código ha expirado. Por favor solicita uno nuevo.';
      }
    }, 1000);
  }

  // Cooldown para reenviar código
  startResendCooldown() {
    this.canResend = false;
    this.resendCooldown = 120;
    
    const cooldownInterval = setInterval(() => {
      this.resendCooldown--;
      
      if (this.resendCooldown <= 0) {
        clearInterval(cooldownInterval);
        this.canResend = true;
      }
    }, 1000);
  }

  // Formatear tiempo
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  // Toggle password visibility
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Volver al paso anterior
  goBack() {
    if (this.step === 'code') {
      this.step = 'email';
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }
    }
  }
}
