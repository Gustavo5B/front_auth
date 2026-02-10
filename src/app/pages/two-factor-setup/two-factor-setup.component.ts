import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TwoFactorService } from '../../services/two-factor.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-two-factor-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './two-factor-setup.component.html',
  styleUrls: ['./two-factor-setup.component.css']
})
export class TwoFactorSetupComponent implements OnInit {
  paso: number = 1;
  metodoSeleccionado: string = 'TOTP';
  qrCodeUrl: string = '';
  secreto: string = '';
  codigoVerificacion: string = '';
  mensaje: string = '';
  isError: boolean = false;
  correo: string = '';
  cargando: boolean = false;

  constructor(
    private twoFactorService: TwoFactorService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ OBTENER CORREO DE LOCALSTORAGE DIRECTAMENTE
    this.correo = localStorage.getItem('userEmail') || '';
    
    console.log('📧 Correo obtenido para 2FA:', this.correo); // Debug
    
    // ✅ VALIDAR QUE EL CORREO SEA VÁLIDO
    if (!this.correo || this.correo === '1' || !this.correo.includes('@')) {
      console.error('❌ Correo inválido:', this.correo);
      this.showMessage('No se pudo obtener el correo. Inicia sesión nuevamente.', true);
      setTimeout(() => this.router.navigate(['/login']), 2000);
      return;
    }
    
    this.cargarQR();
  }

  cargarQR(): void {
    this.cargando = true;
    console.log('🔄 Cargando QR para:', this.correo); // Debug
    
    this.twoFactorService.setupTOTP(this.correo).subscribe({
      next: (response) => {
        this.qrCodeUrl = response.qrCode;
        this.secreto = response.secret;
        this.cargando = false;
        console.log('✅ QR generado correctamente');
      },
      error: (error) => {
        this.showMessage('Error al generar el código QR', true);
        this.cargando = false;
        console.error('❌ Error al cargar QR:', error);
      }
    });
  }

  irAVerificacion(): void {
    if (!this.qrCodeUrl || !this.secreto) {
      this.showMessage('Primero debes escanear el código QR', true);
      return;
    }
    this.paso = 2;
    this.mensaje = '';
  }

  verificarCodigo(): void {
    if (!this.codigoVerificacion || this.codigoVerificacion.length !== 6) {
      this.showMessage('El código debe tener exactamente 6 dígitos', true);
      return;
    }

    console.log('🔍 Verificando código para:', this.correo); // Debug
    
    this.cargando = true;
    this.twoFactorService.verifyTOTP(this.correo, this.codigoVerificacion).subscribe({
      next: (response) => {
        this.showMessage('✅ Autenticación de dos factores activada correctamente', false);
        this.cargando = false;
        
        localStorage.setItem('2faEnabled', 'true');
        
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        this.showMessage('❌ Código incorrecto. Verifica el código en tu aplicación', true);
        this.cargando = false;
        this.codigoVerificacion = '';
        console.error('❌ Error al verificar código:', error);
      }
    });
  }

  validarSoloNumeros(event: any): void {
    event.target.value = event.target.value.replace(/[^0-9]/g, '');
    this.codigoVerificacion = event.target.value;
    
    if (this.codigoVerificacion.length === 6) {
      this.mensaje = '';
    }
  }

  copiarSecreto(): void {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(this.secreto).then(() => {
        this.showMessage('✅ Código copiado al portapapeles', false);
        setTimeout(() => {
          if (this.mensaje === '✅ Código copiado al portapapeles') {
            this.mensaje = '';
          }
        }, 2000);
      }).catch(() => {
        this.fallbackCopy();
      });
    } else {
      this.fallbackCopy();
    }
  }

  private fallbackCopy(): void {
    const textArea = document.createElement('textarea');
    textArea.value = this.secreto;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      this.showMessage('✅ Código copiado', false);
      setTimeout(() => this.mensaje = '', 2000);
    } catch (err) {
      this.showMessage('❌ Error al copiar', true);
    }
    document.body.removeChild(textArea);
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  volverAlQR(): void {
    this.paso = 1;
    this.codigoVerificacion = '';
    this.mensaje = '';
  }

  private showMessage(msg: string, isError: boolean): void {
    this.mensaje = msg;
    this.isError = isError;
  }
}