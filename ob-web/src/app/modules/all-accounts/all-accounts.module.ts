import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllAccountsComponent } from './all-accounts.component';
import { SharedModule } from '@app/shared';
import { TranslateModule } from '@ngx-translate/core';
import { AccountsTableComponent } from './components/accounts-table/accounts-table.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { EmptyAccountsComponent } from './components/empty-accounts/empty-accounts.component';
import { AccountModalComponent } from './components/account-modal/account-modal.component';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { kkLocale, enGbLocale, ruLocale } from 'ngx-bootstrap/locale';

defineLocale('kk', kkLocale);
defineLocale('en', enGbLocale), defineLocale('ru', ruLocale);

@NgModule({
  declarations: [
    AllAccountsComponent,
    AccountsTableComponent,
    AccountModalComponent,
    EmptyAccountsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    BsDropdownModule,
    BsDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
  ],
  exports: [AllAccountsComponent],
})
export class AllAccountsModule {
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
