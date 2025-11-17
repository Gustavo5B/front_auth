import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ModalConfig {
  isOpen: boolean;
  content: 'terminos' | 'privacidad' | null;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalState = new BehaviorSubject<ModalConfig>({
    isOpen: false,
    content: null
  });

  modalState$ = this.modalState.asObservable();

  openTerminos(): void {
    this.modalState.next({ isOpen: true, content: 'terminos' });
    document.body.style.overflow = 'hidden'; // Prevenir scroll
  }

  openPrivacidad(): void {
    this.modalState.next({ isOpen: true, content: 'privacidad' });
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    this.modalState.next({ isOpen: false, content: null });
    document.body.style.overflow = 'auto'; // Restaurar scroll
  }
}