import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // ✅ RUTAS QUE NO NECESITAN TOKEN (PÁGINAS PÚBLICAS)
  const publicUrls = [
    '/login',
    '/register',
    '/forgot-password',
    '/verify-email',
    '/verify-recovery-code',
    '/reset-password',
    '/404',
    '/403',
    '/500'
  ];
  
  // Verificar si la URL actual es pública
  const currentPath = window.location.pathname;
  const isPublicUrl = publicUrls.some(url => currentPath.includes(url));
  
  // Obtener token del localStorage
  const token = localStorage.getItem('access_token');
  
  // ✅ Clonar request y agregar token SOLO si NO es ruta pública
  if (token && !isPublicUrl) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  // Manejar la respuesta y errores
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // ⚠️ NO REDIRIGIR SI ESTAMOS EN UNA PÁGINA DE ERROR
      if (currentPath.includes('/404') || 
          currentPath.includes('/403') || 
          currentPath.includes('/500')) {
        return throwError(() => error);
      }
      
      // ============================================
      // 🔐 ERRORES DE AUTENTICACIÓN (401)
      // ============================================
      if (error.status === 401) {
        const errorCode = error.error?.code;
        
        // Sesión revocada o expirada
        if (errorCode === 'SESSION_REVOKED') {
          console.log('❌ Sesión revocada detectada por interceptor');
          localStorage.clear();
          router.navigate(['/login']);
        } 
        else if (errorCode === 'TOKEN_EXPIRED') {
          alert('⏰ Tu sesión ha expirado.\n\nPor favor inicia sesión nuevamente.');
          localStorage.clear();
          router.navigate(['/login']);
        }
        // Cualquier otro 401 sin código específico
        else {
          console.log('❌ Error de autenticación (401)');
          router.navigate(['/403']);
        }
      }
      
      // ============================================
      // 🚫 ACCESO DENEGADO (403)
      // ============================================
      else if (error.status === 403) {
        console.log('❌ Acceso denegado (403)');
        router.navigate(['/403']);
      }
      
      // ============================================
      // 🔍 NO ENCONTRADO (404)
      // ============================================
      else if (error.status === 404) {
        console.log('❌ Recurso no encontrado (404)');
        // Solo redirigir si es un endpoint crítico
        // router.navigate(['/404']); // Descomenta si quieres redirigir
      }
      
      // ============================================
      // ⚠️ ERROR DEL SERVIDOR (500+)
      // ============================================
      else if (error.status >= 500) {
        console.error('❌ Error del servidor:', error.status);
        router.navigate(['/500']);
      }
      
      return throwError(() => error);
    })
  );
};