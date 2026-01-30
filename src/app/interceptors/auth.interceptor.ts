import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // ✅ RUTAS QUE NO NECESITAN TOKEN
  const publicUrls = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/verify-email',
    '/auth/verify-recovery-code',
    '/auth/reset-password'
  ];
  
  // Verificar si la petición es a una URL pública
  const isPublicRequest = publicUrls.some(url => req.url.includes(url));
  
  // Obtener token
  const token = localStorage.getItem('access_token');
  
  // ✅ Agregar token SOLO si:
  // 1. Existe el token
  // 2. NO es una petición pública
  if (token && !isPublicRequest) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  // Manejar respuesta
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const currentPath = window.location.pathname;
      
      // ⚠️ NO REDIRIGIR si ya estamos en páginas de error o login
      const skipRedirect = ['/404', '/403', '/500', '/login'].some(
        path => currentPath.includes(path)
      );
      
      if (skipRedirect) {
        return throwError(() => error);
      }
      
      // 🔐 ERRORES DE AUTENTICACIÓN (401)
      if (error.status === 401) {
        const errorCode = error.error?.code;
        
        if (errorCode === 'SESSION_REVOKED' || errorCode === 'TOKEN_EXPIRED') {
          console.log('❌ Sesión expirada');
          localStorage.clear();
          router.navigate(['/login'], { 
            queryParams: { reason: 'session_expired' } 
          });
        } else if (!isPublicRequest) {
          // Solo redirigir si NO es una petición de login/registro
          console.log('❌ No autorizado');
          localStorage.clear();
          router.navigate(['/login']);
        }
      }
      
      // 🚫 ACCESO DENEGADO (403)
      else if (error.status === 403) {
        console.log('❌ Acceso denegado');
        router.navigate(['/403']);
      }
      
      // 🔍 NO ENCONTRADO (404)
      else if (error.status === 404) {
        console.error('❌ Endpoint no encontrado:', req.url);
        // NO redirigir automáticamente para 404 de API
        // Deja que el componente maneje el error
      }
      
      // ⚠️ ERROR DEL SERVIDOR (500+)
      else if (error.status >= 500) {
        console.error('❌ Error del servidor:', error.status);
        router.navigate(['/500']);
      }
      
      return throwError(() => error);
    })
  );
};