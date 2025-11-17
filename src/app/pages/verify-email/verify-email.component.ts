import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  email: string = '';
  codigo: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  isResending: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Obtener email de query params
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      
      if (!this.email) {
        this.router.navigate(['/register']);
      }
    });
  }

  onVerify(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.codigo.length !== 6) {
      this.errorMessage = 'El código debe tener 6 dígitos';
      return;
    }

    this.isLoading = true;

    this.authService.verifyEmail(this.email, this.codigo).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('✅ Verificación exitosa:', response);
        this.successMessage = '✅ Cuenta verificada exitosamente. Redirigiendo al login...';
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Error en verificación:', error);
        
        if (error.status === 401) {
          this.errorMessage = 'Código incorrecto o expirado';
        } else {
          this.errorMessage = error.error?.message || 'Error al verificar código';
        }
      }
    });
  }

  onResendCode(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isResending = true;

    this.authService.resendVerificationCode(this.email).subscribe({
      next: (response) => {
        this.isResending = false;
        this.successMessage = '📧 Código reenviado exitosamente';
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.isResending = false;
        console.error('❌ Error al reenviar:', error);
        this.errorMessage = error.error?.message || 'Error al reenviar código';
      }
    });
  }
}