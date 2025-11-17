import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ModalConfig } from '../../services/modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-legal-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './legal-modal.component.html',
  styleUrls: ['./legal-modal.component.css']
})
export class LegalModalComponent implements OnInit, OnDestroy {
  isOpen: boolean = false;
  content: 'terminos' | 'privacidad' | null = null;
  
  private subscription?: Subscription;

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    // Suscribirse al estado del modal
    this.subscription = this.modalService.modalState$.subscribe(
      (state: ModalConfig) => {
        this.isOpen = state.isOpen;
        this.content = state.content;
      }
    );
  }

  ngOnDestroy(): void {
    // Limpiar suscripción para evitar memory leaks
    this.subscription?.unsubscribe();
  }

  close(): void {
    this.modalService.close();
  }

  // Cerrar modal solo si se hace clic en el overlay (fondo negro)
  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }
}