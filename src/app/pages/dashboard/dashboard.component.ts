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
  mostrarModalQR: boolean = false;
  private sessionCheckSubscription?: Subscription;

  constructor(
    public authService: AuthService,
    private router: Router,
    private inactivityService: InactivityService
  ) { }

  ngOnInit(): void {
    console.log('🔍 Verificando autenticación...');
    
    if (!this.authService.isAuthenticated()) {
      console.log('❌ Usuario no autenticado, redirigiendo...');
      this.router.navigate(['/login']);
      return;
    }

    this.inactivityService.startMonitoring();
    console.log('✅ Monitoreo de inactividad verificado en dashboard');

    this.cargarDatosUsuario();
    this.startSessionCheck();
  }

  ngOnDestroy(): void {
    if (this.sessionCheckSubscription) {
      this.sessionCheckSubscription.unsubscribe();
    }
  }

  // =========================================================
  // 🔄 VERIFICAR SESIÓN CADA 30 SEGUNDOS CON BACKEND
  // =========================================================
  startSessionCheck(): void {
    this.sessionCheckSubscription = interval(30000).subscribe(() => {
      console.log('🔍 Verificando sesión con el backend...');
      
      this.authService.checkSession().subscribe({
        next: (response) => {
          console.log('✅ Sesión válida:', response);
        },
        error: (error) => {
          console.error('❌ Sesión inválida:', error);
          
          if (error.status === 401) {
            const errorCode = error.error?.code;
            
            if (errorCode === 'SESSION_REVOKED') {
              alert('🔒 Tu sesión fue cerrada desde otro dispositivo.\n\nPor favor inicia sesión nuevamente.');
            } else if (errorCode === 'TOKEN_EXPIRED') {
              alert('⏰ Tu sesión ha expirado.\n\nPor favor inicia sesión nuevamente.');
            } else {
              alert('Tu sesión ya no es válida. Serás redirigido al login.');
            }
            
            this.authService.logout();
          }
        }
      });
    });
  }

  // =========================================================
  // 👤 CARGAR DATOS DEL USUARIO
  // =========================================================
  cargarDatosUsuario(): void {
    this.usuario = this.authService.getUserData();
    console.log('👤 Datos del usuario cargados:', this.usuario);

    if (!this.usuario || !this.usuario.correo) {
      console.error('❌ No se pudo obtener el correo del usuario');
      alert('Error al cargar tus datos. Por favor, inicia sesión nuevamente.');
      this.authService.logout();
    }
  }

  // =========================================================
  // 🔀 CAMBIAR VISTA
  // =========================================================
  cambiarVista(vista: 'inicio' | 'seguridad'): void {
    this.vistaActual = vista;
  }

  // =========================================================
  // 🚪 LOGOUT - DETENER MONITOREO
  // =========================================================
  logout(): void {
    console.log('👋 Cerrando sesión...');
    
    this.inactivityService.stopMonitoring();
    console.log('🛑 Monitoreo de inactividad detenido');
    
    if (this.sessionCheckSubscription) {
      this.sessionCheckSubscription.unsubscribe();
    }
    
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

  // =========================================================
  // 🛒 COMPRAR PRODUCTO DESTACADO
  // =========================================================
  comprarProducto(): void {
  console.log('🛒 Iniciando proceso de compra de la olla...');
  
  const confirmar = confirm(
    '🛒 Confirmar Compra\n\n' +
    'Producto: Olla de Barro Huasteca\n' +
    'Precio: $650.00 MXN\n\n' +
    '¿Deseas proceder con la compra?'
  );

  if (confirmar) {
    alert(
      '✅ ¡Gracias por tu compra!\n\n' +
      'Tu pedido ha sido registrado.\n' +
      'Recibirás un correo con los detalles del envío.\n\n' +
      'Número de orden: #NUB-' + Math.floor(Math.random() * 100000)
    );
  }
}

  // =========================================================
  // 📱 MOSTRAR MODAL QR PARA VER EN 3D
  // =========================================================
  mostrarQR(): void {
    console.log('📱 Mostrando código QR para vista 3D...');
    this.mostrarModalQR = true;
    document.body.style.overflow = 'hidden';
  }

  // =========================================================
  // ❌ CERRAR MODAL QR
  // =========================================================
  cerrarModalQR(): void {
    console.log('❌ Cerrando modal QR...');
    this.mostrarModalQR = false;
    document.body.style.overflow = 'auto';
  }
}