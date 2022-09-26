import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { AccountHistoryComponent } from './account-history.component';
import { SharedModule } from '@app/shared';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TableModalComponent } from './components/table-modal/table-modal.component';
import { SmallStatusComponent } from './components/small-status/small-status.component';
import { NewDocButtonsComponent } from './components/new-doc-buttons/new-doc-buttons.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { CardStatisticComponent } from './components/card-statistic/card-statistic.component';
import { NgxMaskModule } from 'ngx-mask';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { kkLocale, enGbLocale, ruLocale } from 'ngx-bootstrap/locale';

defineLocale('kk', kkLocale);
defineLocale('en', enGbLocale), defineLocale('ru', ruLocale);

@NgModule({
  declarations: [
    AccountHistoryComponent,
    TableModalComponent,
    SmallStatusComponent,
    NewDocButtonsComponent,
    CardStatisticComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    BsDatepickerModule,
    BsDropdownModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    NgSelectModule,
    PaginationModule.forRoot(),
    NgxMaskModule.forChild(),
  ],
  exports: [AccountHistoryComponent],
})
export class AccountHistoryModule {
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
