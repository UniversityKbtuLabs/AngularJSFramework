import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelperService } from '@core/services/helper.service';
import { CustomvalidationService } from '@core/services/customvalidation.service';
import { OperationsService } from '@core/services/operations.service';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { docNum, errorMessage, successMessage } from '@core/helpers';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
import {
  operationPeriod,
  periodFormat,
  requestDateFormat,
} from '@core/constants';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SIGN_CONFIRM } from '@core/constants/pathnames';
import { TRANSFER_DETAILS } from '@data/models/p2p-types';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from '@core/services/document.service';
import { Subscription } from 'rxjs';
import { LoginService } from '@core/services/login.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ob-convertation',
  templateUrl: './convertation.component.html',
  styleUrls: ['./convertation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConvertationComponent
  extends SubscriptionAccumulator
  implements OnInit
{
  convertationForm: FormGroup;
  isEditDocNum: boolean = false;
  convertationType: string = 'fx';
  convertationTypeList = [{ code: 'fx', label: 'Halyk FX' }];

  public fxRateInfo: boolean = false;
  public standartRateInfo: boolean = false;
  public treasuryInfo: boolean = false;
  public cashInfo: boolean = false;
  public defaultPrefill: any = null;
  public userInfo: any = null;

  isLoading: boolean = false;
  accountListLoading: boolean = false;
  formLoading: boolean = false;
  purposesLoading: boolean = false;
  valconContractsLoading: boolean = false;
  currentRateLoading: boolean = false;

  visa = './assets/icons/ic_visa.svg';
  masterCard = './assets/icons/ic_master_card.svg';

  accountList: any[] = [];
  valconContracts: any = [];
  kztCurrencyBalance: any[] = [];
  accountDebitList: any[] = [];
  accountCreditList: any[] = [];
  purposeList: any[] = [];

  amountDebitChangeSubscription: Subscription = null;
  amountCreditChangeSubscription: Subscription = null;

  public isEmptyBalance: boolean = false;
  public insufficientFunds: boolean = false;
  public isSearchableContract: boolean = false;
  isSearchablePurpose: boolean = false;
  isSearchableTarget: boolean = false;
  isSearchableSrc: boolean = false;
  private editTemplate: any;

  public initRate: any = null;
  public currentRate: number = null;
  public individualRate: number = null;
  public mainAmount: number = 0;
  public counterAmount: number = 0;
  public handShakeInterval: any;

  public showIndividualRate: boolean = false;
  public individualRateInterval: any;
  public individualRateTime: number = 179;
  public individualRateLoading: boolean = false;
  public refreshInterval: any;
  public refreshTime: number = 179;
  public amountInterval: any;

  public handShakeValue: any = null;
  public id: string = '';

  constructor(
    public helperService: HelperService,
    private fb: FormBuilder,
    private customValidator: CustomvalidationService,
    private operationsService: OperationsService,
    private toastrService: ToastrService,
    private changeDetector: ChangeDetectorRef,
    private router: Router,
    private documentService: DocumentService,
    private route: ActivatedRoute,
    private loginService: LoginService,
    private translateService: TranslateService
  ) {
    super();

    this.convertationForm = this.fb.group({
      accountDebit: [null, this.customValidator.accountFromValidator],
      accountCredit: [null, this.customValidator.accountToValidator],
      amountDebit: [null, Validators.required],
      amountCredit: [null, Validators.required],
      docNum: [' ', this.customValidator.docNumValidator],
      purpose: [null, Validators.required],
      contractNumber: [null],
    });

    this.addSubscriber(
      // редактирование
      this.documentService.currentTemplate$.subscribe(data => {
        if (this.route.snapshot.queryParamMap.get('template')) {
          if (data !== null) {
            this.editTemplate = data;
          } else {
            //после reload получаем данные
            this.editTemplate = JSON.parse(localStorage.getItem('template'));
          }
        }
      })
    );
  }

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('template')) {
      this.edit();
    } else if (this.route.snapshot.params['id']) {
      this.getExchange();
    }

    this.getPrefill();
    this.getCurrentAccounts();
    this.getValconContracts();
    this.getExchangePurposes();
    this.getValueChanges();
    this.getUserInfo();
  }

  docNumChange(value: any) {
    this.convertationFormControl.docNum.setValue(value);
  }

  editDocNum() {
    // Переключение режима редактирования поля Номера Документа
    this.isEditDocNum = !this.isEditDocNum;
    if (this.isEditDocNum === true) {
      setTimeout(() => {
        const elm = document.getElementById('docNum');
        elm.focus();
      }, 0);
    }
  }

  onDocNumKeyUp(event: any) {
    // Проверка на нажатие клавиши Enter на поле номер документа
    if (event.keyCode === 13) {
      this.isEditDocNum = false;
    }
  }

  get convertationFormControl() {
    return this.convertationForm.controls;
  }

  displayFieldClass(field: string) {
    // css класс
    return { 'is-invalid': this.isFieldInvalid(field) };
  }

  isFieldInvalid(field: string) {
    // Валидация полей
    const formField = this.convertationForm.get(field);
    return (
      (!formField.valid && formField.touched && !formField.pristine) ||
      (!formField.valid && formField.dirty && !formField.pristine)
    );
  }

  changeConvertationType(type: any) {
    this.convertationType = type;
  }

  fxRateInfoShow() {
    this.fxRateInfo = !this.fxRateInfo;
  }

  standartRateInfoShow() {
    this.standartRateInfo = !this.standartRateInfo;
  }

  treasuryInfoShow() {
    this.treasuryInfo = !this.treasuryInfo;
  }

  cashInfoShow() {
    this.cashInfo = !this.cashInfo;
  }

  onOpenOnCloseTarget(isOn: boolean) {
    this.isSearchableTarget = !isOn;
  }

  onOpenOnCloseSrc(isOn: boolean) {
    this.isSearchableSrc = !isOn;
  }

  getIcon(account: any): string {
    let icon = this.visa;
    if (account.level) {
      // Карта или Карт-счет
      if (account.level === 1) {
        // Карт-счет
        icon = this.helperService.getAccountIcon(
          account.currency || account.currencyCode,
          'default',
          'accounts'
        );
      }
      if (account.level === 3) {
        // Карта
        const firstChar =
          account.contractNumber && account.contractNumber.charAt(0);
        if (firstChar === '5') {
          icon = this.masterCard;
        }
      }
    } else {
      // Счет
      icon = this.helperService.getAccountIcon(
        account.currency,
        'default',
        'accounts'
      );
    }
    return icon;
  }

  private getPrefill() {
    let nDocNum = docNum();
    let nDocDate = moment().format(requestDateFormat);
    this.addSubscriber(
      this.operationsService.getConvertationPrefill().subscribe({
        next: (prefill: any) => {
          this.defaultPrefill = prefill;
          if (!prefill.docDate) {
            this.defaultPrefill.docDate = nDocDate;
          }
          this.defaultPrefill.binSender = this.userInfo.currentContract.bin;
          this.defaultPrefill.chief = this.userInfo.user.name;
          this.defaultPrefill.nameSender = this.userInfo.currentContract.name;
          this.convertationForm.patchValue({ docNum: nDocNum });
        },
        error: (err: any) => {
          errorMessage(err, this.toastrService);
        },
      })
    );
  }

  onContractSelect(contract: any) {}

  getContractAmount() {
    if (this.convertationFormControl.contractNumber.value) {
      return this.convertationFormControl.contractNumber.value.amount;
    } else {
      return 0;
    }
  }

  getContractCurrency() {
    if (this.convertationFormControl.contractNumber.value) {
      return this.helperService.formatCurrency(
        this.convertationFormControl.contractNumber.value.currency
      );
    } else {
      return 'KZT';
    }
  }

  onOpenContract(isSearchableContract: boolean) {
    this.isSearchableContract = !isSearchableContract;
  }

  onPurposeSelect(purpose: any) {}

  onOpenPurpose(isSearchablePurpose: boolean) {
    this.isSearchablePurpose = !isSearchablePurpose;
  }

  getCurrentAccounts(): void {
    // ТЕКУЩИЕ СЧЕТА с балансами
    this.accountListLoading = true;
    this.addSubscriber(
      this.operationsService
        .getAccountsList()
        .subscribe(
          (result: any) => {
            // this.kztCurrencyBalance = result.filter(
            //     (balance: any) => balance.currency === "KZT"
            // );
            //
            // //   const iban = this.router.url.split("/")?.[4];
            this.accountList = [...this.accountList, ...result];

            this.accountCreditList = [...this.accountCreditList, ...result]; // init values
            this.accountDebitList = [...this.accountDebitList, ...result];
            // if (!this.transferForm.get('accountTo').value && this.accountToList.length &&
            // this.senderIban && this.accountToList.findIndex(i => i.iban === this.senderIban) > -1) {
            //     this.transferForm.patchValue({
            //         accountTo: this.senderIban
            //     })
            // }
            if (
              this.route.snapshot.queryParamMap.get('mainCurrency') &&
              this.route.snapshot.queryParamMap.get('counterCurrency') &&
              this.route.snapshot.queryParamMap.get('operation')
            ) {
              this.getFXConvertationAccounts();
            }
          },
          error => errorMessage(error, this.toastrService)
        )
        .add(() => {
          setTimeout(() => {
            this.accountListLoading = false;
            this.changeDetector.detectChanges();
          }, 2000);
        })
    );
  }

  getValueChanges() {
    this.convertationForm.get('accountDebit').valueChanges.subscribe(item => {
      let iban = item;
      let accountDebit = this.getAccountDebit();
      let accountCredit = this.getAccountCredit();
      this.onAccountChange();

      this.accountCreditList = this.accountList.filter(
        item => item.currency !== accountDebit.currency
      );

      if (
        accountDebit?.actualBalance <= 0 ||
        accountDebit?.amountBalance <= 0
      ) {
        this.isEmptyBalance = true;
      } else {
        this.isEmptyBalance = false;
      }

      const sum = this.convertationForm.get('amountDebit').value;
      if (sum) {
        this.insufficientFunds =
          sum > accountDebit?.actualBalance ||
          sum > accountDebit?.amountBalance; // Проверка достаточности средств
        this.changeDetector.detectChanges();
      } else {
        this.insufficientFunds = false;
      }

      if (accountDebit && accountCredit) {
        this.currentRateLoading = true;
        this.addSubscriber(
          this.operationsService
            .initRate(accountDebit.currency, accountCredit.currency)
            .subscribe({
              next: (value: any) => {
                this.initRate = value[0];
                this.showIndividualRate = false;
                this.calculateRate();
                if (
                  this.convertationFormControl.amountCredit.value &&
                  this.convertationFormControl.amountDebit.value
                ) {
                  this.setCreditAmount();
                }
                this.refreshCurrentRate();
              },
              error: (err: any) => {
                errorMessage(err, this.toastrService);
              },
            })
        );
      }
    });

    this.convertationForm.get('accountCredit').valueChanges.subscribe(item => {
      let accountDebit = this.getAccountDebit();
      let accountCredit = this.getAccountCredit();
      this.onAccountChange();

      this.accountDebitList = this.accountList.filter(
        item => item.currency !== accountCredit.currency
      );
      if (accountDebit && accountCredit) {
        this.currentRateLoading = true;
        this.addSubscriber(
          this.operationsService
            .initRate(accountDebit.currency, accountCredit.currency)
            .subscribe({
              next: (value: any) => {
                this.initRate = value[0];
                this.showIndividualRate = false;
                this.calculateRate();
                if (
                  this.convertationFormControl.amountCredit.value &&
                  this.convertationFormControl.amountDebit.value
                ) {
                  this.setDebitAmount();
                }
                this.refreshCurrentRate();
              },
              error: (err: any) => {
                errorMessage(err, this.toastrService);
              },
            })
        );
      }
    });

    this.convertationForm.valueChanges
      .pipe(debounceTime(600), distinctUntilChanged())
      .subscribe(_ => {
        this.formLoading = true;
        // this.getCommission();
        this.changeDetector.detectChanges();
      });
  }

  getAccountDebit() {
    const selectedAcc = this.convertationForm.get('accountDebit').value;
    const nAccount = this.accountDebitList.find((acc: any) => {
      const iban = acc.iban || acc.accountIban;
      if (iban === selectedAcc) {
        return acc;
      }
    });
    return nAccount;
  }

  getAccountCredit() {
    const selectedAcc = this.convertationForm.get('accountCredit').value;
    const nAccount = this.accountCreditList.find((acc: any) => {
      const iban = acc.iban || acc.accountIban;
      if (iban === selectedAcc) {
        return acc;
      }
    });
    return nAccount;
  }

  getExchangePurposes() {
    this.purposesLoading = true;
    this.addSubscriber(
      this.operationsService.getExchangePurposes().subscribe({
        next: (value: any) => {
          this.purposeList = value;
          this.purposesLoading = false;
          this.changeDetector.detectChanges();
        },
        error: (err: any) => {
          errorMessage(err, this.toastrService);
          this.purposesLoading = false;
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  getValconContracts() {
    this.valconContractsLoading = true;
    this.addSubscriber(
      this.operationsService.getValconContracts().subscribe({
        next: (value: any) => {
          this.valconContracts = value;
          this.valconContractsLoading = false;
          this.changeDetector.detectChanges();
        },
        error: (err: any) => {
          errorMessage(err, this.toastrService);
          this.valconContractsLoading = false;
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  onSubmit() {
    if (
      this.handShakeValue &&
      this.handShakeValue.status === 'OFFERED' &&
      this.refreshTime > 0 &&
      this.individualRateLoading === false
    ) {
      clearInterval(this.refreshInterval);
      clearInterval(this.individualRateInterval);
      clearInterval(this.handShakeInterval);
      this.operationsService.convertationRefreshTime$.next(this.refreshTime);
      this.navigateToSign();
    } else {
      errorMessage(
        'Вы не можете совершить конвертацию по текущему курсу запросите индивидуальный',
        this.toastrService
      );
    }
  }

  navigateToSign() {
    if (this.convertationForm.valid) {
      this.isLoading = true;

      const requestBody = this.returnRequestBody('sign');
      const queryParams = {
        template: requestBody,
        operationType: 'convertation',
      };
      this.router.navigate([SIGN_CONFIRM.replace(':type', 'convertation')]);
      this.documentService.dataTemplate$.next(queryParams);
      localStorage.setItem('template', JSON.stringify(queryParams));
    } else {
      const allFields = Object.keys(this.convertationForm.controls);
      let emptyField: string;
      allFields.forEach(f => {
        if (
          !this.convertationForm.get(f).value &&
          this.convertationForm.get(f).status === 'INVALID'
        ) {
          if (!emptyField) {
            emptyField = f;
          }
          this.convertationForm.get(f).markAsTouched();
          this.convertationForm.get(f).markAsDirty();
        }
      });
      if (emptyField) {
        errorMessage({ message: 'Поля пустые' }, this.toastrService);
      }
    }
  }

  private returnRequestBody(type: string) {
    let accountDebit = this.getAccountDebit();
    let accountCredit = this.getAccountCredit();
    let requestBody: any = {};
    if (type === 'sign') {
      requestBody = {
        docNum: this.convertationFormControl.docNum.value,
        docDate: this.defaultPrefill.docDate,
        accountDebit: this.convertationFormControl.accountDebit.value,
        accountCredit: this.convertationFormControl.accountCredit.value,
        accountDebitCurrency: this.getAccountDebit().currency,
        accountCreditCurrency: this.getAccountCredit().currency,
        amountDebit: this.convertationFormControl.amountDebit.value,
        amountCredit: this.convertationFormControl.amountCredit.value,
        purpose: this.convertationFormControl.purpose.value,
        contractNumber: this.convertationFormControl.contractNumber.value,
        prefill: this.defaultPrefill,
        convertationType: this.convertationType,
        mainCurrency: this.initRate.mainCurrency,
        counterCurrency: this.initRate.counterCurrency,
        handShakeValue: this.handShakeValue,
        currentRate: this.currentRate,
        individualRate: this.individualRate,
        pairName: this.initRate.pairName,
      };
    } else if (type === 'validate') {
      requestBody = {
        docNum: this.convertationFormControl.docNum.value,
        docDate: this.defaultPrefill.docDate,
        accountDebit: this.convertationFormControl.accountDebit.value,
        accountCredit: this.convertationFormControl.accountCredit.value,
        amountDebit: this.convertationFormControl.amountDebit.value,
        amountCredit: this.convertationFormControl.amountCredit.value,
        currencyCredit: this.getAccountCredit().currency,
        currencyDebit: this.getAccountDebit().currency,
        amount: this.convertationFormControl.amountDebit.value,
        binSender: this.defaultPrefill.binSender,
        chief: this.defaultPrefill.chief,
        chiefAccountant: 'Не предусмотрен',
        nameSender: this.defaultPrefill.nameSender,
        clientCurrency: this.defaultPrefill.clientCurrency,
        handshakeId: this.defaultPrefill.handshakeId,
        operation: this.defaultPrefill.operation,
        rate: this.defaultPrefill.rate,
        residencySender: this.defaultPrefill.residencySender,
        secoSender: this.defaultPrefill.secoSender,
        purposeCode: this.convertationFormControl.purpose.value?.code,
        purpose: this.convertationFormControl.purpose.value?.description,
        amountKzt: this.defaultPrefill.amountKzt,
        amountUsd: this.defaultPrefill.amountUsd,
      };
    } else if (type === 'handshake') {
      requestBody = {
        amount: this.defaultPrefill.amountUsd,
        amountUSD: this.defaultPrefill.amountUsd,
        clientCurrency: this.defaultPrefill.clientCurrency,
        creditAmount: this.convertationFormControl.amountCredit.value,
        creditCurrency: accountCredit.currency,
        debitAmount: this.convertationFormControl.amountDebit.value,
        debitCurrency: accountDebit.currency,
        pairName: this.initRate.pairName,
      };
    }
    return requestBody;
  }

  private edit() {
    this.addSubscriber(
      this.documentService.dataTemplate$.subscribe({
        next: (data: any) => {
          this.convertationForm.patchValue({
            docNum: data.docNum,
            docDate: data.docDate,
            accountDebit: data.accountDebit,
            accountCredit: data.accountCredit,
            amountDebit: data.amountDebit,
            amountCredit: data.amountCredit,
            purpose: data.purpose,
            contractNumber: data.contractNumber,
          });
          this.defaultPrefill = data.prefill;
          this.individualRate = data.individualRate;
          this.currentRate = data.currentRate;
          this.handShakeValue = data.handShakeValue;
          this.addSubscriber(
            this.operationsService.convertationRefreshTime$.subscribe(value => {
              this.refreshTime = value;
              this.individualRateLoading = false;
              this.showIndividualRate = true;
              this.refreshIndividualRate();
            })
          );
        },
      })
    );
  }

  amountDebitFocus() {
    this.amountDebitChangeSubscription = this.convertationForm
      .get('amountDebit')
      .valueChanges.subscribe(v => {
        let accountDebit = this.getAccountDebit();
        let accountCredit = this.getAccountCredit();
        if (v) {
          if (v > 0) {
            if (accountDebit) {
              this.insufficientFunds =
                v > accountDebit?.actualBalance ||
                v > accountDebit?.amountBalance;
              if (accountDebit && accountCredit) {
                this.setCreditAmount();
              }
              this.changeDetector.detectChanges();
            }
          }
        } else {
          if (accountDebit && accountCredit) {
            this.convertationFormControl.amountCredit.setValue(null);
          }
          this.insufficientFunds = false;
        }
      });
    if (this.amountCreditChangeSubscription) {
      this.amountCreditChangeSubscription.unsubscribe();
    }
  }

  amountCreditFocus() {
    this.amountCreditChangeSubscription = this.convertationForm
      .get('amountCredit')
      .valueChanges.subscribe(v => {
        let accountDebit = this.getAccountDebit();
        let accountCredit = this.getAccountCredit();
        if (v) {
          if (v > 0) {
            if (accountDebit) {
              this.insufficientFunds =
                v > accountDebit?.actualBalance ||
                v > accountDebit?.amountBalance;
              if (accountDebit && accountCredit) {
                this.setDebitAmount();
              }
              this.changeDetector.detectChanges();
            }
          }
        } else {
          if (accountDebit && accountCredit) {
            this.convertationFormControl.amountDebit.setValue(null);
          }
          this.insufficientFunds = false;
        }
      });
    if (this.amountDebitChangeSubscription) {
      this.amountDebitChangeSubscription.unsubscribe();
    }
  }

  amountDebitFocusOut() {
    this.amountDebitChangeSubscription.unsubscribe();
  }

  amountCreditFocusOut() {
    this.amountCreditChangeSubscription.unsubscribe();
  }

  switchAccounts() {
    let accountDebit = this.getAccountDebit();
    let accountCredit = this.getAccountCredit();
    let debitList = this.accountDebitList;
    let creditList = this.accountCreditList;
    if (accountDebit && accountCredit) {
      this.accountDebitList = creditList;
      this.accountCreditList = debitList;
      this.convertationFormControl.accountDebit.setValue(accountCredit.iban);
      this.convertationFormControl.accountCredit.setValue(accountDebit.iban);
    }
  }

  getDebitFooter() {
    if (this.convertationFormControl.accountDebit.value) {
      return {
        currency: this.getAccountDebit()?.currency,
        amount: this.convertationFormControl.amountDebit.value,
      };
    } else {
      return {
        currency: 'KZT',
        amount: 0,
      };
    }
  }

  getCreditFooter() {
    if (this.convertationFormControl.accountCredit.value) {
      return {
        currency: this.getAccountCredit()?.currency,
        amount: this.convertationFormControl.amountCredit.value,
      };
    } else {
      return {
        currency: 'KZT',
        amount: 0,
      };
    }
  }

  calculateRate() {
    if (this.initRate) {
      let accountDebit = this.getAccountDebit();
      let amountCenter: number = 100000;

      let ratePrice: number = 0;
      if (this.initRate.mainCurrency === accountDebit.currency) {
        this.defaultPrefill.operation = 'BUY';
        if (
          (this.initRate.buyBelow ? this.initRate.buyBelow : 0) <=
            amountCenter &&
          (this.initRate.buyAbove ? this.initRate.buyAbove : 0) <= amountCenter
        ) {
          ratePrice = this.initRate.buyBelow ? this.initRate.buyBelow : 0;
        } else {
          ratePrice = this.initRate.buyAbove ? this.initRate.buyAbove : 0;
        }
      } else {
        this.defaultPrefill.operation = 'SELL';

        if (
          (this.initRate.sellBelow ? this.initRate.sellBelow : 0) <=
            amountCenter &&
          (this.initRate.sellAbove ? this.initRate.sellAbove : 0) <=
            amountCenter
        ) {
          ratePrice = this.initRate.sellBelow ? this.initRate.sellBelow : 0;
        } else {
          ratePrice = this.initRate.sellAbove ? this.initRate.sellAbove : 0;
        }
      }

      this.currentRate = ratePrice;
      this.defaultPrefill.rate = ratePrice;
      this.currentRateLoading = false;
    }
  }

  setCreditAmount() {
    let accountDebit = this.getAccountDebit();

    let sellAmount: number = Number(
      Number(this.convertationFormControl.amountDebit.value).toFixed(
        this.getNumberOfPrecisionForSum(
          this.initRate.mainCurrency,
          this.initRate.counterCurrency
        )
      )
    );
    let buyAmount: number = 0;

    if (accountDebit.currency === this.initRate.mainCurrency) {
      buyAmount = sellAmount * this.defaultPrefill.rate;
    } else {
      buyAmount =
        sellAmount /
        this.defaultPrefill.rate.toFixed(
          this.getNumberOfPrecisionForSum(
            this.initRate.mainCurrency,
            this.initRate.counterCurrency
          )
        );
    }

    this.convertationFormControl.amountCredit.setValue(
      buyAmount.toFixed(
        this.getNumberOfPrecisionForSum(
          this.initRate.mainCurrency,
          this.initRate.counterCurrency
        )
      )
    );

    if (this.convertationFormControl.amountDebit.value > 0) {
      clearInterval(this.amountInterval);
      let time: number = 1;
      this.amountInterval = setInterval(() => {
        if (time > 0) {
          time--;
        } else {
          time = 1;
          clearInterval(this.amountInterval);
          this.checkLimit();
        }
      }, 1000);
    }
    this.defaultPrefill.amount = this.mainAmount;
    this.defaultPrefill.clientCurrency = accountDebit.currency;
  }

  setDebitAmount() {
    let accountCredit = this.getAccountCredit();

    let buyAmount: number = Number(
      Number(this.convertationFormControl.amountCredit.value).toFixed(
        this.getNumberOfPrecisionForSum(
          this.initRate.mainCurrency,
          this.initRate.counterCurrency
        )
      )
    );
    let sellAmount: number = 0;

    if (accountCredit.currency === this.initRate.mainCurrency) {
      sellAmount = buyAmount * this.defaultPrefill.rate;
    } else {
      sellAmount =
        buyAmount /
        this.defaultPrefill.rate.toFixed(
          this.getNumberOfPrecisionForSum(
            this.initRate.mainCurrency,
            this.initRate.counterCurrency
          )
        );
    }

    this.convertationFormControl.amountDebit.setValue(
      sellAmount.toFixed(
        this.getNumberOfPrecisionForSum(
          this.initRate.mainCurrency,
          this.initRate.counterCurrency
        )
      )
    );

    if (this.convertationFormControl.amountCredit.value > 0) {
      clearInterval(this.amountInterval);
      let time: number = 1;
      this.amountInterval = setInterval(() => {
        if (time > 0) {
          time--;
        } else {
          time = 1;
          clearInterval(this.amountInterval);
          this.checkLimit();
        }
      }, 1000);
    }
    this.defaultPrefill.amount = this.mainAmount;
    this.defaultPrefill.clientCurrency = accountCredit.currency;
  }

  getNumberOfPrecisionForSum(
    mainCurrency: String,
    counterCurrency: String
  ): number {
    if (
      mainCurrency == 'XAU' ||
      mainCurrency == 'XAG' ||
      counterCurrency == 'XAU' ||
      counterCurrency == 'XAG'
    ) {
      return 3;
    } else {
      return 2;
    }
  }

  private checkLimit() {
    let body: any = this.returnRequestBody('validate');
    this.addSubscriber(
      this.operationsService.getCurrencyContractParams(body).subscribe({
        next: (val: any) => {
          if (val) {
            this.defaultPrefill.amountKzt = val.amountKZT;
            this.defaultPrefill.amountUsd = val.amountUSD;
            this.defaultPrefill.sellBuyCur = val.contractRequired;
          }
        },
        error: (err: any) => {
          errorMessage(err, this.toastrService);
        },
      })
    );
  }

  private getUserInfo() {
    this.addSubscriber(
      this.loginService.userInfoObject$.subscribe(value => {
        this.userInfo = value;
      })
    );
  }

  requestIndividualRate() {
    if (this.convertationForm.valid) {
      this.showIndividualRate = true;
      this.individualRateLoading = true;
      clearInterval(this.refreshInterval);
      this.refreshTime = 179;

      this.calculateIndividualRateTime();
      this.addSubscriber(
        this.operationsService.checkOperday().subscribe({
          next: (value: any) => {
            if (value.dayIsOpen === true || value.fx247 === true) {
              setTimeout(() => {
                this.validateFX();
              }, 5000);
            }
          },
          error: (err: any) => {
            errorMessage(err, this.toastrService);
            this.showIndividualRate = false;
            this.individualRateLoading = false;
          },
        })
      );
    } else {
      const allFields = Object.keys(this.convertationForm.controls);
      let emptyField: string;
      allFields.forEach(f => {
        if (
          !this.convertationForm.get(f).value &&
          this.convertationForm.get(f).status === 'INVALID'
        ) {
          if (!emptyField) {
            emptyField = f;
          }
          this.convertationForm.get(f).markAsTouched();
          this.convertationForm.get(f).markAsDirty();
        }
      });
      if (emptyField) {
        errorMessage({ message: 'Поля пустые' }, this.toastrService);
      }
    }
  }

  validateFX() {
    let bodyValidate = this.returnRequestBody('validate');
    this.operationsService.validateFX(bodyValidate).subscribe({
      next: validateVal => {
        this.createHandShake();
      },
      error: validateErr => {
        errorMessage(validateErr, this.toastrService);
        this.showIndividualRate = false;
        this.individualRateLoading = false;
      },
    });
  }

  createHandShake() {
    let bodyHandshake = this.returnRequestBody('handshake');
    this.operationsService.createHandShake(bodyHandshake).subscribe({
      next: value => {
        this.handShakeValue = value;
        this.pollHandShanke(0, 5);
      },
      error: error => {
        errorMessage(error, this.toastrService);
        this.showIndividualRate = false;
        this.individualRateLoading = false;
      },
    });
  }

  pollHandShanke(intervalCount: number, handShakeIntervalTime: number) {
    if (intervalCount !== 36) {
      this.handShakeInterval = setInterval(() => {
        if (handShakeIntervalTime > 0) {
          handShakeIntervalTime--;
        } else {
          handShakeIntervalTime = 5;
          intervalCount = intervalCount + 1;
          clearInterval(this.handShakeInterval);
          this.operationsService
            .pollHandShake(this.handShakeValue.id)
            .subscribe({
              next: value => {
                this.handShakeValue = value;
                if (
                  this.handShakeValue &&
                  this.handShakeValue.status === 'OFFERED' &&
                  this.handShakeValue.offeredRate !== null
                ) {
                  this.individualRateLoading = false;
                  this.individualRate = this.handShakeValue.offeredRate;
                  this.defaultPrefill.rate = this.handShakeValue.offeredRate;
                  this.defaultPrefill.handshakeId = this.handShakeValue.id;
                  this.defaultPrefill.operation = this.handShakeValue.operation;
                  this.refreshIndividualRate();
                  this.setCreditAmount();
                  this.changeDetector.detectChanges();
                } else {
                  this.pollHandShanke(intervalCount, handShakeIntervalTime);
                }
              },
              error: error => {
                errorMessage(error, this.toastrService);
                this.individualRateLoading = false;
                this.changeDetector.detectChanges();
              },
            });
        }
      }, 1000);
    } else {
      this.deleteHandshake();
    }
  }

  deleteHandshake() {
    if (this.handShakeValue && this.handShakeValue.id) {
      this.showIndividualRate = false;
      this.individualRateLoading = false;
      this.operationsService.deleteHandShake(this.handShakeValue.id).subscribe({
        next: () => {
          errorMessage('Прошло 3 минуты', this.toastrService);
          this.handShakeValue = null;
        },
        error: () => {
          errorMessage('Handshake не удален', this.toastrService);
        },
      });
    }
  }

  calculateIndividualRateTime() {
    this.individualRateInterval = setInterval(() => {
      if (this.individualRateTime > 0 && this.individualRateLoading === true) {
        this.individualRateTime--;
        this.changeDetector.detectChanges();
      } else {
        clearInterval(this.individualRateInterval);
        this.individualRateTime = 179;
      }
    }, 1000);
  }

  getTime(time: number) {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    return minutes + ':' + (seconds < 10 ? '0' + seconds : seconds) + ' c';
  }

  private refreshIndividualRate() {
    this.refreshInterval = setInterval(() => {
      if (
        this.refreshTime > 0 &&
        this.individualRateLoading === false &&
        this.showIndividualRate
      ) {
        this.refreshTime--;
        this.changeDetector.detectChanges();
      } else {
        clearInterval(this.refreshInterval);
        this.refreshTime = 179;
        this.requestIndividualRate();
        this.changeDetector.detectChanges();
      }
    }, 1000);
  }

  private refreshCurrentRate() {
    this.refreshInterval = setInterval(() => {
      if (this.refreshTime > 0) {
        this.refreshTime--;
        this.changeDetector.detectChanges();
      } else {
        clearInterval(this.refreshInterval);
        this.refreshTime = 179;
        let accountDebit = this.getAccountDebit();
        let accountCredit = this.getAccountCredit();
        if (accountDebit && accountCredit) {
          this.currentRateLoading = true;
          this.addSubscriber(
            this.operationsService
              .initRate(accountDebit.currency, accountCredit.currency)
              .subscribe({
                next: (value: any) => {
                  this.initRate = value[0];
                  this.showIndividualRate = false;
                  this.calculateRate();
                  if (
                    this.convertationFormControl.amountCredit.value &&
                    this.convertationFormControl.amountDebit.value
                  ) {
                    this.setCreditAmount();
                  }
                  this.refreshCurrentRate();
                },
                error: (err: any) => {
                  errorMessage(err, this.toastrService);
                },
              })
          );
        }
        this.changeDetector.detectChanges();
      }
    }, 1000);
  }

  getContractPlaceholder(): string {
    if (
      this.convertationFormControl.contractNumber.value ||
      this.isSearchableContract
    ) {
      return this.translateService.instant('settings.company.contract');
    } else {
      return this.translateService.instant(
        'currencyControl.convertation.contractNotRequire'
      );
    }
  }

  getCurrency(cur: string): string {
    if (cur) {
      return this.helperService.formatCurrency(cur);
    } else {
      return '';
    }
  }

  private getExchange() {
    this.id = this.route.snapshot.params['id'];
    this.addSubscriber(
      this.operationsService.getExchangeById(Number(this.id)).subscribe({
        next: (value: any) => {
          if (value) {
            this.convertationFormControl.accountDebit.setValue(
              value.accountDebit
            );
            this.convertationFormControl.accountCredit.setValue(
              value.accountCredit
            );
            this.convertationFormControl.amountDebit.setValue(
              value.amountDebit
            );
            this.convertationFormControl.amountCredit.setValue(
              value.amountCredit
            );
            this.convertationFormControl.docNum.setValue(value.docNum);
            this.getPurpose(value?.purposeCode);
            this.getContract(value?.currContractId);
            this.refreshCurrentRate();
          }
        },
        error: err => {
          errorMessage(err, this.toastrService);
        },
      })
    );
  }

  private getPurpose(purposeCode: string) {
    setTimeout(() => {
      let purpose: any;
      for (let i: number = 0; i < this.purposeList.length; i++) {
        if (this.purposeList[i].code === purposeCode) {
          purpose = this.purposeList[i];
          break;
        }
      }
      this.convertationFormControl.purpose.setValue(purpose);
    }, 0);
  }

  private getContract(currContractId: string) {
    setTimeout(() => {
      let contract: any;
      for (let i: number = 0; i < this.valconContracts.length; i++) {
        if (this.valconContracts[i].id === currContractId) {
          contract = this.valconContracts[i];
          break;
        }
      }
      this.convertationFormControl.contractNumber.setValue(contract);
    }, 0);
  }

  private onAccountChange() {
    this.currentRate = null;
    this.individualRate = null;
    this.handShakeValue = null;
    this.showIndividualRate = false;
    clearInterval(this.individualRateInterval);
    this.individualRateTime = 179;
    this.individualRateLoading = false;
    clearInterval(this.refreshInterval);
    this.refreshTime = 179;
  }

  getFXConvertationAccounts() {
    let operation = this.route.snapshot.queryParamMap.get('operation');
    let mainCurrency = this.route.snapshot.queryParamMap.get('mainCurrency');
    let counterCurrency =
      this.route.snapshot.queryParamMap.get('counterCurrency');
    let mainCurrencyAccount = null;
    let counterCurrencyAccount = null;
    for (let i = 0; i < this.accountList.length; i++) {
      if (mainCurrency === this.accountList[i]?.currency) {
        mainCurrencyAccount = this.accountList[i];
      } else if (counterCurrency === this.accountList[i]?.currency) {
        counterCurrencyAccount = this.accountList[i];
      }
    }
    if (operation === 'buy') {
      this.convertationForm.patchValue({
        accountDebit: mainCurrencyAccount?.iban,
        accountCredit: counterCurrencyAccount?.iban,
      });
    } else if (operation === 'sell') {
      this.convertationForm.patchValue({
        accountDebit: counterCurrencyAccount?.iban,
        accountCredit: mainCurrencyAccount?.iban,
      });
    }
  }
}
