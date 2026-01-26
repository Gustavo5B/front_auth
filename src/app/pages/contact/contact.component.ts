import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  contactForm!: FormGroup;
  isSubmitting = false;
  showSuccessMessage = false;

  constructor(private fb: FormBuilder) {
    // Scroll to top cuando se carga el componente
    window.scrollTo(0, 0);
  }

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Inicializar formulario con validaciones
   */
  initForm(): void {
    this.contactForm = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(255)
      ]],
      asunto: ['', Validators.required],
      mensaje: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(1000)
      ]],
      aceptoTerminos: [false, Validators.requiredTrue]
    });
  }

  /**
   * Verificar si un campo es inválido y fue tocado
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtener mensaje de error personalizado para cada campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    
    if (!field) return '';

    if (field.hasError('required')) {
      switch (fieldName) {
        case 'nombre':
          return 'El nombre es obligatorio';
        case 'email':
          return 'El correo electrónico es obligatorio';
        case 'mensaje':
          return 'El mensaje es obligatorio';
        default:
          return 'Este campo es obligatorio';
      }
    }

    if (field.hasError('email')) {
      return 'Por favor ingresa un correo válido';
    }

    if (field.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      if (fieldName === 'nombre') {
        return `El nombre debe tener al menos ${minLength} caracteres`;
      }
      if (fieldName === 'mensaje') {
        return `El mensaje debe tener al menos ${minLength} caracteres`;
      }
    }

    if (field.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Máximo ${maxLength} caracteres permitidos`;
    }

    return '';
  }

  /**
   * Manejar envío del formulario
   */
  onSubmit(): void {
    // Marcar todos los campos como tocados para mostrar errores
    Object.keys(this.contactForm.controls).forEach(key => {
      this.contactForm.get(key)?.markAsTouched();
    });

    // Si el formulario es inválido, no continuar
    if (this.contactForm.invalid) {
      console.log('❌ Formulario inválido');
      return;
    }

    // Iniciar proceso de envío
    this.isSubmitting = true;
    console.log('📧 Enviando formulario...', this.contactForm.value);

    // Simular envío (aquí conectarías con tu backend)
    setTimeout(() => {
      this.isSubmitting = false;
      this.showSuccessMessage = true;
      
      // Resetear formulario
      this.contactForm.reset();
      
      // Ocultar mensaje de éxito después de 5 segundos
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 5000);

      console.log('✅ Mensaje enviado exitosamente');
    }, 2000);

    // NOTA: Para conectar con tu backend, reemplaza el setTimeout con:
    /*
    this.http.post('http://localhost:4000/api/contact', this.contactForm.value)
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.showSuccessMessage = true;
          this.contactForm.reset();
          
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 5000);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error al enviar:', error);
          alert('Hubo un error al enviar tu mensaje. Por favor intenta de nuevo.');
        }
      });
    */
  }
}