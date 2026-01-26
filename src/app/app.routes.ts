import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TwoFactorSetupComponent } from './pages/two-factor-setup/two-factor-setup.component';
import { TwoFactorVerifyComponent } from './pages/two-factor-verify/two-factor-verify.component';
import { VerifyEmailComponent } from './pages/verify-email/verify-email.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';

// ✅ IMPORTAR COMPONENTES DE ERROR
import { Error404Component } from './components/errors/error-404/error-404.component';
import { Error500Component } from './components/errors/error-500/error-500.component';
import { Error403Component } from './components/errors/error-403/error-403.component';

export const routes: Routes = [
  // ============================================
  // RUTAS PRINCIPALES
  // ============================================
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'dashboard', component: DashboardComponent },
   { path: 'about-us', component: AboutUsComponent },  // ← AGREGAR
  { path: 'sobre-nosotros', redirectTo: '/about-us' }, // ← Opcional: alias en español
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
  // ✅ PÁGINAS DE ERROR (SIN AUTENTICACIÓN)
  // ============================================
  { path: '404', component: Error404Component },
  { path: '403', component: Error403Component },
  { path: '500', component: Error500Component },

  // ============================================
  // RUTA FALLBACK (DEBE IR AL FINAL)
  // ============================================
  { path: '**', redirectTo: '/404' }
];