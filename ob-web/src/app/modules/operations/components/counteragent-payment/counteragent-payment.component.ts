import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { prohibitedSymbols } from '@app/core/helpers';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { ActivatedRoute, Router } from '@angular/router';
import { CONFIRM, SIGN_CONFIRM } from '@core/constants/pathnames';
import { AccountsService } from '@core/services/accounts.service';
import { DictionaryService } from '@core/services/dictionary.service';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { IAccountInfo } from '@app/data/models/account-types';
import { DocumentService } from '@app/core/services/document.service';
import { IPayOrder } from '@app/data/models/document-type';
import { HelperService } from '@app/core/services/helper.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CustomvalidationService } from '@app/core/services/customvalidation.service';
import { docNum, errorMessage, getIn } from '@app/core/helpers';
import moment from 'moment';
import { requestDateFormat } from '@app/core/constants';
import { AccountHistoryService } from '@app/core/services/account-history.service';
import { environment } from '@env/environment';

@Component({
  selector: 'ob-counteragent-payment',
  templateUrl: './counteragent-payment.component.html',
  styleUrls: ['./counteragent-payment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounteragentPaymentComponent
  extends SubscriptionAccumulator
  implements OnInit, OnDestroy
{
  @Input() id: number;
  accounts: any = [];
  isEditDocNum: boolean = false;
  prefill: IPayOrder | null = null;
  counteragentForm: FormGroup;
  description: string = '';
  counterAgentList: any = [];
  editTemplate: any;
  knpList: any = [];

  prohibitedSymbols = prohibitedSymbols();

  bicBankRecipient: string = ''; // ??
  bankName: string = '';
  commission: string = '';

  isFormValid$ = new BehaviorSubject<boolean>(false);
  isFormValidOb$ = this.isFormValid$.asObservable();

  public binSubject$ = new Subject<string>();
  public accountNumber$ = new BehaviorSubject<string>('');
  accountInfo: any = [];

  public cbc: string = '';
  public knpSubject$ = new Subject<string>();
  public isSearchableKnp: boolean = false;

  //валидация кнп
  public isKnpInvalid: boolean = false;
  public isKnpInvalidSubject$ = new BehaviorSubject<boolean>(false);
  public isKnpChecked: boolean = false;

  public isSearchingKnp: boolean = false;
  public isSearchingBin: boolean = false;
  public isSearchableBin: boolean = false;
  public insufficientFunds: boolean = false;
  public isPurposeInputBlur: boolean = false;
  public isAccountsLoading: boolean = false;
  public loading: boolean;

  public emptyFieldsError: string;
  public chiefSigner: string;
  public chiefAccountant: string;
  public currentSelectedAccount: string;
  public formSubscription: Subscription;

  public kbeInfo: boolean = false;
  public knpInfo: boolean = false;

  //для проверки контрагента
  public interval: any;
  public counteragentCheckInfo: any;
  public checkInfo: boolean = false;
  public checkInfoLoading: boolean = false;
  public checkTime: number = 20;
  public checkInfoErrorCount: number = 0;
  public companyNotFound: boolean = false;
  public wasChecked: boolean = true;
  public checkHelper: any[] = [];
  public helperFulfilled: any[] = [];
  public helperInprogress: any[] = [];
  public counteragentBin: string;

  public subcriptions: Subscription[] = [];
  public isDisableKbeTooltip: boolean = false;
  public isDisablePurposeTooltip: boolean = false;
  public isSelectedAccountOpen: boolean = false;
  public isBankIconExists: boolean = true;
  public isUrgentAvailable: boolean = true;
  public urgentNotAvailable: string;
  public emptyRequiredFields = '';
  public receiverKbe = '';
  public isSaveLoading: boolean = false;
  public isProduction: boolean = false;

  constructor(
    private accountsService: AccountsService,
    private changeDetector: ChangeDetectorRef,
    private router: Router,
    private fb: FormBuilder,
    private dictionaryService: DictionaryService,
    private documentService: DocumentService,
    public helperService: HelperService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private customValidator: CustomvalidationService,
    private route: ActivatedRoute,
    private accountHistoryService: AccountHistoryService
  ) {
    super();
    this.counteragentForm = this.fb.group({
      docDate: [''],
      docNum: [' ', this.docNumValidator],
      bin: [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(12),
          Validators.maxLength(12),
        ]),
      ],
      account: ['', [this.ibanValidator, this.similarAccountsValidator]],
      counteragent: ['', Validators.required],
      kbe: ['', this.kbeValidator],
      knp: [
        null,
        Validators.compose([
          Validators.required,
          this.customValidator.symbolValidator,
          Validators.pattern(/^-?([0-9]\d*)?$/),
        ]),
      ],
      purpose: [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(420),
          this.customValidator.symbolValidator,
        ]),
      ],
      quickPayment: [false, Validators.required],
      nds: [false, Validators.required],
      selectedAcc: [null, Validators.required],
      sum: [null, this.sumValidator],
      bankName: [''],
      bankBic: [''],
    });
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

  get counteragentFormControl() {
    return this.counteragentForm.controls;
  }

  ngOnInit(): void {
    this.isProduction = environment.production;
    this.addSubscriber(
      this.accountsService.accountsLoading$.subscribe({
        next: v => {
          this.isAccountsLoading = v;
          this.changeDetector.detectChanges();
        },
      })
    );

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

    this.isFormValidOb$.pipe(debounceTime(800)).subscribe({
      // Подписка на валидность формы. Запрос комиссии
      next: () => {
        if (this.isFormValid$.value) {
          this.getCommission(); // Можно сделать проверку на измененные поля чтобы не дергать коммиссию всегда
        }
      },
    });

    this.dictionaryService.observableCounteragentList$.subscribe({
      // Подписка на список счетов
      next: v => {
        if (v.content) {
          v.content.sort(function (a: any, b: any) {
            if (a.name < b.name) {
              return -1;
            } else if (a.name > b.name) {
              return 1;
            } else {
              return 0;
            }
          });
          this.counterAgentList = v.content;
        }
      },
    });

    this.subscribeOnAccountInfo();

    this.addSubscriber(
      this.dictionaryService.counteragentListLoading$.subscribe({
        // Подписка на статус загрузки списка счетов
        next: v => {
          this.isSearchingBin = v;
          this.changeDetector.detectChanges();
        },
      })
    );

    this.addSubscriber(
      this.dictionaryService.accountInfoLoading$.subscribe({
        // Подписка на статус загрузки списка счетов
        next: v => {
          this.changeDetector.detectChanges();
        },
      })
    );
    this.subcriptions.push(this.accountsService.getAccountsList()); // Запрос списка счетов
    this.addSubscriber(
      this.accountsService.currentAccounts.subscribe((data: IAccountInfo[]) => {
        // Подписка на список тек счетов
        let kztAccounts = data.filter(
          acc => acc.currency === 'KZT' && acc.active === 'Y'
        ); // Фильтрация по Тенговым и Активынм счетам
        this.accounts = kztAccounts;
        this.accountsService.setSelectedAccount(this.accounts[0]);
        const iban = this.router.url.split('/')?.[4];

        if (iban && iban.length === 20) {
          this.counteragentForm.patchValue({ selectedAcc: iban });
        }
      })
    );

    this.getTranslations();
    this.subscribeKnpChanges();
    this.getKnp('');
    this.subcriptions.push(this.dictionaryService.searchCounteragent(''));
    this.onChanges();
    if (this.id) {
      // id документа
      let operationStatus = JSON.parse(
        localStorage.getItem('operation-info')
      ).status;
      let operationType = JSON.parse(
        localStorage.getItem('operation-info')
      ).type;

      if (operationStatus === 'DRAFT') {
        this.getDraft(); //созданный документ
      } else {
        this.getPayment(operationType, this.id); //при изменении или повторении платежа
      }
    } else if (this.editTemplate) {
      this.edit();
    } else {
      this.getPrefill(); // получаем шаблон
    }
    this.subscribeAccountInfoErrChanges();
    this.subscribeBinSubjectChanges();
    this.subscribeAccountNumberChanges();

    //Валидация кнп
    this.addSubscriber(
      this.isKnpInvalidSubject$.subscribe({
        next: value => (this.isKnpInvalid = value),
      })
    );
  }

  onBinClose() {
    this.isSearchableBin = false;
  }

  kbeValidator = (control: FormControl) => {
    // Валидатор Кбе
    if (control.value || control.value === 0) {
      if (control.value > 9) {
        if (/^[1-2][1-9]+$/g.test(control.value)) {
          return null;
        } else {
          return {
            pattern: true,
          };
        }
      } else {
        return {
          pattern: true,
        };
      }
    } else {
      return { required: true };
    }
  };

  ibanValidator = (control: FormControl) => {
    // Валидатор поля Счет контрагента
    if (control.value && control.value.length) {
      const value = control.value.toUpperCase();
      if (/^[a-zA-Z0-9]+$/.test(control.value)) {
        // 0
        if (value.length < 20) {
          let error = { minLength: true, pattern: false };
          if (value.length === 1 && value !== 'K') {
            error.pattern = true;
          } else if (value.length === 2 && value !== 'KZ') {
            error.pattern = true;
          }
          return error;
        } else {
          if (value.substring(0, 2) !== 'KZ') {
            return {
              pattern: true,
            };
          } else {
            return null;
          }
        }
      } else {
        let error = { pattern: true, specChars: false };
        if (/\W|_/g.test(control.value)) {
          error.specChars = true;
        }
        return error;
      }
    } else {
      return { required: true };
    }
  };

  onChanges() {
    const form = this.counteragentForm;
    const accService = this.accountsService;
    form.controls['sum'].valueChanges.subscribe({
      // Проверка достаточности средств
      next: v => {
        if (v) {
          if (v > 0) {
            const nAccount = this.accounts.find((acc: any) => {
              const iban = acc.iban || acc.accountIban;
              if (iban === this.counteragentFormControl.selectedAcc.value) {
                return acc;
              }
            });
            const selectedAcc = form.get('selectedAcc').value;
            if (selectedAcc) {
              this.insufficientFunds = v > nAccount?.actualBalance;
              this.changeDetector.detectChanges();
            }
          }
        }
      },
    });

    this.formSubscription = form.controls['selectedAcc'].valueChanges.subscribe(
      {
        next: account => {
          const nAccount = this.accounts.find((acc: any) => {
            const iban = acc.iban || acc.accountIban;
            if (iban === account) {
              return acc;
            }
          });
          const sum = form.get('sum').value;
          if (sum) {
            this.insufficientFunds = sum > nAccount?.actualBalance; // Проверка достаточности средств
            this.changeDetector.detectChanges();
          }
          accService.setSelectedAccount(nAccount); // Сохранение Object аккаунта в сервис
        },
      }
    );

    form.controls['account'].valueChanges.subscribe({
      // Проверка поля счета
      next: v => {
        if (v) {
          const accLength = v.length;
          if (accLength === 20) {
            if (v !== this.accountNumber$.value) {
              this.accountNumber$.next(v);
            }
          } else {
            // При отсутствии валидной длины удаляем поля
            // form.controls['bankBic'].patchValue('')
            // form.controls['bin'].patchValue('')
            // form.controls['counteragent'].patchValue('')
            // form.controls['kbe'].patchValue('')
            // form.controls['bankName'].patchValue('')
          }
        }
      },
    });

    form.statusChanges.subscribe(status =>
      this.isFormValid$.next(status === 'VALID')
    ); // Подписка на валидность формы
  }

  onBinOpen() {
    this.isSearchableBin = true;
  }

  onBinChange(account: any) {
    if (account) {
      const counteragent = this.counterAgentList.find(function (c: any) {
        if (c.account === account.account && c.idn === account.idn) {
          return c;
        } else {
          return undefined;
        }
      });
      if (counteragent) {
        this.onBinChangeCheck();
        clearInterval(this.interval);
        this.counteragentForm.patchValue({
          bin: counteragent.idn,
          account: counteragent.account,
          kbe: counteragent.residencyCode + counteragent.secoCode,
          counteragent: counteragent.name,
          bankName: counteragent.bankName,
          bankBic: counteragent.bankBic,
        });
      }
    }
  }

  subscribeAccountNumberChanges(): void {
    // Подписка на изменение номера счета
    this.accountNumber$
      .pipe(
        debounceTime(800) // TODO подумать нужен ли distinct
      )
      .subscribe({
        next: v => {
          if (v) {
            this.subcriptions.push(
              this.dictionaryService.getAccountInfoByIban(v, this.toastr)
            );
          }
        },
      });
  }

  subscribeAccountInfoErrChanges() {
    // Подписка на изменение номера счета
    this.dictionaryService.accountInfoError$.subscribe({
      next: error => {
        if (error) {
          errorMessage(error, this.toastr);
        }
      },
    });
  }

  subscribeOnAccountInfo() {
    this.dictionaryService.observableAccountInfo$.subscribe({
      // Подписка на запрос данных счета по iban
      next: accountInfo => {
        if (accountInfo.bankBic) {
          this.accountInfo = accountInfo;
          let bankBic: string,
            bankName: string,
            name: string,
            residencyCode: string,
            secoCode: string,
            idn: string,
            account: string;
          let value: { [key: string]: string };
          bankBic = accountInfo.bankBic;
          bankName = accountInfo.bankName;
          name = accountInfo.name;
          residencyCode = accountInfo.residencyCode;
          secoCode = accountInfo.secoCode;
          idn = accountInfo.idn;
          account = accountInfo.account;
          value = {
            bankBic,
            bankName,
            counteragent: name,
            residencyCode,
            secoCode,
            bin: idn,
            account,
          };

          for (const key in value) {
            if (!value[key]) {
              delete value[key];
            }
          }
          if (value.residencyCode && value.secoCode) {
            value.kbe = `${value.residencyCode}${value.secoCode}`;
            delete value.residencyCode;
            delete value.secoCode;
          }
          this.counteragentForm.patchValue(value);
          this.changeDetector.detectChanges();
        }
      },
    });
  }

  onDocNumKeyUp(event: any) {
    // Проверка на нажатие клавиши Enter на поле номер документа
    if (event.keyCode === 13) {
      this.isEditDocNum = false;
    }
  }

  getTranslations() {
    this.translate
      .get([
        'operations.default.comissionHint',
        'error.empty_fields_present',
        'error.urgent_not_available',
        'operations.default.staffAccountNumber',
        'error.enter-required-fields',
        'operations.default.receiver-kbe',
      ])
      .subscribe(translations => {
        this.commission = translations['operations.default.comissionHint'];
        this.emptyFieldsError = translations['error.empty_fields_present'];
        this.urgentNotAvailable = translations['error.urgent_not_available'];
        (this.emptyRequiredFields =
          translations['error.enter-required-fields']),
          (this.receiverKbe = translations['operations.default.receiver-kbe']);
      });
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

  isFieldInvalid(field: string) {
    // Валидация полей
    const formField = this.counteragentForm.get(field);
    if (field === 'knp' && formField.valid) {
      return this.isKnpInvalid;
    }
    return (
      (!formField.valid && formField.touched && !formField.pristine) ||
      (!formField.valid && formField.dirty && !formField.pristine)
    );
  }

  displayFieldClass(field: string) {
    // css класс
    return { 'is-invalid': this.isFieldInvalid(field) };
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
    } else {
      this.isDisableKbeTooltip = true;
    }
  }

  enableTooltip(type: string) {
    if (type === 'purpose') {
      this.isDisablePurposeTooltip = false;
    } else {
      this.isDisableKbeTooltip = false;
    }
  }

  convertToFixed() {
    return this.counteragentFormControl.sum.value
      ? this.counteragentFormControl.sum.value
      : '0';
  }

  getDraft(): void {
    // получаем черновик
    this.addSubscriber(
      this.documentService
        .getSavedOrderById(this.id)
        .subscribe((res: IPayOrder) => {
          this.prefill = res;
          this.counteragentForm.patchValue({
            docDate: res?.docDate || '',
            docNum: res?.docNum || '',
            bin: res?.idnRecipient || '',
            account: res?.accountRecipient || '',
            knp: res?.knpCode || '',
            purpose: res?.purpose || '',
            quickPayment: res?.urgent,
            nds: res?.isNdsCountFlag,
            selectedAcc: res.accountSender,
            sum: res?.amount || '',
            kbe: res?.kbe || '',
            counteragent: res?.nameRecipient || '',
          });
          this.description = res?.knpName;
          Object.values(this.counteragentForm.controls).forEach(field => {
            field.markAsTouched();
            field.updateValueAndValidity();
          });
        })
    );
  }

  getPayment(type: any, id: number) {
    this.addSubscriber(
      this.accountHistoryService.getPaymentById(type, id.toString()).subscribe(
        (res: IPayOrder) => {
          // TODO CHECK 2nd CALLBACK
          this.getPrefill(); // для получения номера документа и даты создания и валютирования
          this.counteragentForm.patchValue({
            bin: res?.idnRecipient || '',
            account: res?.accountRecipient || '',
            knp: res?.knpCode || '',
            purpose: res?.purpose || '',
            quickPayment: res?.urgent,
            nds: res?.isNdsCountFlag,
            selectedAcc: res.accountSender,
            sum: res?.amount || '',
            kbe: res?.kbe || '',
            counteragent: res?.nameRecipient || '',
          });
          this.description = res?.knpName;
          Object.values(this.counteragentForm.controls).forEach(field => {
            field.markAsTouched();
            field.updateValueAndValidity();
          });
        },
        () => {
          this.getCommission();
        }
      )
    );
  }

  onSearchBin(searchStr: any) {
    let item = searchStr.term;
    this.changeBinSubject(item);
    this.counteragentForm.patchValue({
      bin: searchStr.term,
    });
    this.counteragentFormControl.bin.markAsDirty();
    if (item === '') {
      this.counteragentForm.patchValue({
        bin: null,
      });
    }
  }

  changeBinSubject(search: string) {
    this.binSubject$.next(search);
  }

  subscribeBinSubjectChanges(): void {
    this.binSubject$.pipe(debounceTime(800), distinctUntilChanged()).subscribe({
      next: v => {
        this.subcriptions.push(this.dictionaryService.searchCounteragent(v));
      },
    });
  }

  onSearchKnp(input: any) {
    this.getKnp(input.term);
    let knpObj = this.knpList.find((val: any) => val.code === input.term);

    if (knpObj?.code.length > 0) {
      this.description = knpObj.name;
    }
    this.counteragentForm.patchValue({
      knp: input.term,
    });
    this.counteragentFormControl.knp.markAsDirty();
    if (input.term === '') {
      this.counteragentForm.patchValue({
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
        this.isSearchingKnp = true;
        this.changeDetector.detectChanges();
        this.subcriptions.push(
          this.dictionaryService.searchKnp(v, 'PAY_ORDER').subscribe({
            next: data => {
              if (data.length === 0) {
                this.isKnpInvalidSubject$.next(true);
              }
              setTimeout(() => {
                this.knpList = data;
                this.isSearchingKnp = false;
                if (data.length > 0) {
                  this.isKnpInvalidSubject$.next(false);
                }
                this.isKnpChecked = true;
                this.changeDetector.detectChanges();
              }, 800);
            },
          })
        );

        this.counteragentForm.controls['knp'].valueChanges.subscribe({
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
          this.cbc = knpObj.cbc;
          this.description = knpObj.name;
        }
      } else {
        this.counteragentForm.patchValue({
          knp: knp.code,
        });
        this.cbc = knp.cbc;
        this.description = knp?.name;
      }
      this.changeDetector.detectChanges();
    }
  }

  get formControl() {
    return this.counteragentForm.controls;
  }

  onOpenKnp() {
    this.isSearchableKnp = true;
  }

  onCloseKnp() {
    this.isSearchableKnp = false;
  }

  getPrefill(): void {
    // Запрос префила
    let nDocNum = docNum();
    let nDocDate = moment().format(requestDateFormat);
    this.subcriptions.push(
      this.documentService.getPayOrderPrefill().subscribe({
        next: (data: IPayOrder) => {
          this.prefill = data;
          if (!data.docDate) {
            this.prefill.docDate = nDocDate;
          }
          this.counteragentForm.patchValue({ docNum: nDocNum });
          this.changeDetector.detectChanges();
        },
        error: error => {
          errorMessage(error, this.toastr);
          this.prefill = { docDate: nDocDate, docNum: nDocNum };
          this.counteragentForm.patchValue({ docNum: nDocNum });
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  edit() {
    this.prefill = this.editTemplate;
    this.counteragentForm.patchValue({
      docDate: this.editTemplate?.docDate || '',
      docNum: this.editTemplate?.docNum || '',
      bin: this.editTemplate?.idnRecipient || '',
      account: this.editTemplate?.accountRecipient || '',
      knp: this.editTemplate?.knpCode || '',
      purpose: this.editTemplate?.purpose || '',
      quickPayment: this.editTemplate?.urgent,
      nds: this.editTemplate?.isNdsCountFlag,
      selectedAcc: this.editTemplate.accountSender,
      sum: this.editTemplate?.amount || '',
      kbe: this.editTemplate?.kbe || '',
      counteragent: this.editTemplate?.nameRecipient || '',
    });
    this.description = this.editTemplate?.knpName;
    Object.values(this.counteragentForm.controls).forEach(field => {
      field.markAsTouched();
      field.updateValueAndValidity();
    });
    this.getCommission();
  }

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

  sumValidator = (control: FormControl) => {
    if (control.value) {
      if (
        Number.parseFloat(control.value) <= 0 ||
        isNaN(Number.parseFloat(control.value))
      ) {
        return { incorrectSum: true }; //Проверка сумма равна 0 или .
      }
      return null;
    } else {
      return { required: true };
    }
  };

  changeTemplate() {
    const form = this.counteragentFormControl;
    let newTemplate = {
      accountSender: getIn(form, 'selectedAcc', 'value', 'iban'),
      accountRecipient: getIn(form, 'account', 'value') || '',
      accountMiddleBank: this.prefill?.accountMiddleBank || '',
      amount: getIn(form, 'sum', 'value') || '',
      bankNameRecipient: getIn(form, 'bankName', 'value') || '',
      bicBankRecipient: getIn(form, 'bankBic', 'value') || '',
      currencyContractExists: this.prefill?.currencyContractExists,
      chief: this.chiefSigner || '',
      chiefAccountant: this.chiefAccountant,
      docDate: this.prefill?.docDate || '',
      docNum: getIn(form, 'docNum', 'value') || '',
      els: this.prefill?.els || undefined,
      id: this.prefill?.id || undefined,
      idnRecipient: getIn(form, 'bin', 'value') || '',
      infoRecipient: getIn(form, 'counteragent', 'value'),
      isNdsCountFlag: getIn(form, 'nds', 'value') || false,
      kbe: getIn(form, 'kbe', 'value') || '',
      knpCode: getIn(form, 'knp', 'value', 'code') || '',
      knpName: this.description || '',
      middleBankName: this.prefill?.middleBankName || '',
      nameSender: this.prefill?.nameSender || '',
      nameRecipient: getIn(form, 'counteragent', 'value') || '',
      period: this.prefill?.period || '',
      purpose: getIn(form, 'purpose', 'value') || '',
      source: this.prefill?.source || 'WEB',
      subType: this.prefill?.subType || '',
      taxCommitteeParent: this.prefill?.taxCommitteeParent || '',
      urgent: getIn(form, 'quickPayment', 'value') || false,
      vinCode: this.prefill?.vinCode || '',
      valDate: this.prefill?.valDate || '',
      comission: this.commission || '0',
    };
    return newTemplate;
  }

  FieldsValidation(type: string): void {
    const form = this.counteragentForm;
    if (type === 'save') {
      this.savePayOrder();
    } else {
      if (form.valid && !this.isKnpInvalid && this.isKnpChecked) {
        //форма невалидна
        if (type === 'sign') {
          this.sendPayOrder();
        }
      } else {
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
          errorMessage({ message: this.emptyFieldsError }, this.toastr);
        }
      }
    }
  }

  sendPayOrder() {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
    let counteragentTemplate = this.changeTemplate();

    const queryParams = {
      template: counteragentTemplate,
      id: this.counteragentFormControl.counteragent.value,
      operationType: 'counteragent',
    };
    this.router.navigate([SIGN_CONFIRM.replace(':type', 'counteragent')]);
    this.documentService.dataTemplate$.next(queryParams);
    localStorage.setItem('template', JSON.stringify(queryParams));
  }

  savePayOrder(): void {
    this.isSaveLoading = true;
    this.changeDetector.detectChanges();
    let newPayOrder = this.changeTemplate();
    delete newPayOrder.source;
    delete newPayOrder.taxCommitteeParent;
    this.subcriptions.push(
      this.documentService.savePayOrder(newPayOrder).subscribe(
        (data: any) => {
          if (data.status === 200) {
            this.router.navigate(['operations'], {
              state: { scrollTo: 'operation-table', tab: 'DRAFT' },
            });
          }
          this.isSaveLoading = false;
          this.changeDetector.detectChanges();
        },
        (error: any) => {
          errorMessage(error, this.toastr);
          this.isSaveLoading = false;
          this.changeDetector.detectChanges();
        }
      )
    );
  }

  reset() {
    this.accountNumber$.unsubscribe();
    this.dictionaryService.accountInfoError$.next(null);
    this.dictionaryService.accountInfo$.next({});
    this.counteragentForm.reset();
  }

  ngOnDestroy(): void {
    this.reset();
    this.subcriptions.forEach(s => s.unsubscribe());
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }

  getIn(data: any, args: string[]) {
    return getIn(data, ...args);
  }

  setKnp(id: any) {
    this.counteragentForm.patchValue({
      knp: this.knpList.find((val: any) => val.id === id).code,
    });
    this.description = this.knpList.find((val: any) => val.id === id).name;
  }

  getIcon(currency: string): string {
    return this.helperService.getAccountIcon(currency);
  }

  getCommission(): void {
    this.loading = true;
    this.subcriptions.push(
      this.documentService
        .getPayOrderCommission(this.changeTemplate())
        .subscribe({
          next: (data: any) => {
            this.commission = data + '';
            this.changeDetector.markForCheck();
            this.loading = false;
          },
          error: (error: any) => {
            this.loading = false;
            errorMessage(error, this.toastr);
          },
        })
    );
  }

  docNumChange(value: any) {
    this.counteragentFormControl.docNum.setValue(value);
  }

  getHeight(content: any) {
    const v1 = Math.ceil(content.length / 65);
    const v2 = content.split('\n').length;
    return Math.max(v1, v2);
  }
  // Пользователь может вводить только цифры
  passOnlyNumbers(ev: any) {
    if (ev.type === 'paste' || ev.type === 'drop') {
      var textContent = (
        ev.type === 'paste' ? ev.clipboardData : ev.dataTransfer
      ).getData('text');
      return !isNaN(textContent);
    } else if (ev.type === 'keypress') {
      if (ev.ctrlKey || ev.metaKey) {
        return true;
      }
      var keysToAllow = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57];
      return keysToAllow.indexOf(ev.keyCode) > -1;
    } else {
      return true;
    }
  }

  kbeInfoShow() {
    this.kbeInfo = !this.kbeInfo;
  }

  knpInfoShow() {
    this.knpInfo = !this.knpInfo;
  }

  onOpenSelectedAccount() {
    this.isSelectedAccountOpen = true;
  }

  onCloseSelectedAccount() {
    this.isSelectedAccountOpen = false;
  }
  //Проверка возможна ли опция срочного платежа (до 15:00 по времени г. НурСултан)
  checkUrgentAvailable() {
    var d = new Date();
    var utc = d.getTime() + d.getTimezoneOffset() * 60000;
    var nd = new Date(utc + 3600000 * +6);
    if (nd.getHours() * 60 + nd.getMinutes() < 15 * 60) {
      this.isUrgentAvailable = true;
    } else {
      this.isUrgentAvailable = false;
      errorMessage({ message: this.urgentNotAvailable }, this.toastr);
    }
  }

  onBinChangeCheck() {
    this.checkInfo = false;
    this.companyNotFound = false;
    this.checkInfoErrorCount = 0;
    this.helperInprogress = [];
    this.helperFulfilled = [];
    this.checkHelper = [];
    this.wasChecked = true;
    if (this.counteragentForm.get('bin').value !== null) {
      if (!this.isProduction) {
        this.accountsService.getCheckCountragentList().subscribe(list => {
          if (list && list.length !== 0) {
            let checker: boolean = false;
            for (let i: number = 0; i < list.length; i++) {
              if (
                list[i].beneficiaryBin ===
                  this.counteragentForm.get('bin').value &&
                list[i].status === 'FULFILLED'
              ) {
                checker = true;
                break;
              }
            }
            if (checker === true) {
              let bin = this.counteragentForm.get('bin').value;
              if (
                bin !== null &&
                this.counteragentForm.get('bin').valid &&
                this.checkInfoErrorCount !== 3
              ) {
                this.checkInfo = true;
                this.checkInfoLoading = true;
                for (let i: number = 0; i < list.length; i++) {
                  if (
                    list[i].beneficiaryBin === bin &&
                    list[i].status === 'FULFILLED'
                  ) {
                    this.helperFulfilled.push(list[i]);
                    this.checkHelper.push(list[i]);
                  } else if (
                    list[i].beneficiaryBin === bin &&
                    list[i].status === 'IN_PROGRESS'
                  ) {
                    this.helperInprogress.push(list[i]);
                    this.checkHelper.push(list[i]);
                  } else if (
                    list[i].beneficiaryBin === bin &&
                    list[i].status === 'COMPANY_NOT_FOUND'
                  ) {
                    this.checkHelper.push(list[i]);
                  }
                }
                if (this.checkHelper.length !== 0) {
                  if (
                    this.checkHelper[this.checkHelper.length - 1].status ===
                    'FULFILLED'
                  ) {
                    if (this.wasChecked === false) {
                      this.accountsService
                        .checkCounteragent(bin)
                        .subscribe(value => {
                          this.checkAndGetInfo();
                        });
                    } else {
                      this.checkInfoLoading = false;
                      this.changeDetector.detectChanges();
                    }
                  } else if (
                    this.checkHelper[this.checkHelper.length - 1].status ===
                      'IN_PROGRESS' &&
                    this.helperFulfilled.length !== 0
                  ) {
                    if (this.wasChecked === false) {
                      this.accountsService
                        .getCheckCountragentInfo(bin)
                        .subscribe((info: any) => {
                          //Получаем информацию с бэка
                          if (info) {
                            this.counteragentCheckInfo = info;
                            this.checkInfoLoading = false;
                            this.changeDetector.detectChanges();
                          } else {
                            this.checkInfoErrorCount = 3;
                            this.checkInfoLoading = false;
                            this.changeDetector.detectChanges();
                          }
                        });
                    } else {
                      this.checkInfoLoading = false;
                      this.changeDetector.detectChanges();
                    }
                  } else if (
                    this.checkHelper[this.checkHelper.length - 1].status ===
                      'IN_PROGRESS' &&
                    this.helperFulfilled.length === 0
                  ) {
                    this.interval = setInterval(() => {
                      if (this.checkTime > 0) {
                        this.checkTime--;
                      } else {
                        this.checkTime = 20;
                        clearInterval(this.interval);
                        //после 20 секунд рекурсивно вызываем нашу функцию
                        this.checkInfoErrorCount = this.checkInfoErrorCount + 1;
                        this.checkAndGetInfo();
                      }
                    }, 1000);
                  } else if (
                    this.checkHelper[this.checkHelper.length - 1].status ===
                    'COMPANY_NOT_FOUND'
                  ) {
                    this.companyNotFound = true;
                    this.checkInfoLoading = false;
                    this.changeDetector.detectChanges();
                  }
                } else {
                  this.accountsService
                    .checkCounteragent(bin)
                    .subscribe(value => {
                      this.checkAndGetInfo();
                    });
                }
              } else if (bin !== null && this.checkInfoErrorCount === 3) {
                //если сервис вернул нам 3 раза ошибку значит контрагент не проверен
                //прошла минута не удалось проверить контрагента
                this.checkInfoLoading = false;
                this.changeDetector.detectChanges();
              }
            }
          }
        });
      }
    }
  }

  checkAndGetInfo() {
    let bin = this.counteragentForm.get('bin').value;
    if (
      bin !== null &&
      this.counteragentForm.get('bin').valid &&
      this.checkInfoErrorCount !== 3
    ) {
      this.checkInfo = true;
      this.checkInfoLoading = true;
      this.accountsService.getCheckCountragentList().subscribe(list => {
        for (let i: number = 0; i < list.length; i++) {
          if (
            list[i].beneficiaryBin === bin &&
            list[i].status === 'FULFILLED'
          ) {
            this.helperFulfilled.push(list[i]);
            this.checkHelper.push(list[i]);
          } else if (
            list[i].beneficiaryBin === bin &&
            list[i].status === 'IN_PROGRESS'
          ) {
            this.helperInprogress.push(list[i]);
            this.checkHelper.push(list[i]);
          } else if (
            list[i].beneficiaryBin === bin &&
            list[i].status === 'COMPANY_NOT_FOUND'
          ) {
            this.checkHelper.push(list[i]);
          }
        }
        if (this.checkHelper.length !== 0) {
          if (
            this.checkHelper[this.checkHelper.length - 1].status === 'FULFILLED'
          ) {
            if (this.wasChecked === false) {
              this.accountsService.checkCounteragent(bin).subscribe(value => {
                this.checkAndGetInfo();
              });
            } else {
              this.checkInfoLoading = false;
              this.changeDetector.detectChanges();
            }
          } else if (
            this.checkHelper[this.checkHelper.length - 1].status ===
              'IN_PROGRESS' &&
            this.helperFulfilled.length !== 0
          ) {
            if (this.wasChecked === false) {
              this.accountsService
                .getCheckCountragentInfo(bin)
                .subscribe((info: any) => {
                  //Получаем информацию с бэка
                  if (info) {
                    this.counteragentCheckInfo = info;
                    this.checkInfoLoading = false;
                    this.changeDetector.detectChanges();
                  } else {
                    this.checkInfoErrorCount = 3;
                    this.checkInfoLoading = false;
                    this.changeDetector.detectChanges();
                  }
                });
            } else {
              this.checkInfoLoading = false;
              this.changeDetector.detectChanges();
            }
          } else if (
            this.checkHelper[this.checkHelper.length - 1].status ===
              'IN_PROGRESS' &&
            this.helperFulfilled.length === 0
          ) {
            this.interval = setInterval(() => {
              if (this.checkTime > 0) {
                this.checkTime--;
              } else {
                this.checkTime = 20;
                clearInterval(this.interval);
                //после 20 секунд рекурсивно вызываем нашу функцию
                this.checkInfoErrorCount = this.checkInfoErrorCount + 1;
                this.checkAndGetInfo();
              }
            }, 1000);
          } else if (
            this.checkHelper[this.checkHelper.length - 1].status ===
            'COMPANY_NOT_FOUND'
          ) {
            this.companyNotFound = true;
            this.checkInfoLoading = false;
            this.changeDetector.detectChanges();
          }
        } else {
          this.accountsService.checkCounteragent(bin).subscribe(value => {
            this.checkAndGetInfo();
          });
        }
      });
    } else if (bin !== null && this.checkInfoErrorCount === 3) {
      //если сервис вернул нам 3 раза ошибку значит контрагент не проверен
      //прошла минута не удалось проверить контрагента
      this.checkInfoLoading = false;
      this.changeDetector.detectChanges();
    }
  }

  checkAgain() {
    this.checkInfo = false;
    this.companyNotFound = false;
    this.checkInfoErrorCount = 0;
    this.helperInprogress = [];
    this.helperFulfilled = [];
    this.checkHelper = [];
    this.wasChecked = false;
    this.checkAndGetInfo();
  }

  formatDate(date: string): string {
    if (date) {
      date = date.substr(0, 10);
      let month: string = date.substr(5, 2);
      let day: string = date.substr(8, 2);
      let year: string = date.substr(0, 4);
      return day + ' ' + this.getMonth(month) + ' ' + year + ' года ';
    }
    return '';
  }

  getMonth(month: string): string {
    switch (month) {
      case '01':
        return 'января';
      case '02':
        return 'февраля';
      case '03':
        return 'марта';
      case '04':
        return 'апреля';
      case '05':
        return 'мая';
      case '06':
        return 'июня';
      case '07':
        return 'июля';
      case '08':
        return 'августа';
      case '09':
        return 'сентября';
      case '10':
        return 'октября';
      case '11':
        return 'ноября';
      case '12':
        return 'декабря';
      default:
        return '';
    }
  }

  counteragentBinChange() {
    if (this.counteragentBin && this.counteragentBin.length === 12) {
      this.onBinChangeCheck();
    }
  }

  // Валидация если пользователь выбрал одинаковые счета списания и получателя
  similarAccountsValidator = (control: FormControl) => {
    if (control.value && control.value.length) {
      const value = control.value.toUpperCase();
      if (this.counteragentFormControl.selectedAcc.value === value) {
        return { similarAccounts: true };
      } else {
        return null;
      }
    } else {
      return null;
    }
  };
}
