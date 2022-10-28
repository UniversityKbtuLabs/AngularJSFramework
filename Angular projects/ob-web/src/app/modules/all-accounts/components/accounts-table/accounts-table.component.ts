import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { HelperService } from '@app/core/services/helper.service';
import { Router } from '@angular/router';
import { getIn, thousandsSeparator } from '@app/core/helpers';
import { AccountsService } from '@core/services/accounts.service';
import { TranslateService } from '@ngx-translate/core';
import { accountStatuses } from '@app/core/constants';

@Component({
  selector: 'ob-accounts-table',
  templateUrl: './accounts-table.component.html',
  styleUrls: ['./accounts-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsTableComponent {
  @Input() headers: string[];
  @Input() list: any;
  @Input() type: string;
  openStatus: string = '';

  public accountActions: any = [
    {
      name: this.translate.instant('operations.default.paymentToCounterparty'),
      code: 'new-countragent',
    },
    {
      name: this.translate.instant('accounts.actions.top-up'),
      code: 'account-topup',
    },
    {
      name: this.translate.instant('operations.type.Top-up-autokassa'),
      code: 'atm-topup',
    },
    {
      name: this.translate.instant('operations.type.withdraw-autokassa'),
      code: 'atm-withdrawal',
    },
    {
      name: this.translate.instant('operations.type.withdraw-atm-code'),
      code: 'code-withdrawal',
    },
  ];

  public cardActions: any = [
    {
      name: this.translate.instant('accounts.actions.top-up'),
      code: 'account-topup',
    },
    {
      name: this.translate.instant('operations.type.top-up-card'),
      code: 'card-topup',
    },
    {
      name: this.translate.instant('operations.default.transfer-to-account'),
      code: 'account-transfer',
    },
    {
      name: this.translate.instant('operations.default.transfer-to-card'),
      code: 'card-transfer',
    },
  ];

  public depositActions: any = [
    {
      name: this.translate.instant('accounts.actions.top-up-deposit'),
      code: 'deposit-topup',
    },
    {
      name: this.translate.instant('accounts.actions.partial-withdrawal'),
      code: 'partial-withdrawal',
    },
  ];

  constructor(
    public helperService: HelperService,
    public router: Router,
    public accountsService: AccountsService,
    public translate: TranslateService
  ) {}

  getCurrencySymbol(currency: string): string {
    return this.helperService.formatCurrency(currency);
  }

  isOpenStatus(account: any) {
    if (getIn(account, 'absState')) {
      if (getIn(account, 'absState').toLowerCase() === accountStatuses.open) {
        return '';
      } else {
        return 'table_body__img-error';
      }
    } else {
      return '';
    }
  }

  getParsedAmount(type: string, amount: number): string | number {
    if (type === 'amount' && amount) {
      return thousandsSeparator(amount);
      // return this.helperService.formatAmount(amount)
    } else {
      return amount || '0';
    }
  }

  getActions(currency: string = '') {
    switch (this.type) {
      case 'accounts':
        return currency === 'KZT'
          ? this.accountActions
          : this.accountActions.filter(
              (action: any) => action.code !== 'new-countragent'
            );
      case 'cards':
        return this.cardActions;
      case 'deposits':
        return this.depositActions;
      default:
        return this.accountActions;
    }
  }

  getAccountIcon(icon: string, type: string, absState: string) {
    return this.helperService.getAccountIcon(icon, type, this.type, absState);
  }

  getCards() {
    return Object.keys(this.list);
  }

  imgError(event: any) {
    event.target.src = 'assets/icons/tenge_symbol.svg';
  }

  getCardImg(card: string, active: string) {
    if (active === 'N' || active === 'I' || active === 'D') {
      return card[0] === '4'
        ? './assets/icons/visa-disabled.svg'
        : './assets/icons/mastercard-disabled.svg';
    } else {
      return card[0] === '4'
        ? './assets/icons/ic_visa.svg'
        : './assets/icons/ic_master_card.svg';
    }
  }

  navigateToCountragentPage(number: string) {
    this.router.navigate([`operations/payment/counteragent/${number}`]);
  }

  navigateToA2aPayment(number: string) {
    this.router.navigate([`operations/transfer/accounts/${number}`]);
  }

  doActionByCode(action: string, number: string = '') {
    switch (action) {
      case 'new-countragent':
        return this.navigateToCountragentPage(number);
      case 'account-topup':
        return this.navigateToA2aPayment(number);
      default:
        return false;
    }
  }

  navigateToDetails(account: any) {
    if (this.type === 'credits') {
      this.accountsService.previousUrl.next(this.router.url.split('#')[0]);
      this.router.navigate([
        `${this.type.substring(0, this.type.length - 1)}/${account.id}`,
      ]);
    } else if (this.type === 'cards') {
      this.accountsService.previousUrl.next(this.router.url.split('#')[0]);
      this.router.navigate([
        `${this.type.substring(0, this.type.length - 1)}/${account.contractId}`,
      ]);
    } else {
      this.accountsService.previousUrl.next(this.router.url.split('#')[0]);
      this.router.navigate([
        `${this.type.substring(0, this.type.length - 1)}/${account.dictId}`,
      ]);
    }
  }

  navigateCardAccount(id: string | number) {
    this.accountsService.previousUrl.next(this.router.url.split('#')[0]);
    this.router.navigate([`card-account/${id}`]);
  }

  capitalizeName(fullName: string) {
    const words = fullName.toLowerCase().split(' ');
    return words
      .map(word => {
        if (word.includes('.')) {
          return word.toUpperCase();
        } else {
          return word[0].toUpperCase() + word.substring(1);
        }
      })
      .join(' ');
  }

  getDate(date: string) {
    if (date) {
      let splittedDate: string[] = date.split('.');
      let day = splittedDate[0];
      return (
        (day[0] === '0' ? day[1] : day) +
        ' ' +
        this.translate.instant(this.helperService.getMonth(splittedDate[1]))
      );
    } else {
      return '';
    }
  }

  getPayDate(date: string) {
    if (date) {
      let currentDate: Date = new Date();
      let month =
        currentDate.getMonth() + 1 > 9
          ? String(currentDate.getMonth() + 1)
          : '0' + String(currentDate.getMonth() + 1);
      return (
        'до ' +
        date +
        ' ' +
        this.translate.instant(this.helperService.getMonth(month))
      );
    } else {
      return '';
    }
  }
}
