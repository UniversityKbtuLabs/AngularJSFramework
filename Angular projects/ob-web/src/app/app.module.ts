import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UsersModule } from './modules/users/users.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '@shared/shared.module';
import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { CommonModule, DatePipe } from '@angular/common';
import { AccountsModule } from './modules/accounts/accounts.module';
import { AccountModule } from './modules/account/account.module';
import { MainService } from './core/services/main.service';
import { CookieService } from 'ngx-cookie-service';
import { OperationsModule } from './modules/operations/operations.module';
import { NewMainComponent } from './layout/new-main/new-main.component';
import { NewMainModule } from './layout/new-main/new-main.module';
import { CoreModule } from './core/core.module';
import { ToastrModule } from 'ngx-toastr';
import { NgxMaskModule } from 'ngx-mask';
import { NewHeaderComponent } from './layout/new-header/new-header.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { HttpCancelService } from './core/services/httpcancel.service';
import { SocketService } from './core/services/socket.service';
import { AllAccountsModule } from './modules/all-accounts/all-accounts.module';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent, NewMainComponent, NewHeaderComponent],
  imports: [
    CommonModule,
    UsersModule,
    SharedModule,
    NewMainModule,
    AccountsModule,
    AccountModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AgGridModule.withComponents([]),
    TranslateModule.forRoot({
      defaultLanguage: 'ru',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    ModalModule.forRoot(),
    OperationsModule,
    CoreModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      preventDuplicates: true,
    }),
    NgxMaskModule.forRoot(),
    NgSelectModule,
    AllAccountsModule,
  ],
  providers: [
    MainService,
    CookieService,
    DatePipe,
    HttpCancelService,
    SocketService,
  ],
  bootstrap: [AppComponent],
  exports: [],
})
export class AppModule {}
