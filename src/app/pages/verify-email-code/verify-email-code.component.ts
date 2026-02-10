import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email-code',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify-email-code.component.html',
  styleUrls: ['./verify-email-code.component.css']
})
export class VerifyEmailCodeComponent implements OnInit, OnDestroy {
  correo: string = '';
  codigo: string = '';
  mensaje: string = '';
  isError: boolean = false;
  tiempoRestante: number = 900;
  intervalo: any;
  cargando: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('📧 Iniciando verificación de Email 2FA...');
    
    // ✅ MÉTODO MEJORADO: Obtener correo con validación
    const state = history.state;
    const storedEmail = localStorage.getItem('temp_correo_2fa');
    const userEmail = localStorage.getItem('userEmail'); // ← CORRECCIÓN CLAVE
    
    // 🔹 Prioridad: state → temp_correo_2fa → userEmail
    this.correo = state?.correo || storedEmail || userEmail || '';
    
    console.log('📧 Correo obtenido para verificación:', this.correo);
    
    // ✅ VALIDACIÓN MEJORADA
    if (!this.correo || this.correo === '1' || !this.correo.includes('@')) {
      console.error('❌ Correo inválido:', this.correo);
      console.warn('⚠️ Redirigiendo al login...');
      this.showMessage('Error al obtener el correo. Por favor inicia sesión nuevamente.', true);
      setTimeout(() => this.router.navigate(['/login']), 2000);
      return;
    }
    
    console.log('✅ Correo validado correctamente');
    
    // Inicia temporizador y envía el código automáticamente
    this.iniciarTemporizador();
    this.enviarCodigoInicial();
  }

  ngOnDestroy(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  enviarCodigoInicial(): void {
    console.log('📤 Enviando código inicial a:', this.correo);
    
    this.authService.resendLoginCode(this.correo).subscribe({
      next: () => {
        console.log('📨 Código enviado correctamente a', this.correo);
        this.showMessage('📧 Código enviado a tu correo', false);
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (err) => {
        console.error('❌ Error enviando código:', err);
        this.showMessage('Error al enviar el código', true);
      }
    });
  }

  iniciarTemporizador(): void {
    this.intervalo = setInterval(() => {
      if (this.tiempoRestante > 0) {
        this.tiempoRestante--;
      } else {
        clearInterval(this.intervalo);
        this.showMessage('⏰ El código ha expirado. Solicita uno nuevo.', true);
      }
    }, 1000);
  }

  get tiempoFormateado(): string {
    const min = Math.floor(this.tiempoRestante / 60);
    const seg = this.tiempoRestante % 60;
    return `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
  }

  verificarCodigo(): void {
    if (!this.codigo || this.codigo.trim().length === 0) {
      this.showMessage('Por favor ingresa el código recibido', true);
      return;
    }

    console.log('🔍 Verificando código para:', this.correo);
    
    this.cargando = true;
    this.authService.verifyLoginCode({ 
      correo: this.correo, 
      codigo: this.codigo.trim() 
    }).subscribe({
      next: (res) => {
        console.log('✅ Verificación exitosa:', res);
        localStorage.removeItem('temp_correo_2fa');

        // ✅ GUARDADO COMPLETO DE DATOS
        if (res.token || res.access_token) {
          const token = res.token || res.access_token;
          this.authService.saveToken(token);
          localStorage.setItem('access_token', token);
          localStorage.setItem('token', token);
        }
        
        if (res.usuario) {
          this.authService.saveUserData(res.usuario);
          localStorage.setItem('userEmail', res.usuario.correo);
          localStorage.setItem('userName', res.usuario.nombre);
          localStorage.setItem('userId', res.usuario.id.toString());
        }
        
        localStorage.setItem('isLoggedIn', 'true');

        this.showMessage('✅ Código verificado correctamente', false);
        this.cargando = false;

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (err) => {
        console.error('❌ Error en verificación:', err);
        const msg = err.error?.message || 'Código inválido o expirado';
        this.showMessage(msg, true);
        this.cargando = false;
        this.codigo = '';
      }
    });
  }

  reenviarCodigo(): void {
    if (this.cargando) return;

    console.log('🔄 Reenviando código a:', this.correo);
    
    this.cargando = true;
    this.showMessage('Reenviando código...', false);
    
    this.authService.resendLoginCode(this.correo).subscribe({
      next: () => {
        console.log('✅ Código reenviado correctamente');
        this.showMessage('✅ Nuevo código enviado a tu correo', false);
        this.tiempoRestante = 900;
        this.cargando = false;
        this.codigo = '';
        
        setTimeout(() => {
          if (this.mensaje === '✅ Nuevo código enviado a tu correo') {
            this.mensaje = '';
          }
        }, 3000);
      },
      error: (err) => {
        console.error('❌ Error al reenviar:', err);
        this.showMessage('❌ No se pudo reenviar el código', true);
        this.cargando = false;
      }
    });
  }

  volver(): void {
    localStorage.removeItem('temp_correo_2fa');
    this.router.navigate(['/login']);
  }

  private showMessage(msg: string, isError: boolean): void {
    this.mensaje = msg;
    this.isError = isError;
  }
}