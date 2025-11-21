import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  sub?: string;
  email?: string;
  correo?: string;
  id_usuario?: number;
  metodo_gmail_2fa?: boolean;
  exp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private twoFactorApiUrl = `${environment.apiUrl}/2fa`;
  private gmail2faApiUrl = `${environment.apiUrl}/gmail2fa`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    console.log('🌐 AuthService usando:', environment.apiUrl);
  }

  // =========================================================
  // 📝 REGISTER
  // =========================================================
  register(nombre: string, correo: string, contrasena: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { nombre, correo, contrasena, aceptoTerminos: true });
  }

  // =========================================================
  // ✉️ VERIFICAR EMAIL CON CÓDIGO
  // =========================================================
  verifyEmail(correo: string, codigo: string): Observable<any> {
    console.log('✉️ Verificando email:', correo);
    return this.http.post(`${this.apiUrl}/verify-email`, { correo, codigo });
  }

  // =========================================================
  // 🔄 REENVIAR CÓDIGO DE VERIFICACIÓN
  // =========================================================
  resendVerificationCode(correo: string): Observable<any> {
    console.log('🔄 Reenviando código de verificación a:', correo);
    return this.http.post(`${this.apiUrl}/resend-code`, { correo });
  }

  // =========================================================
  // 💾 GUARDAR EMAIL TEMPORAL (para verificación)
  // =========================================================
  saveTempEmail(correo: string): void {
    localStorage.setItem('temp_email_verification', correo);
  }

  // =========================================================
  // 📧 OBTENER EMAIL TEMPORAL
  // =========================================================
  getTempEmail(): string | null {
    return localStorage.getItem('temp_email_verification');
  }

  // =========================================================
  // 🗑️ LIMPIAR EMAIL TEMPORAL
  // =========================================================
  clearTempEmail(): void {
    localStorage.removeItem('temp_email_verification');
  }

  // =========================================================
  // 🔐 LOGIN
  // =========================================================
  login(correo: string, contrasena: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { correo, contrasena }).pipe(
      tap((response: any) => {
        console.log('📥 Respuesta del login:', response);
        
        // Guardar token (priorizar access_token, pero soportar token legacy)
        if (response.access_token) {
          this.saveToken(response.access_token);
          console.log('✅ Token guardado (access_token)');
        } else if (response.token) {
          this.saveToken(response.token);
          console.log('✅ Token guardado (token legacy)');
        }

        // Guardar datos del usuario si vienen en la respuesta
        if (response.usuario) {
          this.saveUserData(response.usuario);
        }
      })
    );
  }

  // =========================================================
  // 🔐 LOGIN CON 2FA (TOTP)
  // =========================================================
  loginWith2FA(correo: string, codigo2fa: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login-2fa`, { correo, codigo2fa }).pipe(
      tap((response: any) => {
        console.log('📥 Respuesta login-2fa:', response);
        
        if (response.access_token) {
          this.saveToken(response.access_token);
        } else if (response.token) {
          this.saveToken(response.token);
        }

        if (response.usuario) {
          this.saveUserData(response.usuario);
        }
      })
    );
  }

  // =========================================================
  // ✅ VERIFICAR CÓDIGO DE GMAIL-2FA
  // =========================================================
  verifyLoginCode(data: { correo: string; codigo: string }): Observable<any> {
    return this.http.post(`${this.gmail2faApiUrl}/verificar-codigo-login`, data).pipe(
      tap((response: any) => {
        console.log('📥 Respuesta verify-login-code:', response);
        
        if (response.access_token) {
          this.saveToken(response.access_token);
        } else if (response.token) {
          this.saveToken(response.token);
        }

        if (response.usuario) {
          this.saveUserData(response.usuario);
        }
      })
    );
  }

  // =========================================================
  // 📧 REENVIAR CÓDIGO GMAIL-2FA
  // =========================================================
  resendLoginCode(correo: string): Observable<any> {
    return this.http.post(`${this.gmail2faApiUrl}/enviar-codigo-login`, { correo });
  }

  // =========================================================
  // 📧 ENVIAR CÓDIGO DE EMAIL DURANTE LOGIN
  // =========================================================
  sendEmailCode(correo: string): Observable<any> {
    console.log('📧 Enviando código EMAIL a:', correo);
    return this.http.post(`${this.twoFactorApiUrl}/send-login-code`, { correo });
  }

  // =========================================================
  // 🔐 CONFIGURAR TOTP
  // =========================================================
  setupTOTP(correo: string): Observable<any> {
    console.log('🔐 Configurando TOTP para:', correo);
    console.log('🔗 URL:', `${this.twoFactorApiUrl}/setup-totp`);
    return this.http.post(`${this.twoFactorApiUrl}/setup-totp`, { correo });
  }

  // =========================================================
  // ✅ VERIFICAR TOTP
  // =========================================================
  verifyTOTP(correo: string, token: string): Observable<any> {
    return this.http.post(`${this.twoFactorApiUrl}/verify-totp`, { correo, token });
  }

  // =========================================================
  // ✅ VALIDAR TOTP
  // =========================================================
  validateTOTP(correo: string, token: string): Observable<any> {
    return this.http.post(`${this.twoFactorApiUrl}/validate-totp`, { correo, token });
  }

  // =========================================================
  // 💾 GUARDAR TOKEN
  // =========================================================
  saveToken(token: string): void {
    localStorage.setItem('access_token', token);
    console.log('💾 Token guardado en localStorage');
  }

  // =========================================================
  // 🔑 OBTENER TOKEN
  // =========================================================
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // =========================================================
  // 💾 GUARDAR DATOS DEL USUARIO (LEGACY)
  // =========================================================
  saveUserData(usuario: any): void {
    localStorage.setItem('user', JSON.stringify(usuario));
  }

  // =========================================================
  // 👤 OBTENER DATOS DEL USUARIO
  // =========================================================
  getUserData(): any {
    const token = this.getToken();
    
    if (!token) {
      console.warn('⚠️ No hay token disponible');
      return null;
    }

    try {
      // Decodificar el token JWT para obtener los datos
      const decoded = jwtDecode<TokenPayload>(token);
      
      return {
        correo: decoded.sub || decoded.email || decoded.correo,
        id_usuario: decoded.id_usuario,
        metodo_gmail_2fa: decoded.metodo_gmail_2fa || false
      };
    } catch (error) {
      console.error('❌ Error al decodificar token:', error);
      
      // Fallback: intentar obtener de localStorage legacy
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    }
  }

  // =========================================================
  // ✅ VERIFICAR SI ESTÁ AUTENTICADO
  // =========================================================
  isAuthenticated(): boolean {
    const token = this.getToken();
    
    if (!token) {
      console.log('❌ No hay token');
      return false;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const now = Date.now() / 1000;
      
      if (decoded.exp && decoded.exp < now) {
        console.log('⏰ Token expirado');
        this.logout();
        return false;
      }
      
      console.log('✅ Token válido');
      return true;
    } catch (error) {
      console.error('❌ Error al verificar token:', error);
      this.logout();
      return false;
    }
  }

  // =========================================================
  // 🚪 LOGOUT (ACTUALIZADO CON INACTIVITY SERVICE)
  // =========================================================
  logout(): void {
    // Limpiar tokens y datos
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('temp_correo_2fa');
    localStorage.removeItem('temp_email_verification');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('isLoggedIn');
    
    console.log('👋 Sesión cerrada');
    
    // Redirigir al login
    this.router.navigate(['/login']);
  }
  // =========================================================
// 🔥 CERRAR OTRAS SESIONES
// =========================================================
closeOtherSessions(): Observable<any> {
  console.log('🔥 Cerrando otras sesiones...');
  return this.http.post(`${this.apiUrl}/close-other-sessions`, {});
}
}
