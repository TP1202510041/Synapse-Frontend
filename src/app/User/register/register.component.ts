import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['../styles/auth.styles.css']  // <- Añade esta línea
})

export class RegisterComponent {
  registerData = {
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    dni: '',
    address: '',
    birthDate: '',
    gender: 'PREFIERO_NO_DECIR',
    role: 'USER',
    specialization: ''
  };
  error: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  passwordStrength: string = '';
  validationErrors: string[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  validatePassword() {
    const password = this.registerData.password;
    this.validationErrors = [];

    if (password.length < 8) {
      this.validationErrors.push('Mínimo 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      this.validationErrors.push('Al menos 1 mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      this.validationErrors.push('Al menos 1 minúscula');
    }
    if (!/[0-9]/.test(password)) {
      this.validationErrors.push('Al menos 1 número');
    }
    if (!/[@$!%*?&]/.test(password)) {
      this.validationErrors.push('Al menos 1 carácter especial (@$!%*?&)');
    }

    // Calcular fortaleza
    const strength = 5 - this.validationErrors.length;
    if (strength === 5) this.passwordStrength = 'Muy fuerte';
    else if (strength === 4) this.passwordStrength = 'Fuerte';
    else if (strength === 3) this.passwordStrength = 'Media';
    else if (strength === 2) this.passwordStrength = 'Débil';
    else this.passwordStrength = 'Muy débil';
  }

  calculateAge(): number {
    if (!this.registerData.birthDate) return 0;
    const today = new Date();
    const birthDate = new Date(this.registerData.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  onRegister() {
    this.error = '';
    this.validationErrors = [];

    // Validaciones del frontend
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    // Validar DNI solo si se proporciona
    if (this.registerData.dni && (this.registerData.dni.length < 8 || this.registerData.dni.length > 12)) {
      this.error = 'El DNI debe tener entre 8 y 12 dígitos';
      return;
    }

    // Validar edad solo si se proporciona fecha de nacimiento
    if (this.registerData.birthDate) {
      const age = this.calculateAge();
      if (age < 18) {
        this.error = 'Debes ser mayor de 18 años para registrarte';
        return;
      }
    }

    // Limpiar cualquier token viejo antes de registrarse
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userId');
    
    console.log('📤 Enviando datos de registro:', this.registerData);

    this.authService.register(this.registerData)
      .subscribe({
        next: (response) => {
          console.log('✅ Registro exitoso:', response);
          alert('✅ Registro exitoso. Por favor inicia sesión.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('❌ Error completo en registro:', err);
          console.error('Status:', err.status);
          console.error('Error response:', err.error);
          
          // Manejar diferentes tipos de errores del backend
          if (err.status === 400) {
            // Errores de validación
            if (err.error?.errors && Array.isArray(err.error.errors)) {
              // Formato: { errors: [{field: "password", message: "..."}] }
              const errorMessages = err.error.errors.map((e: any) => e.message);
              this.error = errorMessages.join('. ');
              console.log('📋 Errores de validación:', errorMessages);
            } else if (err.error?.message) {
              // Formato: { message: "..." }
              const message = err.error.message;
              // Si el mensaje es sobre token JWT, cambiarlo por algo más claro
              if (message.includes('Token JWT') || message.includes('JWT')) {
                this.error = 'Error de validación. Por favor verifica los datos ingresados.';
              } else {
                this.error = message;
              }
            } else if (typeof err.error === 'string') {
              // Formato: string directo
              const message = err.error;
              // Si el mensaje es sobre token JWT, cambiarlo por algo más claro
              if (message.includes('Token JWT') || message.includes('JWT')) {
                this.error = 'Error de validación. Por favor verifica los datos ingresados.';
              } else {
                this.error = message;
              }
            } else {
              this.error = 'Error de validación. Por favor verifica los datos ingresados.';
            }
          } else if (err.status === 409) {
            // Conflicto (email o DNI duplicado)
            this.error = err.error?.message || 'El email o DNI ya está registrado';
          } else if (err.status === 0) {
            // Error de conexión
            this.error = 'No se puede conectar al servidor. Verifica tu conexión a internet.';
          } else if (err.status === 401 || err.status === 403) {
            // Error de autenticación - probablemente token inválido
            const message = err.error?.message || err.error || '';
            if (message.includes('Token JWT') || message.includes('JWT')) {
              this.error = 'Por favor completa todos los campos requeridos correctamente.';
            } else {
              this.error = message || 'Error de autenticación';
            }
          } else {
            // Otros errores
            const message = err.error?.message || '';
            if (message.includes('Token JWT') || message.includes('JWT')) {
              this.error = 'Error al procesar la solicitud. Por favor intenta nuevamente.';
            } else {
              this.error = message || 'Error al registrar el usuario. Por favor intenta nuevamente.';
            }
          }
          
          console.log('💬 Mensaje de error mostrado:', this.error);
        }
      });
  }
}
