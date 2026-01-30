import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { InactivityService } from '../../services/inactivity.service';
import { ObrasService } from '../../services/obras.service';
import { CategoriasService } from '../../services/categorias.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { interval, Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule,BreadcrumbsComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  usuario: any = null;
  tiene2FA: boolean = false;
  vistaActual: 'inicio' | 'seguridad' = 'inicio';
  mostrarModalQR: boolean = false;
  private sessionCheckSubscription?: Subscription;

  // =========================================================
  // 🎨 DATOS DEL CATÁLOGO
  // =========================================================
  obras: any[] = [];
  obrasDestacadas: any[] = [];
  categorias: any[] = [];
  obraDestacadaPrincipal: any = null;
  
  // Filtros
  terminoBusqueda: string = '';
  categoriaSeleccionada: number | null = null;
  precioMin: number | null = null;
  precioMax: number | null = null;
  
  // Paginación
  paginaActual: number = 1;
  totalPaginas: number = 1;
  totalObras: number = 0;
  
  // Estado de carga
  cargandoObras: boolean = false;
  errorCarga: string | null = null;

  constructor(
    public authService: AuthService,
    private router: Router,
    private inactivityService: InactivityService,
    private obrasService: ObrasService,
    private categoriasService: CategoriasService,
    public breadcrumbService: BreadcrumbService
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
    
    // ✅ CARGAR DATOS DEL CATÁLOGO
    this.cargarCategorias();
    this.cargarObrasDestacadas();
    this.cargarObras();
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
  // 📂 CARGAR CATEGORÍAS
  // =========================================================
  cargarCategorias(): void {
    this.categoriasService.listarCategorias().subscribe({
      next: (response) => {
        if (response.success) {
          this.categorias = response.data;
          console.log('✅ Categorías cargadas:', this.categorias);
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar categorías:', error);
      }
    });
  }

  // =========================================================
  // 🌟 CARGAR OBRAS DESTACADAS
  // =========================================================
  cargarObrasDestacadas(): void {
    this.obrasService.obtenerObrasDestacadas().subscribe({
      next: (response) => {
        if (response.success) {
          this.obrasDestacadas = response.data;
          
          // Primera obra destacada es la principal
          if (this.obrasDestacadas.length > 0) {
            this.obraDestacadaPrincipal = this.obrasDestacadas[0];
          }
          
          console.log('✅ Obras destacadas cargadas:', this.obrasDestacadas);
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar obras destacadas:', error);
      }
    });
  }

  // =========================================================
  // 📚 CARGAR OBRAS (CON FILTROS)
  // =========================================================
  cargarObras(): void {
    this.cargandoObras = true;
    this.errorCarga = null;

    const filtros: any = {
      page: this.paginaActual,
      limit: 12
    };

    if (this.categoriaSeleccionada) {
      filtros.categoria = this.categoriaSeleccionada;
    }
    if (this.precioMin) {
      filtros.precio_min = this.precioMin;
    }
    if (this.precioMax) {
      filtros.precio_max = this.precioMax;
    }

    this.obrasService.listarObras(filtros).subscribe({
      next: (response) => {
        if (response.success) {
          this.obras = response.data;
          this.totalObras = response.pagination.total;
          this.totalPaginas = response.pagination.totalPages;
          this.paginaActual = response.pagination.page;
          
          console.log('✅ Obras cargadas:', this.obras);
          console.log('📊 Paginación:', response.pagination);
        }
        this.cargandoObras = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar obras:', error);
        this.errorCarga = 'No se pudieron cargar las obras. Intenta de nuevo.';
        this.cargandoObras = false;
      }
    });
  }

  // =========================================================
  // 🔍 BUSCAR OBRAS
  // =========================================================
  buscarObras(): void {
    if (!this.terminoBusqueda || this.terminoBusqueda.trim().length < 2) {
      alert('Por favor ingresa al menos 2 caracteres para buscar');
      return;
    }

    this.cargandoObras = true;

    this.obrasService.buscarObras(this.terminoBusqueda.trim(), this.paginaActual).subscribe({
      next: (response) => {
        if (response.success) {
          this.obras = response.data;
          this.totalObras = response.search.total;
          this.totalPaginas = response.pagination.totalPages;
          
          console.log(`✅ Búsqueda: "${this.terminoBusqueda}" - ${this.totalObras} resultados`);
        }
        this.cargandoObras = false;
      },
      error: (error) => {
        console.error('❌ Error en búsqueda:', error);
        this.errorCarga = 'Error al buscar obras';
        this.cargandoObras = false;
      }
    });
  }

  // =========================================================
  // 📂 FILTRAR POR CATEGORÍA
  // =========================================================
  filtrarPorCategoria(idCategoria: number | null): void {
    this.categoriaSeleccionada = idCategoria;
    this.paginaActual = 1;
    this.cargarObras();
  }

  // =========================================================
  // 💰 FILTRAR POR RANGO DE PRECIO
  // =========================================================
  filtrarPorPrecio(evento: any): void {
    const rango = evento.target.value;
    
    if (!rango) {
      this.precioMin = null;
      this.precioMax = null;
    } else if (rango === '0-1000') {
      this.precioMin = 0;
      this.precioMax = 1000;
    } else if (rango === '1000-3000') {
      this.precioMin = 1000;
      this.precioMax = 3000;
    } else if (rango === '3000+') {
      this.precioMin = 3000;
      this.precioMax = null;
    }
    
    this.paginaActual = 1;
    this.cargarObras();
  }

  // =========================================================
  // 📄 CAMBIAR PÁGINA
  // =========================================================
  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.cargarObras();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // =========================================================
  // 🛒 AGREGAR AL CARRITO
  // =========================================================
  agregarAlCarrito(obra: any): void {
    console.log('🛒 Agregando al carrito:', obra);
    alert(`"${obra.titulo}" agregado al carrito`);
    // TODO: Implementar lógica real del carrito
  }

  // =========================================================
  // ❤️ AGREGAR A FAVORITOS
  // =========================================================
  agregarAFavoritos(obra: any): void {
    console.log('❤️ Agregando a favoritos:', obra);
    alert(`"${obra.titulo}" agregado a favoritos`);
    // TODO: Implementar lógica real de favoritos
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
    console.log('🛒 Iniciando proceso de compra...');
    
    const confirmar = confirm(
      '🛒 Confirmar Compra\n\n' +
      `Producto: ${this.obraDestacadaPrincipal?.titulo || 'Producto'}\n` +
      `Precio: $${this.obraDestacadaPrincipal?.precio_minimo || 0} MXN\n\n` +
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

  // =========================================================
  // 🧪 MÉTODO TEMPORAL PARA PROBAR PÁGINAS DE ERROR
  // =========================================================
  testError(code: number): void {
    this.router.navigate([`/${code}`]);
  }
}