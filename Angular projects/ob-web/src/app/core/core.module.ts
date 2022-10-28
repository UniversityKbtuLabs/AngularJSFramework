import { NgModule, Provider } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { ErrorInterceptor } from './interceptors/error.interceptor';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { ManageHttpInterceptor } from './interceptors/managehttp.interceptor';

const INTERCEPTOR = (type: any) => ({
  provide: HTTP_INTERCEPTORS,
  useClass: type,
  multi: true,
});

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule, HttpClientModule],
  exports: [RouterModule, HttpClientModule],
  providers: [
    INTERCEPTOR(ErrorInterceptor),
    INTERCEPTOR(TokenInterceptor),
    INTERCEPTOR(ManageHttpInterceptor),
  ],
})
export class CoreModule {}
