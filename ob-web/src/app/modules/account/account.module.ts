/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountComponent } from './account.component';
import { SharedModule } from '@shared/shared.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AccountRoutingModule } from './account-routing.module';
import { CardInfoComponent } from './components/card-info/card-info.component';
import { OperationsModule } from '../operations/operations.module';
import { TranslateModule } from '@ngx-translate/core';
import { AccountHistoryModule } from '../account-history/account-history.module';
import { RequisitesModalComponent } from './components/requisites-modal/requisites-modal.component';
import { FormsModule } from '@angular/forms';
import { AccountInfoComponent } from './components/account-info/account-info.component';
import { StatusModalComponent } from './components/status-modal/status-modal.component';

@NgModule({
  declarations: [
    AccountComponent,
    CardInfoComponent,
    RequisitesModalComponent,
    AccountInfoComponent,
    StatusModalComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    TabsModule,
    AccountRoutingModule,
    OperationsModule,
    TranslateModule,
    AccountHistoryModule,
    FormsModule,
  ],
})
export class AccountModule {}
