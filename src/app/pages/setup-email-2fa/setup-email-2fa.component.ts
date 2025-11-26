import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-setup-email-2fa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './setup-email-2fa.component.html',
  styleUrls: ['./setup-email-2fa.component.css']
})
export class SetupEmail2FAComponent implements OnInit {
  correo: string = '';
  correoEnmascarado: string = ''; // ✅ NUEVO: Para mostrar en UI
  codigo: string = '';
  paso: number = 1;
  mensaje: string = '';
  isError: boolean = false;
  cargando: boolean = false;

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ Obtener correo del localStorage directamente
    this.correo = localStorage.getItem('userEmail') || '';
    
    console.log('📧 Correo obtenido:', this.correo); // Debug

    if (!this.correo) {
      console.error('❌ No se encontró el correo en localStorage');
      alert('No se pudo obtener tu correo. Por favor, inicia sesión nuevamente.');
      this.router.navigate(['/login']);
      return;
    }

    // ✅ Enmascarar email para mostrar en UI
    this.correoEnmascarado = this.maskEmail(this.correo);
  }

  // ✅ FUNCIÓN PARA ENMASCARAR EMAIL
  private maskEmail(email: string): string {
    if (!email) return 'correo oculto';
    
    const [localPart, domain] = email.split('@');
    
    if (!domain) return '***@***';
    
    const maskedLocal = localPart.length > 4
      ? localPart.substring(0, 2) + '***' + localPart.substring(localPart.length - 3)
      : '***';
    
    const domainParts = domain.split('.');
    const maskedDomain = domainParts.length > 1
      ? domainParts[0].substring(0, 1) + '***.' + domainParts.slice(1).join('.')
      : '***';
    
    return `${maskedLocal}@${maskedDomain}`;
  }

  // PASO 1: Enviar código de configuración
  enviarCodigoConfiguracion(): void {
    this.cargando = true;
    this.mensaje = '';

    console.log('📤 Enviando solicitud con correo:', this.correo); // Debug

    this.http.post(`${this.apiUrl}/gmail-2fa/configurar`, { 
      correo: this.correo 
    }).subscribe({
      next: (response: any) => {
        console.log('✅ Respuesta del servidor:', response);
        
        // Usar el email enmascarado de la respuesta si está disponible
        if (response.email) {
          this.correoEnmascarado = response.email;
        }
        
        this.showMessage('✅ Código enviado a tu correo', false);
        this.paso = 2;
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al enviar código:', error);
        
        const errorMsg = error.error?.message || 'Error al enviar el código';
        this.showMessage(`❌ ${errorMsg}`, true);
        this.cargando = false;
      }
    });
  }

  // PASO 2: Verificar código y activar Email 2FA
  verificarYActivar(): void {
    if (!this.codigo || this.codigo.trim().length === 0) {
      this.showMessage('Por favor ingresa el código', true);
      return;
    }

    this.cargando = true;

    this.http.post(`${this.apiUrl}/gmail-2fa/verificar`, {
      correo: this.correo,
      codigo: this.codigo.trim()
    }).subscribe({
      next: (response: any) => {
        console.log('✅ Email 2FA activado:', response);
        this.showMessage('✅ Email 2FA activado correctamente', false);
        this.cargando = false;

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Error al verificar código:', error);
        
        const errorMsg = error.error?.message || 'Código inválido';
        this.showMessage(`❌ ${errorMsg}`, true);
        this.cargando = false;
        this.codigo = '';
      }
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  private showMessage(msg: string, isError: boolean): void {
    this.mensaje = msg;
    this.isError = isError;
  }
}