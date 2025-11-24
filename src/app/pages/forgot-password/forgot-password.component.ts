import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RecoveryService } from '../../services/recovery.service';

// ✅ AGREGAR ESTA INTERFAZ
interface RecoveryResponse {
  message: string;
  attemptsRemaining?: number;
  warning?: string;
}

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  warningMessage = '';
  attemptsRemaining: number | null = null;

  constructor(
    private fb: FormBuilder,
    private recoveryService: RecoveryService,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.warningMessage = '';

    const correo = this.forgotForm.value.correo;

    // ✅ TIPAR LA RESPUESTA
    this.recoveryService.requestRecoveryCode(correo).subscribe({
      next: (response: RecoveryResponse) => {  // ← AGREGAR TIPO AQUÍ
        this.isLoading = false;
        this.successMessage = response.message;
        
        if (response.attemptsRemaining !== undefined) {
          this.attemptsRemaining = response.attemptsRemaining;
          console.log(`⚠️ Intentos restantes: ${this.attemptsRemaining}`);
        }

        if (response.warning) {
          this.warningMessage = response.warning;
        }

        localStorage.setItem('recovery_email', correo);

        setTimeout(() => {
          this.router.navigate(['/verify-recovery-code']);
        }, 2000);
      },
      error: (error: any) => {  // ← TAMBIÉN PUEDES TIPAR EL ERROR
        this.isLoading = false;
        
        if (error.status === 429) {
          const data = error.error;
          
          if (data?.blocked) {
            this.errorMessage = data.message;
            
            if (data?.minutesRemaining) {
              console.log(`🔒 Bloqueado por ${data.minutesRemaining} minutos`);
            }
          }
        } else {
          this.errorMessage = error.error?.message || 'Error al enviar el código. Intenta de nuevo.';
        }
      }
    });
  }

  get correo() {
    return this.forgotForm.get('correo');
  }
}