import { OperationsService } from '@core/services/operations.service';
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  Input,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  docNum,
  errorMessage,
  getIn,
  prohibitedSymbols,
} from '@app/core/helpers';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { CONFIRM, SIGN_CONFIRM } from '@core/constants/pathnames';
import { AccountsService } from '@core/services/accounts.service';
import { IAccountInfo } from '@data/models/account-types';
import { IEmployee } from '@data/models/common-types';
import { IPayment, IPaymentsList } from '@data/models/payment-types';
import { DictionaryService } from '@core/services/dictionary.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DocumentService } from '@app/core/services/document.service';
import {
  IPaymentOsms,
  IPaymentPension,
  IPaymentSalary,
  IPaymentSocial,
} from '@data/models/document-type';
import { ModalStaffListComponent } from '@app/shared';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { HelperService } from '@app/core/services/helper.service';
import { CustomvalidationService } from '@app/core/services/customvalidation.service';
import { IBank } from '@app/data/models/dictionary-types';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { NgSelectComponent } from '@ng-select/ng-select';
import moment from 'moment';
import {
  operationPeriod,
  periodFormat,
  requestDateFormat,
} from '@app/core/constants';
import { AccountHistoryService } from '@app/core/services/account-history.service';

const paymentTypes: IPayment = {
  osms: {
    name: 'osms',
    title: 'default.osms_payment',
    url: 'pay-pension/pre-fill/osms',
    commissionUrl: 'documents/pay-pension/get-commission',
    code: 'PAY_MEDICAL',
  },
  retirement: {
    name: 'retirement',
    title: 'operations.type.PAY_PENSION_V2',
    url: 'pay-pension/pre-fill/default',
    commissionUrl: 'documents/pay-pension/get-commission',
    code: 'PAY_PENSION',
  },
  salary: {
    name: 'salary',
    title: 'operations.type.PAY_SALARY_V2',
    url: 'pay-salary/pre-fill/default',
    commissionUrl: 'documents/pay-salary/get-commission',
    code: 'PAY_SALARY',
  },
  social: {
    name: 'social',
    title: 'operations.type.PAY_SOCIAL_V2',
    url: 'pay-social/pre-fill/default',
    commissionUrl: 'documents/pay-social/get-commission',
    code: 'PAY_SOCIAL',
  },
};

