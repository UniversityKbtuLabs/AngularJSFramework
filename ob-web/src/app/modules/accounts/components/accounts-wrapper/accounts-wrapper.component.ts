import {
  Component,
  ChangeDetectionStrategy,
  TemplateRef,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AccountOperations } from '@data/models/common-types';
import { MainService } from '@core/services/main.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ob-accounts-wrapper',
  templateUrl: './accounts-wrapper.component.html',
  styleUrls: ['./accounts-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsWrapperComponent implements OnDestroy {
  public operations: AccountOperations[] = [
    {
      code: 'open',
      value: 'Открыть',
      icon: 'ic_add_account',
      actions: [
        {
          code: 'open-account',
          value: this.translate.instant('default.account'),
        },
        { code: 'open-card', value: this.translate.instant('cards.card') },
      ],
    },
    {
      code: 'topup',
      value: 'Пополнить',
      icon: 'ic_add',
      actions: [
        {
          code: 'topup-card',
          value: this.translate.instant(
            'operations.transfer-confirmation.withdrawal-card'
          ),
        },
        {
          code: 'topup-account',
          value: this.translate.instant('accounts.actions.from-account'),
        },
        {
          code: 'topup-deposit',
          value: this.translate.instant('accounts.actions.from-deposit'),
        },
        {
          code: 'topup-auto',
          value: this.translate.instant('accounts.actions.autokassa-with-cash'),
        },
      ],
    },
    {
      code: 'withdraw',
      value: 'Снять наличные',
      icon: 'ic_money',
      actions: [
        {
          code: 'withdraw-auto',
          value: this.translate.instant('accounts.actions.autokassa-in'),
        },
        {
          code: 'withdraw-terminal',
          value: this.translate.instant('accounts.actions.atm-in'),
        },
        {
          code: 'withdraw-cash',
          value: this.translate.instant('accounts.actions.order-cash'),
        },
      ],
    },
  ];
  public modalRef: BsModalRef | any;

  constructor(
    public router: Router,
    private modalService: BsModalService,
    public mainService: MainService,
    private translate: TranslateService
  ) {}

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { id: 1 });
  }

  doAction(type: string) {
    switch (type) {
      case 'topup-auto':
        this.router.navigate(['/main/accounts/currents/topup']);
        return;
      default:
        return;
    }
  }

  ngOnDestroy(): void {
    this.modalService.hide(1);
  }
}
