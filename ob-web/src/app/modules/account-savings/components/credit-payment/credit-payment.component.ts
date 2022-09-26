import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { AccountsService } from '@core/services/accounts.service';
import { Subscription } from 'rxjs';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { HelperService } from '@core/services/helper.service';
import { thousandsSeparator } from '@core/helpers';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ob-credit-payment',
  templateUrl: './credit-payment.component.html',
  styleUrls: ['./credit-payment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditPaymentComponent
  extends SubscriptionAccumulator
  implements OnInit, OnChanges
{
  @Input() data: any = null;
  public creditPaymentInfoLoading: boolean = false;

  constructor(
    private accountsService: AccountsService,
    private changeDetector: ChangeDetectorRef,
    private helperService: HelperService,
    private translate: TranslateService
  ) {
    super();
  }

  ngOnInit(): void {
    this.addSubscriber(
      this.accountsService.creditPaymentInfoLoading$.subscribe({
        next: v => {
          this.creditPaymentInfoLoading = v;
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {}

  getNextPaymentDate(): string {
    if (this.data && this.data.paymentDate) {
      let splittedDate = this.data.paymentDate.split('.');
      return (
        splittedDate[0] +
        ' ' +
        this.translate.instant(this.helperService.getMonth(splittedDate[1]))
      );
    } else {
      return '';
    }
  }

  getNextPaymentAmount(): number {
    if (this.data && this.data.amountForPay) {
      return Number(this.data.amountForPay);
    } else {
      return 0;
    }
  }

  getPayedPercent(): number {
    if (this.data && this.data?.sdok) {
      let payedPercent = (this.data.payedOD / this.data.sdok) * 100;
      return payedPercent;
    } else {
      return 0;
    }
  }

  getPendingPercent() {
    if (this.data && this.data?.sdok) {
      let pendingPercent = (this.data.payedOD / this.data.sdok) * 100;
      pendingPercent = 100 - pendingPercent;
      return pendingPercent;
    } else {
      return 100;
    }
  }

  getCurrency(cur: string): string {
    if (cur) {
      return this.helperService.formatCurrency(cur);
    } else {
      return '';
    }
  }

  getFormattedActualBalance(amount: number) {
    if (amount) {
      return thousandsSeparator(amount);
    } else {
      return '0';
    }
  }

  getPaid(index: number): number {
    if (this.data && index) {
      let paidSum: number = 0;
      for (let i: number = 0; i < index; i++) {
        paidSum = paidSum + this.data.scheduleList[i].totalAmount;
      }
      return Number(paidSum.toFixed(2));
    } else {
      return 0;
    }
  }
}
