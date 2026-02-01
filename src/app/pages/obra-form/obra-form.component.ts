import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ObrasService } from '../../services/obras.service';
import { CategoriasService } from '../../services/categorias.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-obra-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './obra-form.component.html',
  styleUrls: ['./obra-form.component.css']
})
export class ObraFormComponent implements OnInit {
  obraForm!: FormGroup;
  categorias: any[] = [];
  artistas: any[] = [];
  
  // ✅ TÉCNICAS PREDEFINIDAS
  tecnicas: string[] = [
    'Óleo sobre lienzo',
    'Acrílico sobre lienzo',
    'Acuarela',
    'Fotografía digital',
    'Fotografía analógica',
    'Escultura en barro',
    'Escultura en madera',
    'Cerámica',
    'Grabado',
    'Arte digital',
    'Técnica mixta',
    'Collage',
    'Carboncillo',
    'Lápiz',
    'Pastel',
    'Textil',
    'Serigrafía'
  ];
  
  // Control de formulario
  modoEdicion: boolean = false;
  idObra: number | null = null;
  enviando: boolean = false;
  
  // Subida de imagen
  imagenSeleccionada: File | null = null;
  imagenPreview: string | null = null;
  subiendoImagen: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private obrasService: ObrasService,
    private categoriasService: CategoriasService,
    private http: HttpClient
  ) {
    this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarArtistas();
    
    // Verificar si es modo edición
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.modoEdicion = true;
        this.idObra = +params['id'];
        this.cargarObra(this.idObra);
      }
    });
  }

  // =========================================================
  // 📝 CREAR FORMULARIO CON VALIDACIONES
  // =========================================================
  crearFormulario(): void {
    this.obraForm = this.fb.group({
      titulo: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(200)
      ]],
      descripcion: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(1000)
      ]],
      id_categoria: ['', Validators.required],
      id_artista: ['', Validators.required],
      anio_creacion: ['', [
        Validators.min(1900),
        Validators.max(new Date().getFullYear())
      ]],
      tecnica: ['', Validators.maxLength(100)],
      destacada: [false]
    });
  }

  // =========================================================
  // 📂 CARGAR CATEGORÍAS
  // =========================================================
  cargarCategorias(): void {
    this.categoriasService.listarCategorias().subscribe({
      next: (response) => {
        if (response.success) {
          this.categorias = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  // =========================================================
  // 👨‍🎨 CARGAR ARTISTAS
  // =========================================================
  cargarArtistas(): void {
    this.http.get(`${environment.apiUrl}/artistas`).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.artistas = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar artistas:', error);
      }
    });
  }

  // =========================================================
  // 📖 CARGAR OBRA (MODO EDICIÓN)
  // =========================================================
  cargarObra(id: number): void {
    this.obrasService.obtenerObraPorId(id).subscribe({
      next: (response) => {
        if (response.success) {
          const obra = response.data;
          
          this.obraForm.patchValue({
            titulo: obra.titulo,
            descripcion: obra.descripcion,
            id_categoria: obra.id_categoria,
            id_artista: obra.id_artista,
            anio_creacion: obra.anio_creacion,
            tecnica: obra.tecnica,
            destacada: obra.destacada
          });
          
          // Mostrar imagen actual
          if (obra.imagen_principal) {
            this.imagenPreview = obra.imagen_principal;
          }
        }
      },
      error: (error) => {
        console.error('Error al cargar obra:', error);
        alert('Error al cargar la obra');
      }
    });
  }

  // =========================================================
  // 📸 SELECCIONAR IMAGEN
  // =========================================================
  onImagenSeleccionada(event: any): void {
    const file = event.target.files[0];
    
    if (file) {
      // Validar tipo
      const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!tiposPermitidos.includes(file.type)) {
        alert('Solo se permiten imágenes JPG, PNG o WEBP');
        return;
      }
      
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar 5MB');
        return;
      }
      
      this.imagenSeleccionada = file;
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // =========================================================
  // 💾 GUARDAR OBRA
  // =========================================================
  async guardarObra(): Promise<void> {
    if (this.obraForm.invalid) {
      this.marcarCamposComoTocados();
      alert('Por favor completa todos los campos obligatorios correctamente');
      return;
    }

    this.enviando = true;

    try {
      const datosObra = this.obraForm.value;
      
      if (this.modoEdicion && this.idObra) {
        // EDITAR OBRA EXISTENTE
        await this.editarObra(this.idObra, datosObra);
      } else {
        // CREAR OBRA NUEVA
        await this.crearObraNueva(datosObra);
      }
    } catch (error) {
      console.error('Error al guardar obra:', error);
      alert('Error al guardar la obra');
      this.enviando = false;
    }
  }

  // =========================================================
  // ➕ CREAR OBRA NUEVA
  // =========================================================
 async crearObraNueva(datosObra: any): Promise<void> {
    // ✅ VALIDAR QUE HAY IMAGEN
    if (!this.imagenSeleccionada) {
      alert('Por favor selecciona una imagen');
      this.enviando = false;
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // NO incluir Content-Type para FormData
    });

    // ✅ CREAR FORMDATA CON TODOS LOS DATOS
    const formData = new FormData();
    formData.append('titulo', datosObra.titulo);
    formData.append('descripcion', datosObra.descripcion);
    formData.append('id_categoria', datosObra.id_categoria);
    formData.append('id_artista', datosObra.id_artista);
    
    if (datosObra.anio_creacion) {
      formData.append('anio_creacion', datosObra.anio_creacion);
    }
    
    if (datosObra.tecnica) {
      formData.append('tecnica', datosObra.tecnica);
    }
    
    formData.append('destacada', datosObra.destacada ? '1' : '0');
    
    // ✅ AGREGAR LA IMAGEN
    formData.append('imagen', this.imagenSeleccionada);

    // ✅ ENVIAR TODO EN UNA SOLA PETICIÓN
    this.http.post(`${environment.apiUrl}/obras`, formData, { headers }).subscribe({
      next: (response: any) => {
        if (response.success) {
          alert('✅ Obra creada exitosamente');
          this.router.navigate(['/dashboard']);
        }
        this.enviando = false;
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error al crear la obra: ' + (error.error?.message || 'Error desconocido'));
        this.enviando = false;
      }
    });
  }

  // =========================================================
  // ✏️ EDITAR OBRA EXISTENTE
  // =========================================================
  async editarObra(id: number, datosObra: any): Promise<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // NO incluir Content-Type para FormData
    });

    // ✅ CREAR FORMDATA
    const formData = new FormData();
    formData.append('titulo', datosObra.titulo);
    formData.append('descripcion', datosObra.descripcion);
    formData.append('id_categoria', datosObra.id_categoria);
    formData.append('id_artista', datosObra.id_artista);
    
    if (datosObra.anio_creacion) {
      formData.append('anio_creacion', datosObra.anio_creacion);
    }
    
    if (datosObra.tecnica) {
      formData.append('tecnica', datosObra.tecnica);
    }
    
    formData.append('destacada', datosObra.destacada ? '1' : '0');
    
    // ✅ AGREGAR IMAGEN SI HAY UNA NUEVA
    if (this.imagenSeleccionada) {
      formData.append('imagen', this.imagenSeleccionada);
    }

    // ✅ ACTUALIZAR OBRA
    this.http.put(`${environment.apiUrl}/obras/${id}`, formData, { headers }).subscribe({
      next: (response: any) => {
        if (response.success) {
          alert('✅ Obra actualizada exitosamente');
          this.router.navigate(['/dashboard']);
        }
        this.enviando = false;
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Error al actualizar la obra: ' + (error.error?.message || 'Error desconocido'));
        this.enviando = false;
      }
    });
  }

  // =========================================================
  // 📤 SUBIR IMAGEN A CLOUDINARY
  // =========================================================
  

  // =========================================================
  // 🔍 VALIDACIONES - GETTERS
  // =========================================================
  get titulo() { return this.obraForm.get('titulo'); }
  get descripcion() { return this.obraForm.get('descripcion'); }
  get id_categoria() { return this.obraForm.get('id_categoria'); }
  get id_artista() { return this.obraForm.get('id_artista'); }
  get anio_creacion() { return this.obraForm.get('anio_creacion'); }

  // =========================================================
  // 🎯 MARCAR CAMPOS COMO TOCADOS
  // =========================================================
  marcarCamposComoTocados(): void {
    Object.keys(this.obraForm.controls).forEach(key => {
      this.obraForm.get(key)?.markAsTouched();
    });
  }

  // =========================================================
  // ❌ CANCELAR
  // =========================================================
  cancelar(): void {
    if (confirm('¿Deseas cancelar? Los cambios no guardados se perderán.')) {
      this.router.navigate(['/dashboard']);
    }
  }
}