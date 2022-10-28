import { EventListenerFocusTrapInertStrategy } from '@angular/cdk/a11y';
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  HostListener,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import { OperationsService } from '@core/services/operations.service';

@Component({
  selector: 'ob-f-x-currency-select',
  templateUrl: './f-x-currency-select.component.html',
  styleUrls: ['./f-x-currency-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FXCurrencySelectComponent implements OnInit {
  @Input() currecySelectClassName: string = '';
  showBuyDropdown: boolean = false;
  showSellDropdown: boolean = false;
  @ViewChild('currencySell') currencySellRef: ElementRef;
  @ViewChild('currencyBuy') currencyBuyRef: ElementRef;
  currentRates: any[] = [];
  currencyDescriptions: any[] = [];
  currencyTypeList: any[] = [];

  @Output() currencySell = new EventEmitter();
  @Output() currencyBuy = new EventEmitter();
  currencyTypeListSell: any[] = [];
  currencyTypeListBuy: any[] = [];
  currentCurrencySell: any = null;
  currentCurrencyBuy: any = null;

  constructor(
    private operationsService: OperationsService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.operationsService.fxCurrentRates.subscribe(value => {
      this.currentRates = value;
      this.changeDetector.detectChanges();
    });

    this.operationsService.fxCurrencyDescriptions.subscribe(value => {
      this.currencyDescriptions = value;
      this.changeDetector.detectChanges();
    });

    this.operationsService.fxCurrencyTypeList.subscribe(value => {
      this.currencyTypeList = value;
      this.initCurrencyes();
      this.initValues();
      this.changeDetector.detectChanges();
    });
  }

  isShowSellDropdown() {
    this.showSellDropdown = !this.showSellDropdown;
  }

  isShowBuyDropdown() {
    this.showBuyDropdown = !this.showBuyDropdown;
  }

  initCurrencyes() {
    this.currentCurrencySell = null;
    this.currentCurrencyBuy = null;
    for (let i = 0; i < this.currencyTypeList.length; i++) {
      if (this.currencyTypeList[i].code === 'USD') {
        this.currentCurrencySell = this.currencyTypeList[i];
      } else if (this.currencyTypeList[i].code === 'KZT') {
        this.currentCurrencyBuy = this.currencyTypeList[i];
      }
      if (this.currentCurrencySell && this.currentCurrencyBuy) {
        break;
      }
    }
    if (this.currentCurrencySell && !this.currentCurrencyBuy) {
      this.currentCurrencyBuy = this.currencyTypeList.filter(
        item => item !== this.currentCurrencySell
      )[0];
    } else if (!this.currentCurrencySell && this.currentCurrencyBuy) {
      this.currentCurrencySell = this.currencyTypeList.filter(
        item => item !== this.currentCurrencyBuy
      )[0];
    } else if (!this.currentCurrencySell && !this.currentCurrencyBuy) {
      this.currentCurrencySell = this.currencyTypeList[0];
      this.currentCurrencyBuy = this.currencyTypeList[1];
    }
    this.currencySell.emit(this.currentCurrencySell);
    this.currencyBuy.emit(this.currentCurrencyBuy);
  }

  initValues() {
    this.currencyTypeListBuy = [];
    this.currencyTypeListSell = [];
    let availableRatesBuy: any[] = [];
    let availableRatesSell: any[] = [];

    availableRatesSell = this.currentRates.filter(
      item =>
        // item.mainCurrency === this.currentCurrencyBuy.code ||
        item.counterCurrency === this.currentCurrencyBuy.code &&
        item.mainCurrency !== this.currentCurrencySell.code
    );

    availableRatesBuy = this.currentRates.filter(
      item =>
        item.mainCurrency === this.currentCurrencySell.code &&
        item.counterCurrency !== this.currentCurrencyBuy.code
      // || item.counterCurrency === this.currentCurrencySell.code
    );

    availableRatesSell.map(item => {
      if (item.mainCurrency === this.currentCurrencyBuy.code) {
        this.currencyTypeListSell.push({
          code: item.counterCurrency,
          label: item.counterCurrency,
        });
      } else if (item.counterCurrency === this.currentCurrencyBuy.code) {
        this.currencyTypeListSell.push({
          code: item.mainCurrency,
          label: item.mainCurrency,
        });
      }
    });

    availableRatesBuy.map(item => {
      if (item.mainCurrency === this.currentCurrencySell.code) {
        this.currencyTypeListBuy.push({
          code: item.counterCurrency,
          label: item.counterCurrency,
        });
      } else if (item.counterCurrency === this.currentCurrencySell.code) {
        this.currencyTypeListBuy.push({
          code: item.mainCurrency,
          label: item.mainCurrency,
        });
      }
    });
  }

  getCurrencyDescription(item: any) {
    let currencyDescription: any = null;
    if (item && this.currencyDescriptions.length > 0) {
      for (let i: number = 0; i < this.currencyDescriptions.length; i++) {
        if (this.currencyDescriptions[i].isoCode === item.code) {
          currencyDescription = this.currencyDescriptions[i];
          break;
        }
      }
    }
    return currencyDescription;
  }

  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: any): void {
    if (
      !this.currencySellRef?.nativeElement.contains(event.target) &&
      this.currencySellRef
    ) {
      this.showSellDropdown = false;
    }
    if (
      !this.currencyBuyRef?.nativeElement.contains(event.target) &&
      this.currencyBuyRef
    ) {
      this.showBuyDropdown = false;
    }
  }

  changeCurrentSell(item: any) {
    this.currentCurrencySell = item;
    this.showSellDropdown = false;
    this.currencySell.emit(item);
    this.initValues();
  }

  changeCurrentBuy(item: any) {
    this.currentCurrencyBuy = item;
    this.showBuyDropdown = false;
    this.currencyBuy.emit(item);
    this.initValues();
  }

  swapCurrencyes() {
    let helper = this.currentCurrencySell;
    this.currentCurrencySell = this.currentCurrencyBuy;
    this.currentCurrencyBuy = helper;
    this.showSellDropdown = false;
    this.showBuyDropdown = false;
    this.currencySell.emit(this.currentCurrencySell);
    this.currencyBuy.emit(this.currentCurrencyBuy);
    this.initValues();
  }
}
