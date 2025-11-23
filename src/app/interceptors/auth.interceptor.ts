import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Obtener token del localStorage
  const token = localStorage.getItem('access_token');
  
  // Clonar request y agregar token si existe
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  // Manejar la respuesta y errores
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const errorCode = error.error?.code;
        
        // Si la sesión fue revocada o expiró
        if (errorCode === 'SESSION_REVOKED' || errorCode === 'TOKEN_EXPIRED') {
  console.log('❌ Sesión inválida detectada por interceptor'); // Solo log
  localStorage.clear();
  router.navigate(['/login']);
} else if (errorCode === 'TOKEN_EXPIRED') {
          alert('⏰ Tu sesión ha expirado.\n\nPor favor inicia sesión nuevamente.');
          
          localStorage.clear();
          router.navigate(['/login']);
        }
      }
      
      return throwError(() => error);
    })
  );
};