@Component({
  selector: 'ob-common-payment',
  templateUrl: './common-payment.component.html',
  styleUrls: [
    './common-payment.component.scss',
    '../counteragent-payment/counteragent-payment.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommonPaymentComponent
  extends SubscriptionAccumulator
  implements OnInit, OnDestroy
{
  @Input() id: number;

  prohibitedSymbols = prohibitedSymbols();
  modalRef?: BsModalRef;

  public employees: IEmployee[] = [];
  public paymentType: IPaymentsList | null = null;
  public paymentTitle: string = '';
  public prefill: any = null;
  public isGeneralDate: boolean = false;
  public accounts: IAccountInfo[] = [];
  public selectedAccount: IAccountInfo | null = null;
  public usersList: IEmployee[] = [];
  public formLoading: boolean = false;
  public filteredKnp: any = [];
  public allKnps: any = [];
  public flagknp: boolean = false;
  public commonForm: FormGroup;
  public description: string;
  public currentPaymentName: string = '';
  public newUserList: any;
  public currency: string = '';
  public sum: number = 0;
  public commission: string;
  public commissionUrl: string;
  public isLoading: boolean = false;
  public isEditDocNum: boolean = false;
  public bankInfo: string = '';
  public bankInfoBic: string = '';
  public formSubmitFlag: boolean = false;
  public userListInns: any = [];
  @ViewChild('ngSelectKnp') ngSelectKnpCbc: NgSelectComponent;
  public knpObservable$: Observable<any>;
  public knpSubject$ = new Subject<string>();
  public knpList: any = [];
  public isSearchingKnp: boolean = false;
  public isSearchableKnp: boolean = false;
  public emptyFieldsError: string;
  public chiefSigner: string;
  public chiefAccountant: string;
  public isPurposeInputBlur: boolean = false;
  public editTemplate: any;
  public loading: boolean;
  public bankInfoloading: boolean = false;
  public salaryInfo: boolean = false;
  public retirementInfo: boolean = false;
  public retirementInfo1: boolean = false;
  public osmsInfo: boolean = false;
  public osmsInfo1: boolean = false;
  public socialInfo: boolean = false;
  public socialInfo1: boolean = false;
  public subscriptions: Subscription[] = [];
  public isDisablePurposeTooltip: boolean = false;
  public isSelectedAccountOpen: boolean = false;
  public isUrgentAvailable: boolean = true;
  public urgentNotAvailable: string;
  collectivePeriodSubject: BehaviorSubject<Date> = new BehaviorSubject<Date>(
    null
  );
  public empAccMsg: string = '';
  public isSaveLoading: boolean = false;

  public employeeBankName$ = new BehaviorSubject<any>(null);
  public observalbeEmployeeBankName$ = this.employeeBankName$.asObservable();

  public employeeBankLogo$ = new BehaviorSubject<any>(null);
  public observalbeEmployeeBankLogo$ = this.employeeBankLogo$.asObservable();
  public unicodeList: any = [];
  public comissionTxt = '';
  public isSearchableBankRecipient: boolean = false;
  public isUnicodesLoading: boolean = false;
  public isBankNameRecipient: boolean = false;
  public lastVisitedPageEmployees: number;

  constructor(
    private modalService: BsModalService,
    public accountsService: AccountsService,
    public operationsService: OperationsService,
    public changeDetector: ChangeDetectorRef,
    public route: ActivatedRoute,
    private router: Router,
    private dictionaryService: DictionaryService,
    private fb: FormBuilder,
    private documentService: DocumentService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private helperService: HelperService,
    private customValidator: CustomvalidationService,
    private accountHistoryService: AccountHistoryService
  ) {
    super();
    this.commonForm = this.fb.group({
      docNum: [' ', this.docNumValidator],
      bankNameRecipient: [
        null,
        [
          Validators.minLength(20),
          Validators.pattern(/^[A-Z0-9]+(?!.)/),
          this.similarAccountsValidator,
        ],
      ],
      bin: [
        '',
        Validators.compose([
          Validators.minLength(12),
          this.customValidator.symbolValidator,
        ]),
      ],
      knp: [null, Validators.required],
      purpose: [''],
      quickPayment: [false],
      collectivePeriod: [false],
      collectivePeriodDate: [null],
      selectedAcc: [null, Validators.required],
    });
    this.addSubscriber(
      //редактирование
      this.documentService.currentTemplate$.subscribe(data => {
        if (this.route.snapshot.queryParamMap.get('template')) {
          if (data) {
            this.editTemplate = data;
          }
        }
      })
    );
  }

  get commonFormControl() {
    return this.commonForm.controls;
  }

  ngOnInit(): void {
    const paymentType: IPaymentsList = this.route.snapshot.params.type;
    this.paymentType = paymentType;
    this.paymentTitle = paymentTypes[paymentType]?.title;
    this.currentPaymentName = paymentTypes[paymentType].name;
    this.commissionUrl = paymentTypes[paymentType].commissionUrl;
    this.subscriptions.push(this.accountsService.getAccountsList());
    if (this.paymentType === 'salary') {
      this.commonFormControl.purpose.setValidators(
        Validators.compose([
          Validators.required,
          Validators.maxLength(420),
          this.customValidator.symbolValidator,
        ])
      );
    }
    this.documentService.firstChiefSigner$.subscribe({
      next: firstChiefSigner => {
        this.chiefSigner = firstChiefSigner.name;
        this.changeDetector.detectChanges();
      },
    });

    this.addSubscriber(
      this.documentService.accountantSigner$.subscribe({
        next: chiefAccountant => {
          this.chiefAccountant = chiefAccountant.name;
          this.changeDetector.detectChanges();
        },
      })
    );
    this.formChanges();
    this.addSubscriber(
      this.accountsService.currentAccounts.subscribe((data: IAccountInfo[]) => {
        let kztAccounts = data.filter(
          acc => acc.currency === 'KZT' && acc.active === 'Y'
        );
        this.accounts = kztAccounts;
        this.accountsService.setSelectedAccount(this.accounts[0]);
      })
    );
    if (this.id) {
      // id документа
      let operationStatus = JSON.parse(
        localStorage.getItem('operation-info')
      ).status;
      let operationType = JSON.parse(
        localStorage.getItem('operation-info')
      ).type;
      if (operationStatus === 'DRAFT') {
        this.getDraft(paymentTypes[paymentType]?.url); //созданный документ
      } else {
        this.getPrefill(paymentTypes[paymentType]?.url); // для получения номера документа и даты создания и валютирования
        this.getPaymentById(
          operationType,
          this.id,
          paymentTypes[paymentType]?.url
        ); //при изменении или повторении платежа
      }
    } else if (this.editTemplate) {
      this.edit();
    } else {
      this.getPrefill(paymentTypes[paymentType]?.url); // получаем шаблон
    }
    this.getTranslations();
    //  this.searchKnp();
    this.subscribeKnpChanges();
    this.getKnp('');
    if (this.paymentType === 'salary') {
      this.getUnicodes();
    }
    this.operationsService.currenStaffListLastPage$.subscribe(
      data => (this.lastVisitedPageEmployees = data)
    );
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

  getTranslations() {
    this.translate
      .get([
        'operations.default.comissionHint',
        'error.empty_fields_present',
        'error.urgent_not_available',
        'operations.default.staffAccountNumber',
        'operations.payments.commission',
      ])
      .subscribe(translations => {
        this.commission = translations['operations.default.comissionHint'];
        this.emptyFieldsError = translations['error.empty_fields_present'];
        this.urgentNotAvailable = translations['error.urgent_not_available'];
        this.empAccMsg = translations['operations.default.staffAccountNumber'];
        this.comissionTxt = translations['operations.payments.commission'];
      });
  }

  openModal() {
    let initialState = {
      employeeList: this.newUserList,
      paymentType: this.paymentType,
    };
    this.modalRef = this.modalService.show(ModalStaffListComponent, {
      class: 'modal-xl modal-dialog-centered',
      id: 1,
      initialState,
      ignoreBackdropClick: false,
    });
    /*При открывании второго модального окна
    для ред. доб. сотрудника меняется размер модального окна*/
    this.modalRef.content.changeWidth.subscribe((data: any) => {
      if (data) {
        this.modalRef.setClass('modal-lg modal-dialog-centered');
      }
    });

    this.addSubscriber(
      this.modalRef.content.onClose.subscribe((data: IEmployee[]) => {
        this.usersList = data;
        this.changeDetector.detectChanges();
      })
    );
  }

  formChanges(): void {
    this.commonForm
      .get('bankNameRecipient')
      .valueChanges.pipe(debounceTime(800), distinctUntilChanged())
      .subscribe(value => {
        this.getBankNameRecipient(value);
      });

    this.commonForm.valueChanges
      .pipe(debounceTime(800), distinctUntilChanged())
      .subscribe(_ => {
        if (this.paymentType === 'salary') {
          if (
            this.commonForm.valid &&
            this.totalAmount() > 0 &&
            !this.isLoading &&
            this.bankInfo.trim().length > 0
          ) {
            this.sendCommission();
          }
        } else {
          if (
            this.commonForm.valid &&
            this.totalAmount() > 0 &&
            !this.isLoading
          ) {
            this.sendCommission();
          }
        }
      });
  }

  getBankNameRecipient(value: any) {
    if (value?.length > 19 && this.commonFormControl.bankNameRecipient.valid) {
      this.bankInfoloading = true;
      this.subscriptions.push(
        this.dictionaryService.getBankName(value).subscribe(
          (data: IBank) => {
            this.bankInfo = data.bankName;
            this.bankInfoBic = data.bic;
            this.bankInfoloading = false;
            this.employeeBankName$.next(data.bankName);
            this.employeeBankLogo$.next(data.bic);
            if (
              this.commonForm.valid &&
              this.totalAmount() > 0 &&
              !this.isLoading &&
              this.bankInfo.trim().length > 0
            ) {
              this.sendCommission();
            }
            this.changeDetector.detectChanges();
          },
          error => {
            if (
              getIn(error, 'error', 'systemMessage') &&
              getIn(error, 'error', 'systemMessage').includes(
                'recipientAccNotCorrect'
              )
            ) {
              this.commonForm.controls['bankNameRecipient'].setErrors({
                incorrectBankAccount: true,
              });
              this.employeeBankName$.next(null);
              this.employeeBankLogo$.next(null);
              this.bankInfoloading = false;
            }
          }
        )
      );
      this.changeDetector.detectChanges();
    } else {
      this.bankInfo = '';
      this.bankInfoBic = '';
      this.employeeBankName$.next(null);
      this.employeeBankLogo$.next(null);
      this.changeDetector.detectChanges();
    }
  }

  editDocNum() {
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

  ngOnDestroy(): void {
    this.modalService.hide(1);
    this.modalService.hide(2);
    localStorage.removeItem('operation-for-change');
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  getIcon(currency: string): string {
    return this.helperService.getAccountIcon(currency);
  }

  getPrefill(type: string): void {
    this.isLoading = true;
    let nDocNum = docNum();
    let nDocDate = moment().format(requestDateFormat);
    this.subscriptions.push(
      this.documentService.getPreFill(type).subscribe({
        next: (data: any) => {
          this.prefill = data;
          if (!data.docDate) {
            this.prefill.docDate = nDocDate;
          }
          this.commonForm.patchValue({ docNum: nDocNum, knp: data.knpCode });
          this.description = data.knpName;
          this.isLoading = false;
          this.changeDetector.detectChanges();
        },
        error: (err: any) => {
          this.prefill = { docNum: nDocNum, docDate: nDocDate };
          this.commonForm.patchValue({ docNum: nDocNum });
          this.isLoading = false;
          errorMessage(err, this.toastr);
          this.changeDetector.detectChanges();
        },
        complete: () => {
          this.isLoading = false;
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  getDraft(type: string): void {
    // получаем черновик
    this.subscriptions.push(
      this.documentService
        .getSavedPaymentsById(type.split('/')[0], this.id)
        .subscribe({
          next: (data: any) => {
            this.prefill = data;
            this.commonForm.setValue({
              docNum: data?.docNum || '',
              bankNameRecipient: data?.accountRecipient || '',
              bin: data?.idnRecipient || '',
              knp: data?.knpCode || '',
              purpose: data?.purpose || '',
              quickPayment: data?.urgent || false,
              selectedAcc: data.accountSender,
              collectivePeriod:
                data?.collectivePeriod && data?.collectivePeriodDate
                  ? true
                  : false,
              collectivePeriodDate:
                moment(data?.collectivePeriodDate, operationPeriod).toDate() ||
                '',
            });
            this.getAccountCurrency();
            this.description = data?.knpName || '';
            this.setCommonValues(data, type);
            Object.values(this.commonForm.controls).forEach(field => {
              field.markAsTouched();
            });
          },
          error: error => {
            errorMessage(error, this.toastr);
          },
        })
    );
  }

  getPaymentById(type: any, id: number, prefillUrl: string) {
    this.addSubscriber(
      this.accountHistoryService
        .getPaymentById(type, id.toString())
        .subscribe((data: any) => {
          this.commonForm.setValue({
            docNum: docNum(),
            bankNameRecipient: data?.accountRecipient || '',
            bin: data?.idnRecipient || '',
            knp: data?.knpCode || '',
            purpose: data?.purpose || '',
            quickPayment: data?.urgent || false,
            selectedAcc: data.accountSender,
            collectivePeriod:
              data?.collectivePeriod && data?.collectivePeriodDate
                ? true
                : false,
            collectivePeriodDate:
              moment(data?.collectivePeriodDate, operationPeriod).toDate() ||
              '',
          });
          this.getAccountCurrency();
          this.description = data?.knpName || '';
          this.setCommonValues(data, prefillUrl);
          Object.values(this.commonForm.controls).forEach(field => {
            field.markAsTouched();
          });
        })
    );
  }

  edit() {
    this.prefill = this.editTemplate;
    this.commonForm.setValue({
      docNum: this.editTemplate?.docNum || '',
      bankNameRecipient: this.editTemplate?.accountRecipient || '',
      bin: this.editTemplate?.idnRecipient || '',
      knp: this.editTemplate?.knpCode || '',
      purpose: this.editTemplate?.purpose || '',
      quickPayment: this.editTemplate?.urgent || false,
      selectedAcc: this.editTemplate.accountSender,
      collectivePeriod:
        this.editTemplate?.collectivePeriod &&
        this.editTemplate?.collectivePeriodDate
          ? true
          : false,
      collectivePeriodDate:
        moment(
          this.editTemplate?.collectivePeriodDate,
          operationPeriod
        ).toDate() || '',
    });
    this.getAccountCurrency();
    this.description = this.editTemplate?.knpName || '';
    this.setCommonValues(this.editTemplate, this.router.url);
    Object.values(this.commonForm.controls).forEach(field => {
      field.markAsTouched();
    });
    // if (this.commonForm.valid && !this.isLoading) {
    //   this.sendCommission();
    // }
  }

  setCommonValues(data: any, type: string) {
    this.description = data.knpName;
    if (type.includes('pension')) {
      this.usersList = data['pensionList'] || [];
    } else if (type.includes('social')) {
      this.usersList = data['socialList'] || [];
    } else if (type.includes('salary')) {
      this.usersList = data['salaryList'] || [];
    } else if (type.includes('retirement')) {
      this.usersList = data['pensionList'] || [];
    } else if (type.includes('osms')) {
      this.usersList = data['pensionList'] || [];
    }

    if (this.usersList.length >= 0) {
      this.userListInns = this.usersList.map((item: any) => item.iin);
      this.usersList = this.usersList.map((item: any) => ({
        ...item,
        birthDay: item.birthday,
        // period: item.period
        //   ? moment(item.period, operationPeriod).format(periodFormat)
        //   : "",
        id: item.employeeId,
      }));
    }
    this.changeDetector.markForCheck();
  }

  onSearchKnp(input: any) {
    this.getKnp(input.term);
    this.commonForm.patchValue({
      knp: input.term,
    });
    this.commonForm.get('knp').markAsDirty();
    if (input.term === '') {
      this.commonForm.patchValue({
        knp: null,
      });
    }
    // if (input.term) {
    //   this.commonForm.patchValue({
    //     knp: input.term,
    //   });
    // }
  }

  getKnp(search: string) {
    this.knpSubject$.next(search);
  }

  subscribeKnpChanges(): void {
    this.knpSubject$.pipe(debounceTime(800), distinctUntilChanged()).subscribe({
      next: (v: string) => {
        this.isSearchingKnp = true;
        this.changeDetector.detectChanges();
        if (this.paymentType === 'salary') {
          this.subscriptions.push(
            this.dictionaryService
              .searchKnp(v, paymentTypes[this.paymentType].code)
              .subscribe({
                next: data => {
                  setTimeout(() => {
                    this.knpList = data;
                    this.isSearchingKnp = false;
                    this.changeDetector.detectChanges();
                  }, 800);
                },
                error: error => {
                  this.isSearchingKnp = false;
                  errorMessage(error, this.toastr);
                  this.changeDetector.detectChanges();
                },
              })
          );
        } else {
          this.subscriptions.push(
            this.dictionaryService
              .searchKnpWithCbc(v, paymentTypes[this.paymentType].code)
              .subscribe({
                next: data => {
                  data.content.sort(function (a, b) {
                    if (a.knp > b.knp) {
                      return 1;
                    } else if (a.knp < b.knp) {
                      return -1;
                    } else {
                      return 0;
                    }
                  });
                  setTimeout(() => {
                    this.knpList = data.content;
                    this.isSearchingKnp = false;
                    this.changeDetector.detectChanges();
                  }, 800);
                },
                error: error => {
                  this.isSearchingKnp = false;
                  errorMessage(error, this.toastr);
                  this.changeDetector.detectChanges();
                },
              })
          );
        }
        this.commonForm.controls['knp'].valueChanges.subscribe({
          next: knp => {
            if (knp) {
              this.description = knp.name;
              this.changeDetector.detectChanges();
            }
          },
        });
      },
      error: error => {
        errorMessage(error, this.toastr);
        this.isSearchingKnp = false;
        this.changeDetector.detectChanges();
      },
    });
  }

  onOpenKnp() {
    // this.ngSelectKnpCbc.clearModel();
    this.isSearchableKnp = true;
    // this.onSearchKnp({ term: "" });
  }

  onCloseKnp() {
    this.isSearchableKnp = false;
  }

  onChangeKnp(knp: any) {
    if (typeof knp === 'string') {
      const knpObj = this.knpList.find((val: any) => val.knp === knp);
      if (knpObj) {
        this.description = knpObj.name;
      }
    } else {
      // let nKnp = "";
      // if (knp) {
      //   nKnp = knp.code || knp.knp;
      // }
      this.commonForm.patchValue({
        knp: knp.code || knp.knp,
      });
      this.description = knp?.name || knp?.knpName;
    }

    this.changeDetector.detectChanges();
  }

  getEmployees(employees: any) {
    this.newUserList = [...employees];
    // if (employees.length) {
    //     employees.forEach((e: any, index: number) => {
    //         if (checkObjectProperty(() => e.period) && e.period !== '') {
    //             this.newUserList[index].period = this.formatPeriodDate(employees[index].period)
    //         }
    //     })
    // }
    if (
      this.commonFormControl.collectivePeriod.value &&
      this.commonFormControl.collectivePeriodDate.value
    ) {
      let periodDate = this.commonFormControl.collectivePeriodDate.value;
      if (
        employees.some(
          (emp: any) =>
            emp['period'].getMonth() !== periodDate.getMonth() ||
            emp['period'].getFullYear() !== periodDate.getFullYear()
        )
      ) {
        this.commonFormControl.collectivePeriod.setValue(false);
      }
    }

    if (this.paymentType !== 'salary') {
      this.newUserList = this.newUserList.map((item: any) => ({
        ...item,
        period: item.period
          ? moment(item.period, periodFormat).format(operationPeriod)
          : '',
      }));
    }

    this.userListInns = employees.map((item: any) => item.iin);
    if (this.sum !== this.totalAmount()) {
      if (this.paymentType === 'salary') {
        if (
          this.commonForm.valid &&
          !this.isLoading &&
          this.bankInfo.trim().length > 0
        ) {
          this.sendCommission();
        }
      } else {
        if (this.commonForm.valid && !this.isLoading) {
          this.sendCommission();
        }
      }
      this.sum = this.totalAmount();
    }
  }

  formatPeriodDate(periodDate: string | Date): string {
    return periodDate instanceof Date
      ? moment(periodDate).format(operationPeriod)
      : periodDate;
  }

  changeSelectedAccount() {
    const account: IAccountInfo | undefined = this.accounts.find((acc: any) => {
      if (
        acc.iban === this.selectedAccount ||
        acc.accountIban === this.selectedAccount
      ) {
        return acc;
      }
    });

    if (account) {
      this.accountsService.setSelectedAccount(account);
    }
    this.getAccountCurrency();
  }

  getAccountCurrency() {
    const account = this.accounts.find(
      item => item.iban === this.commonForm.get('selectedAcc').value
    );
    if (account) {
      this.currency = account.currency;
    }
  }

  changeGeneralDate(val: boolean) {
    this.isGeneralDate = val;
  }

  onSave() {
    if (this.currentPaymentName === 'osms') {
      this.saveOsmsPayment();
    } else if (this.currentPaymentName === 'salary') {
      this.saveSalaryPayment();
    } else if (this.currentPaymentName === 'retirement') {
      this.savePensionPayment();
    } else if (this.currentPaymentName === 'social') {
      this.saveSocialPayment();
    }
  }

  onSign() {
    if (this.currentPaymentName === 'osms') {
      this.sendOsmsPayment();
    } else if (this.currentPaymentName === 'salary') {
      this.sendSalaryPayment();
    } else if (this.currentPaymentName === 'retirement') {
      this.sendPensionPayment();
    } else if (this.currentPaymentName === 'social') {
      this.sendSocialPayment();
    }
    this.formLoading = true;
  }

  getOsmsTemplate(): IPaymentOsms {
    let params: IPaymentOsms = {
      id: this.prefill?.id || undefined,
      docDate: this.prefill?.docDate,
      valDate: this.prefill?.docDate,
      docNum: this.commonFormControl.docNum.value,
      amount: this.sum,
      nameRecipient: this.prefill?.nameRecipient,
      accountRecipient: this.prefill?.accountRecipient,
      idnRecipient: this.prefill?.idnRecipient,
      nameSender: this.prefill?.nameSender,
      accountSender: this.commonFormControl.selectedAcc.value,
      bankNameRecipient: this.bankInfo || this.prefill?.bankNameRecipient,
      bicBankRecipient: this.bankInfoBic || this.prefill?.bicBankRecipient,
      knpCode: this.commonFormControl.knp.value,
      knpName: this.description,
      purpose: this.description,
      infoRecipient: this.prefill?.infoRecipient || undefined,
      urgent: this.commonFormControl.quickPayment.value,
      kbe: this.prefill?.kbe,
      chief: this.chiefSigner || '',
      chiefAccountant: this.chiefAccountant,
      subType: this.prefill?.subType,
      pensionList: this.formattedEmployeeList(),
      source: this.prefill?.source || 'WEB',
      comission: this.commission || '0',
      collectivePeriod: this.commonFormControl.collectivePeriod.value,
      collectivePeriodDate: this.formatPeriodDate(
        this.commonFormControl.collectivePeriodDate.value
      ),
    };
    return params;
  }

  sendOsmsPayment() {
    const queryParams = {
      template: this.getOsmsTemplate(),
      id: this.id,
      operationType: 'osms',
      lastVisitedPage: this.lastVisitedPageEmployees,
    };
    this.router.navigate([SIGN_CONFIRM.replace(':type', 'osms')]);
    this.documentService.dataTemplate$.next(queryParams);
    localStorage.setItem('template', JSON.stringify(queryParams));
  }

  saveOsmsPayment() {
    this.isSaveLoading = true;
    this.changeDetector.detectChanges();
    let newOsms = this.getOsmsTemplate();
    delete newOsms.source;
    this.addSubscriber(
      this.documentService.saveOSMSPrefill(newOsms).subscribe(
        (data: any) => {
          if (data.status === 200) {
            this.router.navigate(['operations'], {
              state: { scrollTo: 'operation-table', tab: 'DRAFT' },
            });
          }
          this.isSaveLoading = false;
          this.changeDetector.detectChanges();
        },
        error => {
          this.formLoading = false;
          errorMessage(error, this.toastr);
          this.isSaveLoading = false;
          this.changeDetector.detectChanges();
        }
      )
    );
  }

  salaryTemplate(): IPaymentSalary {
    let params: IPaymentSalary = {
      id: this.prefill?.id || undefined,
      docDate: this.prefill?.docDate,
      valDate: this.prefill?.docDate,
      docNum: this.commonFormControl.docNum.value,
      amount: this.sum,
      nameRecipient: this.bankInfo,
      accountRecipient: this.commonFormControl.bankNameRecipient.value,
      idnRecipient: this.commonFormControl.bin.value,
      nameSender: this.prefill?.nameSender,
      accountSender: this.commonFormControl.selectedAcc.value,
      bankNameRecipient: this.bankInfo,
      bicBankRecipient: this.bankInfoBic,
      knpCode: this.commonFormControl.knp.value,
      knpName: this.description,
      purpose: this.commonFormControl.purpose.value,
      infoRecipient: this.prefill?.infoRecipient || undefined,
      urgent: this.commonFormControl.quickPayment.value,
      kbe: '19',
      chief: this.chiefSigner || '',
      chiefAccountant: this.chiefAccountant,
      subType: this.prefill?.subType,
      accountSenderCurrency: this.currency,
      salaryList: this.formattedEmployeeList(),
      source: this.prefill?.source || 'WEB',
      comission: this.commission || '0',
    };
    if (this.bankInfoBic === 'HSBKKZKX') {
      params.urgent = 'true';
    }
    return params;
  }

  sendSalaryPayment() {
    const queryParams = {
      template: this.salaryTemplate(),
      id: this.id,
      operationType: 'salary',
      lastVisitedPage: this.lastVisitedPageEmployees,
    };
    this.router.navigate([SIGN_CONFIRM.replace(':type', 'salary')]);
    this.documentService.dataTemplate$.next(queryParams);
    localStorage.setItem('template', JSON.stringify(queryParams));
  }

  saveSalaryPayment() {
    this.isSaveLoading = true;
    this.changeDetector.detectChanges();
    let newSalary = this.salaryTemplate();
    delete newSalary.source;
    this.addSubscriber(
      this.documentService.saveSalaryPrefill(newSalary).subscribe(
        (data: any) => {
          if (data.status === 200) {
            this.router.navigate(['operations'], {
              state: { scrollTo: 'operation-table', tab: 'DRAFT' },
            });
          }
          this.isSaveLoading = false;
          this.changeDetector.detectChanges();
        },
        error => {
          this.formLoading = false;
          errorMessage(error, this.toastr);
          this.isSaveLoading = false;
          this.changeDetector.detectChanges();
        }
      )
    );
  }

  getPensionTemplate(): IPaymentPension {
    let params: IPaymentPension = {
      id: this.prefill?.id || undefined,
      docDate: this.prefill?.docDate,
      valDate: this.prefill?.docDate,
      docNum: this.commonFormControl.docNum.value,
      amount: this.sum,
      nameRecipient: this.prefill?.nameRecipient,
      accountRecipient: this.prefill?.accountRecipient,
      idnRecipient: this.prefill?.idnRecipient,
      nameSender: this.prefill?.nameSender,
      accountSender: this.commonFormControl.selectedAcc.value,
      bankNameRecipient: this.bankInfo || this.prefill?.bankNameRecipient,
      bicBankRecipient: this.bankInfoBic || this.prefill?.bicBankRecipient,
      knpCode: this.commonFormControl.knp.value,
      knpName: this.description,
      purpose: this.description,
      infoRecipient: this.prefill?.infoRecipient || undefined,
      urgent: this.commonFormControl.quickPayment.value,
      kbe: this.prefill?.kbe,
      chief: this.chiefSigner || '',
      chiefAccountant: this.chiefAccountant,
      subType: this.prefill?.subType,
      pensionList: this.formattedEmployeeList(),
      source: this.prefill?.source || 'WEB',
      comission: this.commission || '0',
      collectivePeriod: this.commonFormControl.collectivePeriod.value,
      collectivePeriodDate: this.formatPeriodDate(
        this.commonFormControl.collectivePeriodDate.value
      ),
    };
    return params;
  }

  sendPensionPayment() {
    const queryParams = {
      template: this.getPensionTemplate(),
      id: this.id,
      operationType: 'retirement',
      lastVisitedPage: this.lastVisitedPageEmployees,
    };
    this.router.navigate([SIGN_CONFIRM.replace(':type', 'retirement')]);
    this.documentService.dataTemplate$.next(queryParams);
    localStorage.setItem('template', JSON.stringify(queryParams));
  }

  savePensionPayment() {
    this.isSaveLoading = true;
    this.changeDetector.detectChanges();
    let newPension = this.getPensionTemplate();
    delete newPension.source;
    this.addSubscriber(
      this.documentService.savePensionPrefill(newPension).subscribe(
        (data: any) => {
          if (data.status === 200) {
            this.router.navigate(['operations'], {
              state: { scrollTo: 'operation-table', tab: 'DRAFT' },
            });
          }
          this.isSaveLoading = false;
          this.changeDetector.detectChanges();
        },
        error => {
          this.formLoading = false;
          errorMessage(error, this.toastr);
          this.isSaveLoading = false;
          this.changeDetector.detectChanges();
        }
      )
    );
  }

  getSocialTemplate(): IPaymentSocial {
    let params: IPaymentSocial = {
      id: this.prefill?.id || undefined,
      docDate: this.prefill?.docDate,
      valDate: this.prefill?.docDate,
      docNum: this.commonFormControl.docNum.value,
      period: this.prefill?.period,
      nameRecipient: this.prefill?.nameRecipient,
      accountRecipient: this.prefill?.accountRecipient,
      idnRecipient: this.prefill?.idnRecipient,
      amount: this.sum,
      nameSender: this.prefill?.nameSender,
      accountSender: this.commonFormControl.selectedAcc.value,
      bankNameRecipient: this.bankInfo || this.prefill?.bankNameRecipient,
      bicBankRecipient: this.bankInfoBic || this.prefill?.bicBankRecipient,
      knpCode: this.commonFormControl.knp.value,
      knpName: this.description,
      purpose: this.description,
      infoRecipient: this.prefill?.infoRecipient || undefined,
      urgent: this.commonFormControl.quickPayment.value,
      kbe: this.prefill?.kbe,
      chief: this.chiefSigner || '',
      chiefAccountant: this.chiefAccountant,
      subType: this.prefill?.subType,
      socialList: this.formattedEmployeeList(),
      source: this.prefill?.source || 'WEB',
      comission: this.commission || '0',
      collectivePeriod: this.commonFormControl.collectivePeriod.value,
      collectivePeriodDate: this.formatPeriodDate(
        this.commonFormControl.collectivePeriodDate.value
      ),
    };
    return params;
  }

  sendSocialPayment() {
    const queryParams = {
      template: this.getSocialTemplate(),
      id: this.id,
      operationType: 'social',
      lastVisitedPage: this.lastVisitedPageEmployees,
    };
    this.router.navigate([SIGN_CONFIRM.replace(':type', 'social')]);
    this.documentService.dataTemplate$.next(queryParams);
    localStorage.setItem('template', JSON.stringify(queryParams));
  }

  saveSocialPayment(): void {
    this.isSaveLoading = true;
    this.changeDetector.detectChanges();
    let newSocail = this.getSocialTemplate();
    delete newSocail.source;
    this.addSubscriber(
      this.documentService.saveSocailPrefill(newSocail).subscribe(
        (data: any) => {
          if (data.status === 200) {
            this.router.navigate(['operations'], {
              state: { scrollTo: 'operation-table', tab: 'DRAFT' },
            });
          }
          this.isSaveLoading = false;
          this.changeDetector.detectChanges();
        },
        error => {
          this.formLoading = false;
          errorMessage(error, this.toastr);
          this.isSaveLoading = false;
          this.changeDetector.detectChanges();
        }
      )
    );
  }

  totalAmount() {
    let totalSum = this.newUserList.reduce(
      (sum: number, item: { amount: any }) => sum + Number(item.amount),
      0
    );
    return totalSum;
  }

  confirmPayment() {
    this.router.navigate([
      CONFIRM.replace(':type', this.currentPaymentName),
      {
        sum: this.sum,
        name: this.prefill?.bankNameRecipient,
        receiver: this.paymentTitle,
      },
    ]);
  }

  sendCommission() {
    if (this.currentPaymentName === 'osms') {
      this.getCommission(this.getOsmsTemplate(), this.commissionUrl);
    } else if (this.currentPaymentName === 'salary') {
      this.getCommission(this.salaryTemplate(), this.commissionUrl);
    } else if (this.currentPaymentName === 'retirement') {
      this.getCommission(this.getPensionTemplate(), this.commissionUrl);
    } else if (this.currentPaymentName === 'social') {
      this.getCommission(this.getSocialTemplate(), this.commissionUrl);
    }
  }

  getCommission(template: any, url: string): void {
    delete template?.socialList;
    delete template?.pensionList;
    delete template?.salaryList;
    delete template?.collectivePeriod;
    delete template?.collectivePeriodDate;
    this.loading = true;
    this.subscriptions.push(
      this.documentService.getPaymentCommission(template, url).subscribe({
        next: (data: any) => {
          this.commission = data + '';
          this.loading = false;
          this.changeDetector.detectChanges();
        },
        error: error => {
          this.loading = false;
          errorMessage(error, this.toastr);
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  FieldsValidation(type: string) {
    const form = this.commonForm;
    let emptyAccList: string[] = this.hasEmptyAccountNumber(this.newUserList);
    let hasEmptyAccount: boolean = emptyAccList.length > 0;
    if (type === 'save') {
      this.onSave();
    } else {
      if (this.paymentType === 'salary') {
        if (form.valid && !hasEmptyAccount) {
          //форма невалидна
          if (type === 'sign') {
            this.onSign();
          }
        } else {
          if (hasEmptyAccount) {
            let empEmptyAccErrMsg = `${this.emptyFieldsError}: \n •${this.empAccMsg}`;
            if (emptyAccList.length > 1) {
              emptyAccList.forEach((employee: any) => {
                empEmptyAccErrMsg += `\n ${employee.index + 1}) ${
                  employee.name
                }`;
              });
            }
            errorMessage({ message: empEmptyAccErrMsg }, this.toastr);
          }
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
      } else {
        if (form.valid) {
          //форма невалидна
          if (type === 'sign') {
            this.onSign();
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
  }

  isFieldValid(field: string) {
    const formField = this.commonForm.get(field);
    return (
      (!formField.valid && formField.touched && !formField.pristine) ||
      (!formField.valid && formField.dirty && !formField.pristine)
    );
  }

  displayFieldClass(field: string) {
    return { 'is-invalid': this.isFieldValid(field) };
  }

  onTextareaBlur() {
    this.isPurposeInputBlur = true;
    this.enableTooltip();
  }

  onTextareaFocus() {
    this.isPurposeInputBlur = false;
    this.disableTooltip();
  }

  docNumChange(value: any) {
    this.commonFormControl.docNum.setValue(value);
  }
  getHeight(content: any) {
    const v1 = Math.ceil(content.length / 65);
    const v2 = content.split('\n').length;
    return Math.max(v1, v2);
  }

  salaryInfoShow() {
    this.salaryInfo = !this.salaryInfo;
  }

  retirementInfoShow() {
    this.retirementInfo = !this.retirementInfo;
  }

  retirement1InfoShow() {
    this.retirementInfo1 = !this.retirementInfo1;
  }

  osmsInfoShow() {
    this.osmsInfo = !this.osmsInfo;
  }

  osms1InfoShow() {
    this.osmsInfo1 = !this.osmsInfo1;
  }

  socialInfoShow() {
    this.socialInfo = !this.socialInfo;
  }

  social1InfoShow() {
    this.socialInfo1 = !this.socialInfo1;
  }

  disableTooltip() {
    this.isDisablePurposeTooltip = true;
  }

  enableTooltip() {
    this.isDisablePurposeTooltip = false;
  }

  onOpenSelectedAccount() {
    this.isSelectedAccountOpen = true;
  }

  onCloseSelectedAccount() {
    this.isSelectedAccountOpen = false;
  }

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

  onPeriodChange(value: Date) {
    if (
      this.commonFormControl.collectivePeriod.value &&
      !this.commonFormControl.collectivePeriodDate.pristine //Чтобы при редактировании сохранились выбранные периоды сотрудников
    ) {
      this.collectivePeriodSubject.next(value);
    }
  }

  markDirty() {
    this.commonFormControl.collectivePeriodDate.markAsDirty();
  }

  togglePeriod() {
    if (!this.commonFormControl.collectivePeriod.value) {
      this.commonForm.patchValue({
        collectivePeriodDate: null,
      });
    }
  }

  hasEmptyAccountNumber(usersList: IEmployee[]): string[] {
    let emptyAccList: any[] = [];
    for (let i: number = 0; i < usersList.length; i++) {
      if (!usersList[i].account) {
        let empName: string = '';
        if (usersList[i]?.lastName !== null) {
          empName += this.helperService.capitalizeFirstLetter(
            usersList[i]?.lastName
          );
        }
        if (usersList[i]?.firstName !== null) {
          empName +=
            ' ' +
            this.helperService.capitalizeFirstLetter(usersList[i]?.firstName);
        }
        if (usersList[i]?.middleName !== null) {
          empName +=
            ' ' +
            this.helperService.capitalizeFirstLetter(usersList[i]?.middleName);
        }
        emptyAccList.push({ index: i, name: empName });
      }
    }
    return emptyAccList;
  }

  getUnicodes() {
    this.isUnicodesLoading = true;
    this.changeDetector.detectChanges();
    this.operationsService.getSalaryUnicodes().subscribe({
      next: (data: any) => {
        this.unicodeList = data;
        this.isUnicodesLoading = false;
        this.changeDetector.detectChanges();
      },
      error: (err: any) => {
        errorMessage(err, this.toastr);
        this.isUnicodesLoading = false;
        this.changeDetector.detectChanges();
      },
    });
  }

  getUnicodeComissionText(rate: any) {
    return `${this.comissionTxt} ${rate}%`;
  }

  onChangeBankRecipient(event: any) {
    this.commonForm.patchValue({
      bankNameRecipient: event.id,
      bin: event.bin,
    });
    this.changeDetector.detectChanges();
    this.getBankNameRecipient(event.id);
  }

  onSearchBankRecipient(input: any) {
    this.commonForm.patchValue({
      bankNameRecipient: input.term,
    });
    this.commonForm.get('bankNameRecipient').markAsDirty();
    if (input.term === '') {
      this.commonForm.patchValue({
        bankNameRecipient: null,
      });
    }
  }

  onOpenCloseBankRecipient() {
    this.isSearchableBankRecipient = !this.isSearchableBankRecipient;
    this.changeDetector.detectChanges();
  }

  similarAccountsValidator = (control: FormControl) => {
    if (control.value && control.value.length) {
      const value = control.value.toUpperCase();
      if (this.commonFormControl.selectedAcc.value === value) {
        return { similarAccounts: true };
      } else {
        return null;
      }
    } else {
      return null;
    }
  };

  formattedEmployeeList() {
    let resultList: any = [];
    this.newUserList.forEach((emp: any) => {
      let newEmp: any = Object.assign({}, emp);
      newEmp.employeeId = emp.id;
      newEmp.birthday = emp.birthDay;
      delete newEmp.id;
      delete newEmp.birthDay;
      if (this.paymentType === 'salary') {
        delete newEmp.period;
      }
      resultList.push(newEmp);
    });
    return resultList;
  }
}
