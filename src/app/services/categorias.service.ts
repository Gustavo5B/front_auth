import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private apiUrl = `${environment.apiUrl}/categorias`;

  constructor(private http: HttpClient) { }

  // =========================================================
  // 📂 LISTAR TODAS LAS CATEGORÍAS
  // =========================================================
  listarCategorias(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // =========================================================
  // 🔍 OBTENER DETALLE DE CATEGORÍA
  // =========================================================
  obtenerCategoriaPorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  obtenerCategoriaPorSlug(slug: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/slug/${slug}`);
  }
}