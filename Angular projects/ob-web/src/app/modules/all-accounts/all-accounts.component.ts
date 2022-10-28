/* eslint-disable max-len */
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { thousandsSeparator } from '@app/core/helpers';
import { SubscriptionAccumulator } from '@app/core/helpers/SubscriptionAccumulator';
import { AccountsService } from '@app/core/services/accounts.service';
import { HelperService } from '@app/core/services/helper.service';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { AccountModalComponent } from './components/account-modal/account-modal.component';

@Component({
  selector: 'ob-all-accounts',
  templateUrl: './all-accounts.component.html',
  styleUrls: ['./all-accounts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

/* 
  Страница /home/accounts
  Компонент отображения всех продуктов страница согласно типа продукта - @type
  допустимые типы продуктов:
   - accounts
   - cards
   - deposits
   - credits
  В списке хранятся списки продуктов - @list 
*/
export class AllAccountsComponent
  extends SubscriptionAccumulator
  implements OnInit, OnChanges, OnDestroy
{
  modalRef?: BsModalRef;

  @Input() type: string;
  @Input() list: any;
  public amountList: any = {};
  public accStatementTitle: any = {};
  public loading: any = {};
  public subscription: Subscription;

  constructor(
    public changeDetector: ChangeDetectorRef,
    public helperService: HelperService,
    private modalService: BsModalService,
    private translateService: TranslateService,
    public accountsService: AccountsService,
    private router: Router
  ) {
    super();
    this.getStatements = this.getStatements.bind(this);
    this.getRequisites = this.getRequisites.bind(this);
  }

  ngOnInit(): void {
    this.translateService
      .get([
        'operations.default.accountStatement',
        'operations.default.depositStatement',
        'operations.default.cardStatement',
        'products.deposits.allDepositStatements',
      ])
      .subscribe(translations => {
        this.accStatementTitle.cards =
          translations['operations.default.cardStatement'];
        this.accStatementTitle.deposits =
          translations['operations.default.depositStatement'];
        this.accStatementTitle.accounts =
          translations['operations.default.accountStatement'];
        this.accStatementTitle.loans =
          translations['operations.default.loanStatement'];
        this.accStatementTitle.allDepositStatements =
          translations['products.deposits.allDepositStatements'];
      });

    const loadingCb = (loading: boolean, cb = () => {}) => {
      if (loading) {
        cb();
      }
      this.loading = { [this.type]: loading };
      this.changeDetector.detectChanges();
    };
    if (this.type === 'cards') {
      this.accountsService.isLoadingCard$.subscribe({
        next: loading => {
          loadingCb(loading, () => {});
        },
      });
    } else if (this.type === 'deposits') {
      this.accountsService.isLoadingDeposit$.subscribe({
        next: loading => loadingCb(loading),
      });
    } else if (this.type === 'accounts') {
      this.accountsService.accountsLoading$.subscribe({
        next: loading => loadingCb(loading),
      });
    } else if (this.type === 'credits') {
      this.accountsService.isLoadingLoans$.subscribe({
        next: loading => loadingCb(loading),
      });
    } else {
      this.loading = { [this.type]: true };
      setTimeout(() => {
        this.loading = { [this.type]: false };
        this.changeDetector.detectChanges();
      }, 1300);
      this.changeDetector.detectChanges();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.type === 'accounts') {
      if (changes?.list) {
        const currentList: any = {};

        changes.list?.currentValue.forEach((element: any) => {
          if (currentList[element.currency]) {
            currentList[element.currency] = [
              +currentList[element.currency] + +element.amount,
            ];
          } else {
            currentList[element.currency] = [element.amount];
          }
        });

        this.amountList = currentList;
        this.changeDetector.detectChanges();
      }
    }
  }

  getTitle(): string {
    switch (this.type) {
      case 'accounts':
        return this.translateService.instant('accounts.accounts');
      case 'cards':
        return this.translateService.instant('accounts.cards');
      case 'deposits':
        return this.translateService.instant('accounts.deposits');
      case 'credits':
        return this.translateService.instant('accounts.credits');
      default:
        return '';
    }
  }

  getButtonLabel(): string {
    switch (this.type) {
      case 'accounts':
        return this.translateService.instant('accounts.createAccount');
      case 'cards':
        return this.translateService.instant('accounts.addCard');
      case 'deposits':
        return this.translateService.instant('accounts.addDeposit');
      case 'credits':
        return this.translateService.instant('accounts.addCredit');
      default:
        return '';
    }
  }

  getTableHeaders(): string[] {
    switch (this.type) {
      case 'accounts':
        return [
          this.translateService.instant('default.nomination'),
          this.translateService.instant('default.accountNumber'),
          this.translateService.instant('status.in-progress'),
          this.translateService.instant('accounts.status.available'),
        ];
      case 'cards':
        return [
          this.translateService.instant('default.nomination'),
          this.translateService.instant('default.cardHolder'),
          this.translateService.instant('status.in-progress'),
          this.translateService.instant('accounts.status.available'),
        ];
      case 'deposits':
        return [
          this.translateService.instant('default.nomination'),
          this.translateService.instant('default.term'),
          this.translateService.instant('accounts.actions.reward'),
          this.translateService.instant('default.amountLower'),
        ];
      case 'credits':
        return [
          this.translateService.instant('default.nomination'),
          this.translateService.instant('products.default.contract-number'),
          this.translateService.instant('default.balanceOwed'),
          this.translateService.instant('operations.payments.payment-date'),
          this.translateService.instant('default.monthsPayment'),
        ];
      default:
        return [];
    }
  }

  getCurrencies() {
    return Object.keys(this.amountList);
  }

  getCurrency(cur: string): string {
    return this.helperService.formatCurrency(cur);
  }

  getFormattedAmount(amount: number) {
    if (amount && amount >= 0) {
      return thousandsSeparator(amount);
    } else {
      return '0,00';
    }
  }

  getStatements() {
    const initialState: any = {
      type: this.type,
      accountsList: this.list,
      isExtended: true,
      modalType: 'statements',
      fileName: this.accStatementTitle[this.type],
    };
    this.modalRef = this.modalService.show(AccountModalComponent, {
      class: 'modal-dialog-centered',
      initialState,
      id: 1,
    }); // TODO ПОДУМАТЬ КАК ПЕРЕДАТЬ ИМЯ ФАЙЛА
  }

  getRequisites() {
    const initialState: any = {
      type: this.type,
      accountsList: this.list,
      isExtended: true,
      modalType: 'requisites',
    };
    this.modalRef = this.modalService.show(AccountModalComponent, {
      class: 'modal-dialog-centered',
      initialState,
      id: 1,
    });
  }
  //Скачать ведомость
  getDepositStatements() {
    const initialState: any = {
      type: this.type,
      accountsList: this.list,
      isExtended: true,
      modalType: 'deposit-statements',
      fileName: this.accStatementTitle['allDepositStatements'],
    };
    this.modalRef = this.modalService.show(AccountModalComponent, {
      class: 'modal-dialog-centered',
      initialState,
      id: 1,
    });
  }

  createAccount() {
    this.router.navigate(['products/create/account']);
  }

  createCard() {
    this.router.navigate(['products/create/business-card']);
  }

  ngOnDestroy(): void {
    this.modalService.hide(1);
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  createDeposit() {
    this.router.navigate(['products/create/deposit'], {
      queryParams: { type: 'express' },
    });
  }
}
