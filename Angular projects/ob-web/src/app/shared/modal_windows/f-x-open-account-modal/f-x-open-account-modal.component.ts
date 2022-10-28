import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'ob-f-x-open-account-modal',
  templateUrl: './f-x-open-account-modal.component.html',
  styleUrls: ['./f-x-open-account-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FXOpenAccountModalComponent implements OnInit {
  modalId: any;
  currency: any;

  constructor(
    private modalOptions: ModalOptions,
    private modalService: BsModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.modalId = this.modalOptions?.id;
    this.currency = this.modalOptions?.initialState?.currency;
  }

  closeModal() {
    this.modalService.hide(this.modalId);
  }

  createAccount() {
    this.router.navigate(['/products/create/account'], {
      queryParams: { currency: this.currency },
    });
    this.modalService.hide(this.modalId);
  }
}
