import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error-403',
  templateUrl: './error-403.component.html',
  styleUrls: ['./error-403.component.css']
})
export class Error403Component {

  constructor(private router: Router) {}

  /**
   * Redirigir al login
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Navegar a la página de inicio
   */
  goHome(): void {
    this.router.navigate(['/dashboard']);
  }
}