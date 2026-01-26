import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-error-404',
  templateUrl: './error-404.component.html',
  styleUrls: ['./error-404.component.css']
})
export class Error404Component {

  constructor(
    private router: Router,
    private location: Location
  ) {}

  /**
   * Navegar a la página de inicio
   */
  goHome(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Regresar a la página anterior
   */
  goBack(): void {
    this.location.back();
  }
}