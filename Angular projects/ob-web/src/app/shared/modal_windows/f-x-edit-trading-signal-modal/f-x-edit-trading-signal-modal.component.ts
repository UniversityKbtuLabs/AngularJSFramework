import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'ob-f-x-edit-trading-signal-modal',
  templateUrl: './f-x-edit-trading-signal-modal.component.html',
  styleUrls: ['./f-x-edit-trading-signal-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FXEditTradingSignalModalComponent implements OnInit {
  modalId: any;
  editSignalForm: FormGroup;
  trackingDate: Date;
  maxDate: Date = new Date();
  public periodError: boolean = false;

  constructor(
    private modalOptions: ModalOptions,
    private modalService: BsModalService,
    private fb: FormBuilder
  ) {
    this.editSignalForm = this.fb.group({
      expectedAmount: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.modalId = this.modalOptions?.id;
  }

  closeModal() {
    this.modalService.hide(this.modalId);
  }

  displayFieldClass(field: string) {
    // css класс
    return { 'is-invalid': this.isFieldInvalid(field) };
  }

  isFieldInvalid(field: string) {
    // Валидация полей
    const formField = this.editSignalForm.get(field);
    return (
      (!formField.valid && formField.touched && !formField.pristine) ||
      (!formField.valid && formField.dirty && !formField.pristine)
    );
  }

  changeDate(date: any) {
    if (date?.toString() === 'Invalid Date' || !event) {
      this.trackingDate = null; //очищает поле если не валидная дата
      return;
    } else {
      this.trackingDate = date;
    }
  }
}
