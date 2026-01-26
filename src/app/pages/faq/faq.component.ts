import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Question {
  id: string;
  question: string;
  answer: string;
  category: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {
  searchTerm: string = '';
  openCategory: string | null = null;
  openQuestion: string | null = null;
  filteredCategories: string[] = [];

  // Base de datos de preguntas frecuentes
  questions: Question[] = [
    // ========== ENVÍOS Y ENTREGAS ==========
    {
      id: 'envio-1',
      category: 'envios',
      question: '¿Cuánto tiempo tarda el envío?',
      answer: 'Los envíos dentro de la República Mexicana tardan entre <strong>3 a 7 días hábiles</strong>, dependiendo de tu ubicación. Para zonas metropolitanas el tiempo es de 2-4 días hábiles.'
    },
    {
      id: 'envio-2',
      category: 'envios',
      question: '¿Hacen envíos internacionales?',
      answer: 'Actualmente solo realizamos envíos dentro de <strong>México</strong>. Estamos trabajando para ofrecer envíos internacionales próximamente.'
    },
    {
      id: 'envio-3',
      category: 'envios',
      question: '¿Cuál es el costo del envío?',
      answer: 'El costo de envío varía según tu ubicación y el peso del producto. Los costos se calculan automáticamente al momento de realizar la compra. <strong>Envío gratis en compras mayores a $1,500 MXN</strong>.'
    },
    {
      id: 'envio-4',
      category: 'envios',
      question: '¿Puedo rastrear mi pedido?',
      answer: 'Sí, una vez que tu pedido sea enviado recibirás un <strong>número de guía de rastreo</strong> por correo electrónico para que puedas seguir tu paquete en tiempo real.'
    },
    {
      id: 'envio-5',
      category: 'envios',
      question: '¿Qué hago si mi paquete llega dañado?',
      answer: 'Si tu pedido llega con daños, contáctanos inmediatamente a través de nuestro correo con fotos del producto. Te enviaremos un <strong>reemplazo sin costo adicional</strong> o te haremos un reembolso completo.'
    },

    // ========== PAGOS Y FACTURACIÓN ==========
    {
      id: 'pago-1',
      category: 'pagos',
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos:<br>• Tarjetas de crédito y débito (Visa, Mastercard, American Express)<br>• Transferencias bancarias<br>• PayPal<br>• Pagos en OXXO y tiendas de conveniencia'
    },
    {
      id: 'pago-2',
      category: 'pagos',
      question: '¿Es seguro pagar en línea?',
      answer: 'Sí, todos los pagos están protegidos con <strong>cifrado SSL de 256 bits</strong> y procesados a través de plataformas seguras como Stripe. Nunca almacenamos información de tarjetas.'
    },
    {
      id: 'pago-3',
      category: 'pagos',
      question: '¿Puedo obtener factura?',
      answer: 'Sí, puedes solicitar tu factura dentro de las <strong>72 horas posteriores a tu compra</strong>. Solo necesitas enviarnos tus datos fiscales (RFC y razón social) a nuestro correo de facturación.'
    },
    {
      id: 'pago-4',
      category: 'pagos',
      question: '¿Ofrecen opciones de pago a meses?',
      answer: 'Sí, aceptamos pagos a <strong>3, 6, 9 y 12 meses sin intereses</strong> con tarjetas participantes de bancos seleccionados.'
    },

    // ========== PARA ARTISTAS ==========
    {
      id: 'artista-1',
      category: 'artistas',
      question: '¿Cómo puedo vender mis obras en NU★B STUDIO?',
      answer: 'Para unirte como artista, envíanos un mensaje a través de nuestro <strong>formulario de contacto</strong> seleccionando "Quiero ser Artista". Te contactaremos para explicarte el proceso de registro y comisiones.'
    },
    {
      id: 'artista-2',
      category: 'artistas',
      question: '¿Qué comisión cobra la plataforma?',
      answer: 'Cobramos una comisión del <strong>15% sobre el precio final de venta</strong>. Tú estableces el precio de tus obras y recibes el 85% de cada venta.'
    },
    {
      id: 'artista-3',
      category: 'artistas',
      question: '¿Cuánto tiempo tardan en aprobar mi registro?',
      answer: 'El proceso de revisión toma aproximadamente <strong>3 a 5 días hábiles</strong>. Revisamos tu portafolio y te contactamos para confirmar tu alta en la plataforma.'
    },
    {
      id: 'artista-4',
      category: 'artistas',
      question: '¿Cómo recibo mis pagos?',
      answer: 'Los pagos se realizan cada <strong>15 días</strong> mediante transferencia bancaria o PayPal. Solo necesitas configurar tu método de pago preferido en tu perfil de artista.'
    },
    {
      id: 'artista-5',
      category: 'artistas',
      question: '¿Puedo subir cuántas obras quiera?',
      answer: 'Sí, no hay límite en la cantidad de obras que puedes publicar. Te recomendamos mantener tu galería actualizada con fotografías de alta calidad.'
    },

    // ========== COMPRAS Y DEVOLUCIONES ==========
    {
      id: 'compra-1',
      category: 'compras',
      question: '¿Puedo cancelar mi pedido?',
      answer: 'Puedes cancelar tu pedido <strong>antes de que sea enviado</strong> sin ningún costo. Una vez enviado, aplican las políticas de devolución.'
    },
    {
      id: 'compra-2',
      category: 'compras',
      question: '¿Cuál es la política de devoluciones?',
      answer: 'Aceptamos devoluciones dentro de los <strong>primeros 15 días</strong> posteriores a la entrega, siempre que el producto esté en perfectas condiciones y con su empaque original.'
    },
    {
      id: 'compra-3',
      category: 'compras',
      question: '¿Cómo hago una devolución?',
      answer: 'Contáctanos por correo indicando tu número de pedido y el motivo de la devolución. Te enviaremos una guía de retorno prepagada y procesaremos tu reembolso una vez recibido el producto.'
    },
    {
      id: 'compra-4',
      category: 'compras',
      question: '¿Las obras son únicas?',
      answer: 'Sí, cada pieza artesanal es <strong>única</strong>. Aunque el artista puede crear piezas similares, cada una tiene sus propias características que la hacen especial.'
    },

    // ========== CUENTA Y SEGURIDAD ==========
    {
      id: 'cuenta-1',
      category: 'cuenta',
      question: '¿Cómo creo una cuenta?',
      answer: 'Haz clic en <strong>"Registrarse"</strong> en el menú principal, completa tus datos y verifica tu correo electrónico. ¡Es rápido y gratis!'
    },
    {
      id: 'cuenta-2',
      category: 'cuenta',
      question: '¿Olvidé mi contraseña, qué hago?',
      answer: 'En la página de inicio de sesión, haz clic en <strong>"¿Olvidaste tu contraseña?"</strong> y sigue las instrucciones para restablecerla. Recibirás un código por correo.'
    },
    {
      id: 'cuenta-3',
      category: 'cuenta',
      question: '¿Cómo activo la autenticación de dos factores?',
      answer: 'Ve a <strong>"Mi Cuenta" → "Seguridad"</strong> y activa la autenticación de dos factores (2FA). Puedes usar Google Authenticator o recibir códigos por correo.'
    },
    {
      id: 'cuenta-4',
      category: 'cuenta',
      question: '¿Puedo cambiar mi correo electrónico?',
      answer: 'Sí, en la sección <strong>"Mi Cuenta" → "Datos Personales"</strong> puedes actualizar tu correo. Necesitarás verificar el nuevo correo antes de que el cambio sea efectivo.'
    },

    // ========== CONTACTO Y SOPORTE ==========
    {
      id: 'soporte-1',
      category: 'soporte',
      question: '¿Cuál es su horario de atención?',
      answer: 'Nuestro horario es de <strong>Lunes a Viernes de 9:00 a 18:00 hrs</strong> y <strong>Sábados de 10:00 a 14:00 hrs</strong> (Hora del Centro de México).'
    },
    {
      id: 'soporte-2',
      category: 'soporte',
      question: '¿Cuánto tardan en responder mis mensajes?',
      answer: 'Respondemos todos los mensajes en menos de <strong>24 horas hábiles</strong>. Para soporte urgente, contáctanos por WhatsApp.'
    },
    {
      id: 'soporte-3',
      category: 'soporte',
      question: '¿Tienen tienda física?',
      answer: 'Actualmente somos una <strong>plataforma digital</strong>. Estamos ubicados en Chapulhuacán, Hidalgo, pero todas las compras se realizan en línea.'
    },
    {
      id: 'soporte-4',
      category: 'soporte',
      question: '¿Cómo puedo reportar un problema técnico?',
      answer: 'Envíanos un mensaje a través del <strong>formulario de contacto</strong> seleccionando "Soporte Técnico" y describe el problema. Nuestro equipo lo resolverá lo antes posible.'
    }
  ];

  constructor() {
    window.scrollTo(0, 0);
  }

  ngOnInit(): void {
    // Inicializar con todas las categorías visibles
    this.updateFilteredCategories();
  }

  /**
   * Actualizar categorías filtradas
   */
  updateFilteredCategories(): void {
    if (!this.searchTerm) {
      this.filteredCategories = ['envios', 'pagos', 'artistas', 'compras', 'cuenta', 'soporte'];
    } else {
      const categories = new Set<string>();
      this.questions.forEach(q => {
        if (this.matchesSearch(q)) {
          categories.add(q.category);
        }
      });
      this.filteredCategories = Array.from(categories);
    }
  }

  /**
   * Verificar si una pregunta coincide con la búsqueda
   */
  matchesSearch(question: Question): boolean {
    const term = this.searchTerm.toLowerCase();
    return question.question.toLowerCase().includes(term) ||
           question.answer.toLowerCase().includes(term);
  }

  /**
   * Filtrar preguntas al escribir en el buscador
   */
  filterQuestions(): void {
    this.updateFilteredCategories();
    
    // Si hay búsqueda, abrir todas las categorías
    if (this.searchTerm && this.filteredCategories.length > 0) {
      this.openCategory = this.filteredCategories[0];
    }
  }

  /**
   * Obtener preguntas filtradas por categoría
   */
  getFilteredQuestions(category: string): Question[] {
    const categoryQuestions = this.questions.filter(q => q.category === category);
    
    if (!this.searchTerm) {
      return categoryQuestions;
    }
    
    return categoryQuestions.filter(q => this.matchesSearch(q));
  }

  /**
   * Verificar si se debe mostrar una categoría
   */
  shouldShowCategory(category: string): boolean {
    return !this.searchTerm || this.filteredCategories.includes(category);
  }

  /**
   * Abrir/cerrar categoría
   */
  toggleCategory(category: string): void {
    this.openCategory = this.openCategory === category ? null : category;
    this.openQuestion = null; // Cerrar pregunta abierta al cambiar de categoría
  }

  /**
   * Abrir/cerrar pregunta
   */
  toggleQuestion(questionId: string): void {
    this.openQuestion = this.openQuestion === questionId ? null : questionId;
  }
}