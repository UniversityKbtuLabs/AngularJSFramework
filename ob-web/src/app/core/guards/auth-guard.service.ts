import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';

import { CookieService } from 'ngx-cookie-service';

import { LoginService } from '../services/login.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate, CanActivateChild {
  constructor(
    public auth: LoginService,
    public router: Router,
    public cookieService: CookieService
  ) {}

  canActivateChild(): boolean {
    return this.checkLogin();
  }

  canActivate(): boolean {
    return this.checkLogin();
  }

  checkLogin(): boolean {
    if (!this.cookieService.get('access_token')) {
      this.router.navigate(['login']);
      return false;
    }
    return true;
  }
}
