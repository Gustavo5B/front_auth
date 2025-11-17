import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LegalModalComponent } from './legal-modal/legal-modal.component'; // ✅ IMPORTAR

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    LegalModalComponent  // ✅ AGREGAR
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'front_auth';
}