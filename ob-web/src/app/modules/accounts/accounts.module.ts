import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { AccountsComponent } from './accounts.component';
import { SharedModule } from '@shared/shared.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AccountsWrapperComponent } from './components/accounts-wrapper/accounts-wrapper.component';
import { AccountsTableComponent } from './components/accounts-table/accounts-table.component';
import { AccountInfoComponent } from './components/account-info/account-info.component';

import { NewAccountComponent } from './components/new-account/new-account.component';
import { AccountTopupComponent } from './components/account-topup/account-topup.component';
import { TranslateModule } from '@ngx-translate/core';
import { CardListComponent } from './components/card-list/card-list.component';
import { ExchangeModule } from '../exchange/exchange.module';
import { AccountsRoutingModule } from './accounts-routing.module';
@NgModule({
  declarations: [
    AccountsComponent,
    AccountsWrapperComponent,
    AccountsTableComponent,
    AccountInfoComponent,
    NewAccountComponent,
    AccountTopupComponent,
    CardListComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    TabsModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ExchangeModule,
    AccountsRoutingModule,
  ],
  exports: [AccountsComponent],
})
export class AccountsModule {}
