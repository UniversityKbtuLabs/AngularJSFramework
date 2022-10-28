import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CodeInputModule } from 'angular-code-input';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AgGridModule } from 'ag-grid-angular';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import {
  BsDatepickerModule,
  BsDatepickerConfig,
  BsLocaleService,
} from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxMaskModule } from 'ngx-mask';
import { SettingsShowUserDialogComponent } from './modal_windows/settings-show-user-dialog/settings-show-user-dialog.component';
import { StgSwitchComponent } from './components/stg-switch/stg-switch.component';

import {
  LabelWithIconComponent,
  TableComponent,
  BackButtonComponent,
  InputCalendarComponent,
  ModalComponent,
  ButtonComponent,
  InputComponent,
  TariffsConditionsComponent,
  InstructionStepComponent,
  DropdownComponent,
  SlideModalComponent,
  MailFormComponent,
  AccountSelectOptionComponent,
  SuccessRequestComponent,
  OperationsFilterComponent,
  TabSelectsComponent,
  ModalDischargeComponent,
  LoaderComponent,
  DropdownButtonComponent,
  CollapseComponent,
  CustomCardComponent,
  AccountV2Directive,
  NewAmountMaskDirective,
  FormatAmountPipe,
  AmountPipe,
  ReversePipe,
  AccountNumberPipe,
  AccountListSorter,
  InfoBlockComponent,
  KnpCbcComponent,
  OperationStatusComponent,
  ContactComponent,
  PushComponent,
  FooterComponent,
  ModalAddStaffComponent,
  ModalStaffListComponent,
  SmsModalComponent,
  SelectAccountComponent,
  ConfirmModalComponent,
  BlockedCardComponent,
  CounteragentListComponent,
} from '.';
import { FieldErrorDisplayComponent } from './components/field-error-display/field-error-display.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { SettingsLeftBarComponent } from './components/settings-left-bar/settings-left-bar.component';
import { SumLengthDirective } from './directives/sum-length.directive';
import { DocNumberPaymentDirective } from './directives/doc-number-payment.directive';
import { KnpComponent } from './components/knp/knp.component';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { StgUserTableComponent } from './components/stg-user-table/stg-user-table.component';
import { StgEmployeeTableComponent } from './components/stg-employee-table/stg-employee-table.component';
import { StgCounteragentTableComponent } from './components/stg-counteragent-table/stg-counteragent-table.component';
import { ModalOperationsMainComponent } from './components/modal-operations-main/modal-operations-main.component';
import { AdvertisingCardComponent } from './components/advertising-card/advertising-card.component';
import { OperationActionsComponent } from './components/operation-actions/operation-actions.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { CheckIconDirective } from './directives/check-icon.directive';
import { SettingsComponent } from './components/settings/settings.component';
import { SettingsItemComponent } from './components/settings-item/settings-item.component';
import { TableEmptyRowsComponent } from '@shared/components/table-empty-rows/table-empty-rows.component';
import { LastOperationComponent } from './components/last-operation/last-operation.component';
import { CardComponent } from './components/card/card.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { BadgeComponent } from './components/badge/badge';
import { FXOpenAccountModalComponent } from './modal_windows/f-x-open-account-modal/f-x-open-account-modal.component';
import { FXEditTradingSignalModalComponent } from './modal_windows/f-x-edit-trading-signal-modal/f-x-edit-trading-signal-modal.component';
import { CurrencyCardComponent } from './components/currency-card/currency-card.component';

import { kkLocale, enGbLocale, ruLocale } from 'ngx-bootstrap/locale';

defineLocale('kk', kkLocale);
defineLocale('en', enGbLocale), defineLocale('ru', ruLocale);

