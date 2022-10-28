import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { OperationsService } from '@core/services/operations.service';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { errorMessage } from '@core/helpers';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ob-fx-page',
  templateUrl: './fx-page.component.html',
  styleUrls: ['./fx-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FXPageComponent extends SubscriptionAccumulator implements OnInit {
  constructor(
    private operationsService: OperationsService,
    private toastrService: ToastrService
  ) {
    super();
  }

  ngOnInit(): void {
    this.operationsService.fxCurrentRatesLoading.next(true);
    this.operationsService.fxCurrencyDescriptionsLoading.next(true);
    this.operationsService.fxTradingSignalsLoading.next(true);
    this.operationsService.fxCurrencyTypeListLoading.next(true);

    this.addSubscriber(
      this.operationsService.getFXCurrentRates().subscribe({
        next: (value: any) => {
          this.operationsService.fxCurrentRates.next(value);
          this.operationsService.fxCurrencyTypeList.next(
            this.getCurrencyTypeList(value)
          );
          this.operationsService.fxCurrentRatesLoading.next(false);
          this.operationsService.fxCurrencyTypeListLoading.next(false);
        },
        error: (err: any) => {
          errorMessage(err, this.toastrService);
          this.operationsService.fxCurrentRatesLoading.next(false);
          this.operationsService.fxCurrencyTypeListLoading.next(false);
        },
      })
    );

    this.addSubscriber(
      this.operationsService.getFXCurrencyInfo().subscribe({
        next: (value: any) => {
          this.operationsService.fxCurrencyDescriptions.next(value);
          this.operationsService.fxCurrencyDescriptionsLoading.next(false);
        },
        error: (err: any) => {
          errorMessage(err, this.toastrService);
          this.operationsService.fxCurrencyDescriptionsLoading.next(false);
        },
      })
    );

    this.addSubscriber(
      this.operationsService.getFXTradingSignals().subscribe({
        next: (value: any) => {
          this.operationsService.fxTradingSignals.next(value);
          this.operationsService.fxTradingSignalsLoading.next(false);
        },
        error: (err: any) => {
          errorMessage(err, this.toastrService);
          this.operationsService.fxTradingSignalsLoading.next(false);
        },
      })
    );
  }

  //Вытаскиваем список уникальных валют для Tab Select
  getCurrencyTypeList(data: any[]) {
    let uniqueList: any[] = [];
    for (let i: number = 0; i < data.length; i++) {
      if (i === 0) {
        uniqueList.push({
          code: data[i].mainCurrency,
          label: data[i].mainCurrency,
        });
        uniqueList.push({
          code: data[i].counterCurrency,
          label: data[i].counterCurrency,
        });
      } else {
        let isUniqueMainCurrency: boolean = true;
        let isUniqueCounterCurrency: boolean = true;
        for (let j: number = 0; j < uniqueList.length; j++) {
          if (data[i].mainCurrency === uniqueList[j].code) {
            isUniqueMainCurrency = false;
          }
          if (data[i].counterCurrency === uniqueList[j].code) {
            isUniqueCounterCurrency = false;
          }
        }
        if (isUniqueMainCurrency === true) {
          uniqueList.push({
            code: data[i].mainCurrency,
            label: data[i].mainCurrency,
          });
        }
        if (isUniqueCounterCurrency === true) {
          uniqueList.push({
            code: data[i].counterCurrency,
            label: data[i].counterCurrency,
          });
        }
      }
    }
    return uniqueList;
  }
}
