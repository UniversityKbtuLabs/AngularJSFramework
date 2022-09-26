import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class MainService {
  formType: BehaviorSubject<string> = new BehaviorSubject('');
  currentFormType: Observable<string> = this.formType.asObservable();

  constructor() {
    this.openSlideModal = this.openSlideModal.bind(this);
  }

  openSlideModal(type: string): void {
    this.formType.next(type);
    const sliderModal: HTMLElement | null =
      document.getElementById('slider-modal');
    const bg: HTMLElement | null = document.getElementById('bg');
    const slider: HTMLElement | null = document.getElementById('slider');

    if (slider && bg && sliderModal) {
      slider.className = 'slider-active slider';
      bg.className = 'bg-active bg';
      sliderModal.className = 'slider-modal-active slider-modal';
    }
  }

  closeModal(): void {
    const sliderModal: HTMLElement | null =
      document.getElementById('slider-modal');
    const bg: HTMLElement | null = document.getElementById('bg');
    const slider: HTMLElement | null = document.getElementById('slider');
    if (slider && bg && sliderModal) {
      slider.className = 'slider';
      bg.className = 'bg';
      sliderModal.className = 'slider-modal';
    }
    this.formType.next('');
  }
}
