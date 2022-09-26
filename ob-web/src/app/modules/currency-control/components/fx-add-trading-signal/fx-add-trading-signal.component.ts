import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { errorMessage, successMessage } from '@core/helpers';
import { OperationsService } from '@app/core/services/operations.service';
import { HelperService } from '@app/core/services/helper.service';
import { TranslateService } from '@ngx-translate/core';
import { EventListenerFocusTrapInertStrategy } from '@angular/cdk/a11y';
import { isThisTypeNode } from 'typescript';
import { ToastrService } from 'ngx-toastr';
import { SubscriptionAccumulator } from '@app/core/helpers/SubscriptionAccumulator';

@Component({
  selector: 'ob-fx-add-trading-signal',
  templateUrl: './fx-add-trading-signal.component.html',
  styleUrls: ['./fx-add-trading-signal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FXAddTradingSignalComponent
  extends SubscriptionAccumulator
  implements OnInit
{
  addSignalForm: FormGroup;
  trackingDate: Date = new Date();
  public periodError: boolean = false;

  currencySell: any = null;
  currencyBuy: any = null;
  currencyRates: any[] = [];
  currencyRatesLoading: boolean = false;
  actualCurrencyRateBuy: any = null;
  actualCurrencyRateSell: any = null;

  constructor(
    private fb: FormBuilder,
    private operationsService: OperationsService,
    private changeDetector: ChangeDetectorRef,
    private helperService: HelperService,
    private translateService: TranslateService,
    private toastr: ToastrService
  ) {
    super();
    this.addSignalForm = this.fb.group({
      expectedAmount: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.getCurrencyRates();
  }

  getCurrencyRates() {
    this.operationsService.fxCurrentRates.subscribe(value => {
      this.currencyRates = value;
      this.changeDetector.detectChanges();
    });
  }

  getCurrencyRatesLoading() {
    this.operationsService.fxCurrentRatesLoading.subscribe(value => {
      this.currencyRatesLoading = value;
      this.changeDetector.detectChanges();
    });
  }

  changeCurrencyBuy($event: any) {
    this.currencyBuy = $event;
    if (this.currencySell && this.currencyBuy) {
      this.getActualCurrencyRate();
    }
  }

  changeCurrencySell($event: any) {
    this.currencySell = $event;
    if (this.currencySell && this.currencyBuy) {
      this.getActualCurrencyRate();
    }
  }

  getActualCurrencyRate() {
    if (this.currencySell && this.currencyBuy) {
      for (let i: number = 0; i < this.currencyRates.length; i++) {
        if (
          this.currencyRates[i].mainCurrency === this.currencySell.code &&
          this.currencyRates[i].counterCurrency === this.currencyBuy.code
        ) {
          this.actualCurrencyRateBuy = this.currencyRates[i];
          this.addSignalFormControl.expectedAmount.setValue(
            this.actualCurrencyRateBuy.buyMarket
          );
          this.actualCurrencyRateSell = null;
          break;
        } else if (
          this.currencyRates[i].mainCurrency === this.currencyBuy.code &&
          this.currencyRates[i].counterCurrency === this.currencySell.code
        ) {
          this.actualCurrencyRateSell = this.currencyRates[i];
          this.addSignalFormControl.expectedAmount.setValue(
            this.actualCurrencyRateBuy.sellMarket
          );
          this.actualCurrencyRateBuy = null;
          break;
        }
      }
    }
  }

  changeDate(date: any) {
    if (date?.toString() === 'Invalid Date' || !event) {
      this.trackingDate = null; //очищает поле если не валидная дата
      return;
    } else {
      this.trackingDate = date;
    }
  }

  formatCurrecyForPlaceholder() {
    let translated = this.translateService.instant(
      'currencyControl.halykFX.expectedSum'
    );
    let currency =
      this.actualCurrencyRateSell?.mainCurrency ||
      this.actualCurrencyRateBuy?.mainCurrency;
    return translated + ' 1 ' + this.helperService.formatCurrency(currency);
  }

  formatCurrecyForInput() {
    let currency =
      this.actualCurrencyRateSell?.counterCurrency ||
      this.actualCurrencyRateBuy?.counterCurrency;
    return ' ' + this.helperService.formatCurrency(currency);
  }

  get addSignalFormControl() {
    return this.addSignalForm.controls;
  }

  addTradingSignal() {
    let requestBody: any = {};
    if (
      !this.actualCurrencyRateSell &&
      this.actualCurrencyRateBuy &&
      !this.trackingDate
    ) {
      requestBody = this.getRequestBody('buy');
    } else if (
      this.actualCurrencyRateSell &&
      !this.actualCurrencyRateBuy &&
      !this.trackingDate
    ) {
      requestBody = this.getRequestBody('sell');
    } else if (
      !this.actualCurrencyRateSell &&
      this.actualCurrencyRateBuy &&
      this.trackingDate
    ) {
      requestBody = this.getRequestBody('buy_with_date');
    } else if (
      this.actualCurrencyRateSell &&
      !this.actualCurrencyRateBuy &&
      this.trackingDate
    ) {
      requestBody = this.getRequestBody('sell_with_date');
    }
    this.sendRequest(requestBody);
  }

  getRequestBody(type: string) {
    switch (type) {
      case 'buy':
        return {
          buyRate: this.addSignalFormControl.expectedAmount.value,
          counterCurrency: this.actualCurrencyRateBuy.counterCurrency,
          mainCurrency: this.actualCurrencyRateBuy.mainCurrency,
        };

      case 'sell':
        return {
          sellRate: this.addSignalFormControl.expectedAmount.value,
          counterCurrency: this.actualCurrencyRateSell.counterCurrency,
          mainCurrency: this.actualCurrencyRateSell.mainCurrency,
        };

      case 'buy_with_date':
        return {
          buyRate: this.addSignalFormControl.expectedAmount.value,
          counterCurrency: this.actualCurrencyRateBuy.counterCurrency,
          mainCurrency: this.actualCurrencyRateBuy.mainCurrency,
          expirationDate: this.formatTrackingDate(),
        };
      case 'sell_with_date':
        return {
          sellRate: this.addSignalFormControl.expectedAmount.value,
          counterCurrency: this.actualCurrencyRateSell.counterCurrency,
          mainCurrency: this.actualCurrencyRateSell.mainCurrency,
          expirationDate: this.formatTrackingDate(),
        };
      default:
        return '';
    }
  }

  formatTrackingDate() {
    return (
      this.trackingDate.getFullYear() +
      '-' +
      (this.trackingDate.getMonth() > 10
        ? this.trackingDate.getMonth() + 1
        : '0' + (this.trackingDate.getMonth() + 1)) +
      '-' +
      (this.trackingDate.getDate() > 10
        ? this.trackingDate.getDate()
        : '0' + this.trackingDate.getDate())
    );
  }

  sendRequest(body: any) {
    this.operationsService.addFXTradingSignal(body).subscribe(
      val => {
        successMessage('сигнал успешно добавлен', this.toastr);
        this.addSubscriber(
          this.operationsService.getFXTradingSignals().subscribe({
            next: (value: any) => {
              this.operationsService.fxTradingSignals.next(value);
            },
            error: (err: any) => {
              errorMessage(err, this.toastr);
            },
          })
        );
      },
      err => {
        errorMessage(err, this.toastr);
      }
    );
  }
}
