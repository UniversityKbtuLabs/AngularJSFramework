import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyControlComponent } from './currency-control.component';
import { CurrencyControlRoutingModule } from './currency-control-routing.modules';
import { TranslateModule } from '@ngx-translate/core';
import { LastEventsComponent } from './components/last-events/last-events.component';
import { CurrencyControlDescriptionComponent } from '@modules/currency-control/components/currency-control-description/currency-control-description.component';
import { SharedModule } from '@app/shared';
import { AccountHistoryModule } from '@modules/account-history/account-history.module';
import { ExchangeModule } from '@modules/exchange/exchange.module';
import { ConvertationComponent } from './pages/convertation/convertation.component';
import { OperationsModule } from '@modules/operations';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { TextMaskModule } from 'angular2-text-mask';
import { FXAddTradingSignalComponent } from './components/fx-add-trading-signal/fx-add-trading-signal.component';
import { FXTradingSignalTableComponent } from './components/fx-trading-signal-table/fx-trading-signal-table.component';
import { FXCurrencyesGraphComponent } from './components/fx-currencyes-graph/fx-currencyes-graph.component';
import { FXPageComponent } from './pages/fx-page/fx-page.component';
import { FXCurrencyesComponent } from './components/fx-currencyes/fx-currencyes.component';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { HistogramComponent } from './components/histogram/histogram.component';
import { FXCurrencySelectComponent } from './components/f-x-currency-select/f-x-currency-select.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ContractListComponent } from './components/contract-list/contract-list.component';
import { ContactListTableComponent } from './components/contact-list-table/contact-list-table.component';
import { ContractCreationComponent } from './pages/contract-creation/contract-creation.component';
import { ConfirmationComponent } from './components/confirmation/confirmation.component';
import { CurrencyTransferComponent } from './components/currency-transfer/currency-transfer.component';

import { defineLocale } from 'ngx-bootstrap/chronos';
import { kkLocale, enGbLocale, ruLocale } from 'ngx-bootstrap/locale';

defineLocale('kk', kkLocale);
defineLocale('en', enGbLocale), defineLocale('ru', ruLocale);

@NgModule({
  declarations: [
    CurrencyControlComponent,
    CurrencyControlDescriptionComponent,
    LastEventsComponent,
    ConvertationComponent,
    FXAddTradingSignalComponent,
    FXTradingSignalTableComponent,
    FXCurrencyesGraphComponent,
    FXPageComponent,
    FXCurrencyesComponent,
    HistogramComponent,
    FXCurrencySelectComponent,
    ContractListComponent,
    ContactListTableComponent,
    ContractCreationComponent,
    ConfirmationComponent,
    CurrencyTransferComponent,
  ],
  imports: [
    CommonModule,
    CurrencyControlRoutingModule,
    TranslateModule,
    SharedModule,
    AccountHistoryModule,
    ExchangeModule,
    OperationsModule,
    NgSelectModule,
    ReactiveFormsModule,
    NgxMaskModule.forChild(),
    TextMaskModule,
    BsDatepickerModule,
    FormsModule,
    TooltipModule.forRoot(),
    BsDropdownModule,
    PaginationModule.forRoot(),
    BsDatepickerModule.forRoot(),
  ],
})
export class CurrencyControlModule {
  constructor(private bsLocaleService: BsLocaleService) {
    if (localStorage.getItem('locale') === 'kk') {
      this.bsLocaleService.use('kk');
    } else if (localStorage.getItem('locale') === 'en') {
      this.bsLocaleService.use('en');
    } else {
      this.bsLocaleService.use('ru');
    }
  }
}
