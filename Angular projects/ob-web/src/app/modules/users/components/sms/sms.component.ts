/* eslint-disable max-len */
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { LoginService } from '@core/services/login.service';
import { environment } from '@env/environment';
import { SmsInfoComponent } from '../sms-info/sms-info.component';
import { CodeInputComponent } from 'angular-code-input';
import { takeUntil, timeout } from 'rxjs/operators';
import { interval, Observable, Subscription, timer } from 'rxjs';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { mobileOperators, systemErrors } from '@app/core/constants';
import { errorMessage, getIn, loginTabs } from '@app/core/helpers';
import { TranslateService } from '@ngx-translate/core';
import { CertificateModalComponent } from '@app/modules/ecp/certificate-modal/certificate-modal.component';
import { CertificateHintModalComponent } from '@app/modules/ecp/certificate-hint-modal/certificate-hint-modal.component';
import { SocketService } from '@app/core/services/socket.service';

declare var Fingerprint: any;
var fingerprintReport = function (cB: any) {
  var options = {
    debug: false,
    excludes: {
      ping: true,
      wsPing: true,
      plugins: true,
    },
  };
  Fingerprint.get(options, function (json: any) {
    cB(json);
  });
};

@Component({
  selector: 'ob-sms',
  templateUrl: './sms.component.html',
  styleUrls: ['./sms.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmsComponent
  extends SubscriptionAccumulator
  implements OnInit, OnDestroy
{
  public phoneNumber: string = '';
  public isOperatorValid: boolean = true;
  public modalRef: BsModalRef | undefined;

  public loginType: string = 'phone';
  public loginTabs: any = [];
  public messages: string[] = [];

  // Flags
  public codeCompleted: boolean = false;
  public isCodeComponent: boolean = false;
  public isNumberSend: boolean = false;
  public isRegistered: boolean = true;
  public smsCodeExpired: boolean = false;
  public notFoundPhone: boolean = false;
  public isECPLogin: boolean = false;
  isEnterKeyPressed: boolean;

  // ОТП Код
  public code: string = '';
  public otp: string = '';

  // Errors
  public isServiceError: boolean = false;
  public loginError: any;
  public errorCode: string = '';

  // Таймер
  public observableTimer: Observable<number>;
  public minutes: number = 2;
  public seconds: number = 0;
  public isTimerFinished: boolean = false;

  // Subscriptions
  subscriptions: Subscription[] = [];
  public subscription: Subscription; // Подписка на запрос СМС кода
  public numberRegiterSubsc$: Subscription;
  public timerSubscription: Subscription; // Подписка таймер
  public smsValidationSubscr: Subscription;
  public getSmsCodeSubscription: Subscription;
  public socketSubscription: Subscription;
  public phoneNumberNotification: string;
  public socketDataSubscription: Subscription;

  // ws
  public isConnecting: boolean = false;

  @ViewChild('codeInput') codeInput!: CodeInputComponent;

  constructor(
    public loginService: LoginService,
    private router: Router,
    private modalService: BsModalService,
    private changeDetection: ChangeDetectorRef,
    public toasterService: ToastrService,
    private translate: TranslateService,
    private socketService: SocketService
  ) {
    super();
    this.setFingerPrint = this.setFingerPrint.bind(this);
    this.openModal = this.openModal.bind(this);
    // this.connectTumSocket1 = this.connectTumSocket1.bind(this)
  }

  ngOnInit() {
    this.loginTabs = loginTabs();

    /* Соединение web socketa */
    // this.connectTumSocket1()

    /* Отправка данных антифрода */
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => fingerprintReport(this.setFingerPrint));
    } else {
      setTimeout(() => fingerprintReport(this.setFingerPrint), 500);
    }
    /* подписка на ошибки авторизации */
    this.addSubscriber(
      this.loginService.currentLoginError.subscribe(error => {
        if (Object.keys(error).length > 0) {
          this.otp = '';
          const systemMessage = getIn(error, 'systemMessage');
          const systemError = systemErrors.find(function (e) {
            if (e.error.includes(systemMessage)) {
              return e;
            } else {
              return undefined;
            }
          });
          if (systemError) {
            error.systemMessage = systemError.code;
          }
        }
        this.loginError = error;
        this.changeDetection.detectChanges();
      })
    );

    this.addSubscriber(
      this.loginService.isCodeComponent.subscribe((val: boolean) => {
        this.isCodeComponent = val;
      })
    );

    /* Подписка на проверку телефона как зарегистрированного */
    this.numberRegiterSubsc$ = this.loginService.isRegistered$.subscribe({
      next: v => {
        this.isRegistered = v;
        this.changeDetection.detectChanges();
      },
    });

    /* Подписка на ответ запроса СМС кода */
    this.subscription = this.loginService.isNumberSend$.subscribe({
      next: v => {
        this.errorCode = '';
        if (v) {
          // если отправлен запускаем timer
          this.isNumberSend = true;
          const now = moment();
          const nextTime = now.add(120100, 'milliseconds');
          const source = interval(1000);
          this.observableTimer = source.pipe(
            takeUntil(timer(nextTime.toDate()))
          );
          /* Подписка на таймер */
          this.timerSubscription = this.observableTimer.subscribe({
            next: v => {
              const left = this.timeLeft();
              if (left > 0) {
                if (this.seconds === 0) {
                  this.minutes = this.minutes - 1;
                  this.seconds = 60;
                }
                this.seconds = this.seconds - 1;
              } else {
                this.isTimerFinished = true;
              }
              this.changeDetection.detectChanges();
            },
            error: err => console.info(err),
            complete: () => {
              this.isTimerFinished = true;
              this.changeDetection.detectChanges();
            },
          });
        } else {
          if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
          }
        }
        this.changeDetection.detectChanges();
      },
    });

    this.getTranslations();
  }

  /* Переключатель типа входа */
  onLoginTypeChange(value: string): void {
    if (value === 'ecp') {
      this.connectWs();
    } else {
      this.socketService.close();
    }
    this.loginType = value;
    this.changeDetection.detectChanges();
  }

  connectWs() {
    this.isConnecting = true;
    this.socketService.connect(() => {
      this.isConnecting = false;
      this.changeDetection.detectChanges();
    });
    this.changeDetection.detectChanges();
  }

  openModal() {
    if (this.socketDataSubscription && !this.socketDataSubscription.closed) {
      this.socketDataSubscription.unsubscribe();
    }
    if (this.socketService.connectionStatus$.value) {
      const socketData = this.socketService.data$.value;
      /* 
                Есть connection. Делаем проверку:
                1.На валидность apiKey
                2.На посадку apiKey в системе
             */
      if (socketData.isLoadedKeysFromToken && socketData.certificates.length) {
        this.showModal();
      } else {
        this.socketService.checkApiKey();
        // нужно делать коннект так как клиент мог сменить токен
        this.isConnecting = true;
        this.socketService.connect(() => {
          // this.socketService.checkApiKey()
          this.isConnecting = false;
          this.socketDataSubscription = this.socketService.data$.subscribe({
            next: v => {
              if (
                v.isApiKeyChecked &&
                v.isApiKeyValid &&
                v.isLoadedKeysFromToken &&
                v.isProfileInfoLoaded &&
                v.isMACAddressLoaded &&
                v.version &&
                v.certificates &&
                v.certificates.length
              ) {
                this.showModal();
                if (this.socketDataSubscription) {
                  this.socketDataSubscription.unsubscribe();
                }
              }
            },
          });
          this.changeDetection.detectChanges();
        });
      }
    } else {
      errorMessage(
        { message: 'Проверьте подключение токена' },
        this.toasterService
      );
      this.socketService.connect();
    }
  }

  showModal() {
    this.modalRef = this.modalService.show(CertificateModalComponent, {
      class: 'modal-lg modal-dialog-centered',
      id: 1,
    });
  }

  openEcpHintModal() {
    this.modalRef = this.modalService.show(CertificateHintModalComponent, {
      class: 'modal-lg modal-dialog-centered',
      id: 1,
    });
  }

  ngOnDestroy(): void {
    if (this.socketDataSubscription) {
      this.socketDataSubscription.unsubscribe();
    }
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
    this.loginService.socketData$.next({});
    this.modalService.hide(1);
    this.loginService.isNumberSend$.next(false);
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.getSmsCodeSubscription) {
      this.getSmsCodeSubscription.unsubscribe();
    }
    if (this.smsValidationSubscr) {
      this.smsValidationSubscr.unsubscribe();
    }
  }

  getTranslations() {
    this.translate
      .get(['sms.numberInputTitle'])
      .subscribe((translates: any) => {
        this.phoneNumberNotification = 'sms.numberInputTitle';
      });
  }

  setFingerPrint(report: any) {
    async function getReport(): Promise<any> {
      const zipUtil = await import('lz-string');
      const zipContents = await zipUtil.compressToEncodedURIComponent(report);
      return zipContents;
    }
    getReport().then(res => {
      this.loginService.setFingerPrint(res);
    });
  }

  getErrorMessage(error: any, field: string) {
    return getIn(error, field) || '';
  }

  /* Метод для возврата к форме авторизации
        Очистка полей на форме
    */
  retypePhoneNumber() {
    this.phoneNumber = '';
    this.loginService.changeSmsStatus(false);
    this.loginService.changeLoginError('');
    this.loginService.changeCodeComponentVisible(false);
    this.resetState();
    this.loginService.isNumberSend$.next(false);
  }

  /* Метод для повторного запроса СМС кода */
  resend() {
    this.code = '';
    this.codeInput.reset();
    this.errorCode = '';
    this.resetState();
    this.changeDetection.detectChanges();
    this.onPhoneNumberSend();
  }

  resetState() {
    this.otp = '';
    this.minutes = 2;
    this.seconds = 0;
    this.isTimerFinished = false;
    this.smsCodeExpired = false;
    this.loginService.isRegistered$.next(true);
  }

  getFormattedPhone() {
    const operator = this.phoneNumber.slice(0, 3);
    const phBit1 = this.phoneNumber.slice(3, 6);
    const phBit2 = this.phoneNumber.slice(6, 8);
    const phBit3 = this.phoneNumber.slice(8, 10);
    return `+7(${operator}) ${phBit1} ${phBit2} ${phBit3}`;
  }

  /* Метод для запроса СМС кода */
  onPhoneNumberSend() {
    this.isEnterKeyPressed = true;
    if (this.phoneNumber.length) {
      let phoneError = '';
      if (this.phoneNumber.length === 10) {
        if (this.isOperatorValid) {
          this.getSmsCodeSubscription = this.loginService.getSmsCode(
            this.phoneNumber
          );
        }
      } else {
        if (this.isOperatorValid) {
          phoneError = this.phoneNumberNotification;
        }
      }
      this.loginService.loginError.next({ message: phoneError });
    } else {
      this.loginService.loginError.next({
        message: this.phoneNumberNotification,
      });
    }
  }

  /* Метод запроса валидации СМС кода */
  onValidateSmsCode() {
    // TODO скрыть кнопку ввода номера
    // Оптписаться от Таймера
    let body = new URLSearchParams();
    body.set('client_id', environment.auth.clientID);
    body.set('response_type', 'code');
    body.set(
      'code_challenge',
      '539a374ff43dce2e894fd4061aa545e6f7f5972d40ee9a1676901fb92125ffee'
    );
    body.set('code_challenge_method', 'sha-256');
    body.set('no-redirect', '1');
    const errorHandler = (errorCode: any) => {
      this.errorCode = errorCode;
      this.changeDetection.detectChanges();
    };
    this.smsValidationSubscr = this.loginService.validateSmsCode(
      this.phoneNumber,
      this.code,
      body,
      errorHandler
    );
  }

  /* Handler ввода ОТП кода */
  onCodeChanged(code: string) {
    this.loginService.changeLoginError('');
    if (!code) {
      this.code = code;
      this.codeCompleted = false;
    }
    this.otp = code;
  }

  /* Handler ввода ОТП кода */
  onCodeCompleted(code: string) {
    if (code) {
      this.code = code;
      this.codeCompleted = true;
      this.onValidateSmsCode();
    } else {
      this.codeCompleted = false;
    }
  }

  onRightPosition(target: any) {
    let index: number;
    // @ts-ignore
    let inputs = this.codeInput.inputs;
    for (let input in inputs) {
      if (inputs[input] === target) {
        index = parseInt(input);
      }
    }
    if (!this.errorCode && index > this.otp.length) {
      this.codeInput.focusOnField(this.otp.length);
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    //keykode of tab
    if (event.keyCode === 9 && this.codeInput && !this.errorCode) {
      this.codeInput.focusOnField(this.otp.length);
    }
  }

  showInfo() {
    const config = {
      keyboard: false,
      animated: true,
      class: 'user-inactive-modal in',
    };
    this.modalRef = this.modalService.show(SmsInfoComponent, { id: 1 });
  }

  phoneCheck() {
    let phoneError = '';
    const operator = this.phoneNumber.substring(0, 3);
    if (this.isEnterKeyPressed) {
      phoneError = this.phoneNumberNotification;
      this.isEnterKeyPressed = false;
    }
    if (this.phoneNumber.length >= 1 && this.phoneNumber.length < 10) {
      if (operator.length === 3) {
        this.isOperatorValid = mobileOperators.includes(operator);
      }
    } else if (this.phoneNumber.length === 10) {
      this.isOperatorValid = mobileOperators.includes(operator);
    } else {
      this.isOperatorValid = true;
    }
    this.changeDetection.detectChanges();
    this.loginService.loginError.next({ message: phoneError });
  }

  renderTimeUnit(unit: number) {
    return unit < 10 ? `0${unit}` : `${unit}`;
  }

  timeLeft(): Number {
    return this.minutes * 60 + this.seconds;
  }

  onFocus() {
    if (
      this.phoneNumber.length >= 1 &&
      this.phoneNumber.length < 10 &&
      this.isOperatorValid
    ) {
      this.loginService.loginError.next({
        message: this.phoneNumberNotification,
      });
    }
  }
}
