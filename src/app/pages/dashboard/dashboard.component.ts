import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { InactivityService } from '../../services/inactivity.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  usuario: any = null;
  tiene2FA: boolean = false;
  vistaActual: 'inicio' | 'seguridad' = 'inicio';
  private sessionCheckSubscription?: Subscription;

  constructor(
    public authService: AuthService,
    private router: Router,
    private inactivityService: InactivityService
  ) { }

  ngOnInit(): void {
    console.log('🔍 Verificando autenticación...');
    
    // Verificar autenticación
    if (!this.authService.isAuthenticated()) {
      console.log('❌ Usuario no autenticado, redirigiendo...');
      this.router.navigate(['/login']);
      return;
    }

    // Asegurar que el monitoreo esté activo
    this.inactivityService.startMonitoring();
    console.log('✅ Monitoreo de inactividad verificado en dashboard');

    // Cargar datos del usuario
    this.cargarDatosUsuario();
    
    // ✅ INICIAR VERIFICACIÓN PERIÓDICA DE SESIÓN
    this.startSessionCheck();
  }

  ngOnDestroy(): void {
    // Limpiar suscripción al salir del componente
    if (this.sessionCheckSubscription) {
      this.sessionCheckSubscription.unsubscribe();
    }
  }

  // =========================================================
  // 🔄 VERIFICAR SESIÓN CADA 30 SEGUNDOS
  // =========================================================
  startSessionCheck(): void {
    this.sessionCheckSubscription = interval(30000).subscribe(() => {
      if (!this.authService.isAuthenticated()) {
        console.log('⚠️ Sesión inválida detectada');
        alert('Tu sesión ya no es válida. Serás redirigido al login.');
        this.authService.logout();
      }
    });
  }

  cargarDatosUsuario(): void {
    this.usuario = this.authService.getUserData();
    console.log('👤 Datos del usuario cargados:', this.usuario);

    if (!this.usuario || !this.usuario.correo) {
      console.error('❌ No se pudo obtener el correo del usuario');
      alert('Error al cargar tus datos. Por favor, inicia sesión nuevamente.');
      this.authService.logout();
    }
  }

  cambiarVista(vista: 'inicio' | 'seguridad'): void {
    this.vistaActual = vista;
  }

  // =========================================================
  // 🚪 LOGOUT - DETENER MONITOREO
  // =========================================================
  logout(): void {
    console.log('👋 Cerrando sesión...');
    
    // Detener monitoreo de inactividad antes de hacer logout
    this.inactivityService.stopMonitoring();
    console.log('🛑 Monitoreo de inactividad detenido');
    
    // Detener verificación de sesión
    if (this.sessionCheckSubscription) {
      this.sessionCheckSubscription.unsubscribe();
    }
    
    // Cerrar sesión
    this.authService.logout();
  }

  // =========================================================
  // 🔐 CONFIGURAR TOTP (Google Authenticator)
  // =========================================================
  configurar2FA(): void {
    if (!this.usuario?.correo) {
      alert('No se pudo obtener tu correo');
      return;
    }

    this.router.navigate(['/two-factor-setup'], {
      state: { 
        correo: this.usuario.correo,
        metodoPreseleccionado: 'TOTP',
        saltarSeleccion: true
      }
    });
  }

  // =========================================================
  // 📧 CONFIGURAR EMAIL 2FA (Gmail)
  // =========================================================
  configurarEmail2FA(): void {
    console.log('📧 Configurando Email 2FA...');

    if (!this.usuario?.correo) {
      console.error('❌ No hay correo disponible');
      alert('No se pudo obtener tu correo. Por favor, inicia sesión nuevamente.');
      this.authService.logout();
      return;
    }

    const correo = this.usuario.correo.trim();
    console.log('✅ Correo encontrado:', correo);

    // Ir a la configuración de Email 2FA
    this.router.navigate(['/setup-email-2fa']);
  }

  // =========================================================
  // 🔥 CERRAR OTRAS SESIONES
  // =========================================================
  cerrarOtrasSesiones(): void {
    const confirmacion = confirm(
      '¿Estás seguro de que deseas cerrar todas las demás sesiones?\n\n' +
      'Esto cerrará la sesión en todos tus otros dispositivos (móvil, tablet, otros navegadores).\n\n' +
      'Tu sesión actual permanecerá activa.'
    );

    if (!confirmacion) {
      return;
    }

    console.log('🔥 Cerrando otras sesiones...');

    this.authService.closeOtherSessions().subscribe({
      next: (response) => {
        console.log('✅ Respuesta:', response);
        
        const sesionesRevocadas = response.sessionsRevoked || 0;
        
        if (sesionesRevocadas > 0) {
          alert(
            `✅ Éxito!\n\n` +
            `Se cerraron ${sesionesRevocadas} sesión(es) en otros dispositivos.\n\n` +
            `Tu sesión actual sigue activa.`
          );
        } else {
          alert(
            '✅ No había otras sesiones activas.\n\n' +
            'Solo esta sesión está activa.'
          );
        }
      },
      error: (error) => {
        console.error('❌ Error al cerrar sesiones:', error);
        
        if (error.status === 401) {
          alert(
            '❌ Tu sesión ha expirado.\n\n' +
            'Por favor inicia sesión nuevamente.'
          );
          this.authService.logout();
        } else {
          alert(
            '❌ Error al cerrar sesiones.\n\n' +
            'Por favor intenta de nuevo.'
          );
        }
      }
    });
  }
}