@NgModule({
  declarations: [
    LabelWithIconComponent,
    TableComponent,
    BackButtonComponent,
    InputCalendarComponent,
    ModalComponent,
    ButtonComponent,
    DropdownComponent,
    SlideModalComponent,
    MailFormComponent,
    InputComponent,
    AccountSelectOptionComponent,
    SuccessRequestComponent,
    TariffsConditionsComponent,
    OperationsFilterComponent,
    TabSelectsComponent,
    ModalDischargeComponent,
    InstructionStepComponent,
    LoaderComponent,
    DropdownButtonComponent,
    CollapseComponent,
    CustomCardComponent,
    AccountV2Directive,
    FormatAmountPipe,
    NewAmountMaskDirective,
    InfoBlockComponent,
    InfoBlockComponent,
    KnpCbcComponent,
    OperationStatusComponent,
    ContactComponent,
    OperationStatusComponent,
    ContactComponent,
    PushComponent,
    FooterComponent,
    SmsModalComponent,
    AmountPipe,
    ReversePipe,
    AccountNumberPipe,
    AccountListSorter,
    SelectAccountComponent,
    ModalAddStaffComponent,
    ModalStaffListComponent,
    FieldErrorDisplayComponent,
    TabsComponent,
    ConfirmModalComponent,
    SettingsLeftBarComponent,
    SettingsShowUserDialogComponent,
    StgSwitchComponent,
    SumLengthDirective,
    DocNumberPaymentDirective,
    KnpComponent,
    TooltipComponent,
    KnpComponent,
    StgUserTableComponent,
    StgEmployeeTableComponent,
    StgCounteragentTableComponent,
    ModalOperationsMainComponent,
    AdvertisingCardComponent,
    OperationActionsComponent,
    ErrorPageComponent,
    CheckIconDirective,
    SettingsComponent,
    SettingsItemComponent,
    TableEmptyRowsComponent,
    LastOperationComponent,
    LastOperationComponent,
    TableEmptyRowsComponent,
    CardComponent,
    BadgeComponent,
    FXOpenAccountModalComponent,
    FXEditTradingSignalModalComponent,
    CurrencyCardComponent,
    BlockedCardComponent,
    CounteragentListComponent,
  ],
  imports: [
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CommonModule,
    NgSelectModule,
    TabsModule,
    AgGridModule.withComponents([]),
    BsDatepickerModule.forRoot(),
    ModalModule,
    ButtonsModule,
    BsDropdownModule.forRoot(),
    RouterModule,
    InfiniteScrollModule,
    CodeInputModule,
    NgxMaskModule.forChild(),
    PaginationModule.forRoot(),
  ],
  providers: [
    BsModalService,
    BsDatepickerConfig,
    DecimalPipe,
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    AmountPipe,
  ],
  exports: [
    LabelWithIconComponent,
    TableComponent,
    BackButtonComponent,
    InputCalendarComponent,
    ModalComponent,
    ButtonComponent,
    DropdownComponent,
    SlideModalComponent,
    AccountSelectOptionComponent,
    SuccessRequestComponent,
    InstructionStepComponent,
    InputComponent,
    LoaderComponent,
    DropdownButtonComponent,
    CollapseComponent,
    CustomCardComponent,
    FormatAmountPipe,
    AccountV2Directive,
    NewAmountMaskDirective,
    InfoBlockComponent,
    KnpCbcComponent,
    ContactComponent,
    PushComponent,
    FooterComponent,
    AmountPipe,
    TabSelectsComponent,
    ReversePipe,
    AccountNumberPipe,
    AccountListSorter,
    SelectAccountComponent,
    ModalAddStaffComponent,
    ModalStaffListComponent,
    SmsModalComponent,
    FieldErrorDisplayComponent,
    TabsComponent,
    ConfirmModalComponent,
    SettingsLeftBarComponent,
    SettingsShowUserDialogComponent,
    StgSwitchComponent,
    SumLengthDirective,
    DocNumberPaymentDirective,
    KnpComponent,
    TooltipComponent,
    KnpComponent,
    StgCounteragentTableComponent,
    StgUserTableComponent,
    StgEmployeeTableComponent,
    AdvertisingCardComponent,
    ErrorPageComponent,
    CheckIconDirective,
    SettingsComponent,
    TableEmptyRowsComponent,
    LastOperationComponent,
    CardComponent,
    BadgeComponent,
    CurrencyCardComponent,
  ],
})
export class SharedModule {
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
