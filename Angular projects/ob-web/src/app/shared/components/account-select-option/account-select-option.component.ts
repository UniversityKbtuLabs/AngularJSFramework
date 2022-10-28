import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { accountStatuses } from '@app/core/constants';
import { getIn, thousandsSeparator } from '@app/core/helpers';
import { HelperService } from '@app/core/services/helper.service';
import { TranslateService } from '@ngx-translate/core';
import { AccountsService } from '@core/services/accounts.service';

@Component({
  selector: 'ob-account-select-option',
  templateUrl: './account-select-option.component.html',
  styleUrls: ['./account-select-option.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountSelectOptionComponent {
  @Input() amount: any = '';
  @Input() description?: string = '';
  @Input() icon?: string = '';
  @Input() account: any;
  @Input() currency: any = '';
  @Input() disabled: boolean = false;
  @Input() lastElement: boolean = true;
  @Input() type: string = '';

  constructor(
    public helperService: HelperService,
    public translate: TranslateService,
    public accountService: AccountsService
  ) {}

  isOpenStatus(account: any) {
    if (getIn(account, 'absState')) {
      if (getIn(account, 'absState').toLowerCase() === accountStatuses.open) {
        return '';
      } else {
        return 'option_img__error';
      }
    } else {
      return '';
    }
  }

  getFormattedAmount(amount: number | string) {
    if (typeof amount === 'string') {
      return amount;
    } else {
      if (amount && amount >= 0) {
        return thousandsSeparator(amount);
      } else {
        return '0,00';
      }
    }
  }
}
