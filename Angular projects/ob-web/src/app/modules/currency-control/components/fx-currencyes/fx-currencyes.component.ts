import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ModalStaffListComponent } from '@app/shared';
import { FXOpenAccountModalComponent } from '@shared/modal_windows/f-x-open-account-modal/f-x-open-account-modal.component';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { OperationsService } from '@core/services/operations.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { HelperService } from '@core/services/helper.service';
import { errorMessage } from '@app/core/helpers';
import { AccountsService } from '@app/core/services/accounts.service';

@Component({
  selector: 'ob-fx-currencyes',
  templateUrl: './fx-currencyes.component.html',
  styleUrls: ['./fx-currencyes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FXCurrencyesComponent
  extends SubscriptionAccumulator
  implements OnInit
{
  currencyType: any = '';
  currencyesTypeList: any[] = [];
  currencyList: any[] = [];
  createAccountCurrencyList: any[] = [];
  currencyDescriptionList: any[] = [];
  modalRef: BsModalRef;
  totalData: any[] = [];
  accountList: any[] = [];

  currentRatesLoading: boolean = false;
  currencyesTypeListLoading: boolean = false;

  constructor(
    private modalService: BsModalService,
    private operationsService: OperationsService,
    private toastrService: ToastrService,
    private changeDetector: ChangeDetectorRef,
    private router: Router,
    private helperService: HelperService,
    private accountsService: AccountsService
  ) {
    super();
  }

  ngOnInit(): void {
    this.getFXCurrentRates();
    this.getCreateAccountCurrencyes();
    this.getCurrencyInfo();
    this.getCurrencyTypeList();
    this.getAccountList();
    this.getFXCurrentRatesLoading();
    this.getCurrencyTypeListLoading();
  }

  changeCurrencyType(type: any) {
    this.currencyType = type;
    this.getRatesForCurrencyType();
  }

  getFXCurrentRates() {
    this.addSubscriber(
      this.operationsService.fxCurrentRates.subscribe(data => {
        this.totalData = data;
        this.changeDetector.detectChanges();
      })
    );
  }

  getFXCurrentRatesLoading() {
    this.addSubscriber(
      this.operationsService.fxCurrentRatesLoading.subscribe(data => {
        this.currentRatesLoading = data;
        this.changeDetector.detectChanges();
      })
    );
  }

  getAccountList() {
    this.addSubscriber(
      this.operationsService.getAccountsList().subscribe(
        (result: any) => {
          this.accountList = [...this.accountList, ...result];
        },
        error => {
          errorMessage(error, this.toastrService);
        }
      )
    );
  }

  //Вытаскиваем список уникальных валют для Tab Select
  getCurrencyTypeList() {
    this.operationsService.fxCurrencyTypeList.subscribe(value => {
      this.currencyesTypeList = value;
      this.currencyType = this.currencyesTypeList[0]?.code;
      this.getRatesForCurrencyType();
      this.changeDetector.detectChanges();
    });
  }

  getCurrencyTypeListLoading() {
    this.operationsService.fxCurrencyTypeListLoading.subscribe(value => {
      this.currencyesTypeListLoading = value;
      this.changeDetector.detectChanges();
    });
  }

  getRatesForCurrencyType() {
    this.currencyList = this.totalData.filter(
      item =>
        item.mainCurrency === this.currencyType ||
        item.counterCurrency === this.currencyType
    );
  }

  getCurrency(item: any): string {
    let currency = '';
    if (item && item.mainCurrency && item.counterCurrency) {
      if (item.mainCurrency === this.currencyType) {
        currency = item.counterCurrency;
      } else if (item.counterCurrency === this.currencyType) {
        currency = item.mainCurrency;
      }
    }
    return currency;
  }

  getBuyAmount(item: any) {
    let buyAmount = 0;
    if (item && item.mainCurrency && item.counterCurrency && item.buyBelow) {
      if (item.mainCurrency === this.currencyType) {
        buyAmount = item.buyBelow;
      } else if (item.counterCurrency === this.currencyType) {
        buyAmount = 1 / item.buyBelow;
      }
    }
    return buyAmount.toFixed(
      this.getNumberOfPrecisionForSum(item.mainCurrency, item.counterCurrency)
    );
  }

  getSellAmount(item: any) {
    let sellAmount = 0;
    if (item && item.mainCurrency && item.counterCurrency && item.sellBelow) {
      if (item.mainCurrency === this.currencyType) {
        sellAmount = item.sellBelow;
      } else if (item.counterCurrency === this.currencyType) {
        sellAmount = 1 / item.sellBelow;
      }
    }
    return sellAmount.toFixed(
      this.getNumberOfPrecisionForSum(item.mainCurrency, item.counterCurrency)
    );
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

  goToConvertationPage(item: any, operation: string) {
    if (this.accountList) {
      let mainCurrencyAccount = null;
      let counterCurrencyAccount = null;
      for (let i = 0; i < this.accountList.length; i++) {
        if (item.mainCurrency === this.accountList[i].currency) {
          mainCurrencyAccount = this.accountList[i];
        } else if (item.counterCurrency === this.accountList[i].currency) {
          counterCurrencyAccount = this.accountList[i];
        }
        if (mainCurrencyAccount && counterCurrencyAccount) {
          break;
        }
      }
      if (mainCurrencyAccount && counterCurrencyAccount) {
        this.router.navigate(['currency-control/convertation'], {
          queryParams: {
            mainCurrency: item.mainCurrency,
            counterCurrency: item.counterCurrency,
            operation: operation,
          },
        });
      } else {
        this.openAccountModal(item);
      }
    }
  }

  openAccountModal(item: any) {
    let initialState: any = {
      currency:
        item.counterCurrency === this.currencyType
          ? item.mainCurrency
          : item.counterCurrency,
    };
    this.modalRef = this.modalService.show(FXOpenAccountModalComponent, {
      class: 'open_fx_account_modal',
      id: 1,
      initialState,
      ignoreBackdropClick: false,
    });
  }

  getCurrencyInfo() {
    this.addSubscriber(
      this.operationsService.fxCurrencyDescriptions.subscribe(data => {
        this.currencyDescriptionList = data;
        this.changeDetector.detectChanges();
      })
    );
  }

  getCurrencyDescription(item: any) {
    let currencyDescription: any = null;
    if (item && this.currencyDescriptionList.length > 0) {
      for (let i: number = 0; i < this.currencyDescriptionList.length; i++) {
        if (
          this.currencyDescriptionList[i].isoCode === this.getCurrency(item)
        ) {
          currencyDescription = this.currencyDescriptionList[i];
          break;
        }
      }
    }
    return currencyDescription;
  }

  formatCurrency(item: any) {
    return this.helperService.formatCurrency(this.getCurrency(item));
  }

  getCreateAccountCurrencyes() {
    this.addSubscriber(
      this.accountsService.getCreateAccountCurrencies().subscribe({
        next: (data: any) => {
          this.createAccountCurrencyList = data;
          this.changeDetector.detectChanges();
        },
        error: (error: any) => {
          errorMessage(error, this.toastrService);
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  canCreateAccount(item: any) {
    let canCreate: boolean = false;
    let hasCounter: boolean = false;
    let hasMain: boolean = false;
    if (
      this.createAccountCurrencyList &&
      this.createAccountCurrencyList.length > 0
    ) {
      for (let i = 0; i < this.createAccountCurrencyList.length; i++) {
        if (
          this.createAccountCurrencyList[i]?.isoCode === item?.counterCurrency
        ) {
          hasCounter = true;
        } else if (
          this.createAccountCurrencyList[i]?.isoCode === item?.mainCurrency
        ) {
          hasMain = true;
        }
        if (hasCounter && hasMain) {
          canCreate = true;
          break;
        }
      }
    }
    return canCreate;
  }
}
