import {
  Component,
  ChangeDetectionStrategy,
  Input,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { Router } from '@angular/router';

import { IFormattedAccounts } from '@data/models/account-types';
import { HelperService } from '@core/services/helper.service';
import { AccountsService } from '@core/services/accounts.service';
import { thousandsSeparator } from '@app/core/helpers';

@Component({
  selector: 'ob-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardListComponent implements OnChanges {
  @Input() title: string = '';
  @Input() list: IFormattedAccounts[] = [];
  @Input() type: string = '';
  @Input() loading: boolean | null = false;
  @Input() disabled: boolean = false;
  @Input() className: string = 'all-accounts';
  @Input() isError: boolean = false;

  public active: boolean = true;
  public addNew: boolean = false;

  constructor(
    private router: Router,
    public helperService: HelperService,
    public accountsService: AccountsService
  ) {
    this.navigateToPage = this.navigateToPage.bind(this);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.list) {
      this.list = changes.list?.currentValue;
      this.addNew = this.list.length < 1 && this.type !== 'all-accounts';
    }
  }

  formatIban(iban: string): string {
    if (this.type === 'cards') {
      return this.helperService.formatIban(iban, this.type);
    } else {
      return this.helperService.formatIban(iban);
    }
  }

  // formatAmount(amount: number, currency: string) {
  // return amount.toLocaleString('fr', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ` ${this.helperService.formatCurrency(currency)}`
  // const parsed = `${this.helperService.formatAmount(amount)} ${this.helperService.formatCurrency(currency)}`

  // return parsed.includes(',') ? parsed.split(',') : [parsed.slice(0, -1), parsed.slice(-1)]
  // }

  getIcon(account: any): string {
    if (this.type === 'cards') {
      if (
        account.status === 'N' ||
        account.status === 'I' ||
        account.status === 'D'
      ) {
        return this.helperService.getCardIcon(account.number, true);
      } else {
        return this.helperService.getCardIcon(account.number, false);
      }
    } else if (this.type === 'deposits') {
      return 'assets/icons/main_deposit.svg';
    } else if (this.type === 'credits') {
      return 'assets/icons/credit.svg';
    } else {
      return this.helperService.getAccountIcon(
        account.currency,
        account.status
      );
    }
  }

  addNewText(): string {
    switch (this.type) {
      case 'accounts':
        return 'accounts.addAccount';
      case 'cards':
        return 'accounts.addCard';
      case 'deposits':
        return 'accounts.addDeposit';
      case 'credits':
        return 'accounts.addCredit';
      default:
        return 'default.open';
    }
  }

  navigateToPage(id: number) {
    if (!this.disabled) {
      this.accountsService.previousUrl.next(this.router.url);
      this.router.navigate([`${this.type.slice(0, -1)}/${id}`]);
    }
  }

  getAmount(account: any) {
    // return this.formatAmount(account.amount, account.currency)
    // if (account.amount >= 0) {
    // 	return thousandsSeparator(account.amount) + ` ${this.helperService.formatCurrency(account.currency)}`
    // } else {
    // 	return ''
    // }
    return thousandsSeparator(account.amount);
  }

  getCurrency(account: any) {
    // return this.formatAmount(account.amount, account.currency)
    // if (account.amount >= 0) {
    // 	return thousandsSeparator(account.amount) + ` ${this.helperService.formatCurrency(account.currency)}`
    // } else {
    // 	return ''
    // }
    return this.helperService.formatCurrency(account.currency);
  }

  getDescription(account: any) {
    if (this.type === 'cards') {
      return (
        this.capitalizeName(account.label) +
        ' ' +
        this.formatIban(account.number)
      );
    } else if (this.type === 'deposits' || this.type === 'accounts') {
      return account.label;
    } else {
      return this.formatIban(account.label);
    }
  }

  getAddNewIcon(): string {
    switch (this.type) {
      case 'cards':
        return 'assets/icons/add_card.svg';
        break;
      case 'credits':
        return 'assets/icons/add_credit.svg';
        break;
      case 'deposits':
        return 'assets/icons/add_deposit.svg';
        break;
      default:
        return 'assets/icons/add.svg';
        break;
    }
  }

  redirectTo() {
    this.router.navigateByUrl('accounts', { state: { type: this.type } });
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
}
