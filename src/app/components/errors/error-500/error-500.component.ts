import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error-500',
  templateUrl: './error-500.component.html',
  styleUrls: ['./error-500.component.css']
})
export class Error500Component implements OnInit {
  errorCode: string = '';
  errorTime: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Generar código de error único
    this.errorCode = `ERR-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    // Obtener hora actual
    const now = new Date();
    this.errorTime = now.toLocaleString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Recargar la página actual
   */
  reloadPage(): void {
    window.location.reload();
  }

  /**
   * Navegar a la página de inicio
   */
  goHome(): void {
    this.router.navigate(['/dashboard']);
  }
}