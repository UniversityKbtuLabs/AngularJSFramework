import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { LoginService } from '../services/login.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private cookieService: CookieService,
    public loginService: LoginService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> | Observable<any> {
    const idToken = this.cookieService.get('access_token');
    if (idToken) {
      if (!sessionStorage.getItem('token')) {
        if (localStorage.getItem('token')) {
          sessionStorage.setItem('token', localStorage.getItem('token'));
        } else {
          this.loginService.logout();
        }
      } else {
        if (!localStorage.getItem('token')) {
          localStorage.setItem('token', sessionStorage.getItem('token'));
        }
      }
      this.loginService.setAuthorizedStatus(true);
      let request = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${idToken}`),
      });
      return next.handle(request).pipe(catchError(error => throwError(error)));
    } else {
      return next.handle(req);
    }
  }
}
