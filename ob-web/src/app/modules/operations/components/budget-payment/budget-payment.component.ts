/* eslint-disable max-len */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { CONFIRM, SIGN_CONFIRM } from '@core/constants/pathnames';
import { AccountsService } from '@core/services/accounts.service';
import { DocumentService } from '@app/core/services/document.service';
import { DictionaryService } from '@app/core/services/dictionary.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { IBudget } from '@app/data/models/document-type';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { IRegion, IUGD } from '@app/data/models/dictionary-types';
import { HelperService } from '@app/core/services/helper.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { IAccountInfo } from '@app/data/models/account-types';
import { getCalendarFormat } from 'ngx-bootstrap/chronos/moment/calendar';
import { CustomvalidationService } from '@app/core/services/customvalidation.service';
import { NgSelectComponent, NgSelectConfig } from '@ng-select/ng-select';
import { Observable, Subject, Subscription } from 'rxjs';
import { docNum, errorMessage, getIn } from '@app/core/helpers';
import moment from 'moment';
import {
  operationPeriod,
  periodFormat,
  requestDateFormat,
} from '@app/core/constants';
import { AccountHistoryService } from '@app/core/services/account-history.service';
@Component({
  selector: 'ob-budget-payment',
  templateUrl: './budget-payment.component.html',
  styleUrls: [
    '../counteragent-payment/counteragent-payment.component.scss',
    './budget-payment.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetPaymentComponent
  extends SubscriptionAccumulator
  implements OnInit, OnDestroy
{
  public paymentTitle: string = 'operations.type.PAY_BUDGET';
  public knp: string = '';
  public kbk: any = {};
  public accounts: any = [];
  public selectedAccount: any;
  public budgetForm: FormGroup;
  public commission: string = '';
  public filteredKnp: any = [];
  public allKnps: any = [];
  public template: IBudget | null = null;
  public description: string = 'Описание Кода назначения платежа';
  public flagknp: boolean = false;
  public regionList: IRegion[] = [];
  public ugdList: IUGD[] = [];
  public cbc: string = '';
  public bin: string = '';
  public isUgd: boolean = true;
  public isEditDocNum: boolean = false;
  public editTemplate: any;
  public docNum: string;

  @Input() id: number;
  @ViewChild('ngSelectKnpCbc') ngSelectKnpCbc: NgSelectComponent;
  accountAmount: number;
  // observables
  public knpCbcResult$: Observable<any>;
  public knpCbcSubject$ = new Subject<string>();

  // flags
  public budgetSubmitFlag: boolean = false;
  public isSearchableKnpCbc: boolean = false;
  public isSearchableRegion: boolean = false;
  public isSearchableUGD: boolean = false;
  public isSearchableAccount: boolean = false;
  public isSearchingKnp: boolean = false;
  public isAccountsLoading: boolean;
  public isUgdListLoading: boolean;
  public loading: boolean;

  public emptyFieldsError: string;
  public chiefSigner: string;
  public chiefAccountant: string;

  public knpDescription: string = '';
  public cbcDescription: string = '';

  public deductionTypeInfo: boolean = false;

  public subscriptions: Subscription[] = [];
  public isSaveLoading: boolean = false;

  constructor(
    public accountsService: AccountsService,
    public changeDetector: ChangeDetectorRef,
    public route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private dictionaryService: DictionaryService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private toastr: ToastrService,
    private helperService: HelperService,
    private customValidator: CustomvalidationService,
    private accountHistoryService: AccountHistoryService
  ) {
    super();
    this.budgetForm = this.fb.group({
      docNum: [' ', this.docNumValidator],
      code: [''],
      docDate: [''],
      region: [null, Validators.required],
      ugd: [null, Validators.required],
      cbcKnpId: [null, Validators.compose([Validators.required])],
      selectedAcc: [null, Validators.required],
      sum: ['', Validators.required],
      period: [new Date(), Validators.required],
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

  get budgetFormControl() {
    return this.budgetForm.controls;
  }

  ngOnInit(): void {
    this.docNum = docNum();

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

    this.addSubscriber(
      this.accountsService.currentAccounts.subscribe((data: IAccountInfo[]) => {
        let kztAccounts = data.filter(
          acc => acc.currency === 'KZT' && acc.active === 'Y'
        );
        this.accounts = kztAccounts;
        this.accountsService.setSelectedAccount(this.accounts[0]);
      })
    );

    this.addSubscriber(
      this.accountsService.accountsLoading$.subscribe({
        next: v => {
          this.isAccountsLoading = v;
          this.changeDetector.detectChanges();
        },
      })
    );

    this.addSubscriber(
      this.dictionaryService.ugdListLoading$.subscribe({
        next: v => {
          this.isUgdListLoading = v;
          this.changeDetector.detectChanges();
        },
      })
    );

    this.addSubscriber(
      this.dictionaryService.observableUugdList$.subscribe({
        next: (data: IUGD[]) => {
          const sortedUgdList = data.sort(function (a, b) {
            if (a.name < b.name) {
              return -1;
            } else if (a.name > b.name) {
              return 1;
            } else {
              return 0;
            }
          });
          this.ugdList = sortedUgdList;
        },
      })
    );
    this.addSubscriber(this.accountsService.getAccountsList());
    this.subscribeKnpCbcValues();
    this.getKnp(' ');
    this.getRegions();
    this.onChange();
    this.getTranslations();
    if (this.id) {
      //id документа
      let operationStatus = JSON.parse(
        localStorage.getItem('operation-info')
      ).status;
      let operationType = JSON.parse(
        localStorage.getItem('operation-info')
      ).type;

      if (operationStatus === 'DRAFT') {
        this.getDraft(); //созданный документ
      } else {
        this.getPaymentById(operationType, this.id); //при изменении или повторении платежа
      }
    } else if (this.editTemplate) {
      this.edit();
    } else {
      this.getPrefill(); // получаем шаблон
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  docNumValidator = (control: FormControl) => {
    // Валидатор поля Номера документа
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

  onOpenRegion(isOn: boolean) {
    this.isSearchableRegion = !isOn;
  }

  onOpenUGD(isOn: boolean) {
    this.isSearchableUGD = !isOn;
  }

  onOpenAccSelect(isOn: boolean) {
    if (!isOn) {
      this.budgetForm.get('selectedAcc').setValue('');
    }
    this.isSearchableAccount = !isOn;
  }

  getTranslations() {
    this.translate
      .get(['operations.default.comissionHint', 'error.empty_fields_present'])
      .subscribe(translations => {
        this.commission = translations['operations.default.comissionHint'];
        this.emptyFieldsError = translations['error.empty_fields_present'];
      });
  }

  getDraft() {
    this.addSubscriber(
      this.documentService
        .getSavedBudgetById(this.id)
        .subscribe((res: IBudget) => {
          this.getDraftUgds(res.payBudgetList[0].taxCommitteeName);
          this.template = res;
          this.budgetForm.patchValue({
            docNum: res?.docNum || '',
            docDate: res?.docDate || '',
            region: res?.payBudgetList[0].taxCommitteeName || '',
            ugd: res?.nameRecipient || '',
            selectedAcc: res?.accountSender,
            sum: res?.amount || '',
            period: res?.payBudgetList[0].period
              ? moment(res?.payBudgetList[0].period, operationPeriod).format(
                  periodFormat
                )
              : '',
          });

          this.subscriptions.push(
            this.dictionaryService
              .searchKnpWithCbc('', 'PAY_BUDGET')
              .subscribe({
                next: data => {
                  let id = data.content.filter(
                    (item: any) =>
                      item.cbc === res?.payBudgetList[0].cbc &&
                      item.knp === res?.knpCode
                  )[0].id;
                  this.budgetForm.patchValue({ cbcKnpId: id });
                  this.cbc = res?.payBudgetList[0].cbc;
                  this.knp = res?.knpCode;
                  this.knpDescription = data.content.filter(
                    (item: any) =>
                      item.cbc === res?.payBudgetList[0].cbc &&
                      item.knp === res?.knpCode
                  )[0].knpName;
                  this.cbcDescription = data.content.filter(
                    (item: any) =>
                      item.cbc === res?.payBudgetList[0].cbc &&
                      item.knp === res?.knpCode
                  )[0].cbcName;
                },
              })
          );

          this.bin = res?.payBudgetList[0].bin;
          this.cbc = res?.payBudgetList[0].cbc;
          this.commission = res?.noCommission + '';

          Object.values(this.budgetForm.controls).forEach(field => {
            field.markAsTouched();
            field.updateValueAndValidity();
          });
          this.bin = res.payBudgetList[0].bin;
          this.cbc = res.payBudgetList[0].cbc;
          this.commission = res.noCommission + '';
        })
    );
  }

  getPaymentById(type: any, id: number): void {
    this.addSubscriber(
      this.accountHistoryService.getPaymentById(type, id.toString()).subscribe(
        (res: IBudget) => {
          this.getDraftUgds(res.payBudgetList[0].taxCommitteeName);
          this.getPrefill(); // для получения номера документа и даты создания и валютирования
          this.budgetForm.patchValue({
            region: res?.payBudgetList[0].taxCommitteeName || '',
            ugd: res?.nameRecipient || '',
            selectedAcc: res?.accountSender,
            sum: res?.amount || '',
          });
          this.subscriptions.push(
            this.dictionaryService
              .searchKnpWithCbc('', 'PAY_BUDGET')
              .subscribe({
                next: data => {
                  let id = data.content.filter(
                    (item: any) =>
                      item.cbc === res?.payBudgetList[0].cbc &&
                      item.knp === res?.knpCode
                  )[0].id;
                  this.budgetForm.patchValue({ cbcKnpId: id });
                  this.cbc = res?.payBudgetList[0].cbc;
                  this.knp = res?.knpCode;
                  this.knpDescription = data.content.filter(
                    (item: any) =>
                      item.cbc === res?.payBudgetList[0].cbc &&
                      item.knp === res?.knpCode
                  )[0].knpName;
                  this.cbcDescription = data.content.filter(
                    (item: any) =>
                      item.cbc === res?.payBudgetList[0].cbc &&
                      item.knp === res?.knpCode
                  )[0].cbcName;
                },
                error: error => {
                  errorMessage(error, this.toastr);
                },
              })
          );

          this.bin = res?.payBudgetList[0].bin;
          this.cbc = res?.payBudgetList[0].cbc;
          this.commission = res?.noCommission + '';

          Object.values(this.budgetForm.controls).forEach(field => {
            field.markAsTouched();
            field.updateValueAndValidity();
          });
          this.bin = res.payBudgetList[0].bin;
          this.cbc = res.payBudgetList[0].cbc;
          this.commission = res.noCommission + '';
        },
        () => {
          if (this.budgetForm.valid) {
            this.sendCommission();
          }
        }
      )
    );
  }

  edit(): void {
    this.getDraftUgds(this.editTemplate.payBudgetList[0].taxCommitteeName);
    this.template = this.editTemplate;
    this.subscriptions.push(
      this.dictionaryService.searchKnpWithCbc('', 'PAY_BUDGET').subscribe({
        next: data => {
          let id = data.content.filter(
            (item: any) =>
              item.cbc === this.editTemplate?.payBudgetList[0].cbc &&
              item.knp === this.editTemplate?.knpCode
          )[0].id;
          this.budgetForm.patchValue({ cbcKnpId: id });
          this.cbc = this.editTemplate?.payBudgetList[0].cbc;
          this.knp = this.editTemplate?.knpCode;
          this.knpDescription = data.content.filter(
            (item: any) =>
              item.cbc === this.editTemplate?.payBudgetList[0].cbc &&
              item.knp === this.editTemplate?.knpCode
          )[0].knpName;
          this.cbcDescription = data.content.filter(
            (item: any) =>
              item.cbc === this.editTemplate?.payBudgetList[0].cbc &&
              item.knp === this.editTemplate?.knpCode
          )[0].cbcName;
        },
        error: error => {
          errorMessage(error, this.toastr);
        },
      })
    );

    this.budgetForm.patchValue({
      docNum: this.editTemplate?.docNum || '',
      docDate: this.editTemplate?.docDate || '',
      region: this.editTemplate?.payBudgetList[0].taxCommitteeName || '',
      ugd: this.editTemplate?.nameRecipient || '',
      selectedAcc: this.editTemplate?.accountSender,
      sum: this.editTemplate?.amount || '',
      period: this.editTemplate?.payBudgetList[0].period
        ? moment(
            this.editTemplate?.payBudgetList[0].period,
            operationPeriod
          ).format(periodFormat)
        : '',
    });
    this.bin = this.editTemplate?.payBudgetList[0].bin;
    this.cbc = this.editTemplate?.payBudgetList[0].cbc;

    Object.values(this.budgetForm.controls).forEach(field => {
      field.markAsTouched();
      field.updateValueAndValidity();
    });
    if (this.budgetForm.valid) {
      this.sendCommission();
    }
  }

  onChange() {
    this.budgetForm.valueChanges
      .pipe(debounceTime(800), distinctUntilChanged())
      .subscribe(_ => {
        if (this.budgetForm.valid) {
          this.sendCommission();
        } else if (this.budgetForm.get('sum').errors?.insufficientFunds) {
          this.sendCommission();
        }
      });
    this.budgetForm.controls['selectedAcc'].valueChanges.subscribe(data => {
      if (data) {
        this.accountAmount = this.accounts.find(
          (acc: any) => acc.iban === this.budgetFormControl.selectedAcc.value
        )?.actualBalance;
        this.budgetFormControl.sum.setValidators(
          Validators.compose([
            Validators.required,
            this.customValidator.amountValidator(this.accountAmount),
          ])
        );
      }
      this.budgetFormControl.sum.updateValueAndValidity();
    });
    this.changeDetector.detectChanges();
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

  sendCommission(): void {
    this.loading = true;
    this.subscriptions.push(
      this.documentService
        .getPayBudgetCommission(this.changeTemplate())
        .subscribe({
          next: (data: any) => {
            this.loading = false;
            this.commission = data + '';
          },
          error: error => {
            this.loading = false;
            errorMessage(error, this.toastr);
          },
          complete: () => {
            this.loading = false;
            this.changeDetector.detectChanges();
          },
        })
    );
  }

  getRegions(): void {
    this.subscriptions.push(
      this.dictionaryService.getRegion().subscribe({
        next: (data: IRegion[]) => {
          this.regionList = data;
        },
        error: error => {
          errorMessage(error, this.toastr);
        },
      })
    );
  }

  onRegionSelect() {
    const region = this.regionList.find(
      item => item.parentName === this.budgetForm.controls['region'].value
    );
    if (region && region.parentId) {
      if (this.budgetFormControl.ugd.value) {
        this.budgetFormControl.ugd.setValue(null);
      }
      this.getUGDs(region.parentId);
    }
  }

  getDraftUgds(region: string) {
    const regionObject = this.regionList.find(
      item => item.parentName === region
    );
    if (regionObject && regionObject.parentId) {
      this.ugdList = [];
      this.subscriptions.push(
        this.dictionaryService.getUGD({
          parentId: regionObject.parentId,
          parentName: region,
        })
      );
    }
  }

  getUGDs(id: string): void {
    const body = {
      parentId: id,
      parentName: this.budgetForm.controls['region'].value,
    };
    this.ugdList = [];
    if (body.parentId && body.parentName) {
      this.subscriptions.push(this.dictionaryService.getUGD(body));
    }
  }

  searchField(event: any, field: string) {
    if (!event.term) {
      this.budgetForm.patchValue({
        [field]: null,
      });
    }
  }

  selectUgd() {
    const ugd = this.budgetForm.controls['ugd'].value;
    if (ugd) {
      const nUgd = this.ugdList.find(i => i.name === ugd);
      if (nUgd) {
        this.bin = nUgd.bin;
      }
    }
  }

  changeSelectedAccount() {
    const account = this.accounts.find((acc: any) => {
      if (
        acc.iban === this.selectedAccount ||
        acc.accountIban === this.selectedAccount
      ) {
        return acc;
      }
    });

    this.accountsService.setSelectedAccount(account);
  }

  getPrefill(): void {
    let nDocNum = docNum();
    let nDocDate = moment().format(requestDateFormat);
    this.subscriptions.push(
      this.documentService.getBudgetPrefill().subscribe({
        next: (data: IBudget) => {
          this.template = data;
          if (!data.docDate) {
            this.template.docDate = nDocDate;
          }
          this.budgetForm.patchValue({ docNum: nDocNum });
          this.changeDetector.detectChanges();
        },
        error: error => {
          errorMessage(error, this.toastr);
          this.template = { docNum: nDocNum, docDate: nDocDate };
          this.budgetForm.patchValue({ docNum: nDocNum });
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  changeTemplate() {
    let newTemplate = {
      id: this.template?.id || undefined,
      docDate: this.template?.docDate,
      valDate: this.template?.valDate,
      docNum: this.budgetFormControl.docNum.value,
      amount: this.budgetFormControl.sum.value,
      nameSender: this.template?.nameSender,
      accountSender: this.budgetFormControl.selectedAcc.value,
      nameRecipient: this.budgetFormControl?.ugd?.value,
      accountRecipient: this.template?.accountRecipient,
      irsRecipient: getIn(this.template, 'irsRecipient'),
      binRecipient: getIn(this.template, 'binRecipient'),
      secoRecipient: this.template?.secoRecipient,
      bankNameRecipient: this.template?.bankNameRecipient,
      bicBankRecipient: this.template?.bicBankRecipient,
      routeType: this.template?.routeType,
      noCommission: parseInt(this.commission) || 0,
      noAutoAuth: this.template?.noAutoAuth,
      residencySender: this.template?.residencySender,
      secoSender: this.template?.secoSender,
      eqFee: getIn(this.template, 'eqFee'),
      opType: getIn(this.template, 'opType'),
      feeCcy: getIn(this.template, 'feeCcy'),
      orkoUrgent: getIn(this.template, 'orkoUrgent'),
      kbe: this.template?.kbe,
      chief: this.chiefSigner || '',
      chiefAccountant: this.chiefAccountant,
      isTemplate: this.template?.isTemplate,
      templateName: getIn(this.template, 'templateName'),
      knpCode: this.knp,
      comission: this.commission || '0',
      payBudgetList: [
        {
          taxCommitteeName: getIn(this.budgetFormControl, 'region', 'value'),
          bin: this.bin,
          cbc: this.cbc,
          knp: this.knp,
          purpose: 'budget payment',
          amount: getIn(this.budgetFormControl, 'sum', 'value'),
          noVinCode: false,
          vinCode: '',
          cbcName: this.cbcDescription,
          knpName: this.knpDescription,
          period: this.budgetFormControl.period.value
            ? moment(this.budgetFormControl.period.value, periodFormat).format(
                operationPeriod
              )
            : '',
        },
      ],
      source: this.template?.source || 'WEB',
      subType: this.template?.subType,
    };
    return newTemplate;
  }

  onSign() {
    let template = this.changeTemplate();
    const queryParams = {
      template: template,
      id: this.id,
      operationType: 'budget',
    };
    this.router.navigate([SIGN_CONFIRM.replace(':type', 'budget')]);
    this.documentService.dataTemplate$.next(queryParams);
    localStorage.setItem('template', JSON.stringify(queryParams));
  }

  onSave(): void {
    this.isSaveLoading = true;
    this.changeDetector.detectChanges();
    let newBudget = this.changeTemplate();
    delete newBudget.source;
    this.subscriptions.push(
      this.documentService.savePayBudget(newBudget).subscribe({
        next: () => {
          this.isSaveLoading = false;
          this.changeDetector.detectChanges();
          this.router.navigate(['operations'], {
            state: { scrollTo: 'operation-table', tab: 'DRAFT' },
          });
        },
        error: (error: any) => {
          errorMessage(error, this.toastr);
          this.isSaveLoading = false;
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  clearInputField() {
    this.ngSelectKnpCbc.clearModel();
    this.isSearchableKnpCbc = true;
  }

  knpCbcSearch(object: any) {
    let item = object.term;
    this.getKnp(item);
    this.budgetForm.patchValue({
      cbc: object.term,
    });
  }

  getKnp(search: string) {
    this.knpCbcSubject$.next(search);
  }

  subscribeKnpCbcValues(): void {
    this.knpCbcSubject$
      .pipe(debounceTime(800), distinctUntilChanged())
      .subscribe({
        next: v => {
          this.isSearchingKnp = true;
          this.changeDetector.detectChanges();
          this.subscriptions.push(
            this.dictionaryService.searchKnpWithCbc(v, 'PAY_BUDGET').subscribe({
              next: data => {
                data.content.sort(function (a, b) {
                  if (a.knp > b.knp) {
                    return 1;
                  } else if (a.knp < b.knp) {
                    return -1;
                  } else if (a.cbc > b.cbc) {
                    return 1;
                  } else if (a.cbc < b.cbc) {
                    return -1;
                  } else {
                    return 0;
                  }
                });
                setTimeout(() => {
                  this.filteredKnp = data.content;
                  this.isSearchingKnp = false;
                  this.changeDetector.detectChanges();
                }, 800);
              },
            })
          );
        },
      });
  }

  knpCbcSelected(id: any) {
    if (id) {
      this.knp = this.filteredKnp.find((val: any) => val.id === id).knp;
      this.cbc = this.filteredKnp.find((val: any) => val.id === id).cbc;
      this.knpDescription = this.filteredKnp.find(
        (val: any) => val.id === id
      ).knpName;
      this.cbcDescription = this.filteredKnp.find(
        (val: any) => val.id === id
      ).cbcName;
    }
  }

  knpCbcSrcClose() {
    this.isSearchableKnpCbc = false;
  }

  getIcon(currency: string): string {
    return this.helperService.getAccountIcon(currency);
  }

  confirmPayment() {
    this.router.navigate([
      CONFIRM.replace(':type', 'budget'),
      {
        sum: this.budgetForm.controls['sum'].value,
        receiver: this.translate.instant('operations.default.paymentToBudget'),
        name: this.budgetFormControl.region.value,
      },
    ]);
  }

  isFieldValid(field: string) {
    // валидация полей
    if (field === 'sum') {
      return (
        (!this.budgetForm.get(field).valid &&
          this.budgetForm.get(field).touched &&
          this.budgetForm.get(field).hasError('required')) ||
        (this.budgetForm.get(field).untouched && this.budgetSubmitFlag)
      );
    }
    return (
      (!this.budgetForm.get(field).valid &&
        this.budgetForm.get(field).touched) ||
      (this.budgetForm.get(field).untouched && this.budgetSubmitFlag) ||
      (!this.budgetForm.get(field).valid && this.budgetForm.get(field).dirty)
    );
  }

  displayFieldClass(field: string) {
    return { 'is-invalid': this.isFieldValid(field) };
  }

  convertToFixed() {
    return this.budgetFormControl.sum.value
      ? parseInt(this.budgetFormControl.sum.value).toFixed(2)
      : '0.00';
  }

  ValidateAllFields(type: string) {
    let exceptSumValue = false;
    let sumInvalid = false;
    if (type === 'save') {
      this.onSave();
    } else {
      this.budgetSubmitFlag = true;
      if (!this.budgetForm.valid) {
        // форма невалидна
        sumInvalid = this.budgetForm.get('sum').errors?.insufficientFunds;
        Object.keys(this.budgetForm.controls).forEach(field => {
          if (field !== 'sum' && this.budgetForm.get(field).invalid) {
            exceptSumValue = true;
          }
        });
        if (sumInvalid && !exceptSumValue) {
          // если недостаточно средств отправляем на сохранение и подпись
          if (type === 'sign') {
            this.onSign();
          } else if (type !== 'save' && type !== 'sign') {
            this.sendCommission();
          }
        }
      } else {
        if (type === 'sign') {
          if (Number(this.commission) >= 0) {
            this.onSign();
          }
        } else if (type !== 'save' && type !== 'sign') {
          this.sendCommission();
        }
      }
    }
  }

  docNumChange(value: any) {
    this.budgetFormControl.docNum.setValue(value);
  }

  deductionTypeInfoShow() {
    this.deductionTypeInfo = !this.deductionTypeInfo;
  }

  openDatepicker() {
    let datepicker = document.getElementById('datepicker');
    datepicker.click();
  }
}
