import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { thousandsSeparator } from '@app/core/helpers';
import { HelperService } from '@app/core/services/helper.service';

@Component({
  selector: 'ob-select-account',
  templateUrl: './select-account.component.html',
  styleUrls: ['./select-account.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectAccountComponent {
  @Input() title: any = '';
  @Input() description?: string = '';
  @Input() icon?: string = '';
  @Input() currency: string = '';
  @Input() selected: boolean = false;
  @Input() showCurrency: boolean = true;

  constructor(public helperService: HelperService) {}

  getFormattedAmount(amount: number | string) {
    if (typeof amount === 'string') {
      return amount;
    } else {
      if (amount && amount >= 0) {
        return thousandsSeparator(amount);
      } else {
        return '0';
      }
    }
  }
}
