import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { PaymentImportModalComponent } from '@app/modules/operations/components/payment-import/payment-import.component';
import { AccountModalComponent } from '@app/modules/all-accounts/components/account-modal/account-modal.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ob-custom-card',
  templateUrl: './custom-card.component.html',
  styleUrls: ['./custom-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomCardComponent implements OnDestroy {
  @Input() className: string = '';
  @Input() routerLink: string = '';
  @Input() imgUrl: string = 'payment_2.svg';
  @Input() title: string = 'Operationa';
  @Input() route: string = '';

  modalRef?: BsModalRef;

  constructor(
    private router: Router,
    private modalService: BsModalService,
    private translate: TranslateService
  ) {}

  navigate() {
    if (this.route === 'extract') {
      const initialState: any = {
        fileName: this.translate.instant('operations.default.accountStatement'),
        isExtended: true,
        modalType: 'statements',
        type: 'accounts',
        accountsList: [],
      };

      this.modalRef = this.modalService.show(AccountModalComponent, {
        class: 'modal-dialog-centered',
        initialState,
        id: 1,
      });
    }

    if (this.route && this.route !== 'extract') {
      this.modalRef = this.modalService.show(PaymentImportModalComponent, {
        class: 'modal-md modal-dialog-centered',
        id: 1,
      });
    }
  }

  ngOnDestroy(): void {
    this.modalService.hide(1);
  }
}
