/* eslint-disable max-len */
import {
  Component,
  ChangeDetectionStrategy,
  TemplateRef,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TranslateService } from '@ngx-translate/core';
import {
  docNum,
  errorMessage,
  getError,
  getIn,
  successMessage,
} from '@app/core/helpers';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { OperationsService } from '@core/services/operations.service';
import { LoginService } from '@core/services/login.service';
import { ICurrAccountsInfo } from '@data/models/bill-types';
import {
  IBankBIN,
  IP2PSecuredRequest,
  TRANSFER_DETAILS,
} from '@data/models/p2p-types';
import { SIGN_CONFIRM, TRANSFER_CONFIRM } from '@core/constants/pathnames';
import { DocumentService } from '@app/core/services/document.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { HelperService } from '@app/core/services/helper.service';
import moment from 'moment';
import { requestDateFormat, systemErrors } from '@app/core/constants';
import {
  BehaviorSubject,
  interval,
  Observable,
  Subscription,
  timer,
} from 'rxjs';
import { environment } from '@env/environment';
import { CustomvalidationService } from '@app/core/services/customvalidation.service';

const mainFields = ['cardFrom', 'amount'];

const visa = './assets/icons/ic_visa.svg';
const mc = './assets/icons/ic_master_card.svg';
const commissionUrl = 'p2p/get-commission';
@Component({
  selector: 'ob-common-transfer',
  templateUrl: './common-transfer.component.html',
  styleUrls: ['./common-transfer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommonTransferComponent
  extends SubscriptionAccumulator
  implements OnInit, OnDestroy
{
  modalRef?: BsModalRef;
  transferForm: FormGroup;

  public accountFromList: ICurrAccountsInfo[] = [];
  public phoneNumber: string = '';
  public cardFrom: any;
  public accountTo: any;
  public cardNumber: string = '';
  public commission: string;
  public code: string = '';

  // prefills - Поля предзаполнения данных для запросов комиссий и переводов
  public defaultPrefill: any; // a2a
  public payCardPrefill: any; // a2c
  public payFromCardPrefill: any; // c2a

  // view vars
  public transferType: string = ''; // Тип перевода
  public transferTitle: string = ' '; // Заголовок перевода
  public cardNumberPlaceholder: any;
  public notFound: string;
  public emptyFieldsError: string;

  //array accounts and cards
  public cardList: any[] = [];

  public issuerIdentificationNumber: string = '';
  public issuerBankName: string = '';

  public issuerBankLogo$ = new BehaviorSubject<any>(null);
  public observableIssuerBankLogo$ = this.issuerBankLogo$.asObservable();

  public issuerCardType$ = new BehaviorSubject<any>(null);
  public observableIssuerCardType$ = this.issuerCardType$.asObservable();

  // Subscriptions
  public subscription: Subscription; // Подписка на запрос СМС кода
  public numberRegiterSubsc$: Subscription;
  public timerSubscription: Subscription; // Подписка таймер
  public smsValidationSubscr: Subscription;
  public getSmsCodeSubscription: Subscription;
  public subscriptions: Subscription[] = []; // Подписка на запрос СМС кода

  // Таймер
  public observableTimer: Observable<number>;
  public minutes: number = 0;
  public seconds: number = 5;
  public isTimerFinished: boolean = false;

  // Errors
  public errorCardNumber: boolean = false;
  public numberSendError: string = '';
  public smsError: string = '';
  public errorSystemCode: string = '';

  /* FLAGS FLAGS FLAGS */

  /* Списки */
  public accountListLoading: boolean = false;
  public saveCardsLoading: boolean = false;
  public corpCardsLoading: boolean = false;
  /* Списки */

  /* Подтверждение */
  public isConfirmationLoading: boolean = false;
  /* Подтверждение */

  /* Card From */
  public isSearchableSrc: boolean = false;
  /* Card */

  public isLoading: boolean = false;
  public formLoading: boolean = false; // TODO not used

  public isNumberSend: boolean = false;
  public isCodeCompleted: boolean = false;
  /* Номер документа */
  public isEditDocNum: boolean = false;

  /* FLAGS FLAGS FLAGS */
  public editTemplate: any;

  public commonTransferInfo: boolean = false;
  public commonTransferInfo1: boolean = false;
  public senderIban: string = '';

  public insufficientFunds: boolean = false;
  public isEmptyBalance: boolean = false;

  constructor(
    private fb: FormBuilder,
    public operationsService: OperationsService,
    public route: ActivatedRoute,
    public router: Router,
    public changeDetector: ChangeDetectorRef,
    private loginService: LoginService,
    private modalService: BsModalService,
    private translate: TranslateService,
    private documentService: DocumentService,
    private toastr: ToastrService,
    private helperService: HelperService,
    private customValidation: CustomvalidationService
  ) {
    super();
    this.getCurrency = this.getCurrency.bind(this);
    this.transferForm = this.fb.group({
      cardFrom: [null, this.cardFromValidator],
      cardTo: [null, customValidation.cardToValidator],
      amount: ['', this.amountValidator],
      docNum: [' ', this.docNumValidator],
    });
    this.addSubscriber(
      // редактирование
      this.documentService.currentTemplate$.subscribe(data => {
        if (this.route.snapshot.queryParamMap.get('template')) {
          if (data) {
            this.editTemplate = data;
          }
        }
      })
    );
  }
  ngOnInit(): void {
    // this.docNum = docNum();
    const transferType = this.route.snapshot.params.type; // Текущий перевод
    this.transferType = transferType;
    this.transferTitle = 'На карту любого банка'; // Имя текущего типа перевода
    this.defaultPrefill = TRANSFER_DETAILS.defaultPrefill;
    this.route.queryParams.subscribe(params => {
      const iban = params['iban'];
      if (iban) {
        this.senderIban = iban;
        this.changeDetector.detectChanges();
      }
    });
    if (this.editTemplate) {
      this.edit();
    } else {
      this.getPrefill('/pay-to-card/pre-fill');
    }

    /* Подписка на ошибки авторизации */
    this.addSubscriber(
      this.operationsService.numberSendError$.subscribe({
        next: error => {
          if (error) {
            this.minutes = 0;
            this.seconds = 0;
            this.numberSendError = error;
            this.changeDetector.detectChanges();
          }
        },
      })
    );

    this.addSubscriber(
      // TODO NOT USED this.isLoading
      this.loginService.isLoading$.subscribe({
        next: v => (this.isLoading = v),
      })
    );

    // this.setValidators();
    this.getTranslations();
    this.getSavedCards();
    this.getCurrentAccounts();
    this.getCorporateAccounts();
    this.getValueChanges();

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
              this.changeDetector.detectChanges();
            },
            error: err => console.info(err),
            complete: () => {
              console.info('completed');
              this.changeDetector.detectChanges();
            },
          });
        } else {
          // if (this.timerSubscription) {
          //   this.timerSubscription.unsubscribe()
          // }
        }
        this.changeDetector.detectChanges();
      },
    });
    this.loginService.userInfoObject$.subscribe({
      next: v => {
        let number = getIn(v, 'user', 'phone');
        if (number) {
          number = `${number.substring(0, 3)} ${number.substring(
            3,
            6
          )} ${number.substring(6, 8)} ${number.substr(8)}`;
        }
        this.phoneNumber = number;

        this.changeDetector.detectChanges();
      },
    });
  }

  timeLeft(): Number {
    return this.minutes * 60 + this.seconds;
  }

  renderTimeUnit(sec: number) {
    // TODO MOVE TO HELPER FNS
    return sec < 10 ? `0${sec}` : `${sec}`;
  }

  getCorporateAccounts() {
    // Текущие КОРПОРАТИВНЫЕ СЧЕТА
    this.corpCardsLoading = true;
    this.addSubscriber(
      this.operationsService.getContracts_v2().subscribe({
        next: result => {
          let filteredResult = result;
          this.cardList = result;
          if (this.transferType === 'card') {
            filteredResult = result.filter(
              // v => v.level === 3 && v.contractType === 'C' && v.valid === 'V' && v.amountBalance > 0
              v => v.level === 3 && v.contractType === 'C' // Фильтрация по картам Level 3(карты) - не скрываем не валидные
            );
          }
          const tempList = [...this.accountFromList, ...filteredResult];
          if (
            !this.transferForm.get('cardFrom').value &&
            this.senderIban &&
            tempList.length &&
            tempList.findIndex(i => i.accountIban === this.senderIban) > -1
          ) {
            this.senderIban;
            this.transferForm.patchValue({
              cardFrom: this.senderIban,
            });
          }
          this.accountFromList = tempList;
          this.corpCardsLoading = false;
          this.changeDetector.detectChanges();
        },
        error: error => {
          errorMessage(error, this.toastr);
          this.corpCardsLoading = false;
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  getCurrentAccounts() {
    // ТЕКУЩИЕ СЧЕТА с балансами
    if (this.transferType === 'accounts') {
      this.accountListLoading = false;
      this.addSubscriber(
        this.operationsService.getAccountsList().subscribe({
          next: (result: any) => {
            let kztCurrencyBalance = result.filter(
              (balance: any) => balance.currency === 'KZT'
            );
            const tempList = [...this.accountFromList, ...kztCurrencyBalance];

            if (
              !this.transferForm.get('cardFrom').value &&
              this.senderIban &&
              tempList.length &&
              tempList.findIndex(i => i.iban === this.senderIban) > -1
            ) {
              const senderAcc = tempList.find(i => i.iban === this.senderIban);
              if (senderAcc) {
                this.cardFrom = senderAcc;
                this.transferForm.patchValue({
                  cardFrom: senderAcc.iban,
                });
              }
            }

            this.accountFromList = tempList;
            // const acc = this.accountFromList.find((acc: any) => acc.iban === iban);

            // if (iban) {
            //   this.cardFrom = acc;
            //   this.transferForm.patchValue({ cardFrom: acc });
            // }
            this.accountListLoading = false;
            this.changeDetector.detectChanges();
          },
          error: error => {
            errorMessage(error, this.toastr);
            this.accountListLoading = false;
            this.changeDetector.detectChanges();
          },
        })
      );
    }
  }

  getSavedCards(): void {
    // СОХРАНЕННЫЕ КАРТЫ
    if (this.transferType === 'card') {
      this.saveCardsLoading = true;
      this.addSubscriber(
        this.operationsService.getSavedCards().subscribe({
          next: (result: any) => {
            // this.accountFromList = [...this.accountFromList, ...result];
            this.saveCardsLoading = false;
            this.changeDetector.detectChanges();
          },
          error: error => {
            errorMessage(error, this.toastr);
            this.saveCardsLoading = false;
            this.changeDetector.detectChanges();
          },
        })
        // .add(() => {
        //   setTimeout(() => {

        //   }, 2000);
        // })
      );
    }
  }

  getTranslations() {
    this.translate
      .get([
        'operations.p2p.cardNumber',
        'operations.p2p.selectAccount',
        'default.not_found',
        'operations.default.comissionHint',
        'error.empty_fields_present',
      ])
      .subscribe(translations => {
        this.cardNumberPlaceholder = translations['operations.p2p.cardNumber'];
        (this.notFound = translations['default.not_found']),
          (this.commission = translations['operations.default.comissionHint']);
        this.emptyFieldsError = translations['error.empty_fields_present'];
      });
  }

  get transferFormControl() {
    return this.transferForm.controls;
  }

  resend() {
    this.code = '';
    // this.isTimerFinished = false;
    this.minutes = 2;
    this.seconds = 0;
    const phone = this.phoneNumber.replaceAll(' ', '');
    this.operationsService.getSmsCode(phone, this.toastr);
  }

  getValueChanges() {
    this.transferForm.get('cardFrom').valueChanges.subscribe(item => {
      const sum = this.transferForm.get('amount').value;
      const nCard = this.getCardFrom();
      if (nCard?.amountBalance <= 0) {
        this.isEmptyBalance = true;
      } else {
        this.isEmptyBalance = false;
      }
      if (sum) {
        const nCard = this.getCardFrom();
        this.insufficientFunds = sum > nCard?.amountBalance; // Проверка достаточности средств
        this.changeDetector.detectChanges();
      }
    });

    this.transferForm.get('amount').valueChanges.subscribe(v => {
      if (v) {
        if (v > 0) {
          const nCard = this.getCardFrom();
          if (nCard) {
            this.insufficientFunds = v > nCard?.amountBalance;
            this.changeDetector.detectChanges();
          }
        }
      }
    });

    this.transferForm
      .get('cardTo')
      .valueChanges.pipe(debounceTime(800), distinctUntilChanged())
      .subscribe(v => {
        if (v) {
          this.cardNumber = v.replace(/[^\d]/g, '');
          if (this.cardNumber.length >= 6) {
            this.getBankById(this.cardNumber);
          } else {
            this.issuerBankLogo$.next(null);
            this.issuerCardType$.next(null);
          }
        } else {
          this.issuerBankLogo$.next(null);
          this.issuerCardType$.next(null);
        }
        this.changeDetector.detectChanges();
      });
    this.transferForm.valueChanges
      .pipe(debounceTime(600), distinctUntilChanged())
      .subscribe(_ => {
        this.formLoading = true;
        this.getCommission(commissionUrl);
        this.changeDetector.detectChanges();
      });
  }

  getBankById(issuerId: string) {
    this.addSubscriber(
      this.operationsService
        .getBankByIssuerIdentificationNumber(issuerId.substring(0, 6))
        .subscribe(
          (result: IBankBIN) => {
            if (result.issuerIdentificationNumber) {
              this.issuerIdentificationNumber =
                result.issuerIdentificationNumber;
              this.issuerBankName = result.bank;
              this.issuerBankLogo$.next(result.bankLogoURI);
              this.issuerCardType$.next(result.issuingSystem);

              this.errorCardNumber = false;
            }
          },
          error => {
            if (!error.ok) {
              this.errorCardNumber = true;
              this.issuerBankLogo$.next(null);
              this.issuerCardType$.next(null);
            }
          }
        )
    );
  }

  /* 
    Метод возврата иконки  
    в зависимости от level возвращает карту или счет
    Значения level: 
    1 Карт-счет
    3 Карта
    undefined Счет
  */
  getIcon(account: any): string {
    let icon = visa;
    if (account.level) {
      if (account.level === 1) {
        icon = this.helperService.getAccountIcon(
          account.currency || account.currencyCode,
          'default',
          'accounts'
        );
      }
      if (account.level === 3) {
        const firstChar =
          account.contractNumber && account.contractNumber.charAt(0);
        if (firstChar === '5') {
          icon = mc;
        }
      }
    } else {
      icon = this.helperService.getAccountIcon(
        account.currency,
        'default',
        'accounts'
      );
    }
    return icon;
  }

  returnRequestBody() {
    let selectedCardIdFrom;
    let contractNumber = this.accountFromList.find(
      card => card.accountIban === this.transferFormControl.cardFrom.value
    )?.contractNumber;
    let contractName = this.accountFromList.find(
      card => card.accountIban === this.transferFormControl.cardFrom.value
    )?.contractName;

    if (this.editTemplate) {
      selectedCardIdFrom = this.editTemplate.cardIdFrom;
    } else {
      selectedCardIdFrom = this.accountFromList.find(
        x => x.accountIban === this.transferFormControl.cardFrom.value
      ).contractId;
    }

    let bodyParams = {
      docNum: this.transferForm.get('docNum').value,
      docDate: getIn(this.defaultPrefill, 'docDate'),
      valDate:
        getIn(this.defaultPrefill, 'valDate') ||
        getIn(this.defaultPrefill, 'docDate'),
      amount: this.transferForm.get('amount').value || 0,
      cardIdFrom: selectedCardIdFrom ? selectedCardIdFrom : undefined,
      cardIdTo: 0,
      cardTo: this.transferForm.get('cardTo').value,
      docType: 'PAY_TO_CARD',
      bicBankRecipient:
        getIn(this.defaultPrefill, 'bicBankRecipient') ||
        TRANSFER_DETAILS.bicBankRecipient,
      source: TRANSFER_DETAILS.source,
      issuerIdentificationNumber: this.issuerIdentificationNumber,
      cardToName: this.issuerBankName,
      contractNumber: contractNumber ? contractNumber : '',
      contractName: contractName ? contractName : '',
      accountFrom: this.transferFormControl.cardFrom.value,
    };
    return bodyParams;
  }

  changeSelectedAccount(item: any, name: string) {
    const iban = item.iban || item.accountIban;
    if (name === 'cardFrom') {
      this.cardFrom = iban;
      //this.cardFrom.iban = iban;
    } else {
      this.accountTo = item;
      this.accountTo.iban = iban;
    }
  }
  resetTimer() {
    this.minutes = 0;
    this.seconds = 0;
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  sendToConfirm() {
    if (
      this.transferForm.valid &&
      !this.errorCardNumber &&
      !this.isEmptyBalance &&
      !this.insufficientFunds
    ) {
      this.isLoading = true;

      const requestBody = this.returnRequestBody();
      const queryParams = {
        template: requestBody,
        operationType: 'card',
      };
      this.router.navigate([SIGN_CONFIRM.replace(':type', 'card')]);
      this.documentService.dataTemplate$.next(queryParams);
      localStorage.setItem('template', JSON.stringify(queryParams));
    } else {
      const allFields = Object.keys(this.transferForm.controls);
      let emptyField: string;
      allFields.forEach(f => {
        if (
          !this.transferForm.get(f).value &&
          this.transferForm.get(f).status === 'INVALID'
        ) {
          if (!emptyField) {
            emptyField = f;
          }
          this.transferForm.get(f).markAsTouched();
          this.transferForm.get(f).markAsDirty();
        }
      });
      if (emptyField) {
        errorMessage({ message: this.emptyFieldsError }, this.toastr);
      }
    }
  }

  confirmTransfer() {
    this.router.navigate([
      TRANSFER_CONFIRM.replace(':type', this.transferType),
      {
        sum: this.transferForm.get('amount').value,
        name: this.defaultPrefill?.bankNameRecipient,
        receiver: '',
        operationType: 'transfer',
      },
    ]);
  }

  edit() {
    let nDocNum = docNum();
    let issuerIdentificationNumber = '';
    if (getIn(this.editTemplate, 'cardTo')) {
      issuerIdentificationNumber = this.editTemplate.cardTo.substr(0, 6);
    }
    this.issuerIdentificationNumber = issuerIdentificationNumber;
    let nDocDate = moment().format(requestDateFormat);
    this.defaultPrefill = this.editTemplate;
    if (!this.editTemplate.docDate) {
      this.defaultPrefill.docDate = nDocDate;
    }
    if (this.editTemplate.docNum && this.editTemplate.docNum !== 'null') {
      nDocNum = this.editTemplate.docNum;
    }
    this.transferForm.patchValue({
      docNum: this.editTemplate.docNum,
      cardFrom: this.editTemplate.accountFrom,
      cardTo: this.editTemplate.cardTo,
      amount: this.editTemplate.amount,
    });
    this.getCommission(commissionUrl);
    this.getBankById(this.issuerIdentificationNumber);
  }

  getPrefill(type: string): void {
    // Получение предзаполненных данных для запросов комиссий и переводов
    let nDocNum = docNum();
    let nDocDate = moment().format(requestDateFormat);
    this.subscriptions.push(
      this.operationsService.getTransferPrefill(type).subscribe({
        next: (data: any) => {
          this.defaultPrefill = data;
          if (!data.docDate) {
            this.defaultPrefill.docDate = nDocDate;
          }
          this.transferForm.patchValue({ docNum: nDocNum });
          this.changeDetector.detectChanges();
        },
        error: error => {
          this.defaultPrefill = { docDate: nDocDate, docNum: nDocNum };
          this.transferForm.patchValue({ docNum: nDocNum });
          errorMessage(error, this.toastr);
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  getCommission(url: string): void {
    // Запрос коммиссии
    if (this.transferForm.valid) {
      const requestBody = this.returnRequestBody();
      let nUrl = `${url}?issuerIdentificationNumber=${this.issuerIdentificationNumber}`;
      this.formLoading = true;
      this.subscriptions.push(
        this.documentService
          .getPaymentCommissionP2P(requestBody, nUrl)
          .subscribe({
            next: (data: any) => {
              this.commission = data + ' ₸';
              this.formLoading = false;
              this.changeDetector.detectChanges();
            },
            error: (error: any) => {
              errorMessage(error, this.toastr);
              this.formLoading = false;
              this.changeDetector.detectChanges();
            },
          })
      );
    } else {
      this.formLoading = false;
    }
  }

  cardFromValidator = (control: FormControl) => {
    if (control && control.value && Object.keys(control.value).length) {
      return null;
    } else {
      return { cardFrom: true };
    }
  };

  amountValidator = (control: FormControl) =>
    control.value > 0 ? null : { amount: true };

  docNumValidator = (control: FormControl) => {
    // Валидатор поля Номера документа
    if (control.value) {
      if (control.value.length > 9) {
        return { maxLengthExceeded: true };
      } else {
        if (!/^[a-zA-Z0-9]+$/.test(control.value)) {
          return { pattern: true };
        } else {
          return null;
        }
      }
    } else {
      return { required: true };
    }
  };

  resetState() {
    this.cardFrom = {};
    this.accountTo = {};
    this.commission = '';
  }

  editDocNum() {
    this.isEditDocNum = !this.isEditDocNum;
    if (this.isEditDocNum === true) {
      setTimeout(() => {
        const elm = document.getElementById('docNum');
        if (elm) {
          elm.focus();
        }
      }, 0);
    }
  }
  onDocNumKeyUp(event: any) {
    // Проверка на нажатие клавиши Enter на поле номер документа
    if (event.keyCode === 13) {
      this.isEditDocNum = false;
    }
  }

  ngOnDestroy(): void {
    this.loginService.changeLoginError('');
    this.subscriptions.forEach(s => s.unsubscribe());
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    this.modalService.hide(1);
  }

  isFieldValid(field: string) {
    const formField = this.transferForm.get(field);
    return (
      (!formField.valid && formField.touched && !formField.pristine) ||
      (!formField.valid && formField.dirty && !formField.pristine)
    );
  }

  displayFieldClass(field: string) {
    if (field === 'cardTo') {
      return { 'is-invalid': this.isFieldValid(field) || this.errorCardNumber };
    } else {
      return { 'is-invalid': this.isFieldValid(field) };
    }
  }

  onOpenOnCloseSrc(isOn: boolean) {
    this.isSearchableSrc = !isOn;
  }

  getCurrency(account: any) {
    return this.helperService.formatCurrency(account.currencyCode);
  }

  closeModal() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.resetState();
    this.minutes = 2;
    this.seconds = 0;
    this.numberSendError = '';
    this.smsError = '';
    this.errorSystemCode = '';
    this.changeDetector.detectChanges();
    this.modalRef.hide();
  }

  docNumChange(value: any) {
    this.transferFormControl.docNum.setValue(value);
  }

  commonTransferInfoShow() {
    this.commonTransferInfo = !this.commonTransferInfo;
  }

  commonTransferInfo1Show() {
    this.commonTransferInfo1 = !this.commonTransferInfo1;
  }

  getCardIcon(cardType: string) {
    if (cardType === 'MASTERCARD') {
      return mc;
    } else {
      return visa;
    }
  }

  getBankIcon(bankLogoURI: string) {
    return environment.baseUrl2 + '/document-service' + bankLogoURI;
  }

  getCardFrom() {
    const selectedCard = this.transferForm.get('cardFrom').value;
    const nCard = this.accountFromList.find((acc: any) => {
      const iban = acc.iban || acc.accountIban;
      if (iban === selectedCard) {
        return acc;
      }
    });
    return nCard;
  }
}
