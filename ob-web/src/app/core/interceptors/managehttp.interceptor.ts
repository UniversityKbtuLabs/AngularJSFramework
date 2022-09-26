import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router, ActivationEnd } from '@angular/router';
import { HttpCancelService } from '../services/httpcancel.service';
import { takeUntil } from 'rxjs/operators';
import { LoginService } from '../services/login.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class ManageHttpInterceptor implements HttpInterceptor {
  constructor(
    public router: Router,
    private httpCancelService: HttpCancelService,
    private loginService: LoginService,
    private cookieService: CookieService
  ) {
    router.events.subscribe(event => {
      // An event triggered at the end of the activation part of the Resolve phase of routing.
      if (event instanceof ActivationEnd) {
        // Cancel pending calls
        this.httpCancelService.cancelPendingRequests();
      }
    });
  }

  intercept<T>(
    req: HttpRequest<T>,
    next: HttpHandler
  ): Observable<HttpEvent<T>> {
    return next.handle(req);
    // if (this.isAllowed(window.location.pathname)) {
    //     return next.handle(req)
    // } else {
    //     return next.handle(req).pipe(takeUntil(this.httpCancelService.onCancelPendingRequests()))
    // }
  }

  isAllowed(path: string) {
    if (path === '/' || path === '/login') {
      return true;
    } else {
      return false;
    }
  }
}
