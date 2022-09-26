import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { OperationsService } from '@core/services/operations.service';
import { HelperService } from '@core/services/helper.service';
import { errorMessage } from '@core/helpers';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import moment, { Moment } from 'moment';
import { statementRequestDateFormat } from '@app/core/constants';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ob-fx-currencyes-graph',
  templateUrl: './fx-currencyes-graph.component.html',
  styleUrls: ['./fx-currencyes-graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FXCurrencyesGraphComponent implements OnInit {
  currentBank: any = 'onlineBank';
  banks: any[] = [
    { name: 'currencyControl.halykFX.OB', code: 'onlineBank' },
    // {name: "currencyControl.halykFX.NacBank", code: "nacBank"},
  ];

  periodType: any = 'eightHours';
  periodTypeList: any = [
    { code: 'eightHours', label: this.translate.instant('default.eightHours') },
    { code: 'day', label: this.translate.instant('default.upperDay') },
    { code: 'week', label: this.translate.instant('general.time.week') },
    { code: 'month', label: this.translate.instant('general.time.month') },
    { code: 'year', label: this.translate.instant('general.time.year') },
  ];

  startDate: Moment = null;
  startDateMax: Date = new Date();
  public startDateError: boolean = false;
  endDate: Date = new Date();
  endDateMax: Date = new Date();
  public endDateError: boolean = false;

  currencySell: any = null;
  currencyBuy: any = null;
  currencyRates: any[] = [];
  actualCurrencyRate: any = null;

  historyRates: any[] = [];

  constructor(
    private operationsService: OperationsService,
    private changeDetector: ChangeDetectorRef,
    private helperService: HelperService,
    private toastrService: ToastrService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.getCurrencyRates();
  }

  getCurrencyRates() {
    this.operationsService.fxCurrentRates.subscribe(value => {
      this.currencyRates = value;
      this.changeDetector.detectChanges();
    });
  }

  getHistoryRates() {
    this.startDate = moment();
    if (this.periodType === 'eightHours') {
      this.startDate.subtract(8, 'hours');
    } else if (this.periodType === 'day') {
      this.startDate.subtract(1, 'days');
    } else if (this.periodType === 'week') {
      this.startDate.subtract(7, 'days');
    } else if (this.periodType === 'month') {
      this.startDate.subtract(1, 'months');
    } else if (this.periodType === 'year') {
      this.startDate.subtract(1, 'years');
    }
    let date = this.getFormattedDate();
    this.operationsService
      .getHistoryRates(this.actualCurrencyRate?.pairName, date)
      .subscribe(
        value => {
          this.historyRates = value;
          this.operationsService.fxHistoryRates.next(value);
        },
        error => {
          errorMessage(error, this.toastrService);
        }
      );
  }

  onBankChange($event: any) {
    this.currentBank = $event;
  }

  changePeriodType($event: any) {
    this.periodType = $event;
    this.getHistoryRates();
  }

  changeStartDate($event: any) {
    this.startDate = $event;
  }

  changeEndDate($event: any) {
    this.endDate = $event;
  }

  changeCurrencyBuy($event: any) {
    this.currencyBuy = $event;
    if (this.currencySell && this.currencyBuy) {
      this.getActualCurrencyRate();
      this.getHistoryRates();
    }
  }

  changeCurrencySell($event: any) {
    this.currencySell = $event;
    if (this.currencySell && this.currencyBuy) {
      this.getActualCurrencyRate();
      this.getHistoryRates();
    }
  }

  getActualCurrencyRate() {
    if (this.currencySell && this.currencyBuy) {
      for (let i: number = 0; i < this.currencyRates.length; i++) {
        if (
          this.currencyRates[i].mainCurrency === this.currencySell.code &&
          this.currencyRates[i].counterCurrency === this.currencyBuy.code
        ) {
          this.actualCurrencyRate = this.currencyRates[i];
          break;
        }
      }
    }
  }

  getBuyAmount() {
    if (this.actualCurrencyRate) {
      return (
        this.actualCurrencyRate.buyBelow.toFixed(
          this.getNumberOfPrecisionForSum(
            this.actualCurrencyRate.mainCurrency,
            this.actualCurrencyRate.counterCurrency
          )
        ) +
        ' ' +
        this.helperService.formatCurrency(
          this.actualCurrencyRate.counterCurrency
        )
      );
    } else {
      return '';
    }
  }

  getSellAmount() {
    if (this.actualCurrencyRate) {
      return (
        this.actualCurrencyRate.sellBelow.toFixed(
          this.getNumberOfPrecisionForSum(
            this.actualCurrencyRate.mainCurrency,
            this.actualCurrencyRate.counterCurrency
          )
        ) +
        ' ' +
        this.helperService.formatCurrency(
          this.actualCurrencyRate.counterCurrency
        )
      );
    } else {
      return '';
    }
  }

  getNumberOfPrecisionForSum(
    mainCurrency: String,
    counterCurrency: String
  ): number {
    if (
      mainCurrency == 'XAU' ||
      mainCurrency == 'XAG' ||
      counterCurrency == 'XAU' ||
      counterCurrency == 'XAG'
    ) {
      return 3;
    } else {
      return 2;
    }
  }

  getFormattedDate() {
    let date: string = this.startDate.format(statementRequestDateFormat);
    return date;
  }
}
