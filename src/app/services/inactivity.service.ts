import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private inactivityTimeout: any;
  private readonly INACTIVITY_TIME = 1 * 60 * 1000; // 15 minutos en milisegundos
  private isMonitoring = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // =========================================================
  // 🚀 INICIAR MONITOREO DE INACTIVIDAD
  // =========================================================
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log('👁️ Monitoreo de inactividad iniciado (15 minutos)');

    // Eventos que indican actividad del usuario
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach(event => {
      document.addEventListener(event, () => this.resetTimer(), true);
    });

    this.resetTimer();
  }

  // =========================================================
  // 🔄 RESETEAR TEMPORIZADOR
  // =========================================================
  private resetTimer(): void {
    // Limpiar el timeout anterior
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }

    // Crear nuevo timeout
    this.inactivityTimeout = setTimeout(() => {
      this.handleInactivity();
    }, this.INACTIVITY_TIME);
  }

  // =========================================================
  // 🚪 MANEJAR INACTIVIDAD (CERRAR SESIÓN)
  // =========================================================
  private handleInactivity(): void {
    console.log('⏰ Sesión expirada por inactividad (15 minutos)');
    
    // ✅ Detener monitoreo ANTES de hacer logout
    this.stopMonitoring();
    
    // Mostrar alerta al usuario
    alert('🔒 Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.');
    
    // Cerrar sesión
    this.authService.logout();
  }

  // =========================================================
  // 🛑 DETENER MONITOREO
  // =========================================================
  stopMonitoring(): void {
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }
    this.isMonitoring = false;
    console.log('🛑 Monitoreo de inactividad detenido');
  }
}