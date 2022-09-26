import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CodeInputModule } from 'angular-code-input';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { AccountsModule } from '@modules/accounts/accounts.module';
import { TextMaskModule } from 'angular2-text-mask';
import { NgxMaskModule } from 'ngx-mask';
import { AccountHistoryModule } from '@modules/account-history/account-history.module';
import { GuaranteesRoutingModule } from '@modules/guarantees/guarantees-routing.module';
import { GuaranteeComponent } from '@modules/guarantees/page/guarantee/guarantee.component';
import { GuaranteesMainComponent } from './page/guarantees-main/guarantees-main.component';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { kkLocale, enGbLocale, ruLocale } from 'ngx-bootstrap/locale';

defineLocale('kk', kkLocale);
defineLocale('en', enGbLocale), defineLocale('ru', ruLocale);

@NgModule({
  declarations: [GuaranteeComponent, GuaranteesMainComponent],
  imports: [
    CommonModule,
    GuaranteesRoutingModule,
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
  ],
  exports: [],
  providers: [],
})
export class GuaranteesModule {
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
