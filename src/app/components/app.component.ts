import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LegalModalComponent } from './legal-modal/legal-modal.component';
import { InactivityService } from '../services/inactivity.service'; // ✅ IMPORTAR
import { AuthService } from '../services/auth.service'; // ✅ IMPORTAR

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    LegalModalComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'front_auth';

  constructor(
    private inactivityService: InactivityService, // ✅ INYECTAR
    private authService: AuthService // ✅ INYECTAR
  ) {}

  ngOnInit(): void {
    // ✅ Iniciar monitoreo solo si el usuario está logueado
    if (this.authService.isAuthenticated()) {
      this.inactivityService.startMonitoring();
      console.log('✅ Monitoreo de sesión iniciado (15 min de inactividad)');
    }
  }
}