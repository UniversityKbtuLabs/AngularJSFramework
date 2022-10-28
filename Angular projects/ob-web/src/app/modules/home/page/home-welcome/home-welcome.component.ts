/* eslint-disable max-len */
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import {
  OPERATIONS,
  CONTRAGENT,
  BUDGET,
  SALARY,
  IMPORT_PAYMENT,
  RETIREMENT,
  SOCIAL,
  OSMS,
  ACCOUNTS,
  CARD,
  CONVERTATION,
  CURRENCY_TRANSFER,
} from '@core/constants/pathnames';
import { AccountHistoryService } from '@app/core/services/account-history.service';
import { errorMessage } from '@core/helpers';
import { ToastrService } from 'ngx-toastr';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ModalOperationsMainComponent } from '@app/shared/components/modal-operations-main/modal-operations-main.component';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { environment } from '@env/environment';

@Component({
  selector: 'ob-home-welcome',
  templateUrl: './home-welcome.component.html',
  styleUrls: ['./home-welcome.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeWelcomeComponent implements OnInit, OnDestroy {
  public operationTitle: string = '';
  public documentsQuantity: number = 0;

  public startDate: Date;
  public endDate: Date = new Date();
  public format: string = 'yyyy-MM-dd';
  public subscription: Subscription;
  public payment_import_route: string = IMPORT_PAYMENT;
  mainOperations = [
    {
      id: 1,
      title: 'default.payment_import',
      router: IMPORT_PAYMENT,
      img: 'payment_2.svg',
      disabled: false,
    },
    {
      id: 2,
      title: 'operations.countragent.title',
      router: CONTRAGENT,
      img: 'payment_1.svg',
      disabled: false,
    },
    {
      id: 3,
      title: 'operations.type.PAY_PENSION_V2',
      router: RETIREMENT,
      img: 'payment_6.svg',
      disabled: false,
    },
    {
      id: 4,
      title: 'operations.type.PAY_SALARY_V2',
      router: SALARY,
      img: 'payment_4.svg',
      disabled: false,
    },
    {
      id: 5,
      title: 'operations.type.PAY_BUDGET',
      router: BUDGET,
      img: 'payment_5.svg',
      disabled: false,
    },
    {
      id: 6,
      title: 'operations.type.PAY_SOCIAL_V2',
      router: SOCIAL,
      img: 'payment_7.svg',
      disabled: false,
    },
  ];
  allOperationsListProd = [
    {
      id: 7,
      title: 'operations.type.PAY_BETWEEN_ACCOUNTS',
      router: ACCOUNTS,
      img: 'transfer_1.svg',
      disabled: false,
    },
    {
      id: 9,
      title: 'operations.type.PAY_MEDICAL_INSURANCE',
      router: OSMS,
      img: 'payment_8.svg',
      disabled: false,
    },
    {
      id: 10,
      title: 'accounts.all-accounts.get-extract',
      img: 'payment_3.svg',
      router: 'extract',
      disabled: false,
    },
    // { id: 11, title: 'Halyk FX', img: 'payment_6.svg', disabled: true },
    {
      id: 12,
      title: 'operations.type.CURR_ORDER_V2',
      img: 'transfer_2.svg',
      //router: CURRENCY_TRANSFER,
      disabled: true,
    },
    {
      id: 13,
      title: 'operations.type.CURR_EXCHANGE_V2',
      img: 'transfer_3.svg',
      //router: CONVERTATION,
      disabled: true,
    },
    {
      id: 14,
      title: 'operations.type.intrabank-currency-transfer',
      img: 'transfer_5.svg',
      disabled: true,
    },
    {
      id: 15,
      title: 'operations.type.PAY_BY_PHONE',
      img: 'transfer_6.svg',
      disabled: true,
    },
    {
      id: 16,
      title: 'operations.type.cash-deposit',
      img: 'cash_1.svg',
      disabled: true,
    },
    {
      id: 17,
      title: 'operations.type.cash-withdrawal',
      img: 'cash_2.svg',
      disabled: true,
    },
  ];
  allOperationsList = [
    {
      id: 7,
      title: 'operations.type.PAY_BETWEEN_ACCOUNTS',
      router: ACCOUNTS,
      img: 'transfer_1.svg',
      disabled: false,
    },
    {
      id: 9,
      title: 'operations.type.PAY_MEDICAL_INSURANCE',
      router: OSMS,
      img: 'payment_8.svg',
      disabled: false,
    },
    {
      id: 10,
      title: 'accounts.all-accounts.get-extract',
      img: 'payment_3.svg',
      router: 'extract',
      disabled: false,
    },
    // { id: 11, title: 'Halyk FX', img: 'payment_6.svg', disabled: true },
    {
      id: 12,
      title: 'operations.type.CURR_ORDER_V2',
      img: 'transfer_2.svg',
      router: CURRENCY_TRANSFER,
      disabled: false,
    },
    {
      id: 13,
      title: 'operations.type.CURR_EXCHANGE_V2',
      img: 'transfer_3.svg',
      router: CONVERTATION,
      disabled: false,
    },
    {
      id: 14,
      title: 'operations.type.intrabank-currency-transfer',
      img: 'transfer_5.svg',
      disabled: true,
    },
    {
      id: 15,
      title: 'operations.type.PAY_BY_PHONE',
      img: 'transfer_6.svg',
      disabled: true,
    },
    {
      id: 16,
      title: 'operations.type.cash-deposit',
      img: 'cash_1.svg',
      disabled: true,
    },
    {
      id: 17,
      title: 'operations.type.cash-withdrawal',
      img: 'cash_2.svg',
      disabled: true,
    },
  ];
  allOperations = environment.production
    ? [...this.allOperationsListProd]
    : [...this.allOperationsList];
  operations = [...this.mainOperations, ...this.allOperations];

  modalRef?: BsModalRef;
  public isProduction: boolean = environment.production;

  constructor(
    public dischargeHistoryService: AccountHistoryService,
    public toastr: ToastrService,
    private modalService: BsModalService,
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getSignDocsQuantity();
  }

  getSignDocsQuantity() {
    this.subscription = this.dischargeHistoryService
      .getSignDocumentsQuantity()
      .subscribe({
        next: v => {
          this.documentsQuantity = v;
          this.changeDetector.detectChanges();
        },
        error: error => errorMessage(error, this.toastr),
      });
  }

  declOfNum(number: number, words: string[]) {
    return words[
      number % 1000 > 4 && number % 1000 < 20
        ? 2
        : [2, 0, 1, 1, 1, 2][number % 10 < 5 ? Math.abs(number) % 10 : 5]
    ];
  }

  openModal(event: any) {
    let initialState = {
      mainOperations: this.mainOperations,
      allOperations: this.allOperations,
    };
    this.modalRef = this.modalService.show(ModalOperationsMainComponent, {
      class: 'modal-lg',
      id: 1,
      initialState,
    });
  }

  goToHalykFXPage() {
    if (!this.isProduction) {
      this.router.navigate(['currency-control/halykfx']);
    }
  }

  ngOnDestroy(): void {
    this.modalService.hide(1);
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
