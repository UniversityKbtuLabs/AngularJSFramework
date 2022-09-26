import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './page/login.component';
import { UsersRoutingModule } from './users-routing.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { SharedModule } from '@shared/shared.module';
import { NgxMaskModule } from 'ngx-mask';
import { TranslateModule } from '@ngx-translate/core';
import { EspComponent } from './components/esp/esp.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SmsComponent } from './components/sms/sms.component';
import { CodeInputModule } from 'angular-code-input';
import { SmsInfoComponent } from './components/sms-info/sms-info.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { CallbackComponent } from './page/callback/callback.component';
import { CertificateModalComponent } from '../ecp/certificate-modal/certificate-modal.component';
import { TokenKeyModalComponent } from '../ecp/token-key-modal/token-key-modal.component';
import { CertificateHintModalComponent } from '../ecp/certificate-hint-modal/certificate-hint-modal.component';

@NgModule({
  declarations: [
    LoginComponent,
    EspComponent,
    SmsComponent,
    SmsInfoComponent,
    CallbackComponent,
    CertificateModalComponent,
    TokenKeyModalComponent,
    CertificateHintModalComponent,
  ],
  imports: [
    CommonModule,
    UsersRoutingModule,
    TabsModule.forRoot(),
    SharedModule,
    NgxMaskModule.forChild(),
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    CodeInputModule,
    NgSelectModule,
  ],
  exports: [],
})
export class UsersModule {}
