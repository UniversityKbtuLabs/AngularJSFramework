import {
  Component,
  ChangeDetectionStrategy,
  AfterViewChecked,
} from '@angular/core';
import {
  OPERATIONS,
  CONTRAGENT,
  BUDGET,
  SALARY,
  RETIREMENT,
  SOCIAL,
  OSMS,
  ACCOUNTS,
  CARD,
  IMPORT_PAYMENT,
} from '@core/constants/pathnames';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ob-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsComponent implements AfterViewChecked {
  payments = [
    {
      title: 'default.payment_import',
      router: IMPORT_PAYMENT,
      img: 'payment_2.svg',
    },
    {
      title: 'operations.countragent.title',
      router: CONTRAGENT,
      img: 'payment_1.svg',
    },
    {
      title: 'operations.type.PAY_SALARY_V2',
      router: SALARY,
      img: 'payment_4.svg',
    },
    {
      title: 'operations.type.PAY_BUDGET',
      router: BUDGET,
      img: 'payment_5.svg',
    },
    {
      title: 'operations.type.PAY_PENSION_V2',
      router: RETIREMENT,
      img: 'payment_6.svg',
    },
    {
      title: 'operations.type.PAY_SOCIAL_V2',
      router: SOCIAL,
      img: 'payment_7.svg',
    },
    {
      title: 'operations.type.PAY_MEDICAL_INSURANCE',
      router: OSMS,
      img: 'payment_8.svg',
    },
  ];

  transfers = [
    {
      title: 'operations.type.PAY_BETWEEN_ACCOUNTS',
      router: ACCOUNTS,
      img: 'transfer_1.svg',
    },
    { title: 'operations.type.PAY_P2P', router: '', img: 'transfer_4.svg' },
    {
      title: 'operations.type.PAY_BY_PHONE',
      router: '',
      img: 'transfer_1.svg',
    },
  ];

  cash = [
    { title: 'operations.type.cash-deposit', router: '', img: 'cash_1.svg' },
    { title: 'operations.type.cash-withdrawal', router: '', img: 'cash_2.svg' },
  ];

  currencyControlList = [
    {
      title: 'operations.type.CURR_EXCHANGE_V2',
      router: '/currency-control/convertation',
      img: 'transfer_3.svg',
    },
    {
      title: 'operations.type.CURR_ORDER_V2',
      router: '/currency-control/currency-transfer',
      img: 'transfer_2.svg',
    },
    {
      title: 'operations.type.intrabank-currency-transfer',
      router: '',
      img: 'transfer_5.svg',
    },
  ];

  currencyControlListProd = [
    {
      title: 'operations.type.CURR_EXCHANGE_V2',
      router: '', //'/currency-control/convertation',
      img: 'transfer_3.svg',
    },
    {
      title: 'operations.type.CURR_ORDER_V2',
      router: '', //'/currency-control/currency-transfer',
      img: 'transfer_2.svg',
    },
    {
      title: 'operations.type.intrabank-currency-transfer',
      router: '',
      img: 'transfer_5.svg',
    },
  ];

  currency_control = environment.production
    ? [...this.currencyControlListProd]
    : [...this.currencyControlList];

  constructor(public translate: TranslateService) {}

  ngAfterViewChecked(): void {
    if (history.state?.scrollTo === 'operation-table') {
      const eltop = document
        .getElementById('operationTable')
        .getBoundingClientRect().top;
      window.scrollBy({
        top: eltop - 300,
        behavior: 'smooth',
      });
    }
  }

  selectedOperation(index: number) {
    //
  }
}
