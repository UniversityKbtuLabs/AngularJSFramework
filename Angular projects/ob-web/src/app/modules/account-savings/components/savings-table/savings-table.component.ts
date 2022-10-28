import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { AccountsService } from '@core/services/accounts.service';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { HelperService } from '@core/services/helper.service';
import { thousandsSeparator } from '@core/helpers';

@Component({
  selector: 'ob-savings-table',
  templateUrl: './savings-table.component.html',
  styleUrls: ['./savings-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SavingsTableComponent
  extends SubscriptionAccumulator
  implements OnInit
{
  @Input() scheduleList: any[] = [];
  @Input() creditDetails: any = null;
  @Input() type: string = '';
  @Input() id: number = 0;
  public creditPaymentInfoLoading: boolean = false;
  public totalCreditAmountWithPercent: number = 0;

  constructor(
    private accountsService: AccountsService,
    private changeDetector: ChangeDetectorRef,
    private helperService: HelperService
  ) {
    super();
  }

  ngOnInit(): void {
    this.addSubscriber(
      this.accountsService.creditPaymentInfoLoading$.subscribe({
        next: v => {
          this.creditPaymentInfoLoading = v;
          if (!v) {
            this.scheduleList.forEach(p => {
              this.totalCreditAmountWithPercent += p.totalAmount;
            });
          }
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  getCurrency(cur: string): string {
    if (cur) {
      return this.helperService.formatCurrency(cur);
    } else {
      return '';
    }
  }

  getPaid(index: number): number {
    if (this.scheduleList) {
      let paidSum: number = this.totalCreditAmountWithPercent;
      for (let i: number = 0; i <= index; i++) {
        paidSum -= this.scheduleList[i].totalAmount;
      }
      return Number(paidSum.toFixed(2));
    } else {
      return 0;
    }
  }

  getFormattedActualBalance(amount: number) {
    if (amount) {
      return thousandsSeparator(amount);
    } else {
      return '0';
    }
  }
}
