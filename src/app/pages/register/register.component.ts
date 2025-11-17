import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

interface PasswordRequirement {
  text: string;
  met: boolean;
  icon: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  nombre: string = '';
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  passwordTouched: boolean = false;
  showPasswordRequirements: boolean = false;
  passwordRequirements: PasswordRequirement[] = [
    { text: 'Mínimo 8 caracteres', met: false, icon: '📏' },
    { text: 'Una letra mayúscula', met: false, icon: '🔤' },
    { text: 'Una letra minúscula', met: false, icon: '🔡' },
    { text: 'Un número', met: false, icon: '🔢' },
    { text: 'Un carácter especial (@$!%*?&#)', met: false, icon: '🔣' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  // =========================================================
  // 👁️ TOGGLE MOSTRAR/OCULTAR CONTRASEÑA
  // =========================================================
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // =========================================================
  // 🔐 VALIDAR CONTRASEÑA EN TIEMPO REAL
  // =========================================================
  onPasswordChange(): void {
    this.passwordTouched = true;
    
    // Validar cada requisito
    this.passwordRequirements[0].met = this.password.length >= 8;
    this.passwordRequirements[1].met = /[A-Z]/.test(this.password);
    this.passwordRequirements[2].met = /[a-z]/.test(this.password);
    this.passwordRequirements[3].met = /[0-9]/.test(this.password);
    this.passwordRequirements[4].met = /[@$!%*?&#]/.test(this.password);
  }
// =========================================================
// 👁️ MOSTRAR/OCULTAR REQUISITOS AL HACER FOCUS
// =========================================================
onPasswordFocus(): void {
  this.showPasswordRequirements = true;
}

onPasswordBlur(): void {
  // Solo ocultar si la contraseña está vacía
  if (!this.password) {
    this.showPasswordRequirements = false;
  }
}
  // =========================================================
  // 💪 CALCULAR FORTALEZA DE CONTRASEÑA
  // =========================================================
  getPasswordStrength(): string {
    const metCount = this.passwordRequirements.filter(req => req.met).length;
    
    if (metCount === 0) return 'none';
    if (metCount <= 2) return 'weak';
    if (metCount <= 3) return 'medium';
    if (metCount <= 4) return 'good';
    return 'strong';
  }

  // =========================================================
  // 🎨 CLASE CSS PARA BARRA DE FORTALEZA
  // =========================================================
  getPasswordStrengthClass(): string {
    return `strength-${this.getPasswordStrength()}`;
  }

  // =========================================================
  // 📝 TEXTO DE FORTALEZA
  // =========================================================
 // =========================================================
// 📝 TEXTO DE FORTALEZA
// =========================================================
getPasswordStrengthText(): string {
  const strength = this.getPasswordStrength();
  const texts: { [key: string]: string } = {  // 👈 AÑADE ESTE TIPADO
    none: '',
    weak: 'Débil',
    medium: 'Media',
    good: 'Buena',
    strong: 'Fuerte'
  };
  return texts[strength] || '';
}
  // =========================================================
  // ✅ VERIFICAR SI CONTRASEÑA ES VÁLIDA
  // =========================================================
  isPasswordValid(): boolean {
    return this.passwordRequirements.every(req => req.met);
  }

  // =========================================================
  // 📋 REGISTRO
  // =========================================================
  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Validaciones básicas
    if (!this.nombre || !this.email || !this.password) {
      this.errorMessage = 'Todos los campos son obligatorios';
      return;
    }

    // Validar nombre
    if (this.nombre.length < 2) {
      this.errorMessage = 'El nombre debe tener al menos 2 caracteres';
      return;
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.nombre)) {
      this.errorMessage = 'El nombre solo puede contener letras y espacios';
      return;
    }

    // Validar email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'El formato del correo no es válido';
      return;
    }

    // Validar contraseña
    if (!this.isPasswordValid()) {
      this.errorMessage = 'La contraseña no cumple con todos los requisitos';
      return;
    }

    this.isLoading = true;

    this.authService.register(this.nombre, this.email, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('✅ Registro exitoso:', response);
        
        // Verificar si requiere verificación
        if (response.requiresVerification) {
          this.successMessage = '📧 Revisa tu correo para verificar tu cuenta';
          
          // Guardar email temporalmente
          this.authService.saveTempEmail(this.email);
          
          // Redirigir a verificación
          setTimeout(() => {
            this.router.navigate(['/verify-email'], {
              queryParams: { email: this.email }
            });
          }, 1500);
        } else {
          // Flujo antiguo (por compatibilidad)
          this.successMessage = 'Registro exitoso. Redirigiendo al login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Error en registro:', error);
        
        // Manejar errores específicos
        if (error.status === 400) {
          if (error.error?.errors && Array.isArray(error.error.errors)) {
            this.errorMessage = error.error.errors.join(', ');
          } else {
            this.errorMessage = error.error?.message || 'El correo ya está registrado';
          }
        } else {
          this.errorMessage = error.error?.message || 'Error en registro';
        }
      }
    });
  }
}