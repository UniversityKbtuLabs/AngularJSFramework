/* eslint-disable max-len */
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { errorMessage, getIn, showRandomMessage } from '@app/core/helpers';
import { AccountHistoryService } from '@app/core/services/account-history.service';
import { LoginService } from '@app/core/services/login.service';
import { SocketService } from '@app/core/services/socket.service';
import { BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

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
  selector: 'ob-token-key-modal',
  templateUrl: './token-key-modal.component.html',
  styleUrls: ['./token-key-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TokenKeyModalComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public certList: any;
  public codeChallenge: string = '';
  public serNum: string = '';
  public id: any = '';
  public socketData: any = { isLoadedKeysFromToken: false };
  public otp = '';
  public code: string = '';
  signedChallenge: string = '';
  base64Header: string = '';
  base64Payload: string = '';
  challenge: string = '';

  // Boolean
  public isSigning: boolean;
  public isGettingOtpPush: boolean;
  public isGettingCodeChallenge: boolean = false;
  public is2FA: boolean = false;
  public isCodeCompleted: boolean = false;
  public codeCompleted: boolean = false;
  public isTokenKeyValid: boolean = false;
  public isMultiple: boolean = false;

  // Subscriptions
  loginRequestSubscription: Subscription;
  codeChallengeSubscription: Subscription;
  codeChallengeRequestSubscription: Subscription;
  otpCheckSubscription: Subscription;
  signedChallengeSubscription: Subscription;
  signSignatureSubscription: Subscription;
  tokenValiditySubscription: Subscription;
  otpSendSubscription: Subscription;

  isOtpModal: boolean = false;
  constructor(
    private loginService: LoginService,
    private accountHistoryService: AccountHistoryService,
    private socketService: SocketService,
    private toastrService: ToastrService,
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private changeDetection: ChangeDetectorRef,
    public options: ModalOptions,
    private router: Router,
    public translate: TranslateService
  ) {
    this.form = this.fb.group({
      tokenKey: ['', this.tokenKeyValidator],
    });
    this.setFingerPrint = this.setFingerPrint.bind(this);
  }

  ngOnInit(): void {
    this.isOtpModal = false;
    if (this.options.initialState.operationId) {
      const operationId = this.options.initialState.operationId.toString();
      const ids = operationId.split(',');
      this.isMultiple = ids.length > 1;
    }
    this.id = this.options.initialState.operationId;

    this.is2FA = this.options.initialState.is2FA as boolean;
    // this.modalTypeSubscription = this.socketService.isOtpModalObservable$.subscribe({
    //   next: flag => {
    //     this.isOtpModal = flag
    //     this.changeDetection.detectChanges()
    //   }
    // })
    /* Отправка данных антифрода */
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => fingerprintReport(this.setFingerPrint));
    } else {
      setTimeout(() => fingerprintReport(this.setFingerPrint), 500);
    }
    setTimeout(() => {
      document.getElementById('tokenKey').focus();
    }, 100);
    this.changeDetection.detectChanges();
  }

  ngOnDestroy(): void {
    this.id = '';
    this.isOtpModal = false;
    this.accountHistoryService.removeSelected();
    if (this.otpCheckSubscription) {
      this.otpCheckSubscription.unsubscribe();
    }
    if (this.loginRequestSubscription) {
      this.loginRequestSubscription.unsubscribe();
    }
    if (this.codeChallengeSubscription) {
      this.codeChallengeSubscription.unsubscribe();
    }
    if (this.codeChallengeRequestSubscription) {
      this.codeChallengeRequestSubscription.unsubscribe();
    }
    if (this.signSignatureSubscription) {
      this.signSignatureSubscription.unsubscribe();
    }
    if (this.tokenValiditySubscription) {
      this.tokenValiditySubscription.unsubscribe();
    }
    if (this.otpSendSubscription) {
      this.otpSendSubscription.unsubscribe();
    }
  }

  setFingerPrint(report: any) {
    async function getReport(): Promise<any> {
      const zipUtil = await import('lz-string');
      const zipContents = await zipUtil.compressToEncodedURIComponent(report);
      return zipContents;
    }
    getReport().then(res => {
      this.accountHistoryService.fingerPrintReport$.next(res);
    });
  }

  closeModal() {
    this.bsModalRef.hide();
  }

  onKeyPress(event: any) {
    // Проверка на нажатие клавиши Enter на поле номер документа
    if (event.keyCode === 13) {
      this.onSign();
    }
  }

  get formControl() {
    return this.form.controls;
  }

  isFieldValid(field: string) {
    const formField = this.form.get(field);
    const isValid =
      (!formField.valid && formField.touched && !formField.pristine) ||
      (!formField.valid && formField.dirty && !formField.pristine);
    return isValid;
  }

  onCodeChanged(code: string) {
    this.loginService.setErrorMessage('');
    this.otp = code;
    if (!code) {
      this.code = code;
      this.isCodeCompleted = false;
    }
    // if (this.otpError) {
    //   this.otpError = ''
    //   this.code = ''
    // }
    // this.smsError = ''
    this.changeDetection.detectChanges();
  }

  onCodeCompleted(code: string) {
    if (code) {
      this.code = code;
      this.codeCompleted = true;
      this.signOtp();
    } else {
      this.codeCompleted = false;
    }
    this.changeDetection.detectChanges();
  }

  /* 
    Формирование данных для проверки ОТП кода 
    base64Header, base64Payload, signedChallenge = Signed(base64Header.base64Payload)
  */
  signOtp(): void {
    // Подписываем ОТП код
    let cert: any;
    let x5c;
    if (this.socketService.data$.value.certificates) {
      cert = this.socketService.data$.value.certificates.find(
        (c: any) => c.serialNumber === sessionStorage.getItem('sn')
      );
      if (cert) {
        x5c = cert.certificateBlob;
      }
    }
    const tokenKey = this.code;
    const base64Header = btoa(JSON.stringify({ svc: 'SIGN-OTP', x5c })); // HEADER
    const base64Payload = btoa(JSON.stringify({ otp: tokenKey })); // PAYLOAD
    const signature = base64Header + '.' + base64Payload; //TODO ПОДПИСАТЬ ТУМАРОМ

    this.signedChallengeSubscription = this.socketService.data$.subscribe({
      next: data => {
        const signedChallenge = getIn(data, 'signedChallenge');
        if (signedChallenge) {
          this.base64Header = base64Header;
          this.base64Payload = base64Payload;
          this.challenge = signature;

          this.signedChallenge = signedChallenge;
          this.socketService.data$.next({
            ...this.socketService.data$.value,
            signedChallenge: '',
          });
          if (this.signedChallengeSubscription) {
            this.signedChallengeSubscription.unsubscribe();
          }
        }
      },
    });

    this.socketService.setApiKey(() => {
      console.info('ws setApiKey');
      this.socketService.signChallenge(
        signature,
        this.form.controls['tokenKey'].value,
        cert.profile,
        cert.serialNumber
      );
    });
  }

  /* 
    Проверяет валидность ПИНа устройста 
    если ПИН валиден меняет тип формы ввода с ПИН на ОТП код
  */
  checkTokenKeyValidity(): void {
    this.isSigning = true;
    const basicString = '123';
    const tokenKey = this.form.controls['tokenKey'].value;
    let cert: any;
    if (this.socketService.data$.value.certificates) {
      cert = this.socketService.data$.value.certificates.find(
        (c: any) => c.serialNumber === sessionStorage.getItem('sn')
      );
    }
    this.socketService.setApiKey(() => {
      this.tokenValiditySubscription = this.socketService.data$.subscribe({
        next: data => {
          if (data.signedChallenge) {
            // Меняешь флажки чистим сервис дату, отписываемся
            this.isTokenKeyValid = true;
            this.socketService.data$.next({
              ...this.socketService.data$.value,
              signedChallenge: '',
            });
            if (
              this.tokenValiditySubscription &&
              !this.tokenValiditySubscription.closed
            ) {
              this.tokenValiditySubscription.unsubscribe();
            }

            this.sendOtp();
          }
          this.isSigning = false;
          this.changeDetection.detectChanges();
        },
        error: () => {
          this.isSigning = false;
          this.changeDetection.detectChanges();
        },
      });
      if (cert) {
        this.socketService.signChallenge(
          basicString,
          tokenKey,
          cert.profile,
          cert.serialNumber
        );
      }
    });
  }

  signNon2FA(otp: string = '123'): void {
    this.codeChallengeRequestSubscription = this.accountHistoryService
      .getChallenges(this.id)
      .subscribe({
        next: (ch: string) => {
          this.codeChallengeRequestSubscription.unsubscribe();
          const challenges = ch.split(';');
          this.isGettingCodeChallenge = false;

          if (challenges.length > 1) {
            let cert = this.returnCertificate();
            const signedChallenges: string[] = [];
            challenges.forEach(challenge => {
              this.socketService.setApiKey(() => {
                this.codeChallengeSubscription =
                  this.socketService.data$.subscribe({
                    next: data => {
                      if (data.signedChallenge) {
                        if (this.codeChallengeSubscription) {
                          this.codeChallengeSubscription.unsubscribe();
                        }
                        const hasChallenge =
                          signedChallenges.indexOf(data.signedChallenge) > -1;
                        if (!hasChallenge) {
                          signedChallenges.push(data.signedChallenge);
                        }
                        if (signedChallenges.length === challenges.length) {
                          const concatedChallenges = signedChallenges.join(';');
                          this.loginService.socketData$.next({});
                          if (!this.loginRequestSubscription) {
                            if (cert) {
                              cert = cert.certificateBlob;
                            }
                            const body = {
                              otp, // TODO HARD CODED
                              cert,
                              mac: data.macaddr,
                              originalChallenge: challenges.join(';'),
                              signedChallenge: concatedChallenges,
                            };
                            this.isSigning = true;
                            this.loginRequestSubscription =
                              this.accountHistoryService
                                .signBySignature(body)
                                .subscribe({
                                  next: (value: any) => {
                                    this.isSigning = false;
                                    const closeModal: any =
                                      this.options.initialState.closeModal;
                                    closeModal();
                                    if (this.options.initialState.successCb) {
                                      const cB: any =
                                        this.options.initialState.successCb;
                                      cB();
                                    } else {
                                      this.router.navigate([
                                        'home/operations/success',
                                      ]);
                                    }
                                    this.changeDetection.detectChanges();
                                  },
                                  error: err => {
                                    this.isSigning = false;
                                    errorMessage(err, this.toastrService);
                                    this.changeDetection.detectChanges();
                                  },
                                });
                          }
                        }
                      }
                    },
                    error: err => {
                      this.isSigning = false;
                      this.codeChallengeRequestSubscription.unsubscribe();
                      this.isGettingCodeChallenge = false;
                    },
                  });

                // 1.
                this.socketService.signChallenge(
                  challenge,
                  this.form.controls['tokenKey'].value,
                  cert.profile,
                  cert.serialNumber
                );
              });
            });
          } else {
            this.socketService.setApiKey(() => {
              // CB
              // Ошибка очередности
              // 2.
              // Создаем подписку к SIGNED CODE CHALLENGE
              let cert = this.returnCertificate();
              this.codeChallengeSubscription =
                this.socketService.data$.subscribe({
                  next: data => {
                    this.isSigning = false;
                    if (data.signedChallenge) {
                      if (cert) {
                        cert = cert.certificateBlob;
                      }
                      const body = {
                        otp, // TODO HARD CODED
                        cert,
                        mac: data.macaddr,
                        originalChallenge: ch,
                        signedChallenge: data.signedChallenge,
                      };

                      this.loginService.socketData$.next({});

                      if (!this.loginRequestSubscription) {
                        this.isSigning = true;
                        this.loginRequestSubscription =
                          this.accountHistoryService
                            .signBySignature(body)
                            .subscribe({
                              next: (value: any) => {
                                this.isSigning = false;
                                const closeModal: any =
                                  this.options.initialState.closeModal;
                                closeModal();
                                if (this.options.initialState.successCb) {
                                  const cB: any =
                                    this.options.initialState.successCb;
                                  cB();
                                } else {
                                  this.router.navigate([
                                    'home/operations/success',
                                  ]);
                                }
                                this.changeDetection.detectChanges();
                              },
                              error: err => {
                                this.isSigning = false;
                                errorMessage(err, this.toastrService);
                                this.changeDetection.detectChanges();
                              },
                            });
                      }
                    }
                  },
                  error: err => {
                    this.isSigning = false;
                    this.codeChallengeRequestSubscription.unsubscribe();
                    this.isGettingCodeChallenge = false;
                  },
                });

              // 1.
              this.socketService.signChallenge(
                ch,
                this.form.controls['tokenKey'].value,
                cert.profile,
                cert.serialNumber
              );
            });
          }
          this.changeDetection.detectChanges();
        },
        error: error => {
          this.isGettingCodeChallenge = false;
          // this.isTokenLoading = false
          errorMessage(error, this.toastrService);
          this.changeDetection.detectChanges();
        },
      });
  }

  returnCertificate(): any {
    let cert;
    if (this.socketService.data$.value.certificates) {
      cert = this.socketService.data$.value.certificates.find(
        (c: any) => c.serialNumber === sessionStorage.getItem('sn')
      );
    }
    return cert;
  }

  sign2FA(): void {
    if (this.code.length === 6) {
      // Проверка ОТП КОДА
      const otpBody = {
        // ФОРМИРУЕМ ДАННЫЕ ДЛЯ ПРОВЕРКИ ОТП КОДА
        data: this.challenge + '.' + this.signedChallenge,
      };
      this.isSigning = true;
      this.otpCheckSubscription = this.accountHistoryService
        .postCheckOtp(otpBody)
        .subscribe({
          next: (v: any) => {
            this.isSigning = false;
            this.isGettingCodeChallenge = true;
            this.signNon2FA(this.code);
            this.changeDetection.detectChanges();
            if (this.otpCheckSubscription) {
              this.otpCheckSubscription.unsubscribe();
            }
          },
          error: err => {
            this.isSigning = false;
            if (this.otpCheckSubscription) {
              this.otpCheckSubscription.unsubscribe();
            }
            errorMessage(err, this.toastrService);
            this.changeDetection.detectChanges();
          },
        });
    } else {
      showRandomMessage('ОТП код ввден не верно', this.toastrService, 'error');
    }
  }

  signBySignature(challenge: string, cert: any, data: any) {
    const body = {
      otp: this.code,
      cert: cert.certificateBlob,
      mac: data.macaddr,
      originalChallenge: challenge,
      signedChallenge: data.signedChallenge,
    };
    this.isSigning = true;
    // **
    this.signSignatureSubscription = this.accountHistoryService
      .signBySignature(body)
      .subscribe({
        next: (value: any) => {
          this.isSigning = false;
          const closeModal: any = this.options.initialState.closeModal;
          closeModal();
          if (this.options.initialState.successCb) {
            const cB: any = this.options.initialState.successCb;
            cB();
          } else {
            this.router.navigate(['home/operations/success']);
          }
          this.changeDetection.detectChanges();
        },
        error: err => {
          this.isSigning = false;
          errorMessage(err, this.toastrService);
          this.changeDetection.detectChanges();
        },
      });
    // **
  }

  sendOtp() {
    const cert: any = this.returnCertificate();
    const fullName = cert.subjectDN
      .split(';')
      ?.find((item: string) => item.includes('CN'))
      ?.split('=')?.[1];
    const user = cert.serialNumber + ';' + fullName;
    const base64 = btoa(unescape(encodeURIComponent(user)));
    //
    this.isGettingOtpPush = true;
    this.changeDetection.detectChanges();
    this.otpSendSubscription = this.accountHistoryService
      .sendOtpPush(base64)
      .subscribe({
        next: res => {
          this.isGettingOtpPush = false;
          // только после отправки ОТП, меняем на модалку ввода ОТП
          this.isOtpModal = true;
          if (this.otpSendSubscription) {
            this.otpSendSubscription.unsubscribe();
          }
          this.changeDetection.detectChanges();
        },
        error: err => {
          this.isGettingOtpPush = false;
          if (this.otpSendSubscription) {
            this.otpSendSubscription.unsubscribe();
          }
          if (
            getIn(err, 'error', 'systemMessage') ===
            'ApplicationException:push_not_necessary'
          ) {
            this.isOtpModal = true;
          } else {
            errorMessage(err, this.toastrService);
            if (document.getElementById('tokenKey')) {
              document.getElementById('tokenKey').focus();
            }
          }
          this.changeDetection.detectChanges();
        },
      });
  }

  onSign() {
    // Проверка на заполненость формы - token Key
    if (this.isFormValid()) {
      // форма валидна
      // this.isGettingCodeChallenge = true
      if (!this.is2FA) {
        this.signNon2FA();
      } else {
        // 1. Проверка формы: Форма ввода ПИНА устройства / Форма ввода ОТП кода
        if (!this.isOtpModal) {
          // Форма ввода ПИНА устройства
          // 1.1 Проверка ПИН устройства
          this.checkTokenKeyValidity();
        } else {
          // Форма ввода ОТП кода
          this.sign2FA();
        }
        /*
          2. ЕСЛИ 2FA  - ПОКАЗЫВАЕМ ОКНО ВВОДА ОТП КОДА
          2.1 ОТП КОД ГЕНЕРИТСЯ НА УСТРОЙСТВЕ ТОКЕНА
        */
      }
    } else {
      this.form.get('tokenKey').markAsTouched();
      this.form.get('tokenKey').markAsDirty();
      document.getElementById('tokenKey').focus();
    }
  }

  showPass() {
    document.getElementById('tokenKey').setAttribute('type', 'text');
  }

  isReadOnlyTokenKey(): boolean | null {
    if (this.isGettingCodeChallenge) {
      return true;
    } else {
      return null;
    }
  }

  isFormValid(): boolean {
    if (!this.form.valid) {
      // форма невалидна
      return false;
    } else {
      return true;
    }
  }

  tokenKeyValidator = (control: FormControl) => {
    // Валидатор поля пароля
    if (control.value && control.value.length > 0) {
      return null;
    } else {
      return { required: true };
    }
  };

  displayFieldClass(field: string) {
    // css класс
    return { 'is-invalid': this.isFieldInvalid(field) };
  }

  isFieldInvalid(field: string) {
    // Валидация полей
    const formField = this.form.get(field);
    return (
      (!formField.valid && formField.touched && !formField.pristine) ||
      (!formField.valid && formField.dirty && !formField.pristine)
    );
  }
}
