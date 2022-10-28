import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExchangeComponent } from './exchange.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@app/shared/shared.module';

@NgModule({
  declarations: [ExchangeComponent],
  imports: [CommonModule, TranslateModule, SharedModule],
  exports: [ExchangeComponent],
})
export class ExchangeModule {}
