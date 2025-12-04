import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { InactivityService } from '../../services/inactivity.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  correo: string = '';
  contrasena: string = '';
  mensaje: string = '';
  isError: boolean = false;
  isLoading: boolean = false;
  currentYear: number = new Date().getFullYear();
  mostrarContrasena: boolean = false; // ← AGREGAR ESTA LÍNEA

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService,
    private inactivityService: InactivityService
  ) {}

  // =========================================================
  // 👁️ MOSTRAR/OCULTAR CONTRASEÑA
  // =========================================================
  toggleMostrarContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  // =========================================================
  // 📄 ABRIR MODALES
  // =========================================================
  openTerminos(): void {
    this.modalService.openTerminos();
  }

  openPrivacidad(): void {
    this.modalService.openPrivacidad();
  }

  // =========================================================
  // 🔐 LOGIN CON MANEJO DE BLOQUEO Y MONITOREO DE INACTIVIDAD
  // =========================================================
  onSubmit(): void {
    this.mensaje = '';

    if (!this.correo || !this.contrasena) {
      this.showMessage('Por favor completa todos los campos', true);
      return;
    }

    this.isLoading = true;

    this.authService.login(this.correo, this.contrasena).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('✅ Login exitoso. Token recibido y almacenado de forma segura.');

        if (response.blocked) {
          console.log('🔒 Cuenta bloqueada');
          
          if (response.minutesRemaining) {
            const minutos = response.minutesRemaining;
            const plural = minutos > 1 ? 's' : '';
            this.showMessage(
              `🔒 Cuenta bloqueada por seguridad. Intenta de nuevo en ${minutos} minuto${plural}.`,
              true
            );
          } else {
            this.showMessage(response.message, true);
          }
          return;
        }

        if (response.requires2FA) {
          this.showMessage('Credenciales correctas. Verificando 2FA...', false);
          localStorage.setItem('temp_correo_2fa', response.correo);

          setTimeout(() => {
            if (response.metodo_2fa === 'TOTP') {
              this.router.navigate(['/two-factor-verify'], {
                state: { correo: response.correo, metodo_2fa: 'TOTP' }
              });
            } else if (response.metodo_2fa === 'GMAIL') {
              this.router.navigate(['/verify-email-code'], {
                state: { correo: response.correo, metodo_2fa: 'GMAIL' }
              });
            } else {
              this.showMessage('Método 2FA desconocido.', true);
            }
          }, 1500);
          return;
        }

        const token = response.access_token || response.token;
        if (token) {
          localStorage.setItem('access_token', token);
          localStorage.setItem('token', token);
        }

        if (response.usuario) {
          localStorage.setItem('userEmail', response.usuario.correo);
          localStorage.setItem('userName', response.usuario.nombre);
          localStorage.setItem('userId', response.usuario.id.toString());
        }
        
        localStorage.setItem('isLoggedIn', 'true');

        this.showMessage('Inicio de sesión exitoso ✅', false);
        
        this.inactivityService.startMonitoring();
        console.log('✅ Monitoreo de inactividad iniciado (15 minutos)');
        
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },

      error: (error) => {
        this.isLoading = false;
        console.error('❌ Error en login:', error);

        if (error.status === 403 && error.error?.blocked) {
          if (error.error.minutesRemaining) {
            const minutos = error.error.minutesRemaining;
            const plural = minutos > 1 ? 's' : '';
            
            const ahora = new Date();
            const horaDesbloqueo = new Date(ahora.getTime() + (minutos * 60000));
            const horaFormateada = horaDesbloqueo.toLocaleTimeString('es-MX', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
            
            this.showMessage(
              `🔒 Cuenta bloqueada. Intenta en ${minutos} minuto${plural} (${horaFormateada}).`,
              true
            );
          } else {
            this.showMessage(error.error.message, true);
          }
          return;
        }

        if (error.status === 401 && error.error?.attemptsRemaining !== undefined) {
          const intentosRestantes = error.error.attemptsRemaining;
          
          if (intentosRestantes === 0) {
            this.showMessage(
              '🔒 Has excedido el límite de intentos. Tu cuenta será bloqueada.',
              true
            );
          } else if (intentosRestantes === 1) {
            this.showMessage(
              `❌ Contraseña incorrecta. ⚠️ Te queda ${intentosRestantes} intento antes del bloqueo.`,
              true
            );
          } else {
            this.showMessage(
              `❌ Contraseña incorrecta. Te quedan ${intentosRestantes} intentos.`,
              true
            );
          }
          return;
        }

        const errorMsg = error.error?.message || 'Error al iniciar sesión';
        this.showMessage(errorMsg, true);
      }
    });
  }

  // =========================================================
  // 🔄 IR A REGISTRO
  // =========================================================
  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  // =========================================================
  // 💬 MOSTRAR MENSAJES
  // =========================================================
  private showMessage(msg: string, isError: boolean): void {
    this.mensaje = msg;
    this.isError = isError;
  }
}