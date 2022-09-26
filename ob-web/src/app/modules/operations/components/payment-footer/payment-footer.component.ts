import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { getNounByNumbers, thousandsSeparator } from '@app/core/helpers';
import { HelperService } from '@core/services/helper.service';
import { OperationsService } from '@app/core/services/operations.service';

@Component({
  selector: 'ob-payment-footer',
  templateUrl: './payment-footer.component.html',
  styleUrls: ['./payment-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentFooterComponent {
  @Input() commission: string = '';
  @Input() sum: string = '';
  @Input() isSave: boolean = false;
  @Input() isSign: boolean = false;
  @Output() toSave = new EventEmitter<boolean>();
  @Output() toSign = new EventEmitter<boolean>();
  @Input() template: any;
  @Input() operationType: string;
  @Input() loading: boolean = false;
  @Input() comissionLoading: boolean = false;
  @Input() saveLoading: boolean = false;
  @Input() convertationDebit: any;
  @Input() convertationCredit: any;
  @Input() showBack: boolean = false;
  @Output() toNext = new EventEmitter<boolean>();
  @Output() toBack = new EventEmitter<boolean>();
  @Input() currency: string = '';
  public isClicked: boolean = false;
  @Input() isTariffConnect: boolean = false;
  @Output() toConnect = new EventEmitter<boolean>();
  @Input() selectedTaRiff: any = null;

  constructor(
    public helperService: HelperService,
    public operationsService: OperationsService
  ) {}

  save(template: any | undefined) {
    this.isClicked = true;
    if (!this.loading && !this.saveLoading) {
      this.toSave.emit(true);
    }
  }

  sign() {
    this.isClicked = true;
    if (!this.loading && !this.comissionLoading) {
      this.toSign.emit(true);
    }
  }

  next() {
    this.toNext.emit(true);
  }

  back() {
    this.toBack.emit(true);
  }

  getFormattedAmount(amount: string) {
    if (amount) {
      const numberedAmount = parseFloat(amount);
      return thousandsSeparator(numberedAmount);
    } else {
      return '0';
    }
  }

  isComission(comission: string) {
    return /\d/.test(comission);
  }

  getCurrency(cur: string): string {
    if (cur) {
      return this.helperService.formatCurrency(cur);
    } else {
      return '';
    }
  }

  connectTariff() {
    this.toConnect.emit(true);
  }

  getTextMonths(month: number) {
    return getNounByNumbers(month, ['месяц', 'месяца', 'месяцев']);
  }
}
