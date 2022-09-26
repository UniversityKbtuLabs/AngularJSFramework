import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  currencyTransferCurrencies,
  FILE_SIZE_20MB,
  operationPeriod,
  periodFormat,
  requestDateFormat,
} from '@app/core/constants';
import {
  docNum,
  errorMessage,
  formatBytes,
  getIn,
  prohibitedSymbols,
} from '@app/core/helpers';
import { SubscriptionAccumulator } from '@app/core/helpers/SubscriptionAccumulator';
import { AccountsService } from '@app/core/services/accounts.service';
import { CustomvalidationService } from '@app/core/services/customvalidation.service';
import { DictionaryService } from '@app/core/services/dictionary.service';
import { DocumentService } from '@app/core/services/document.service';
import { HelperService } from '@app/core/services/helper.service';
import { OperationsService } from '@app/core/services/operations.service';
import { IAccountInfo } from '@app/data/models/account-types';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'ob-currency-transfer',
  templateUrl: './currency-transfer.component.html',
  styleUrls: ['./currency-transfer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyTransferComponent
  extends SubscriptionAccumulator
  implements OnInit, OnDestroy
{
  public currentStep = 0;
  public accountList: any[] = [];
  public contractList: any[] = [];
  public currencyList: any[] = [];
  public error: string = '';
  public allowedFormats: string[] = [
    'pdf',
    'tiff',
    'jpg',
    'png',
    'pcx',
    'doc',
    'docx',
    'txt',
  ];
  subscriptions: Subscription[] = [];
  public contractBin: number;
  public contractListLoading: boolean = false;
  public prefill: any;
  public bankList: any[] = [];
  public selectedContract: any = null;
  public insufficientFunds: boolean = false;
  public chiefSigner: string;
  public chiefAccountant: string;
  public loading: boolean = false;
  file: File = null;
  nFile: any = '';
  fileName: string = 'file';
  fileOver: boolean = false;
  fileList: File[] = [];
  fileNames: any[] = [];
  successMsg: string = '';
  draftMsg: string = '';
  uploadSubscr: Subscription;
  countFileSize: number = 0;
  public fileFormatError: boolean = false;
  public fileMaxSizeError: boolean = false;

  //2step
  public prefillCurrency: string = '';
  public recipientList: any[] = [];
  public countryList: any[] = [];
  public countryListLoading: boolean = false;
  public recipientListLoading: boolean = false;
  public selectedCountry: any;
  public showPassportFields: boolean = false;
  public passportMaxDate: Date = new Date();
  public isRecipientCountrySearchable: boolean = false;
  public generalLength: number = 0;
  globalChange: any;
  errorField: string = '';
  public isMaxLengthError: boolean = false;
  generalLengthFields = [
    'recipientName',
    'recipientCity',
    'recipientStreet',
    'recipientBuilding',
    'recipientApartment',
  ];

  //3step
  public banksCurrentPage: number = 0;
  public isForeignBanksLoading: boolean = false;
  public foreignBankSubscription$ = new BehaviorSubject<string>(null);
  public knpList: any = [];
  public knpDescription: string = '';
  public isKnpChecked: boolean = false;
  public knpSubject$ = new Subject<string>();
  public isKnpInvalid: boolean = false;
  public isKnpInvalidSubject$ = new BehaviorSubject<boolean>(false);
  public isSearchableKnp: boolean = false;
  public isPurposeInputBlur: boolean = false;
  public isDisablePurposeTooltip: boolean = false;
  prohibitedSymbols = prohibitedSymbols();
  public accountListKZT: any[] = [];
  public foreignBankTotalElements: number;
  public isSwift: boolean = true;

  public operationCodeRubList: any[] = [];
  public isSearchableOperationCode: boolean = false;
  public purposeCodeUAEList: any[] = [];
  public purposeCodeListKGS: any[] = [];
  public purposeCodeListCNY: any[] = [];
  public recipientBankName: string;
  public middleBankName: string;
  public middleBankSubsCription$ = new BehaviorSubject<string>(null);

  //
  public info1: boolean = false;
  public info2: boolean = false;
  public commission: string;
  public isCommissionLoading: boolean = false;
  public editTemplate: any = null;
  public emptyFieldsMessage: string = '';
  public fileUploadMessage: string = '';
  //

  // Additional step: budget payment for RUB
  public isBudgetPayment: boolean = false;
  public operationTypeCodeList: any[] = [];
  public isOperationTypeCodeLoading: boolean = false;
  public budgetPaymentTypeList: any[] = [];
  public isBudgetPaymentTypeLoading: boolean = false;
  public budgetPaymentReasonList: any[] = [];
  public isBudgetPaymentReasonLoading: boolean = false;

  constructor(
    private operationsService: OperationsService,
    public helperService: HelperService,
    private changeDetector: ChangeDetectorRef,
    private dictionaryService: DictionaryService,
    private accountsService: AccountsService,
    private toastr: ToastrService,
    private customValidator: CustomvalidationService,
    private documentService: DocumentService,
    private router: Router,
    private route: ActivatedRoute,
    public translate: TranslateService
  ) {
    super();
    this.addSubscriber(
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
    this.getPrefill('');
    this.getCurrencies();
    this.getUnkContracts();
    this.getTranslations();
    this.addSubscriber(this.accountsService.getAccountsList());
    if (this.editTemplate) {
      this.edit();
    }
    this.getGroupAt(0).controls.currency.valueChanges.subscribe(
      (currency: string) => {
        if (currency) {
          this.getGroupAt(0).controls.accountSender.setValue(null);
          this.getGroupAt(0).controls.accountSender.markAsPristine();
          this.getGroupAt(3).patchValue({
            swift: null,
            swiftMiddleBank: null,
          });
          if (this.getGroupAt(1).get('accountRecipient').value) {
            if (
              this.getGroupAt(1)
                .get('accountRecipient')
                .value.startsWith('03') &&
              currency === 'RUB'
            ) {
              this.isBudgetPayment = true;
            } else {
              this.isBudgetPayment = false;
            }
          } else {
            this.isBudgetPayment = false;
          }
          this.recipientBankName = null;
          this.middleBankName = null;
          this.getAccountsByCurrency(currency);
          this.changeDetector.detectChanges();
        }
      }
    );

    this.foreignBankSubscription$
      .pipe(debounceTime(800), distinctUntilChanged())
      .subscribe(data => {
        if (data) {
          this.banksCurrentPage = 0;
          this.getForeignBanks(0, data);
        }
      });

    this.subscribeKnpChanges();
    this.currencyTransferForm.valueChanges
      .pipe(debounceTime(800), distinctUntilChanged())
      .subscribe(value => {
        this.calculateProgress();
        if (this.currentStep !== 2 && this.commission) {
          this.commission = null;
          this.changeDetector.detectChanges();
        }
      });

    this.getGroupAt(1)
      .controls.inn.valueChanges.pipe(debounceTime(800), distinctUntilChanged())
      .subscribe(value => {
        if (value === 0 || value === '0') {
          this.showPassportFields = true;
          this.changeDetector.detectChanges();
        } else {
          if (this.showPassportFields) {
            this.getGroupAt(1).patchValue({
              recipientPassportNum: null,
              recipientPassportDate: null,
            });
            this.getGroupAt(1).get('recipientPassportNum').markAsPristine();
            this.getGroupAt(1).get('recipientPassportDate').markAsPristine();
            this.showPassportFields = false;
            this.changeDetector.detectChanges();
          }
        }
      });

    this.addSubscriber(
      this.documentService.firstChiefSigner$.subscribe({
        next: firstChiefSigner => {
          this.chiefSigner = firstChiefSigner.name;
          this.changeDetector.detectChanges();
        },
      })
    );

    this.addSubscriber(
      this.documentService.accountantSigner$.subscribe({
        next: chiefAccountant => {
          this.chiefAccountant = chiefAccountant.name;
          this.changeDetector.detectChanges();
        },
      })
    );
    this.insufficientFundsValidator();
    this.getLengthError();
    this.getGroupAt(3)
      .valueChanges.pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        if (this.currentStep === 3) {
          let fieldsList = this.getFormFields(this.currentStep);
          let valid = true;
          if (
            fieldsList.find(
              field => this.currentGroup.controls[field]?.valid === false
            )
          ) {
            valid = false;
          }
          if (valid) {
            this.getCommission();
          }
        }
      });
    this.getGroupAt(1)
      .get('accountRecipient')
      .valueChanges.pipe(debounceTime(100), distinctUntilChanged())
      .subscribe(val => {
        if (val) {
          if (val.startsWith('03') && this.transferCurrency === 'RUB') {
            this.isBudgetPayment = true;
          } else {
            this.isBudgetPayment = false;
          }
        } else {
          this.isBudgetPayment = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  /* File Upload */
  @HostListener('dragover', ['$event']) onDragOver(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.fileOver = true;
  }

  @HostListener('drop', ['$event']) onDrop(event: Event) {
    event.stopPropagation();
    this.fileOver = false;
  }

  @HostListener('dragleave', ['$event']) onDragLeave(event: Event) {
    event.stopPropagation();
    this.fileOver = false;
  }

  getFileFormat(file: File): string {
    return file.name.split('.').pop();
  }

  validFileType(file: any) {
    return this.allowedFormats.includes(file.type);
  }

  fileChange(event: any) {
    for (let i = 0; i <= event.target.files.length - 1; i++) {
      let currentFile = event.target.files[i];
      if (
        this.checkFileFormat(currentFile.name) &&
        this.checkFileSize(currentFile.size) &&
        !this.fileNames.includes(currentFile.name)
      ) {
        this.fileList.push(currentFile);
        this.fileNames.push(currentFile.name);
        this.countFileSize += currentFile.size;
        this.fileMaxSizeError = false;
        this.fileFormatError = false;
      }
    }
  }

  checkFileSize(size: number) {
    if (this.countFileSize + size > FILE_SIZE_20MB) {
      this.fileMaxSizeError = true;
      return false;
    } else {
      this.fileMaxSizeError = false;
      return true;
    }
  }

  checkFileFormat(name: string) {
    let format = name.split('.').pop();
    if (this.allowedFormats.includes(format)) {
      this.fileFormatError = false;
      return true;
    } else {
      this.fileFormatError = true;
      return false;
    }
  }

  deleteDoc(id: number) {
    if (this.countFileSize >= 0) {
      this.countFileSize -= this.fileList[id]?.size;
    }
    this.fileMaxSizeError = false;
    this.fileFormatError = false;
    this.checkFileSize(this.fileList[id]?.size);
    this.fileList.splice(id, 1);
    this.fileNames.splice(id, 1);
  }

  getFormattedFileSize(size: number) {
    return formatBytes(size);
  }
  /* File Upload */

  getPrefill(currency: string) {
    let nDocNum = docNum();
    this.operationsService.getCurrencyTransferPrefill(currency).subscribe({
      next: data => {
        this.prefill = data;
        if (!data.docNum) {
          this.prefill.docNum = nDocNum;
        }
        this.getGroupAt(1).patchValue({
          kbe: data?.kbe,
        });
        this.changeDetector.detectChanges();
      },
      error: error => {
        errorMessage(error, this.toastr);
        this.prefill.docNum = nDocNum;
        this.currencyTransferForm.patchValue({ docNum: nDocNum });
        this.changeDetector.detectChanges();
      },
    });
  }

  isStepValid = (index: number): boolean => {
    return this.getGroupAt(index).valid || this.currentGroup.untouched;
  };

  public steps = [
    {
      label: 'senderDetails',
      isValid: this.isStepValid,
      progress: 0,
    },
    {
      label: 'recipientDetails',
      isValid: this.isStepValid,
      progress: 0,
    },
    {
      label: 'budgetPaymentDetails',
      isValid: this.isStepValid,
      progress: 0,
    },
    {
      label: 'transferDetails',
      isValid: this.isStepValid,
      progress: 0,
    },
  ];

  currencyTransferForm = new FormGroup({
    senderDetailsForm: new FormGroup({
      unk: new FormControl(null),
      currency: new FormControl(null, [Validators.required]),
      accountSender: new FormControl(null, Validators.required),
      amount: new FormControl(null, [
        Validators.required,
        this.customValidator.sumZeroValidator,
      ]),
      isConfirmAgreement: new FormControl(false, Validators.requiredTrue),
    }),
    recipientDetailsForm: new FormGroup({
      recipientName: new FormControl(null, [
        Validators.required,
        this.permittedSymbolValidatorOther,
      ]),
      accountRecipient: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^[A-Z0-9]+$/),
      ]), ///^[A-Z0-9]+(?!.)/
      kbe: new FormControl(null, Validators.required),
      recipientCountry: new FormControl(null, [
        Validators.required,
        this.permittedSymbolValidatorOther,
      ]),
      recipientCity: new FormControl(null, [
        Validators.required,
        this.permittedSymbolValidatorOther,
      ]),
      recipientStreet: new FormControl(null, [
        Validators.required,
        this.permittedSymbolValidatorOther,
      ]),
      recipientBuilding: new FormControl(null, [
        Validators.required,
        this.permittedSymbolValidatorOther,
      ]),
      recipientApartment: new FormControl(
        null,
        this.permittedSymbolValidatorOther
      ),
      inn: new FormControl(null, [Validators.required]),
      kpp: new FormControl(null, [
        Validators.maxLength(9),
        Validators.minLength(9),
        Validators.pattern(/^[A-Z0-9]+$/),
      ]),
      recipientPassportNum: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^[A-ZА-ЯЁ0-9]+$/),
      ]),
      recipientPassportDate: new FormControl(null, [Validators.required]),
    }),
    budgetPaymentForm: new FormGroup({
      budgetOperationTypeCode: new FormControl(null, Validators.required),
      budgetCbc: new FormControl(null, [
        Validators.required,
        this.customValidator.allZeroValidator,
      ]),
      budgetOktmoCode: new FormControl(null, [
        Validators.required,
        this.customValidator.allZeroValidator,
      ]),
      budgetPaymentReason: new FormControl(null, Validators.required),
      budgetTaxPeriod: new FormControl(null, Validators.required),
      budgetPaymentDocNumber: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^[а-яА-ЯёЁa-zA-Z0-9]+$/),
      ]),
      budgetPaymentDocDate: new FormControl(null, Validators.required),
      budgetPaymentType: new FormControl(null, Validators.required),
    }),
    transferDetailsForm: new FormGroup({
      swift: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^[A-Z0-9]+$/),
      ]),
      isMiddleBank: new FormControl(false),
      swiftMiddleBank: new FormControl(null, Validators.pattern(/^[A-Z0-9]+$/)),
      knp: new FormControl(
        null,
        Validators.compose([
          Validators.required,
          this.customValidator.symbolValidator,
          Validators.pattern(/^-?([0-9]\d*)?$/),
        ])
      ),
      purpose: new FormControl(null, [
        Validators.required,
        this.permittedSymbolValidatorOther,
        Validators.maxLength(140),
      ]),
      infoToRecipient: new FormControl(null, [
        Validators.required,
        this.permittedSymbolValidatorOther,
        Validators.maxLength(194),
      ]),
      comissionAccount: new FormControl(null, Validators.required),
      urgent: new FormControl(false, Validators.required),
      recipientBankName: new FormControl(null, [
        Validators.required,
        this.permittedSymbolValidatorOther,
      ]),
      recipientBankCountry: new FormControl(null, [
        Validators.required,
        this.permittedSymbolValidatorOther,
      ]),
      recipientBankAddress: new FormControl(null, [
        Validators.required,
        this.permittedSymbolValidatorOther,
      ]),
      operationCodeRub: new FormControl(null, Validators.required),
      purposeCodeUAE: new FormControl(null, Validators.required),
      transitCode: new FormControl(null, Validators.required),
      purposeCodeKGS: new FormControl(null, Validators.required),
      purposeCodeCNY: new FormControl(null, Validators.required),
    }),
  });

  get currentGroup(): FormGroup {
    return this.getGroupAt(this.currentStep);
  }

  get transferCurrency(): string {
    return this.getGroupAt(0).controls.currency.value;
  }

  displayProgress(stepItem: any) {
    return (
      (stepItem.label === 'budgetPaymentDetails' && this.isBudgetPayment) ||
      stepItem.label !== 'budgetPaymentDetails'
    );
  }

  /* Validators */
  permittedSymbolValidatorOther(control: AbstractControl): {
    [key: string]: boolean;
  } {
    if (!control.value) {
      return null;
    }
    let symbolRegxp: RegExp = /^[-()/?',.a-zA-Z0-9 ]+$/;
    const valid = symbolRegxp.test(control.value);
    return !valid ? { invalidSymbolLatin: true } : null;
  }

  permittedSymbolValidatorRusKgs(control: AbstractControl): {
    [key: string]: boolean;
  } {
    if (!control.value) {
      return null;
    }
    let symbolRegxp: RegExp = /^[-()/?',.а-яА-ЯёЁa-zA-Z0-9 ]+$/;
    const valid = symbolRegxp.test(control.value);
    return !valid ? { invalidSymbolCyryillic: true } : null;
  }

  getRecipientNameAddressLength(): number {
    let tempGeneralLength = 0;
    this.generalLengthFields.forEach(
      f => (tempGeneralLength += this.getGroupAt(1).get(f)?.value?.length || 0)
    );
    if (this.getGroupAt(1).get('recipientCountry')?.value) {
      // 2 symb for country (code)
      tempGeneralLength += 2;
    }
    return tempGeneralLength;
  }

  getLengthError() {
    //TODO Оптимизировать
    this.getGroupAt(1)
      .get('recipientName')
      .valueChanges.subscribe(() => {
        this.generalLength = this.getRecipientNameAddressLength();
        if (this.generalLength > 140) {
          this.isMaxLengthError = true;
          if (!this.errorField) {
            this.errorField = 'recipientName';
          }
        } else {
          this.isMaxLengthError = false;
          this.errorField = null;
        }
      });
    this.getGroupAt(1)
      .get('recipientCity')
      .valueChanges.subscribe(() => {
        this.generalLength = this.getRecipientNameAddressLength();
        if (this.generalLength > 140) {
          this.isMaxLengthError = true;
          if (!this.errorField) {
            this.errorField = 'recipientCity';
          }
        } else {
          this.isMaxLengthError = false;
          this.errorField = null;
        }
      });
    this.getGroupAt(1)
      .get('recipientStreet')
      .valueChanges.subscribe(() => {
        this.generalLength = this.getRecipientNameAddressLength();
        if (this.generalLength > 140) {
          this.isMaxLengthError = true;
          if (!this.errorField) {
            this.errorField = 'recipientStreet';
          }
        } else {
          this.isMaxLengthError = false;
          this.errorField = null;
        }
      });
    this.getGroupAt(1)
      .get('recipientBuilding')
      .valueChanges.subscribe(() => {
        this.generalLength = this.getRecipientNameAddressLength();
        if (this.generalLength > 140) {
          this.isMaxLengthError = true;
          if (!this.errorField) {
            this.errorField = 'recipientBuilding';
          }
        } else {
          this.isMaxLengthError = false;
          this.errorField = null;
        }
      });
    this.getGroupAt(1)
      .get('recipientApartment')
      .valueChanges.subscribe(() => {
        this.generalLength = this.getRecipientNameAddressLength();
        if (this.generalLength > 140) {
          this.isMaxLengthError = true;
          if (!this.errorField) {
            this.errorField = 'recipientApartment';
          }
        } else {
          this.isMaxLengthError = false;
          this.errorField = null;
        }
      });
    this.getGroupAt(1)
      .get('recipientCountry')
      .valueChanges.subscribe(() => {
        this.generalLength = this.getRecipientNameAddressLength();
        if (this.generalLength > 140) {
          this.isMaxLengthError = true;
          if (!this.errorField) {
            this.errorField = 'recipientCountry';
          }
        } else {
          this.isMaxLengthError = false;
          this.errorField = null;
        }
      });
  }

  insufficientFundsValidator() {
    this.getGroupAt(0)
      .get('amount')
      .valueChanges.subscribe({
        // Проверка достаточности средств
        next: v => {
          if (v) {
            if (v > 0) {
              const nAccount = this.accountList.find((acc: any) => {
                const iban = acc.iban || acc.accountIban;
                if (iban === this.getGroupAt(0).get('accountSender').value) {
                  return acc;
                }
              });
              const selectedAcc = this.getGroupAt(0).get('accountSender').value;
              if (selectedAcc) {
                this.insufficientFunds = v > nAccount?.actualBalance;
                this.changeDetector.detectChanges();
              }
            }
          }
        },
      });

    this.getGroupAt(0)
      .get('accountSender')
      .valueChanges.subscribe({
        next: account => {
          const nAccount = this.accountList.find((acc: any) => {
            const iban = acc.iban || acc.accountIban;
            if (iban === account) {
              return acc;
            }
          });
          const sum = this.getGroupAt(0).get('amount').value;
          if (sum) {
            this.insufficientFunds = sum > nAccount?.actualBalance; // Проверка достаточности средств
            this.changeDetector.detectChanges();
          }
        },
      });
  }
  /* Validators */

  next(): void {
    this.FieldsValidation();
    if (this.currentStep <= 3) {
      if (this.transferCurrency === 'KGS' || this.transferCurrency === 'RUB') {
        const allFields = Object.keys(this.currentGroup.controls);
        allFields.forEach(f => {
          if (
            this.currentGroup
              .get(f)
              .hasValidator(this.permittedSymbolValidatorOther)
          ) {
            this.currentGroup
              .get(f)
              .removeValidators(this.permittedSymbolValidatorOther);
            this.currentGroup
              .get(f)
              .addValidators(this.permittedSymbolValidatorRusKgs);
          }
        });
      } else {
        this.currentGroup.controls;
        const allFields = Object.keys(this.currentGroup.controls);
        allFields.forEach(f => {
          if (
            this.currentGroup
              .get(f)
              .hasValidator(this.permittedSymbolValidatorRusKgs)
          ) {
            this.currentGroup
              .get(f)
              .removeValidators(this.permittedSymbolValidatorRusKgs);
            this.currentGroup
              .get(f)
              .addValidators(this.permittedSymbolValidatorOther);
          }
        });
      }
      this.calculateProgress();
    }
    if (this.currentStep === 1) {
      this.steps[0].progress = 100;
      if (this.countryList.length <= 0) {
        this.getCountries();
      }
      if (this.recipientList.length <= 0) {
        this.getCounteragents();
      }
      if (
        this.prefill.senderCurrency !== 'RUB' &&
        this.transferCurrency === 'RUB'
      ) {
        this.getGroupAt(3).patchValue({
          purpose: null,
          infoToRecipient: null,
        });
        this.getGroupAt(3).get('purpose').markAsPristine();
        this.getGroupAt(3).get('infoToRecipient').markAsPristine();
      }
      if (this.prefill?.currencySender !== this.transferCurrency) {
        this.getPrefill(this.transferCurrency);
        this.isSwift = true;
      }
    } else if (this.currentStep === 2) {
      this.steps[1].progress = 100;
      if (this.operationTypeCodeList.length <= 0) {
        this.getBudgetOperationTypeCode();
      }
      if (this.budgetPaymentTypeList.length <= 0) {
        this.getBudgetPaymentType();
      }
      if (this.budgetPaymentReasonList.length <= 0) {
        this.getBudgetPaymentReason();
      }
    } else if (this.currentStep === 3) {
      if (this.isBudgetPayment) {
        this.steps[2].progress = 100;
      } else {
        this.steps[1].progress = 100;
      }
      if (
        this.purposeCodeListKGS.length <= 0 &&
        this.transferCurrency === 'KGS'
      ) {
        this.getPurposeCodeKGS();
      }
      if (
        this.purposeCodeListCNY.length <= 0 &&
        this.transferCurrency === 'CNY'
      ) {
        this.getPurposeCodeCNY();
      }
      if (
        this.purposeCodeUAEList.length <= 0 &&
        this.selectedCountry.code === 'AE'
      ) {
        this.getTransferPurposeCodeUAE();
      }
      if (
        this.operationCodeRubList.length <= 0 &&
        this.transferCurrency === 'RUB'
      ) {
        this.getRubOperationCodes();
      }
      if (this.knpList.length <= 0) {
        this.getKnp('');
      }
      if (this.accountListKZT.length <= 0) {
        this.getAccountsByCurrency('KZT');
      }
      let fieldsList = this.getFormFields(this.currentStep);
      let valid = true;
      if (
        fieldsList.find(
          field => this.currentGroup.controls[field].valid === false
        )
      ) {
        valid = false;
      }
      if (valid) {
        this.getCommission();
      }
    } else if (this.currentStep > 3) {
      this.sendToConfirm();
      this.currentStep = 3;
    }
  }

  prev(): void {
    this.steps[this.currentStep].progress = 0;
    if (!this.isBudgetPayment && this.currentStep === 3) {
      this.currentStep = 1;
    } else {
      this.currentStep -= 1;
    }
  }

  getGroupAt(index: number): FormGroup {
    const groups = Object.keys(this.currencyTransferForm.controls).map(
      groupName => this.currencyTransferForm.get(groupName)
    ) as FormGroup[];
    return groups[index];
  }

  getIcon(currency: string): string {
    return this.helperService.getAccountIcon(currency);
  }

  isFieldInvalid(field: string) {
    const formField = this.currentGroup.get(field);
    return (
      (!formField.valid && formField.touched && !formField.pristine) ||
      (!formField.valid && formField.dirty && !formField.pristine)
    );
  }

  displayFieldClass(field: string) {
    let invalid = this.isFieldInvalid(field);
    if (
      this.generalLengthFields.includes(field) ||
      field === 'recipientCountry'
    ) {
      return {
        'is-invalid':
          invalid ||
          (this.isMaxLengthError && this.currentGroup.get(field).value),
      };
    } else {
      return { 'is-invalid': invalid };
    }
  }

  getIn(data: any, args: string[]) {
    return getIn(data, ...args);
  }

  onUnkChange(contractItem: any) {
    this.selectedContract = contractItem;
    if (contractItem) {
      this.currentGroup.controls.unk.setValue(contractItem.unk);
      this.currentGroup.controls.isConfirmAgreement.setValue(true);
      this.getGroupAt(1).patchValue({
        recipientName: contractItem?.inoPartnerName || null,
        accountRecipient: contractItem?.inoPartnerAccount || null,
        recipientCountry:
          this.countryList.find(
            country =>
              country.name === contractItem?.inoPartnerCountryName ||
              country.code === contractItem?.inoPartnerCountryCode
          )?.name || null,
        recipientCity: contractItem?.city || null,
      });
      this.selectedCountry =
        this.countryList.find(
          country =>
            country.name === contractItem?.inoPartnerCountryName ||
            country.code === contractItem?.inoPartnerCountryCode
        ) || null;
      this.getGroupAt(3).patchValue({
        swift:
          contractItem?.inoPartnerBankBic !== 'HSBKKZKX'
            ? contractItem?.inoPartnerBankBic
            : null,
        recipientBankName: contractItem?.inoPartnerBankName || null,
        recipientBankCountry:
          this.countryList.find(
            country => country.code === contractItem?.bankCountry
          )?.name || null,
        recipientBankAddress: contractItem?.bankAddress || null,
      });
      this.recipientBankName = contractItem?.inoPartnerBankName || null;
      this.getGroupAt(1).controls.recipientName.markAsDirty();

      if (
        this.currencyList.find(
          cur => cur.isoCode === contractItem.contractCurrency
        )
      ) {
        this.currentGroup.controls.currency.setValue(
          contractItem.contractCurrency
        );
      } else {
        this.currentGroup.controls.currency.setValue(null);
      }
      this.changeDetector.detectChanges();
    } else {
      this.currentGroup.controls.unk.setValue(null);
      this.currentGroup.controls.isConfirmAgreement.setValue(false);
      this.getGroupAt(1).patchValue({
        recipientName: null,
        accountRecipient: null,
      });
      this.getGroupAt(3).patchValue({
        swift: null,
        recipientBankName: null,
        recipientBankCountry: null,
        recipientBankAddress: null,
      });
      this.recipientBankName = null;
      this.changeDetector.detectChanges();
    }
  }

  /* API */
  getCurrencies() {
    this.dictionaryService.getCurrencies().subscribe(data => {
      this.currencyList = data
        .filter((curr: any) =>
          currencyTransferCurrencies.includes(curr.isoCode)
        )
        .sort(
          (a: any, b: any) =>
            currencyTransferCurrencies.indexOf(a.isoCode) -
            currencyTransferCurrencies.indexOf(b.isoCode)
        );
    });
  }

  getUnkContracts() {
    this.contractListLoading = true;
    this.changeDetector.detectChanges();
    this.dictionaryService.getCurrencyControlUnk().subscribe({
      next: data => {
        this.contractList = data.result;
        this.contractListLoading = false;
        this.changeDetector.detectChanges();
      },
      error: error => {
        errorMessage(error, this.toastr);
        this.contractListLoading = false;
        this.changeDetector.detectChanges();
      },
    });
  }

  getCountries() {
    this.countryListLoading = true;
    this.changeDetector.detectChanges();
    this.dictionaryService.getAllCurrencyControlCountries().subscribe({
      next: data => {
        this.countryListLoading = false;
        this.countryList = data.content;
        this.changeDetector.detectChanges();
      },
      error: error => {
        this.countryListLoading = false;
        this.changeDetector.detectChanges();
        errorMessage(error, this.toastr);
      },
    });
  }

  getForeignBanks(page: number, search: string = '') {
    this.bankList = [];
    let body = {
      pageNum: page,
      search: search,
      pageSize: 50,
      isBic: this.transferCurrency === 'RUB',
    };
    this.isForeignBanksLoading = true;
    this.changeDetector.detectChanges();
    this.dictionaryService.getForeignBanks(body).subscribe({
      next: data => {
        this.bankList = data.content;
        this.banksCurrentPage = data.currentPage;
        this.foreignBankTotalElements = data.totalPages;
        this.isForeignBanksLoading = false;
        this.changeDetector.detectChanges();
      },
      error: error => {
        errorMessage(error, this.toastr);
        this.isForeignBanksLoading = false;
        this.changeDetector.detectChanges();
      },
    });
  }

  loadMoreForeignBanks() {
    if (this.banksCurrentPage + 1 < this.foreignBankTotalElements) {
      this.banksCurrentPage++;
      let body = {
        pageNum: this.banksCurrentPage,
        search: this.foreignBankSubscription$.value,
        pageSize: 50,
        isBic: this.transferCurrency === 'RUB',
      };
      this.isForeignBanksLoading = true;
      this.changeDetector.detectChanges();
      this.dictionaryService.getForeignBanks(body).subscribe(data => {
        this.bankList.push(...data.content);
        this.isForeignBanksLoading = false;
        this.foreignBankTotalElements = data.totalPages;
        this.changeDetector.detectChanges();
      });
    }
  }

  getRubOperationCodes() {
    this.dictionaryService.getTransferOperationCodeRub().subscribe({
      next: data => {
        this.operationCodeRubList = data;
        this.changeDetector.detectChanges();
      },
      error: error => {
        errorMessage(error, this.toastr);
      },
    });
  }

  getTransferPurposeCodeUAE() {
    this.dictionaryService.getTransferPurposeCodeUae().subscribe({
      next: data => {
        this.purposeCodeUAEList = data;
      },
      error: error => {
        errorMessage(error, this.toastr);
      },
    });
  }

  getPurposeCodeKGS() {
    return this.dictionaryService.getTransferPurposeCodeKgs().subscribe({
      next: data => {
        this.purposeCodeListKGS = data;
      },
      error: error => {
        errorMessage(error, this.toastr);
      },
    });
  }

  getPurposeCodeCNY() {
    return this.dictionaryService.getTransferPurposeCodeCny().subscribe({
      next: data => {
        this.purposeCodeListCNY = data;
      },
      error: error => {
        errorMessage(error, this.toastr);
      },
    });
  }

  getCounteragents() {
    this.recipientListLoading = true;
    this.changeDetector.detectChanges();
    this.dictionaryService.getCurrencyTransferCounteragents().subscribe({
      next: data => {
        this.recipientList = data.content;
        this.recipientListLoading = false;
        this.changeDetector.detectChanges();
      },
      error: error => {
        errorMessage(error, this.toastr);
        this.recipientListLoading = false;
        this.changeDetector.detectChanges();
      },
    });
  }

  getCommission() {
    this.isCommissionLoading = true;
    this.changeDetector.detectChanges();
    this.operationsService
      .getCurrencyTransferCommission(this.getTemplate())
      .subscribe({
        next: data => {
          this.commission = data;
          this.isCommissionLoading = false;
          this.changeDetector.detectChanges();
        },
        error: error => {
          this.isCommissionLoading = false;
          errorMessage(error, this.toastr);
          this.changeDetector.detectChanges();
        },
      });
  }

  getBudgetOperationTypeCode() {
    this.isOperationTypeCodeLoading = true;
    this.changeDetector.detectChanges();
    this.dictionaryService.getOperationTypeCode().subscribe({
      next: (data: any) => {
        this.operationTypeCodeList = data;
        this.isOperationTypeCodeLoading = false;
        this.changeDetector.detectChanges();
      },
      error: error => {
        errorMessage(error, this.toastr);
        this.isOperationTypeCodeLoading = false;
        this.changeDetector.detectChanges();
      },
    });
  }

  getBudgetPaymentType() {
    this.isBudgetPaymentTypeLoading = true;
    this.changeDetector.detectChanges();
    this.dictionaryService.getCurrencyBudgetPaymentType().subscribe({
      next: (data: any) => {
        this.budgetPaymentTypeList = data;
        this.isBudgetPaymentTypeLoading = false;
        this.changeDetector.detectChanges();
      },
      error: error => {
        errorMessage(error, this.toastr);
        this.isBudgetPaymentTypeLoading = false;
        this.changeDetector.detectChanges();
      },
    });
  }

  getBudgetPaymentReason() {
    this.isBudgetPaymentReasonLoading = true;
    this.changeDetector.detectChanges();
    this.dictionaryService.getCurrencyBudgetPaymentReason().subscribe({
      next: (data: any) => {
        this.budgetPaymentReasonList = data;
        this.isBudgetPaymentReasonLoading = false;
        this.changeDetector.detectChanges();
      },
      error: error => {
        errorMessage(error, this.toastr);
        this.isBudgetPaymentReasonLoading = false;
        this.changeDetector.detectChanges();
      },
    });
  }
  /* API */

  getAccountsByCurrency(currency: string) {
    this.accountsService.currentAccounts.subscribe((data: IAccountInfo[]) => {
      // Подписка на список тек счетов
      let accByCurrency = data.filter(
        acc => acc.currency === currency && acc.active === 'Y'
      ); // Фильтрация по Тенговым и Активынм счетам
      if (currency === 'KZT') {
        this.accountListKZT = accByCurrency;
      } else {
        this.accountList = accByCurrency;
      }
    });
  }

  onCountryChange(country: any, type: string) {
    if (country) {
      if (type === 'recipient') {
        this.selectedCountry = country;
        this.getGroupAt(1).patchValue({
          //recipientCountry: ((this.transferCurrency==='RUB' || this.transferCurrency==='KGS') && country.cyrilicName) ? country.cyrilicName : country.name //сервис не отрабатывает для кириллицы
          recipientCountry: country.name,
        });
      } else {
        this.getGroupAt(3).patchValue({
          recipientBankCountry: country.name,
        });
      }
    } else {
      if (type === 'recipient') {
        this.selectedCountry = null;
        this.getGroupAt(1).patchValue({
          recipientCountry: null,
        });
      } else {
        this.getGroupAt(3).patchValue({
          recipientBankCountry: null,
        });
      }
    }

    this.changeDetector.detectChanges();
  }

  onRecipientChange(recipient: any) {
    if (recipient) {
      this.getGroupAt(1).patchValue({
        recipientName: recipient?.name || null,
        accountRecipient: recipient?.account || null,
        inn: recipient?.inn || null,
        kpp: recipient?.kpp || null,
        kbe:
          recipient.residencyCode && recipient.secoCode
            ? recipient?.residencyCode + '' + recipient?.secoCode
            : this.prefill.kbe || null,
        recipientCountry:
          this.countryList.find(
            country =>
              country.name === recipient?.country ||
              country.code === recipient?.country
          )?.name || null,
        recipientCity: recipient?.city || null,
      });
      this.selectedCountry =
        this.countryList.find(
          country =>
            country.name === recipient?.country ||
            country.code === recipient?.country
        ) || null;
      this.getGroupAt(3).patchValue({
        recipientBankCountry:
          this.countryList.find(
            country => country.code === recipient?.bankCountry
          )?.name || null,
        recipientBankAddress: recipient?.bankAddress || null,
      });
      if (
        (recipient?.bankCountry === 'RU' && this.transferCurrency === 'RUB') ||
        (recipient?.bankCountry !== 'RU' && this.transferCurrency !== 'RUB')
      ) {
        if (recipient?.bankBic !== 'HSBKKZKX') {
          let bic = recipient?.bankBic;
          let bankName = recipient?.bankName;
          if (this.transferCurrency === 'RUB') {
            bic = bic.replace(/\D/g, ''); //В БИК указываются только цифры
            bankName = bankName.replace(/\/\/[^\s]*/g, ''); //Отделать название от //РУ...
          }
          this.getGroupAt(3).patchValue({
            swift: bic || null,
            recipientBankName: bankName || null,
          });
          this.recipientBankName = bankName || null;
        }
      } else {
        this.getGroupAt(3).patchValue({
          swift: null,
        });
      }
      this.getGroupAt(1).controls.recipientName.markAsDirty();
    } else {
      this.getGroupAt(1).patchValue({
        recipientName: null,
        accountRecipient: null,
      });
      this.getGroupAt(3).patchValue({
        swift: null,
        recipientBankName: null,
        recipientBankCountry: null,
        recipientBankAddress: null,
      });
      this.recipientBankName = null;
    }
    this.changeDetector.detectChanges();
  }

  onBankChange(bank: any) {
    let bic = bank.bic;
    let bankName = bank.name || bank.bankName;
    if (this.transferCurrency === 'RUB') {
      bic = bic.replace(/\D/g, ''); //В БИК указываются только цифры
      bankName = bankName.replace(/\/\/[^\s]*/g, ''); //Отделать название от //РУ...
    }
    if (bank) {
      this.currentGroup.patchValue({
        swift: bic,
      });
      this.recipientBankName = bankName;
    } else {
      this.currentGroup.patchValue({
        swift: null,
      });
      this.recipientBankName = null;
    }
    this.changeDetector.detectChanges();
  }

  onScroll(event: any) {
    if (
      this.isForeignBanksLoading ||
      this.banksCurrentPage + 1 > this.foreignBankTotalElements
    ) {
      return;
    }
    if (this.bankList.length !== 0 && event.end + 10 >= this.bankList.length) {
      this.loadMoreForeignBanks();
    }
  }

  onForeignBanksOpen() {
    this.foreignBankSubscription$.next(null);
    this.banksCurrentPage = 0;
    this.getForeignBanks(0);
  }

  onSearchKnp(input: any) {
    this.getKnp(input.term);
    let knpObj = this.knpList.find((val: any) => val.code === input.term);

    if (knpObj?.code.length > 0) {
      this.knpDescription = knpObj.name;
    }
    this.currentGroup.patchValue({
      knp: input.term,
    });
    this.currentGroup.controls.knp.markAsDirty();
    if (input.term === '') {
      this.currentGroup.patchValue({
        knp: null,
      });
    }
    this.isKnpChecked = false;
  }

  getKnp(search: string) {
    this.knpSubject$.next(search);
  }

  subscribeKnpChanges(): void {
    this.knpSubject$.pipe(debounceTime(800), distinctUntilChanged()).subscribe({
      next: v => {
        this.isSearchableKnp = true;
        this.changeDetector.detectChanges();
        this.subscriptions.push(
          this.dictionaryService.getCurrencyTransferKnp(v).subscribe({
            next: data => {
              if (data.length === 0) {
                this.isKnpInvalidSubject$.next(true);
              }
              setTimeout(() => {
                this.knpList = data;
                this.isSearchableKnp = false;
                if (data.length > 0) {
                  this.isKnpInvalidSubject$.next(false);
                }
                this.isKnpChecked = true;
                this.changeDetector.detectChanges();
              }, 800);
            },
          })
        );

        this.currentGroup.controls['knp'].valueChanges.subscribe({
          next: knp => {
            if (knp) {
              //    this.description = knp?.name
              this.changeDetector.detectChanges();
            }
          },
        });
      },
    });
  }

  onChangeKnp(knp: any) {
    if (knp) {
      if (typeof knp === 'string') {
        const knpObj = this.knpList.find((val: any) => val.knp === knp);
        if (knpObj) {
          this.knpDescription = knpObj.name;
        }
      } else {
        this.currentGroup.patchValue({
          knp: knp.code,
        });
        this.knpDescription = knp?.name;
      }
      this.changeDetector.detectChanges();
    }
  }

  onOpenKnp() {
    this.isSearchableKnp = true;
  }

  onCloseKnp() {
    this.isSearchableKnp = false;
  }

  onTextareaBlur() {
    this.isPurposeInputBlur = true;
    this.enableTooltip('purpose');
  }
  onTextareaFocus() {
    this.isPurposeInputBlur = false;
    this.disableTooltip('purpose');
  }

  disableTooltip(type: string) {
    if (type === 'purpose') {
      this.isDisablePurposeTooltip = true;
    }
  }

  enableTooltip(type: string) {
    if (type === 'purpose') {
      this.isDisablePurposeTooltip = false;
    }
  }

  getHeight(content: any) {
    const v1 = Math.ceil(content.length / 65);
    const v2 = content.split('\n').length;
    return Math.max(v1, v2);
  }

  onOperationCodeChanges(operationCode: any) {
    this.getGroupAt(3).patchValue({
      operationCodeRub: operationCode.code,
    });
  }

  onOpenOperationCode() {
    this.isSearchableOperationCode = true;
  }

  onCloseOperationCode() {
    this.isSearchableOperationCode = false;
  }

  onPurposeCodeChange(purpose: any, type: string) {
    if (type === 'KGS') {
      this.getGroupAt(3).patchValue({
        purposeCodeKGS: purpose.code,
      });
    } else if ('AE') {
      this.getGroupAt(3).patchValue({
        purposeCodeUAE: purpose.mapCode,
      });
    } else if ('CNY') {
      this.getGroupAt(3).patchValue({
        purposeCodeCNY: purpose.mapCode,
      });
    } else {
      this.getGroupAt(3).patchValue({
        purposeCode: purpose.mapcode,
      });
    }
  }

  onBudgetCodeChanges(item: any, type: string) {
    if (type === 'operation-type') {
      this.getGroupAt(2).patchValue({
        budgetOperationTypeCode: item.mapCode,
      });
    } else if (type === 'payment-reason') {
      this.getGroupAt(2).patchValue({
        budgetPaymentReason: item.mapCode,
      });
    } else if (type === 'payment-type') {
      this.getGroupAt(2).patchValue({
        budgetPaymentType: item.mapCode,
      });
    }
  }

  FieldsValidation(): void {
    const form = this.currentGroup;
    let fieldsList = this.getFormFields(this.currentStep);
    let valid = true;
    if (fieldsList.find(field => form.controls[field].valid === false)) {
      valid = false;
    }
    if (this.insufficientFunds && this.currentStep === 0) {
      valid = false;
    }
    if (this.isMaxLengthError && this.currentStep === 1) {
      valid = false;
    }
    if (valid) {
      if (this.isBudgetPayment && this.currentStep === 1) {
        this.currentStep = 2;
      } else if (!this.isBudgetPayment && this.currentStep === 1) {
        this.currentStep = 3;
      } else {
        this.currentStep += 1;
      }
    } else {
      let emptyField: string;
      fieldsList.forEach(f => {
        if (form.get(f).status === 'INVALID') {
          if (!form.get(f).value && !emptyField) {
            emptyField = f;
          }
          form.get(f).markAsTouched();
          form.get(f).markAsDirty();
        }
      });
      if (emptyField) {
        document.getElementById(emptyField).focus();
        errorMessage({ message: this.emptyFieldsMessage }, this.toastr);
      }
    }
  }

  getFormFields(step: number): string[] {
    let fieldsList: string[] = [];
    if (step === 0) {
      fieldsList = [
        'currency',
        'accountSender',
        'amount',
        'isConfirmAgreement',
      ];
    } else if (step === 1) {
      fieldsList = ['recipientName'];
      if (this.transferCurrency === 'RUB') {
        fieldsList.push('inn', 'kpp');
        if (
          this.getGroupAt(1).controls.inn &&
          (this.getGroupAt(1).controls.inn.value === '0' ||
            this.getGroupAt(1).controls.inn.value === 0)
        ) {
          fieldsList.push('recipientPassportNum', 'recipientPassportDate');
        }
      }
      fieldsList.push(
        'accountRecipient',
        'kbe',
        'recipientCountry',
        'recipientCity',
        'recipientStreet',
        'recipientBuilding',
        'recipientApartment'
      );
    } else if (step === 2) {
      if (this.isBudgetPayment) {
        fieldsList.push(
          'budgetOperationTypeCode',
          'budgetCbc',
          'budgetOktmoCode',
          'budgetPaymentReason',
          'budgetTaxPeriod',
          'budgetPaymentDocNumber',
          'budgetPaymentDocDate',
          'budgetPaymentType'
        );
      }
    } else if (step === 3) {
      fieldsList.push(
        'knp',
        'purpose',
        'urgent',
        'comissionAccount',
        'infoToRecipient'
      );
      if (this.transferCurrency === 'USD') {
        if (this.isSwift) {
          fieldsList.push('swift');
        } else {
          fieldsList.push(
            'recipientBankName',
            'recipientBankCountry',
            'recipientBankAddress'
          );
        }
      }
      if (this.transferCurrency === 'RUB') {
        fieldsList.push('swift', 'operationCodeRub');
      }
      if (this.transferCurrency === 'GBP') {
        if (this.isSwift) {
          fieldsList.push('swift');
        } else {
          fieldsList.push(
            'recipientBankName',
            'recipientBankCountry',
            'recipientBankAddress'
          );
        }
      }
      if (this.transferCurrency === 'CNY') {
        fieldsList.push('swift', 'purposeCodeCNY');
      }

      if (this.selectedCountry?.code === 'AE') {
        fieldsList.push('swift', 'purposeCodeUAE');
      }

      if (this.selectedCountry?.code === 'CA') {
        fieldsList.push('swift', 'transitCode');
      }

      if (this.transferCurrency === 'KGS') {
        fieldsList.push('swift', 'purposeCodeKGS');
      }
    }

    return fieldsList;
  }

  calculateProgress() {
    let fieldsList = this.getFormFields(this.currentStep);
    let tempProgress: number = 0;
    let counter = 0;
    fieldsList.forEach(field => {
      if (this.currentGroup.controls[field].valid) {
        tempProgress += Math.round(100 / fieldsList.length);
        counter++;
      }
    });
    if (counter === fieldsList.length) {
      this.steps[this.currentStep].progress = 100;
    } else {
      this.steps[this.currentStep].progress = tempProgress;
    }
    this.changeDetector.detectChanges();
  }

  onSwiftClick() {
    this.isSwift = true;
    this.calculateProgress();
    let fieldsList = this.getFormFields(this.currentStep);
    let valid = true;
    if (
      fieldsList.find(
        field => this.currentGroup.controls[field].valid === false
      )
    ) {
      valid = false;
    }
    if (valid) {
      this.getCommission();
    }
  }
  onNotSwiftClick() {
    this.isSwift = false;
    this.calculateProgress();
    let fieldsList = this.getFormFields(this.currentStep);
    let valid = true;
    if (
      fieldsList.find(
        field => this.currentGroup.controls[field].valid === false
      )
    ) {
      valid = false;
    }
    if (valid) {
      this.getCommission();
    }
  }

  onMiddleBankChange(bank: any) {
    if (bank) {
      this.currentGroup.patchValue({
        swiftMiddleBank: bank?.bic,
      });
      this.middleBankName = bank?.name || bank?.bankName;
      this.changeDetector.detectChanges();
    } else {
      this.currentGroup.patchValue({
        swiftMiddleBank: null,
      });
      this.middleBankName = null;
      this.changeDetector.detectChanges();
    }
  }

  onRecipientSearch(input: any) {
    if (input.term) {
      this.currentGroup.patchValue({
        recipientName: input.term,
      });
    } else {
      this.currentGroup.patchValue({
        recipientName: null,
      });
    }
    this.changeDetector.detectChanges();
  }

  onSwiftSearch(input: any) {
    if (input.term === 'HSBKKZKX') {
      this.currentGroup.patchValue({
        swift: null,
      });
    } else {
      this.currentGroup.patchValue({
        swift: input.term,
      });
    }
    this.recipientBankName = null;
    this.changeDetector.detectChanges();
  }

  onMiddleBankSearch(input: any) {
    this.currentGroup.patchValue({
      swiftMiddleBank: input.term,
    });
    this.middleBankName = null;
    this.changeDetector.detectChanges();
  }

  onDateChange() {
    if (
      this.currentGroup.controls['recipientPassportDate'].errors?.bsDate
        ?.invalid
    ) {
      this.currentGroup.controls['recipientPassportDate'].setValue('');
    }
  }

  getTemplate() {
    let body: any = {
      docDate: this.prefill.docDate,
      valDate: this.prefill.valDate,
      docNum: this.prefill.docNum || docNum(),
      amount: this.getGroupAt(0).get('amount').value,
      knpCode: this.getGroupAt(3).get('knp').value,
      knpName: this.knpDescription,
      nameSender: this.prefill?.nameSender,
      residencySender: this.prefill?.residencySender,
      secoSender: this.prefill?.secoSender,
      binSender: this.prefill?.binSender,
      senderCity: this.prefill?.senderCity,
      senderAddress: this.prefill?.senderAddress,
      accountSender: this.getGroupAt(0).get('accountSender').value,
      bicBankSender: this.prefill?.bicBankSender,
      nameBankSender: this.prefill?.nameBankSender,
      internationalNameSender: this.prefill?.internationalNameSender,
      accountFeePayment: this.getGroupAt(3).get('comissionAccount').value,
      nameRecipient: this.getGroupAt(1).get('recipientName').value,
      accountRecipient: this.getGroupAt(1).get('accountRecipient').value,
      residencyRecipient: this.getGroupAt(1).get('kbe').value[0],
      secoRecipient: this.getGroupAt(1).get('kbe').value[1],
      infoRecipient: this.getGroupAt(3).get('infoToRecipient').value,
      countryRecipient: this.getGroupAt(1).get('recipientCountry').value,
      countryCodeRecipient: this.selectedCountry?.code,
      cityRecipient: this.getGroupAt(1).get('recipientCity').value,
      //accountBankRecipient: '',
      //natCodeBankRecipient: '',
      nameBankRecipient:
        !this.isSwift &&
        (this.transferCurrency === 'USD' || this.transferCurrency === 'GBP')
          ? this.getGroupAt(3).get('recipientBankName').value
          : this.recipientBankName,
      //accountMiddleBank: '',
      //natCodeMiddleBank: '', ??
      //feeMiddleBank: '',
      //countryMiddleBank: '',
      ///cityMiddleBank: '',
      //addressMiddleBank: '',
      paymentInfo: this.getGroupAt(3).get('purpose').value || null,
      paymentFeeType: this.prefill?.paymentFeeType || null,
      paymentFee: this.prefill?.paymentFee || null,
      advancedInfo: this.getGroupAt,
      //isSalary: '',
      currencySender:
        this.transferCurrency ||
        this.getGroupAt(0).get('currency').value ||
        null,
      currencyFeePayment: this.prefill?.currencyFeePayment || 'KZT',
      currencyContractExists: this.selectedContract
        ? false
        : this.getGroupAt(0).get('isConfirmAgreement').value,
      isForSalary: this.prefill?.isForSalary || null,
      rkoUrgent: this.getGroupAt(3).get('urgent').value,
      chief: this.chiefSigner,
      chiefAccountant: this.chiefAccountant,
      transliteration: this.prefill?.transliteration,
      //invoce: '',
      //swiftConfirm: '',
      countryBankRecipient: this.prefill?.countryBankRecipient || null,
      kbe: this.getGroupAt(1).get('kbe').value || null,
      subType: this.prefill?.subType || null,
      isProcessCurrDate: this.getGroupAt(3).get('urgent').value,
      isRubNotResidentOfRussia: this.prefill.isRubNotResidentOfRussia,
      bankRecipientFeeType: this.prefill?.bankRecipientFeeType || null,
      //recipientPostalIndex: '',
      recipientStreet: this.getGroupAt(1).get('recipientStreet').value || null,
      recipientHouseNo:
        this.getGroupAt(1).get('recipientBuilding').value || null,
      recipientApartmentNo:
        this.getGroupAt(1).get('recipientApartment').value || null,
      isBusinessDay: this.prefill?.isBusinessDay,
      isFw_Sortcode:
        !this.isSwift &&
        (this.transferCurrency === 'USD' || this.transferCurrency === 'GBP'),
      thirdpartyId: this.prefill?.thirdpartyId,
      source: 'NEW_WEB',
      fileNames: this.fileNames || [],
    };
    if (this.selectedContract) {
      body.contractDate =
        moment(this.selectedContract?.makeDate, 'DD.MM.YYYY').format(
          'YYYY-MM-DD'
        ) || null;
      body.contract = this.selectedContract?.contractNumber || null;
      body.dealId = this.selectedContract?.contractId || null;
      body.passport = this.getGroupAt(0).get('unk').value || null;
    }

    if (this.transferCurrency === 'RUB') {
      body.recipientInn = this.getGroupAt(1).get('inn').value;
      body.recipientKpp = this.getGroupAt(1).get('kpp').value;
      body.codeVo = this.getGroupAt(3).get('operationCodeRub').value || null;
      body.codeVoDescription = this.operationCodeRubList.find(
        item => item.code === this.getGroupAt(3).get('operationCodeRub').value
      ).name;
      if (
        this.getGroupAt(1).get('inn').value === '0' ||
        this.getGroupAt(1).get('inn').value === 0
      ) {
        body.recipientPassportNum =
          this.getGroupAt(1).get('recipientPassportNum').value || null;
        body.recipientPassportDate =
          moment(this.getGroupAt(1).get('recipientPassportDate').value).format(
            requestDateFormat
          ) || null;
      }
      if (this.isBudgetPayment) {
        body.budgetPayment = true;
        body.cbc = this.getGroupAt(2).get('budgetCbc').value || null;
        body.okatoCode =
          this.getGroupAt(2).get('budgetOktmoCode').value || null;
        body.paymentReasonIndicator =
          this.getGroupAt(2).get('budgetPaymentReason').value || null;
        body.paymentReasonIndicatorDescription =
          this.budgetPaymentReasonList.find(
            item =>
              item.mapCode ===
              this.getGroupAt(2).get('budgetPaymentReason').value
          ).valueRu;
        body.taxPeriodIndicator =
          this.getGroupAt(2).get('budgetTaxPeriod').value || null;
        body.paymentDocNumber =
          this.getGroupAt(2).get('budgetPaymentDocNumber').value || null;
        body.paymentDocDate =
          moment(this.getGroupAt(2).get('budgetPaymentDocDate').value).format(
            requestDateFormat
          ) || null;
        body.hbOpTypeCode =
          this.getGroupAt(2).get('budgetOperationTypeCode').value || null;
        body.hbOpTypeCodeDescription = this.operationTypeCodeList.find(
          item =>
            item.mapCode ===
            this.getGroupAt(2).get('budgetOperationTypeCode').value
        ).valueRu;
        /*?*/ body.budgetInfo =
          this.getGroupAt(2).get('budgetPaymentType').value || null;
        body.budgetInfoDescription = this.budgetPaymentTypeList.find(
          item =>
            item.mapCode === this.getGroupAt(2).get('budgetPaymentType').value
        ).valueRu;
      }
    } else if (this.transferCurrency === 'KGS') {
      body.knpCodeKgs = '';
    } else if (this.transferCurrency === 'CNY') {
      body.transferPurpose = this.getGroupAt(3).get('purposeCodeCNY').value;
      body.transferPurposeDescription = this.purposeCodeListCNY.find(
        item => item.mapCode === this.getGroupAt(3).get('purposeCodeCNY').value
      ).valueRu;
    }

    if (this.getGroupAt(3).get('isMiddleBank').value) {
      body.nameMiddleBank = this.middleBankName || null;
      body.bicMiddleBank =
        this.getGroupAt(3).get('swiftMiddleBank').value || null;
    }

    if (this.selectedCountry?.code === 'AE') {
      body.transferPurpose = this.getGroupAt(3).get('purposeCodeUAE').value;
      body.transferPurposeDescription = this.purposeCodeUAEList.find(
        item => item.mapCode === this.getGroupAt(3).get('purposeCodeUAE').value
      ).valueRu;
    }
    if (this.selectedCountry?.code === 'CA') {
      body.transitCode = this.getGroupAt(3).get('transitCode').value || null;
    }
    if (
      this.isSwift ||
      (this.transferCurrency !== 'USD' && this.transferCurrency !== 'GBP')
    ) {
      body.bicBankRecipient = this.getGroupAt(3).get('swift').value || null;
    } else {
      body.countryBankRecipient = this.getGroupAt(3).get(
        'recipientBankCountry'
      ).value;
      body.addressBankRecipient = this.getGroupAt(3).get(
        'recipientBankAddress'
      ).value;
    }
    return body;
  }

  sendToConfirm() {
    const requestBody = this.getTemplate();
    const queryParams = {
      template: requestBody,
      operationType: 'currency-transfer',
    };
    this.router.navigate([
      '/currency-control/payment/currency-transfer/sign-confirm',
    ]);
    this.documentService.dataTemplate$.next(queryParams);
    this.documentService.currencyTransferFiles$.next(this.fileList);
    localStorage.setItem('template', JSON.stringify(queryParams));
  }

  edit() {
    this.prefill = this.editTemplate;
    this.getGroupAt(0).patchValue({
      amount: this.editTemplate?.amount,
      accountSender: this.editTemplate?.accountSender,
      unk: this.editTemplate?.passport,
      currency: this.editTemplate?.currencySender,
      isConfirmAgreement: true,
    });
    this.getGroupAt(1).patchValue({
      recipientName: this.editTemplate?.nameRecipient,
      accountRecipient: this.editTemplate?.accountRecipient,
      kbe: this.editTemplate?.kbe,
      recipientCountry: this.editTemplate?.countryRecipient,
      recipientCity: this.editTemplate?.cityRecipient,
      recipientStreet: this.editTemplate?.recipientStreet,
      recipientBuilding: this.editTemplate?.recipientHouseNo,
      recipientApartment: this.editTemplate?.recipientApartmentNo,
      inn: this.editTemplate?.recipientInn,
      kpp: this.editTemplate?.recipientKpp,
      recipientPassportNum: this.editTemplate?.recipientPassportNum,
      recipientPassportDate: this.editTemplate?.recipientPassportDate
        ? moment(
            this.editTemplate?.recipientPassportDate,
            requestDateFormat
          ).format('DD.MM.YYYY')
        : null,
    });
    this.generalLength = this.getRecipientNameAddressLength();
    if (this.editTemplate.budgetPayment) {
      this.isBudgetPayment = true;
      this.getGroupAt(2).patchValue({
        budgetCbc: this.editTemplate?.cbc,
        budgetOktmoCode: this.editTemplate?.okatoCode,
        budgetPaymentReason: this.editTemplate?.paymentReasonIndicator,
        budgetTaxPeriod: this.editTemplate?.taxPeriodIndicator,
        budgetPaymentDocNumber: this.editTemplate?.paymentDocNumber,
        budgetPaymentDocDate: moment(
          this.editTemplate?.paymentDocDate,
          requestDateFormat
        ).format('DD.MM.YYYY'),
        budgetOperationTypeCode: this.editTemplate?.hbOpTypeCode,
        budgetPaymentType: this.editTemplate?.budgetInfo,
      });
    }

    this.getGroupAt(3).patchValue({
      knp: this.editTemplate?.knpCode,
      comissionAccount: this.editTemplate?.accountFeePayment,
      infoToRecipient: this.editTemplate?.infoRecipient,
      purpose: this.editTemplate?.paymentInfo,
      urgent: this.editTemplate?.rkoUrgent,
      operationCodeRub: this.editTemplate?.codeVo,
      isMiddleBank: this.editTemplate?.bicMiddleBank ? true : false,
      swiftMiddleBank: this.editTemplate?.bicMiddleBank,
      transitCode: this.editTemplate?.transitCode,
      swift: this.editTemplate?.bicBankRecipient,
    });
    if (this.editTemplate?.contract) {
      this.selectedContract = {
        makeDate: moment(this.editTemplate?.contractDate, 'YYYY-MM-DD').format(
          'DD.MM.YYYY'
        ),
        contractNumber: this.editTemplate?.contract,
        contractId: this.editTemplate?.dealId,
      };
    }
    this.recipientBankName = this.editTemplate?.nameBankRecipient;
    this.isSwift = !this.editTemplate?.isFw_Sortcode;
    if (this.editTemplate?.isFw_Sortcode) {
      this.getGroupAt(3).patchValue({
        recipientBankName: this.editTemplate?.nameBankRecipient,
        recipientBankCountry: this.editTemplate?.countryBankRecipient,
        recipientBankAddress: this.editTemplate?.addressBankRecipient,
      });
    }

    this.selectedCountry = {
      code: this.editTemplate?.countryCodeRecipient,
    };
    this.knpDescription = this.editTemplate?.knpName;
    this.middleBankName = this.editTemplate?.nameMiddleBank;
    this.getAccountsByCurrency(this.transferCurrency);
    this.calculateProgress();
    this.documentService.currencyTransferFiles$.subscribe((files: any) => {
      if (files?.length > 0) {
        this.fileList = files;
        this.fileNames = this.editTemplate?.fileNames;
      }
    });
    this.changeDetector.detectChanges();
  }

  getTranslations() {
    this.translate
      .get(['error.empty_fields_present', 'error.fileUpload'])
      .subscribe(translations => {
        this.emptyFieldsMessage = translations['error.empty_fields_present'];
        this.fileUploadMessage = translations['error.fileUpload'];
      });
  }
}
