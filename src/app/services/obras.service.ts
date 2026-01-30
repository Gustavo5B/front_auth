import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ObrasService {
  private apiUrl = `${environment.apiUrl}/obras`;

  constructor(private http: HttpClient) { }

  // =========================================================
  // 📚 LISTAR OBRAS (CON FILTROS Y PAGINACIÓN)
  // =========================================================
  listarObras(filtros?: {
    page?: number;
    limit?: number;
    categoria?: number;
    artista?: number;
    precio_min?: number;
    precio_max?: number;
    destacadas?: boolean;
    orden?: string;
  }): Observable<any> {
    let params = new HttpParams();

    if (filtros) {
      if (filtros.page) params = params.set('page', filtros.page.toString());
      if (filtros.limit) params = params.set('limit', filtros.limit.toString());
      if (filtros.categoria) params = params.set('categoria', filtros.categoria.toString());
      if (filtros.artista) params = params.set('artista', filtros.artista.toString());
      if (filtros.precio_min) params = params.set('precio_min', filtros.precio_min.toString());
      if (filtros.precio_max) params = params.set('precio_max', filtros.precio_max.toString());
      if (filtros.destacadas) params = params.set('destacadas', 'true');
      if (filtros.orden) params = params.set('orden', filtros.orden);
    }

    return this.http.get(`${this.apiUrl}`, { params });
  }

  // =========================================================
  // 🌟 OBTENER OBRAS DESTACADAS
  // =========================================================
  obtenerObrasDestacadas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/destacadas`);
  }

  // =========================================================
  // 🔍 BUSCAR OBRAS
  // =========================================================
  buscarObras(termino: string, page: number = 1, limit: number = 12): Observable<any> {
    const params = new HttpParams()
      .set('q', termino)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get(`${this.apiUrl}/buscar`, { params });
  }

  // =========================================================
  // 📖 OBTENER DETALLE DE OBRA
  // =========================================================
  obtenerObraPorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  obtenerObraPorSlug(slug: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/slug/${slug}`);
  }

  // =========================================================
  // 📂 FILTRAR POR CATEGORÍA
  // =========================================================
  obtenerObrasPorCategoria(idCategoria: number, page: number = 1, limit: number = 12): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get(`${this.apiUrl}/categoria/${idCategoria}`, { params });
  }

  // =========================================================
  // 👨‍🎨 FILTRAR POR ARTISTA
  // =========================================================
  obtenerObrasPorArtista(idArtista: number, page: number = 1, limit: number = 12): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get(`${this.apiUrl}/artista/${idArtista}`, { params });
  }

  // =========================================================
  // 🏷️ FILTRAR POR ETIQUETA
  // =========================================================
  obtenerObrasPorEtiqueta(slug: string, page: number = 1, limit: number = 12): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get(`${this.apiUrl}/etiqueta/${slug}`, { params });
  }
}