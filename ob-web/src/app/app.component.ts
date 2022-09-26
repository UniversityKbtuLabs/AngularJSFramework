import {
  ChangeDetectionStrategy,
  Component,
  ChangeDetectorRef,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LoginService } from './core/services/login.service';

@Component({
  selector: 'ob-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'Onlinebank';
  isLoggedIn: boolean = false;
  constructor(
    translate: TranslateService,
    public loginService: LoginService,
    public changeDetector: ChangeDetectorRef
  ) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('ru');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    if (localStorage.getItem('locale')) {
      translate.use(localStorage.getItem('locale'));
    } else {
      translate.use('ru');
    }
  }

  isSignIn(event: boolean) {
    this.isLoggedIn = event;
  }
}
