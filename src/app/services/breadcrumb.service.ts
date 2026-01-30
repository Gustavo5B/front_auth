import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Breadcrumb {
  label: string;
  url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbsSubject = new BehaviorSubject<Breadcrumb[]>([]);
  public breadcrumbs$: Observable<Breadcrumb[]> = this.breadcrumbsSubject.asObservable();

  constructor() { }

  // =========================================================
  // 🔄 ESTABLECER BREADCRUMBS
  // =========================================================
  setBreadcrumbs(breadcrumbs: Breadcrumb[]): void {
    // Siempre incluir "Inicio" al principio
    const fullBreadcrumbs: Breadcrumb[] = [
      { label: 'Inicio', url: '/dashboard' },
      ...breadcrumbs
    ];
    this.breadcrumbsSubject.next(fullBreadcrumbs);
  }

  // =========================================================
  // 🗑️ LIMPIAR BREADCRUMBS
  // =========================================================
  clearBreadcrumbs(): void {
    this.breadcrumbsSubject.next([{ label: 'Inicio', url: '/dashboard' }]);
  }

  // =========================================================
  // 📖 OBTENER BREADCRUMBS ACTUALES
  // =========================================================
  getBreadcrumbs(): Breadcrumb[] {
    return this.breadcrumbsSubject.value;
  }
}