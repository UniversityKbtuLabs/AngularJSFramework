import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountSavingsRoutingModule } from './account-savings-routing.module';
import { DepositComponent } from './components/deposit/deposit.component';
import { DepositInfoComponent } from './components/deposit-info/deposit-info.component';
import { SharedModule } from '@app/shared';
import { CreditComponent } from './components/credit/credit.component';
import { CreditInfoComponent } from './components/credit-info/credit-info.component';
import { TranslateModule } from '@ngx-translate/core';
import { AccountSavingsComponent } from '@modules/account-savings/account-savings.component';
import { SavingsTableComponent } from './components/savings-table/savings-table.component';
import { CreditPaymentComponent } from './components/credit-payment/credit-payment.component';
import { DepositMainComponent } from './components/deposit-main/deposit-main.component';
import { ModalSavingsInfoComponent } from './components/modal-savings-info/modal-savings-info.component';

@NgModule({
  declarations: [
    DepositComponent,
    DepositInfoComponent,
    AccountSavingsComponent,
    CreditComponent,
    CreditInfoComponent,
    SavingsTableComponent,
    CreditPaymentComponent,
    DepositMainComponent,
    ModalSavingsInfoComponent,
  ],
  imports: [
    CommonModule,
    AccountSavingsRoutingModule,
    SharedModule,
    TranslateModule,
  ],
})
export class AccountSavingsModule {}
