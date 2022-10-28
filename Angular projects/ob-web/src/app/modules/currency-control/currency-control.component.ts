import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import {
  BUDGET,
  CONTRAGENT,
  IMPORT_PAYMENT,
  OSMS,
  RETIREMENT,
  SALARY,
  SOCIAL,
} from '@core/constants/pathnames';
import { IDocumentList, ITableRows } from '@data/models/account-history-types';
import { AccountHistoryService } from '@core/services/account-history.service';
import { errorMessage } from '@core/helpers';
import { ToastrService } from 'ngx-toastr';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { Router } from '@angular/router';

@Component({
  selector: 'ob-currency-control',
  templateUrl: './currency-control.component.html',
  styleUrls: ['./currency-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyControlComponent
  extends SubscriptionAccumulator
  implements OnInit, OnDestroy
{
  public operations: any = [];
  public lastOperations: any = [];
  public requestBody: any = null;
  public lastOperationsLoading: boolean = false;
  public selectedControlOption: string = '';
  public listType: string = '';
  public controlOptions: any = [
    { label: 'menu.payments', value: 'operations' },
    { label: 'menu.contracts', value: 'contract' },
    { label: 'default.requests', value: 'request' },
  ];

  constructor(
    private accountHistoryService: AccountHistoryService,
    private toastrService: ToastrService,
    private changeDetector: ChangeDetectorRef,
    private router: Router
  ) {
    super();
    this.operations = [
      {
        title: 'operations.type.CURR_EXCHANGE_V2',
        router: 'convertation',
        img: 'currency_control_1.svg',
      },
      {
        title: 'operations.type.CURR_ORDER_V2',
        router: 'currency-transfer',
        img: 'currency_control_2.svg',
      },
      {
        title: 'operations.type.intrabank-currency-transfer',
        router: '',
        img: 'currency_control_2.svg',
      },
      {
        title: 'operations.type.add_currency_contract',
        router: 'contract-creation',
        img: 'currency_control_3.svg',
      },
      {
        title: 'operations.type.edit_currency_contract',
        router: '',
        img: 'currency_control_3.svg',
      },
      {
        title: 'operations.type.close_currency_contract',
        router: '',
        img: 'currency_control_3.svg',
      },
      {
        title: 'operations.type.open_foreign_currency_account',
        router: '/products/create/account',
        img: 'currency_control_4.svg',
      },
    ];
  }

  ngOnInit(): void {
    this.selectedControlOption = this.controlOptions[0].value;
    this.listType = 'operations-history';
  }

  onControlOptionsSelected(value: string) {
    this.selectedControlOption = value;
    if (value === 'operations') {
      this.listType = 'operations-history';
    } else if (value === 'contract') {
      this.listType = 'currency-control';
    } else if (value === 'request') {
      this.listType = 'product-statements';
    }
  }

  goToHalykFXPage() {
    this.router.navigate(['currency-control/halykfx']);
  }
}
