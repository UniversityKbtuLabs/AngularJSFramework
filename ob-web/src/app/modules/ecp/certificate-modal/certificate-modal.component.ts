/* eslint-disable max-len */
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { errorMessage, successMessage } from '@app/core/helpers';
import { LoginService } from '@app/core/services/login.service';
import { SocketService } from '@app/core/services/socket.service';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ob-certificate-modal',
  templateUrl: './certificate-modal.component.html',
  styleUrls: ['./certificate-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificateModalComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public certList: any;
  public codeChallenge: string = '';
  public serNum: string = '';
  public socketData: any = { isLoadedKeysFromToken: false };
  public gostInfo: string = '';
  public profileInfo: any;
  public emptyFieldsError: string;
  public passChangeSuccessMsg: string;
  // Boolean
  public isTokenLoading: boolean = false;
  public isSearchable: boolean = false;
  public details: boolean = false;
  public isPassShown: boolean = false;
  public isNewPassShown: boolean = false;
  public isNewPassShown2: boolean = false;
  public isGettingCodeChallenge: boolean = false;
  public isTokenChangeModal: boolean = false;
  public changePassFromSettings: boolean = false;

  // Subscriptions
  public socketDataSubcr: Subscription;
  public loginRequestSubscription: Subscription;
  public codeChallengeSubscription: Subscription;
  public codeChallengeRequestSubscription: Subscription;
  public challengeLoadingSubscrption: Subscription;
  public tokenLoadingSubscription: Subscription;
  public nativeSignErrorSubscription: Subscription;
  public changePassSubscription: Subscription;
  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private loginService: LoginService,
    private changeDetection: ChangeDetectorRef,
    private socketService: SocketService,
    private toastrService: ToastrService,
    private translate: TranslateService,
    private modalOptions: ModalOptions
  ) {
    if (this.modalOptions?.initialState?.changeFromSettings) {
      // смена пароля из личного кабинета
      this.changePassFromSettings = true;
      this.isTokenChangeModal = true;
      this.isPassShown = false;
      this.isGettingCodeChallenge = false;
      if (this.codeChallengeSubscription) {
        this.codeChallengeSubscription.unsubscribe();
      }
      this.form = this.fb.group({
        token: [''],
        currentPassword: ['', this.tokenKeyValidator],
        newPassword: [
          '',
          [
            Validators.minLength(8),
            this.tokenLetterValidator,
            this.tokenNumberValidator,
            this.tokenSymbolValidator,
            Validators.required,
          ],
        ],
        newPassword2: ['', Validators.required],
      });
    } else {
      this.form = this.fb.group({
        token: [''],
        tokenKey: ['', this.tokenKeyValidator],
      });
    }
  }

  ngOnInit(): void {
    this.getTranslations();
    if (this.isTokenChangeModal) {
      this.bsModalRef.setClass('modal-w-420 modal-mt-160');
    }
    this.nativeSignErrorSubscription =
      this.socketService.nativeSignError$.subscribe({
        next: err => {
          if (err) {
            this.isTokenLoading = false;
            this.socketService.nativeSignError$.next(null);
            this.changeDetection.detectChanges();
          }
        },
      });
    this.tokenLoadingSubscription = this.loginService.isTokenLoading$.subscribe(
      {
        next: loading => {
          this.isTokenLoading = loading;
          this.changeDetection.detectChanges();
        },
      }
    );
    this.socketDataSubcr = this.socketService.data$.subscribe({
      next: v => {
        if (v.certificates && v.certificates.length) {
          setTimeout(() => {
            if (document.getElementById('tokenKey')) {
              document.getElementById('tokenKey').focus();
            }
          }, 100);

          this.form.patchValue({
            token: v.certificates[0],
          });
          this.gostInfo = this.socketService.getCertGostInfo(
            v.certificates[0].algID
          );
          this.certList = this.socketService.data$.value.certificates; // check valid keys

          this.changeDetection.detectChanges();
        }
      },
    });

    this.form.valueChanges.subscribe();
  }

  ngOnDestroy(): void {
    if (this.codeChallengeRequestSubscription) {
      this.codeChallengeRequestSubscription.unsubscribe();
    }
    if (this.nativeSignErrorSubscription) {
      this.nativeSignErrorSubscription.unsubscribe();
    }
    if (this.tokenLoadingSubscription) {
      this.tokenLoadingSubscription.unsubscribe();
    }
    this.loginService.socketData$.next({});
    if (this.challengeLoadingSubscrption) {
      this.challengeLoadingSubscrption.unsubscribe();
    }
    if (this.codeChallengeSubscription) {
      this.codeChallengeSubscription.unsubscribe();
    }
    if (this.socketDataSubcr) {
      this.socketDataSubcr.unsubscribe();
    }
    if (this.loginRequestSubscription) {
      this.loginRequestSubscription.unsubscribe();
    }
    if (this.changePassSubscription) {
      this.changePassSubscription.unsubscribe();
    }
  }

  getTranslations() {
    this.translate
      .get(['error.empty_fields_present', 'login.pass-change-success'])
      .subscribe(translations => {
        this.emptyFieldsError = translations['error.empty_fields_present'];
        this.passChangeSuccessMsg = translations['login.pass-change-success'];
      });
  }

  changeUser() {
    this.profileInfo = this.form.controls['token'].value;
  }

  toggleDetails() {
    this.details = !this.details;
    this.changeDetection.detectChanges();
  }

  assignedTo(): string {
    let assignedTo = '';
    if (this.form.controls['token'].value) {
      let subjectDN = this.form.controls['token'].value.subjectDN.split(';');
      assignedTo = subjectDN.join(' ');
    }
    return assignedTo;
  }

  updateCertList() {
    this.socketService.getCertList();
  }

  closeModal() {
    this.socketService.data$.next({});
    this.bsModalRef.hide();
  }

  onKeyPress(event: any) {
    // Проверка на нажатие клавиши Enter на поле номер документа
    if (event.keyCode === 13) {
      this.login();
    }
  }

  get formControl() {
    return this.form.controls;
  }

  isFieldValid(field: string) {
    const formField = this.form.get(field);
    const isValid =
      (!formField?.valid && formField?.touched && !formField?.pristine) ||
      (!formField?.valid && formField?.dirty && !formField?.pristine);
    return isValid;
  }

  onPasswordChange() {
    if (
      this.formControl.newPassword.value === this.formControl.newPassword2.value
    ) {
      this.changePassword();
    }
  }

  changePassword() {
    if (
      this.codeChallengeRequestSubscription &&
      !this.codeChallengeRequestSubscription.closed
    ) {
      this.codeChallengeRequestSubscription.unsubscribe();
    }
    if (this.loginRequestSubscription) {
      this.loginRequestSubscription.unsubscribe();
      this.loginRequestSubscription = undefined;
    }
    if (this.changePassSubscription) {
      this.changePassSubscription.unsubscribe();
    }
    if (this.checkForm()) {
      this.socketService.setApiKey(() => {
        // подписка на смену пароля
        const id = Date.now().toString(16);
        this.changePassSubscription = this.socketService.data$.subscribe({
          next: data => {
            if (data.id === id) {
              this.changePassSubscription.unsubscribe();
              this.isGettingCodeChallenge = true;
              this.codeChallengeRequestSubscription = this.loginService
                .getChallenge2()
                .subscribe({
                  next: ch => {
                    this.isTokenLoading = true;
                    this.isGettingCodeChallenge = false;
                    this.socketService.setApiKey(() => {
                      // CB
                      // Ошибка очередности
                      // 2.
                      // Создаем подписку к SIGNED CODE CHALLENGE
                      this.codeChallengeSubscription =
                        this.socketService.data$.subscribe({
                          next: data => {
                            // const certificate = this.form.controls['token'].value.certificateBlob
                            if (data.signedChallenge) {
                              const body = {
                                challenge: ch,
                                signature: data.signedChallenge,
                                certificate:
                                  this.form.controls['token'].value
                                    .certificateBlob,
                              };
                              this.loginService.socketData$.next({});
                              // if (data.signedChallenge) {
                              if (this.changePassFromSettings) {
                                // смена пароля из личного кабинета
                                successMessage(
                                  this.passChangeSuccessMsg,
                                  this.toastrService
                                );
                                sessionStorage.setItem(
                                  'sn',
                                  this.profileInfo
                                    ? this.profileInfo.serialNumber
                                    : this.form.controls['token'].value
                                        .serialNumber
                                );
                                sessionStorage.setItem(
                                  'profile',
                                  this.profileInfo
                                    ? this.profileInfo.profile
                                    : this.form.controls['token'].value.profile
                                );
                                this.closeModal();
                              } else {
                                if (!this.loginRequestSubscription) {
                                  this.loginRequestSubscription =
                                    this.loginService.validateBySignature(body);

                                  sessionStorage.setItem(
                                    'sn',
                                    this.profileInfo
                                      ? this.profileInfo.serialNumber
                                      : this.form.controls['token'].value
                                          .serialNumber
                                  );
                                  sessionStorage.setItem(
                                    'profile',
                                    this.profileInfo
                                      ? this.profileInfo.profile
                                      : this.form.controls['token'].value
                                          .profile
                                  );
                                }
                              }
                            }
                          },
                          error: err => {
                            this.codeChallengeRequestSubscription.unsubscribe();
                            this.isGettingCodeChallenge = false;
                            this.isTokenLoading = false;
                          },
                        });

                      // 1.
                      this.socketService.signChallenge(
                        ch,
                        this.form.controls['newPassword'].value,
                        this.form.controls['token'].value.profile,
                        this.form.controls['token'].value.serialNumber
                      );
                    });
                    this.changeDetection.detectChanges();
                  },
                  error: error => {
                    this.isGettingCodeChallenge = false;
                    this.isTokenLoading = false;
                    errorMessage(error, this.toastrService);
                    this.changeDetection.detectChanges();
                  },
                });
            }
          },
        });

        // 1.
        const newPass = this.form.controls['newPassword']?.value;
        const currentPassword = this.form.controls['currentPassword']?.value;
        const profile = this.form.controls['token'].value.profile;

        this.socketService.changeTokenPass(
          newPass,
          currentPassword,
          profile,
          id
        );
      });
      this.changeDetection.detectChanges();
    } else {
      this.validateFields();
    }
  }

  login() {
    if (
      this.codeChallengeRequestSubscription &&
      !this.codeChallengeRequestSubscription.closed
    ) {
      this.codeChallengeRequestSubscription.unsubscribe();
    }
    if (this.loginRequestSubscription) {
      this.loginRequestSubscription.unsubscribe();
      this.loginRequestSubscription = undefined;
    }
    if (this.codeChallengeSubscription) {
      this.codeChallengeSubscription.unsubscribe();
    }
    if (this.checkForm()) {
      // форма валидна
      this.isGettingCodeChallenge = true;
      this.codeChallengeRequestSubscription = this.loginService
        .getChallenge2()
        .subscribe({
          next: ch => {
            this.isTokenLoading = true;
            this.isGettingCodeChallenge = false;
            this.socketService.setApiKey(() => {
              // CB
              // Ошибка очередности
              // 2.
              // Создаем подписку к SIGNED CODE CHALLENGE
              this.codeChallengeSubscription =
                this.socketService.data$.subscribe({
                  next: data => {
                    // const certificate = this.form.controls['token'].value.certificateBlob
                    if (data.signedChallenge) {
                      if (
                        this.socketService.tokenPass$.value &&
                        !this.socketService.defTokenPassess.includes(
                          this.socketService.tokenPass$.value
                        )
                      ) {
                        const body = {
                          challenge: ch,
                          signature: data.signedChallenge,
                          certificate: this.profileInfo
                            ? this.profileInfo.certificateBlob
                            : this.form.controls['token'].value.certificateBlob,
                        };

                        /* 
                        BODY
                        challenge: CODE CHALLENGE
                        signature: SIGNED CODE CHALLENGE
                        certificate: CERTIFICATE(NOT EXPIRED)
                      */
                        this.loginService.socketData$.next({});
                        // if (data.signedChallenge) {
                        if (!this.loginRequestSubscription) {
                          this.loginRequestSubscription =
                            this.loginService.validateBySignature(body);

                          sessionStorage.setItem(
                            'sn',
                            this.profileInfo
                              ? this.profileInfo.serialNumber
                              : this.form.controls['token'].value.serialNumber
                          );
                          sessionStorage.setItem(
                            'profile',
                            this.profileInfo
                              ? this.profileInfo.profile
                              : this.form.controls['token'].value.profile
                          );
                        }
                        // }
                      } else {
                        this.isTokenChangeModal = true;
                        this.isPassShown = false;
                        this.bsModalRef.setClass('modal-w-420 modal-mt-160');
                        this.isGettingCodeChallenge = false;
                        this.isTokenLoading = false;
                        if (this.codeChallengeSubscription) {
                          this.codeChallengeSubscription.unsubscribe();
                        }
                        const token = this.form.controls['token'].value;
                        this.form = this.fb.group({
                          token: [token],
                          currentPassword: [null, this.tokenKeyValidator],
                          newPassword: [
                            null,
                            [
                              Validators.minLength(8),
                              this.tokenLetterValidator,
                              this.tokenNumberValidator,
                              this.tokenSymbolValidator,
                              Validators.required,
                            ],
                          ],
                          newPassword2: [null, Validators.required],
                        });
                        this.changeDetection.detectChanges();
                      }
                    }
                  },
                  error: err => {
                    this.codeChallengeRequestSubscription.unsubscribe();
                    this.isGettingCodeChallenge = false;
                    this.isTokenLoading = false;
                  },
                });

              // 1.
              this.socketService.signChallenge(
                ch,
                this.form.controls['tokenKey'].value,
                this.form.controls['token'].value.profile,
                this.form.controls['token'].value.serialNumber
              );
            });
            this.changeDetection.detectChanges();
          },
          error: error => {
            this.isGettingCodeChallenge = false;
            this.isTokenLoading = false;
            errorMessage(error, this.toastrService);
            this.changeDetection.detectChanges();
          },
        });
    } else {
      console.info('not valid form');
      this.validateFields();
      // this.formErrors.tokenKey = 'Пароль не верный'
    }
  }

  validateFields(): void {
    const form = this.form;
    const allFields = Object.keys(form.controls);
    let emptyField: string;
    allFields.forEach(f => {
      if (!form.get(f).value && form.get(f).status === 'INVALID') {
        if (!emptyField) {
          emptyField = f;
        }
        form.get(f).markAsTouched();
        form.get(f).markAsDirty();
      }
    });
    if (emptyField) {
      document.getElementById(emptyField).focus();
      errorMessage({ message: this.emptyFieldsError }, this.toastrService);
    }
  }

  showPass(id: string) {
    switch (id) {
      case 'tokenKey':
      case 'currentPassword':
        this.isPassShown = !this.isPassShown;
        document
          .getElementById(id)
          .setAttribute('type', this.isPassShown ? 'text' : 'password');
        break;
      case 'newPassword':
        this.isNewPassShown = !this.isNewPassShown;
        document
          .getElementById(id)
          .setAttribute('type', this.isNewPassShown ? 'text' : 'password');
        break;
      case 'newPassword2':
        this.isNewPassShown2 = !this.isNewPassShown2;
        document
          .getElementById(id)
          .setAttribute('type', this.isNewPassShown2 ? 'text' : 'password');
        break;

      default:
        break;
    }
  }

  isReadOnlyTokenKey(): boolean | null {
    if (this.isGettingCodeChallenge || this.isTokenLoading) {
      return true;
    } else {
      return null;
    }
  }

  checkForm(): boolean {
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
  //Валидация на наличие латинских букв
  tokenLetterValidator = (
    control: AbstractControl
  ): { [key: string]: boolean } => {
    if (control.value && control.value.length > 0) {
      if (!/[a-zA-Z]/.test(control.value)) {
        return { letterError: true };
      }
    }
    return null;
  };

  //Валидация на наличие цифр
  tokenNumberValidator = (
    control: AbstractControl
  ): { [key: string]: boolean } => {
    if (control.value && control.value.length > 0) {
      if (!/[0-9]/.test(control.value)) {
        return { numberError: true };
      }
    }
    return null;
  };
  //Валидация на наличие символов
  tokenSymbolValidator = (
    control: AbstractControl
  ): { [key: string]: boolean } => {
    if (control.value && control.value.length > 0) {
      if (!/[!@#$%^&*+-]/.test(control.value)) {
        return { symbolError: true };
      }
    }
    return null;
  };

  displayFieldClass(field: string) {
    // css класс
    return { 'is-invalid': this.isFieldInvalid(field) };
  }

  isFieldInvalid(field: string) {
    // Валидация полей
    const formField = this.form.get(field);
    return (
      (!formField?.valid && formField?.touched && !formField?.pristine) ||
      (!formField?.valid && formField?.dirty && !formField?.pristine)
    );
  }

  onOpen() {
    this.isSearchable = true;
  }

  onClose() {
    this.isSearchable = false;
  }

  returnSerialNumber() {
    if (
      this.form.controls['token'].value &&
      this.form.controls['token'].value.serialNumber
    ) {
      return this.form.controls['token'].value.serialNumber;
    } else {
      return '';
    }
  }

  parseSubject(data: string, pattern: string) {
    const parsedData = data.split(';');
    const assigned = parsedData.find(i => i.includes(pattern));
    if (assigned) {
      return assigned.replace(pattern, '').replaceAll('"', '');
    } else {
      return '';
    }
  }

  returnSigner() {
    if (
      this.form.controls['token'].value &&
      this.form.controls['token'].value.subjectDN
    ) {
      return this.parseSubject(
        this.form.controls['token'].value.subjectDN,
        'CN='
      );
    } else {
      return '';
    }
  }

  getUsagePeriod() {
    if (
      this.form.controls['token'].value &&
      this.form.controls['token'].value.validTo
    ) {
      const now = moment();
      const dateObj = moment(
        this.form.controls['token'].value.validTo,
        'YYYYMMDDhhmmssZ'
      );
      return dateObj.diff(now, 'days');
    } else {
      return '';
    }
  }

  isFieldTouched(field: string) {
    const formField = this.form?.get(field);
    return (
      (formField?.touched && !formField?.pristine) ||
      (formField?.dirty && !formField?.pristine)
    );
  }
}
