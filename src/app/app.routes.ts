import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TwoFactorSetupComponent } from './pages/two-factor-setup/two-factor-setup.component';
import { TwoFactorVerifyComponent } from './pages/two-factor-verify/two-factor-verify.component';
import { VerifyEmailComponent } from './pages/verify-email/verify-email.component';

export const routes: Routes = [
  // ============================================
  // RUTAS PRINCIPALES
  // ============================================
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-email', component: VerifyEmailComponent }, // ← NUEVA RUTA
  { path: 'dashboard', component: DashboardComponent },

  // ============================================
  // AUTENTICACIÓN 2FA (TOTP)
  // ============================================
  { 
    path: 'two-factor-setup', 
    component: TwoFactorSetupComponent 
  },
  { 
    path: 'two-factor-verify', 
    component: TwoFactorVerifyComponent 
  },

  // ============================================
  // AUTENTICACIÓN 2FA (EMAIL)
  // ============================================
  {
    path: 'setup-email-2fa',
    loadComponent: () => import('./pages/setup-email-2fa/setup-email-2fa.component')
      .then(m => m.SetupEmail2FAComponent)
  },
  {
    path: 'verify-email-code',
    loadComponent: () => import('./pages/verify-email-code/verify-email-code.component')
      .then(m => m.VerifyEmailCodeComponent)
  },

  // ============================================
  // RECUPERACIÓN DE CONTRASEÑA
  // ============================================
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password.component')
      .then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'verify-recovery-code',
    loadComponent: () => import('./pages/verify-recovery-code/verify-recovery-code.component')
      .then(m => m.VerifyRecoveryCodeComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/reset-password/reset-password.component')
      .then(m => m.ResetPasswordComponent)
  },

  // ============================================
  // RUTA FALLBACK
  // ============================================
  { path: '**', redirectTo: '/login' }
];