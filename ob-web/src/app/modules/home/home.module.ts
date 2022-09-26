import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { HomeSearchComponent } from './page/home-search/home-search.component';
import { HomeWelcomeComponent } from './page/home-welcome/home-welcome.component';
import { SharedModule } from '@shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { WelcomeModalComponent } from './components/welcome-modal/welcome-modal.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountsModule } from '../accounts/accounts.module';
import { NotificationCardComponent } from './components/notification-card/notification-card.component';
import { OperationsModule } from '../operations/operations.module';
import { ExchangeModule } from '../exchange/exchange.module';
import { HomeOperationsComponent } from './page/home-operations/home-operations.component';
import { AccountHistoryModule } from '../account-history/account-history.module';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CodeInputModule } from 'angular-code-input';
import { SuccessComponent } from './components/success/success.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { HomeAccountsComponent } from './page/home-accounts/home-accounts.component';
import { AllAccountsModule } from '../all-accounts/all-accounts.module';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { kkLocale, enGbLocale, ruLocale } from 'ngx-bootstrap/locale';

defineLocale('kk', kkLocale);
defineLocale('en', enGbLocale), defineLocale('ru', ruLocale);

@NgModule({
  declarations: [
    HomeComponent,
    HomeSearchComponent,
    HomeWelcomeComponent,
    WelcomeModalComponent,
    NotificationCardComponent,
    HomeOperationsComponent,
    SuccessComponent,
    HomeAccountsComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule,
    TranslateModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    AccountsModule,
    OperationsModule,
    ExchangeModule,
    AccountHistoryModule,
    BsDatepickerModule,
    BsDropdownModule,
    CodeInputModule,
    InfiniteScrollModule,
    AllAccountsModule,
  ],
})
export class HomeModule {
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
