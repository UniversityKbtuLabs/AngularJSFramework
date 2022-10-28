import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { HelperService } from '@app/core/services/helper.service';
import { IAccountInfo } from '@app/data/models/account-types';
import { AccountsService } from '@app/core/services/accounts.service';
import { thousandsSeparator } from '@app/core/helpers';

@Component({
  selector: 'ob-card-statistic',
  templateUrl: './card-statistic.component.html',
  styleUrls: ['./card-statistic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardStatisticComponent {
  @Input() accountData: any;

  constructor(
    public helperService: HelperService,
    public accountService: AccountsService
  ) {}

  getCurrentMonth(): string {
    const date = new Date().getMonth();

    return this.helperService.months[date];
  }

  formatAmount(amount: number) {
    return thousandsSeparator(amount);
  }

  getSubtitle(type: 'in' | 'out' | 'inReminder' | 'outReminder'): string {
    const types = {
      in: ['+', this.accountData?.turnCredit],
      out: ['-', this.accountData?.turnDebit],
      inReminder: ['', this.accountData?.incomingBalance],
      outReminder: ['', this.accountData?.outgoingBalance],
    };

    const rawAmount = types[type][1] || 0;
    const amount = this.formatAmount(rawAmount).replaceAll(/\s/g, '  ');
    return `${types[type][0]} ${amount}`;
  }
}
