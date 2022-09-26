import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {
  ActivationEnd,
  ActivationStart,
  NavigationEnd,
  NavigationStart,
  Router,
} from '@angular/router';
import { LoginService } from '@app/core/services/login.service';
import { ICurrentContract, IUser } from '@app/data/models/auth-types';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'ob-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit, OnDestroy {
  public btnList: any[] = [];
  public user: IUser;
  public currentContract: ICurrentContract;
  public phoneAuthorized: boolean = true;
  public companyLabel: string = '';
  public signersLabel: string = '';
  public employeeLabel: string = '';
  public counteragentLabel: string = '';
  public tariffsLabel: string = '';
  public hideSettingsBar: boolean = false;
  private exceptionURLS: string[] = [
    'tariffs/all',
    'tariffs/detail',
    'tariffs/connect',
  ];
  private subscriptions: Subscription[] = [];

  constructor(
    private loginService: LoginService,
    private changeDetector: ChangeDetectorRef,
    public translate: TranslateService,
    private router: Router
  ) {
    this.subscriptions.push(
      this.router.events.subscribe((event: any) => {
        if (event instanceof NavigationEnd) {
          if (this.exceptionURLS.find(str => event.url.includes(str))) {
            this.hideSettingsBar = true;
          } else {
            this.hideSettingsBar = false;
          }
        }
      })
    );
  }

  ngOnInit(): void {
    this.getTranslations();
    this.getUserInfo();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getUserInfo() {
    this.loginService.userInfoObject$
      .pipe(take(2)) // TODO FIX
      .subscribe(
        {
          next: v => {
            if (v.user) {
              this.user = v.user;
              this.currentContract = v.currentContract;
              this.isPhoneAuthorized();
              this.initButtons();
              this.changeDetector.detectChanges();
            }
          },
        }

        // (value) => {
        // console.info(value)
      );
  }
  initButtons() {
    this.btnList = [
      {
        img: './assets/icons/stg_company.svg',
        name: this.companyLabel,
        path: 'company',
        isActive: true,
      },
      {
        img: './assets/icons/stg_users.svg',
        name: this.signersLabel,
        path: 'users',
        isActive: false,
      },
      {
        img: './assets/icons/stg_tarifs.svg',
        name: this.tariffsLabel,
        path: 'tariffs',
        isActive: false,
      },
      {
        img: './assets/icons/stg_employees.svg',
        name: this.employeeLabel,
        path: 'employees',
        isActive: false,
      },
      {
        img: './assets/icons/stg_contragent.svg',
        name: this.counteragentLabel,
        path: 'contragents',
        isActive: false,
      },
      // {img: './assets/icons/stg_notification.svg', name: 'Уведомления', path: 'notifications', isActive: false},
    ];
  }

  isPhoneAuthorized() {
    if (this.user.loggedInBy === 'sms') {
      this.phoneAuthorized === true;
    } else {
      this.phoneAuthorized = false;
    }
  }
  getTranslations() {
    this.translate
      .get([
        'settings.users.about-company',
        'settings.signers',
        'operations.default.employees',
        'default.contragents',
        'settings.tarif.title',
      ])
      .subscribe(translations => {
        this.companyLabel = translations['settings.users.about-company'];
        this.signersLabel = translations['settings.signers'];
        this.employeeLabel = translations['operations.default.employees'];
        this.counteragentLabel = translations['default.contragents'];
        this.tariffsLabel = translations['settings.tarif.title'];
      });
  }

  isHideSettingsBar() {
    if (this.exceptionURLS.find(str => this.router.url.includes(str))) {
      this.hideSettingsBar = true;
    } else {
      this.hideSettingsBar = false;
    }
    //this.changeDetector.detectChanges();
  }
}
