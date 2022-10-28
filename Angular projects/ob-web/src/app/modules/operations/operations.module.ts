import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TextMaskModule } from 'angular2-text-mask';
import { CodeInputModule } from 'angular-code-input';
import { AccountHistoryModule } from '../account-history/account-history.module';

import { OperationsRoutingModule } from './operations-routing.module';
import { AccountsModule } from '@modules/accounts/accounts.module';
import { SharedModule } from '@shared/shared.module';
import { PaymentFooterComponent } from './components/payment-footer/payment-footer.component';
import { NgxMaskModule } from 'ngx-mask';
import { FormatAmountPipe } from '@app/shared/pipes/format-amount.pipe';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import {
  OperationComponent,
  PaymentComponent,
  TransferComponent,
  CommonPaymentComponent,
  BudgetPaymentComponent,
  UsersListComponent,
  CounteragentPaymentComponent,
  ConfirmationComponent,
  CommonTransferComponent,
  OperationsTableComponent,
  TableHeaderListComponent,
  OperationsComponent,
  A2ATransferComponent,
} from '.';
import { PaymentConfirmationComponent } from './components/payment-confirmation/payment-confirmation.component';
import { SignFooterComponent } from './components/sign-footer/sign-footer.component';
import { PaymentImportModalComponent } from './components/payment-import/payment-import.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';

@NgModule({
  declarations: [
    OperationsComponent,
    OperationComponent,
    BudgetPaymentComponent,
    ConfirmationComponent,
    PaymentComponent,
    TransferComponent,
    CounteragentPaymentComponent,
    UsersListComponent,
    PaymentComponent,
    TransferComponent,
    UsersListComponent,
    CommonPaymentComponent,
    CommonTransferComponent,
    OperationsTableComponent,
    TableHeaderListComponent,
    PaymentFooterComponent,
    A2ATransferComponent,
    PaymentConfirmationComponent,
    SignFooterComponent,
    PaymentImportModalComponent,
    PaymentFooterComponent,
  ],
  imports: [
    CommonModule,
    OperationsRoutingModule,
    SharedModule,
    TabsModule,
    FormsModule,
    ReactiveFormsModule,
    AccountsModule,
    NgSelectModule,
    TranslateModule,
    BsDatepickerModule.forRoot(),
    TextMaskModule,
    CodeInputModule,
    NgxMaskModule.forChild(),
    AccountHistoryModule,
    TooltipModule.forRoot(),
    PaginationModule.forRoot(),
  ],
  exports: [
    OperationsTableComponent,
    TableHeaderListComponent,
    PaymentFooterComponent,
    SignFooterComponent,
  ],
  providers: [FormatAmountPipe],
})
export class OperationsModule {}
