import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { LoginService } from '@app/core/services/login.service';
import { SubscriptionAccumulator } from '@app/core/helpers/SubscriptionAccumulator';
import {
  errorMessage,
  fingerprintReport,
  getError,
  getIn,
} from '@app/core/helpers';
import { ToastrService } from 'ngx-toastr';
import { OperationsService } from '@app/core/services/operations.service';
import moment from 'moment';
import { interval, Observable, Subscription, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AccountHistoryService } from '@app/core/services/account-history.service';
import { systemErrors } from '@app/core/constants';
import { Router } from '@angular/router';
import { IP2PSecuredRequest } from '@app/data/models/p2p-types';

@Component({
  selector: 'ob-sms-modal',
  templateUrl: './sms-modal.component.html',
  styleUrls: ['./sms-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmsModalComponent
  extends SubscriptionAccumulator
  implements OnInit, OnDestroy
{
  @Input() cb: any;
  public phoneNumber: string | null;
  public code: string = '';
  public codeCompleted: boolean = false;
  public timer: any;
  public fingerPrint: any;
  public loginType: string = '';

  public isTimerEnd: boolean = false;
  public isOpeningSocket: boolean = false;

  // Subscriptions
  public signDocsSubscription: Subscription;
  public subscription: Subscription; // Подписка на запрос СМС кода
  public timerSubscription: Subscription; // Подписка таймер
  public smsValidationSubscr: Subscription;
  public getSmsCodeSubscription: Subscription;

  // Errors
  public numberSendError: string = '';
  public smsError: string = '';
  public otpError: string = '';
  public loginError: any;

  // Таймер
  public observableTimer: Observable<number>;
  public minutes = 2;
  public seconds = 0;

  public isNumberSend: boolean = false;

  public isCodeCompleted: boolean = false;
  public isConfirmationLoading: boolean = false;

  public otp = '';
  @Output() statusDirectlySign = new EventEmitter<boolean>();
  @Output() p2pCode = new EventEmitter<string>();

  constructor(
    public bsModalRef: BsModalRef,
    public loginService: LoginService,
    public options: ModalOptions,
    public changeDetection: ChangeDetectorRef,
    public toastr: ToastrService,
    public operationsService: OperationsService,
    public accountHistoryService: AccountHistoryService,
    private modalService: BsModalService,
    private router: Router
  ) {
    super();
    this.setFingerPrint = this.setFingerPrint.bind(this);
  }

  ngOnInit(): void {
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => fingerprintReport(this.setFingerPrint));
    } else {
      setTimeout(() => fingerprintReport(this.setFingerPrint), 500);
    }

    /* подписка на ошибки авторизации */
    this.addSubscriber(
      this.loginService.currentLoginError.subscribe(error => {
        if (Object.keys(error).length > 0) {
          this.droptimer();
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

    /* Подписка на ошибки авторизации */
    this.addSubscriber(
      this.operationsService.numberSendError$.subscribe({
        next: error => {
          if (error) {
            this.droptimer();
          }
          this.numberSendError = error;
          this.changeDetection.detectChanges();
        },
      })
    );

    /* 
		  Подписка на ответ запроса СМС кода 
		  Запуск таймера по ответу
		  Подписка на таймер
		*/
    this.subscription = this.operationsService.isNumberSend$.subscribe({
      next: v => {
        if (v) {
          this.isNumberSend = true;
          const now = moment();
          const nextTime = now.add(120100, 'milliseconds');
          const source = interval(1000);
          this.observableTimer = source.pipe(
            takeUntil(timer(nextTime.toDate()))
          );

          this.timerSubscription = this.observableTimer.subscribe({
            next: v => {
              const left = this.timeLeft();
              if (left > 0) {
                if (this.seconds === 0 && this.minutes > 0) {
                  this.minutes = this.minutes - 1;
                  this.seconds = 60;
                }
                this.seconds = this.seconds - 1;
              } else {
                if (this.timerSubscription) {
                  this.timerSubscription.unsubscribe();
                }
              }
              this.changeDetection.detectChanges();
            },
            error: err => console.info(err),
            complete: () => {
              // console.info('completed')
              this.changeDetection.detectChanges();
            },
          });
        } else {
          // if (this.timerSubscription) {
          //   this.timerSubscription.unsubscribe()
          // }
        }
        this.changeDetection.detectChanges();
      },
    });

    this.loginService.userInfoObject$.subscribe({
      next: v => {
        this.loginType = getIn(v, 'user', 'loggedInBy');
        this.phoneNumber = getIn(v, 'user', 'phone');
        this.changeDetection.detectChanges();
        if (this.phoneNumber) {
          this.minutes = 2;
          this.seconds = 0;
          this.operationsService.getSmsCode(this.phoneNumber, this.toastr);
        }
      },
    });
  }

  setFingerPrint(report: any) {
    async function getReport(): Promise<any> {
      const zipUtil = await import('lz-string');
      const zipContents = await zipUtil.compressToEncodedURIComponent(report);
      return zipContents;
    }
    getReport().then(res => {
      this.fingerPrint = res;
    });
  }

  onCodeChanged(code: string) {
    this.loginService.setErrorMessage('');
    this.otp = code;
    if (!code) {
      this.code = code;
      this.isCodeCompleted = false;
      this.numberSendError = '';
    }
    if (this.otpError) {
      this.otpError = '';
      this.code = '';
    }
    this.smsError = '';
    this.changeDetection.detectChanges();
  }

  /* Handler ввода ОТП кода */
  onCodeCompleted(code: string) {
    if (code) {
      this.code = code;
      this.codeCompleted = true;
      this.submit(true);
    } else {
      this.codeCompleted = false;
    }
    this.changeDetection.detectChanges();
  }

  getFormattedPhone() {
    if (this.phoneNumber) {
      const phoneBit1 = this.phoneNumber.substring(0, 3);
      const phoneBit2 = this.phoneNumber.substring(3, 6);
      const phoneBit3 = this.phoneNumber.substring(6, 8);
      const phoneBit4 = this.phoneNumber.substr(8);
      return `+7(${phoneBit1}) ${phoneBit2} ${phoneBit3} ${phoneBit4}`;
    } else {
      return '';
    }
  }

  timeLeft(): Number {
    return this.minutes * 60 + this.seconds;
  }

  renderTimeUnit(sec: number) {
    return sec < 10 ? `0${sec}` : `${sec}`;
  }

  signingDocuments() {
    const id = this.options.initialState.operationId;
    const closeModal: any = this.options.initialState.closeModal;
    this.isConfirmationLoading = true;
    this.signDocsSubscription = this.accountHistoryService
      .signDocuments(this.code, id, this.phoneNumber, this.fingerPrint)
      .subscribe({
        next: (value: any) => {
          this.isConfirmationLoading = false;
          this.droptimer();
          let directlySign: any;
          if (this.options.initialState.isDirectlySign) {
            directlySign = this.options.initialState.isDirectlySign;
          }

          if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
          }

          // this.accountHistoryService.docsLength$.next(0)
          // this.accountHistoryService.docsAmount$.next('{"KZT":[0]}')
          if (closeModal) {
            closeModal();
          }

          if (directlySign) {
            this.statusDirectlySign.emit(true); // если подписывает после создания то закрываем модальное окно
            this.p2pCode.emit(this.code);
            this.modalService.hide(1);
          } else {
            this.router.navigate(['home/operations/success']);
            this.modalService.hide(1);
          }

          this.changeDetection.detectChanges();
        },
        error: err => {
          this.otp = '';
          this.code = '';
          this.otpError = getError(err);
          this.isConfirmationLoading = false;
          this.changeDetection.detectChanges();
        },
      });
  }

  sendSignP2p() {
    const data: any = this.options.initialState?.p2pData;
    let dto: IP2PSecuredRequest = {
      code: this.code,
      phone: this.phoneNumber,
      p2PRequest: data,
    };
    this.isConfirmationLoading = true;
    this.addSubscriber(
      this.operationsService.sendByAppCode(dto).subscribe({
        next: res => {
          this.isConfirmationLoading = false;
          this.droptimer();

          if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
          }
          this.statusDirectlySign.emit(true);
          this.modalService.hide(1);
        },
        error: error => {
          this.otp = '';
          this.code = '';
          errorMessage(error, this.toastr);
          this.isConfirmationLoading = false;
          this.changeDetection.detectChanges();
        },
      })
    );
  }

  droptimer() {
    this.minutes = 0;
    this.seconds = 0;
  }

  getErrorMessage(error: any, field: string) {
    return getIn(error, field) || '';
  }

  submit(isCodeCompleted: boolean = false) {
    const operationType: any = this.options.initialState?.operationType;
    if (isCodeCompleted && !this.isConfirmationLoading) {
      if (operationType === 'card') {
        this.sendSignP2p();
      } else {
        if (this.loginType === 'sms' || this.loginType === 'app') {
          this.signingDocuments();
        }
      }
    } else {
      if (!this.numberSendError.length) {
        this.smsError = 'Введите код';
      }
    }

    // const cb: any = this.options.initialState.signingDocuments
    // cb();
  }

  resend() {
    this.code = '';
    this.minutes = 2;
    this.seconds = 0;
    this.otpError = '';
    this.operationsService.numberSendError$.next('');
    this.loginService.changeLoginError({});
    this.operationsService.getSmsCode(this.phoneNumber, this.toastr);
  }

  closeModal() {
    // this.accountHistoryService.docsAmount$.next('{"KZT":[0]}')
    // this.accountHistoryService.docsLength$.next(0)
    // this.accountHistoryService.selectedDocuments.next([])
    // this.accountHistoryService.openedDocument$.next(null)
    this.accountHistoryService.removeSelected();
    this.numberSendError = '';
    this.bsModalRef.hide();
  }

  // TODO использовать тот же сервис что и при первой отправке // TODO NOT USED
  // onPhoneNumberSend() {
  // 	if (this.phoneNumber) {
  // 		this.addSubscriber(
  // 			this.loginService.getSmsCode(this.phoneNumber, this.toastr)
  // 		)
  // 	}
  // }

  ngOnDestroy(): void {
    this.otpError = '';
    this.operationsService.numberSendError$.next('');
    this.operationsService.isNumberSend$.next(false);
    this.accountHistoryService.removeSelected();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.signDocsSubscription) {
      this.signDocsSubscription.unsubscribe();
    }
  }
}
