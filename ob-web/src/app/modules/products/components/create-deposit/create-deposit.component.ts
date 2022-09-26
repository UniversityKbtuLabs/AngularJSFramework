import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { IAccountInfo, ICreateDeposit } from '@data/models/account-types';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { AccountsService } from '@core/services/accounts.service';
import { HelperService } from '@core/services/helper.service';
import {
  docNum,
  errorMessage,
  getIn,
  getNounByNumbers,
  thousandsSeparator,
} from '@app/core/helpers';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SmsModalComponent } from '@app/shared';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { OperationsService } from '@app/core/services/operations.service';
import {
  depositMinAmount,
  depositTypes,
  requestDateFormat,
} from '@app/core/constants';
import { CustomvalidationService } from '@app/core/services/customvalidation.service';
import { LoginService } from '@app/core/services/login.service';
import { SocketService } from '@app/core/services/socket.service';
import { TokenKeyModalComponent } from '@app/modules/ecp/token-key-modal/token-key-modal.component';

@Component({
  selector: 'ob-create-deposit',
  templateUrl: './create-deposit.component.html',
  styleUrls: ['./create-deposit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateDepositComponent
  extends SubscriptionAccumulator
  implements OnInit, OnDestroy
{
  public createDepositForm: FormGroup;
  public accountList: any[] = [];
  public prefill: ICreateDeposit = null;
  public subscriptions: Subscription[] = [];
  public emptyFieldsError: string = '';
  public rightsToSign: boolean = false;
  public loading: boolean = false;
  public modalRef?: BsModalRef;
  public rewardInfo: any;
  public rewardAmount: number;
  public taxRate: number;
  public isRewardLoading: boolean = false;
  public isAccountsLoading: boolean = false;
  public insufficientFunds: boolean = false;
  public sendLoading: boolean = false;
  public closeDate: string = '';
  public isEditDocNum: boolean = false;
  public depositType: string = '';
  public minAmount: number;
  public showKpnInfo: boolean = false;
  /*  
      Виды депозитов:
        "сumulative": "Депозит “Накопительный”",
        "flexible": "Депозит “Гибкий”",
        "express": "Депозит “Срочный”"
  */

  constructor(
    private accountsService: AccountsService,
    private changeDetector: ChangeDetectorRef,
    private helperService: HelperService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    public translate: TranslateService,
    public router: Router,
    private route: ActivatedRoute,
    public modalService: BsModalService,
    public operationsService: OperationsService,
    private customValidator: CustomvalidationService,
    private loginService: LoginService,
    private socketService: SocketService
  ) {
    super();
    this.depositType = this.route.snapshot.queryParamMap.get('type');
    depositTypes.includes(this.depositType) ? '' : (this.depositType = '');
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.minAmount = depositMinAmount.find(
      d => d.name === this.depositType
    ).minAmount;
    this.createDepositForm = this.fb.group({
      docNum: [' ', this.docNumValidator],
      docDate: [''],
      selectedAccount: [null, Validators.required],
      amount: [null, [Validators.required, this.depositAmountValidator]],
      depositTerm: [1, Validators.required],
      depositTermInput: [1, Validators.required],
      depositRate: [
        null,
        [Validators.required, this.customValidator.sumZeroValidator],
      ],
      isIndividualRate: [false],
    });

    this.getPrefill();
    this.getAccounts();
    this.addSubscriber(
      this.accountsService.accountsLoading$.subscribe({
        next: v => {
          this.isAccountsLoading = v;
          this.changeDetector.detectChanges();
        },
      })
    );
    this.onDepositFormChange();
    this.hasRightsToSign();
    this.onAmountChange();
    this.getTranslations();

    this.createDepositForm.controls.depositTermInput.valueChanges.subscribe(
      val => {
        if (val && !isNaN(val)) {
          this.createDepositForm.controls.depositTerm.setValue(val);
          this.changeDetector.detectChanges();
        }
      }
    );

    this.createDepositForm.controls.depositTerm.valueChanges.subscribe(val => {
      let formControl = this.createDepositForm.controls;
      if (val !== formControl.depositTermInput.value) {
        formControl.depositTermInput.setValue(val);
        this.changeDetector.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.createDepositForm.reset();
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

  getPrefill() {
    let nDocNum = docNum();
    let nDocDate = moment().format(requestDateFormat);
    this.subscriptions.push(
      this.accountsService.getDepositsPrefill().subscribe({
        next: (data: any) => {
          this.prefill = data;
          if (!data.docDate) {
            this.prefill.docDate = nDocDate;
          }
          this.taxRate = data.taxRate;
          this.createDepositForm.patchValue({
            docNum: nDocNum,
            depositRate: data.feeRate,
          });
          this.changeDetector.detectChanges();
        },
        error: (error: any) => {
          errorMessage(error, this.toastr);
          this.createDepositForm.patchValue({ docNum: nDocNum });
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  getAccounts() {
    this.addSubscriber(this.accountsService.getAccountsList());
    this.addSubscriber(
      this.accountsService.currentAccounts.subscribe((data: IAccountInfo[]) => {
        // Подписка на список тек счетов
        let kztAccounts = data.filter(
          acc => acc.currency === 'KZT' && acc.active === 'Y'
        ); // Фильтрация по Тенговым и Активынм счетам
        this.accountList = kztAccounts;
        if (this.accountList.length > 1) {
          this.accountList.sort((a, b) =>
            a.actualBalance > b.actualBalance ? -1 : 1
          ); // Сортировка по балансу по убыванию
        }
        if (this.accountList.length > 0) {
          this.createDepositForm.patchValue({
            selectedAccount: this.accountList[0].iban,
          });
        }
        this.changeDetector.detectChanges();
      })
    );
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

  docNumChange(value: any) {
    this.createDepositForm.controls.docNum.setValue(value);
  }

  getIcon(currency: string): string {
    return this.helperService.getAccountIcon(currency);
  }

  onDocNumKeyUp(event: any) {
    // Проверка на нажатие клавиши Enter на поле номер документа
    if (event.keyCode === 13) {
      this.isEditDocNum = false;
    }
  }

  onDepositFormChange() {
    this.createDepositForm.valueChanges
      .pipe(debounceTime(600), distinctUntilChanged())
      .subscribe(_ => {
        if (
          this.createDepositForm.valid &&
          this.createDepositForm.controls.amount.value > 0
        ) {
          this.getDepositReward();
        } else {
          if (this.rewardAmount !== 0) {
            this.rewardAmount = 0;
          }
        }
      });
  }

  isFieldInvalid(field: string) {
    const formField = this.createDepositForm.get(field);
    return (
      (!formField.valid && formField.touched && !formField.pristine) ||
      (!formField.valid && formField.dirty && !formField.pristine)
    );
  }

  displayFieldClass(field: string) {
    return { 'is-invalid': this.isFieldInvalid(field) };
  }

  getTranslations() {
    this.subscriptions.push(
      this.translate
        .get([
          'error.empty_fields_present',
          'toast-messages.warning.close-date',
        ])
        .subscribe(translations => {
          this.emptyFieldsError = translations['error.empty_fields_present'];
          this.closeDate = translations['toast-messages.warning.close-date'];
        })
    );
  }

  getTemplate() {
    let formControl = this.createDepositForm.controls;
    let newTemplate: ICreateDeposit = {
      docNum: formControl.docNum.value,
      docDate: formControl.docDate.value,
      accountSender: formControl.selectedAccount.value,
      accountSenderId: this.getSelectedAccount.dictId,
      amount: formControl.amount.value,
      depositTerm: formControl.depositTerm.value,
      feeRate: formControl.depositRate.value,
      feeAmount: this.prefill?.feeAmount,
      individualRateCheck: formControl.isIndividualRate.value,
      isRefilAfterConv: this.prefill?.isRefilAfterConv,
      canOpenDeposit: this.prefill?.canOpenDeposit,
      isBusinessDay: this.prefill?.isBusinessDay,
      depositTypeCode: this.prefill?.depositTypeCode,
      taxRate: this.prefill?.taxRate,
      version: this.prefill?.version,
    };
    return newTemplate;
  }

  sendCreateDeposit() {
    this.sendLoading = true;
    this.changeDetector.detectChanges();
    let body = this.getTemplate();
    this.accountsService.sendCreateDeposit(body).subscribe({
      next: (data: any) => {
        if (data.status === 200) {
          if (this.rightsToSign) {
            this.toDirectlySign(data.body); //прямое подписание
          } else {
            this.confirmCreateDeposit(false); //отправка на подпись
          }
        }
        this.sendLoading = false;
        this.changeDetector.detectChanges();
      },
      error: (err: any) => {
        this.sendLoading = false;
        this.changeDetector.detectChanges();
        if (
          err.error.messages[0] === 'validator.error.deposit.close.wrong.day'
        ) {
          errorMessage({ message: this.closeDate }, this.toastr);
        } else {
          errorMessage(err, this.toastr);
        }
      },
    });
  }

  hasRightsToSign(): void {
    this.loading = true;
    this.subscriptions.push(
      this.operationsService.checkRightsToSign().subscribe({
        next: (data: boolean) => {
          this.loading = false;
          if (data) {
            this.rightsToSign = data;
          }
          this.changeDetector.detectChanges();
        },
        error: (error: any) => {
          errorMessage(error, this.toastr);
          this.loading = false;
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  toDirectlySign(id: number): void {
    const initialState: any = { operationId: id, isDirectlySign: true };

    if (
      getIn(this.loginService.userInfoObject$.value, 'user', 'loggedInBy') ===
      'signature'
    ) {
      this.socketService.connect(() => {
        console.info('ws callback');
      });
      const closeModal = () => {
        this.modalService.hide(1);
        this.socketService.close();
      };
      const initialState: any = {
        operationId: id,
        closeModal,
        successCb: () => {
          console.info('first');
          this.confirmCreateDeposit(true);
        },
        is2FA: false,
      };
      this.modalRef = this.modalService.show(TokenKeyModalComponent, {
        class: 'modal-dialog-centered',
        initialState,
        id: 1,
      });
    } else {
      this.modalRef = this.modalService.show(SmsModalComponent, {
        class: 'modal_upper',
        initialState,
        id: 1,
      });
      this.modalRef.content.statusDirectlySign.subscribe((status: boolean) => {
        if (status) {
          this.confirmCreateDeposit(true);
        }
      });
    }
  }

  confirmCreateDeposit(signed: boolean) {
    this.router.navigate([
      'products/create/deposit/confirm',
      {
        productType: 'deposit',
        amount: this.createDepositForm.controls.amount.value,
        isSigned: signed,
        currency: this.helperService.formatCurrency('KZT'),
      },
    ]);
  }

  getDepositEndDate(days: any) {
    let currentDate = new Date();
    return moment(
      currentDate.setDate(currentDate.getDate() + Number(days))
    ).format('DD.MM.YYYY');
  }

  getTextDays(day: number) {
    return getNounByNumbers(day, ['день', 'дня', 'дней']);
  }

  getDepositReward() {
    let formControl = this.createDepositForm.controls;
    let rewardBody = {
      accountId: this.getSelectedAccount.dictId,
      amount: formControl.amount.value,
      amountAccountBalanceFlag: false,
      depositTypeCode: this.prefill?.depositTypeCode || '',
      depositTerm: formControl.depositTerm.value,
      individualRateFlag: formControl.isIndividualRate.value,
      individualRate: formControl.isIndividualRate.value
        ? formControl.depositRate.value
        : 0,
    };
    this.isRewardLoading = true;
    this.changeDetector.detectChanges();
    this.accountsService.getDepositReward(rewardBody).subscribe({
      next: (data: any) => {
        this.rewardInfo = data;
        this.rewardAmount = data.rewardAfterTax;
        this.isRewardLoading = false;
        if (
          !formControl.isIndividualRate.value &&
          this.prefill.feeRate !== data.rewardRate
        ) {
          this.prefill.feeRate = data.rewardRate;
        }

        if (formControl.depositRate.value !== data.rewardRate) {
          formControl.depositRate.setValue(data.rewardRate, {
            emitEvent: false,
          });
        }
        this.changeDetector.detectChanges();
      },
      error: (err: any) => {
        this.isRewardLoading = false;
        errorMessage(err, this.toastr);
        this.changeDetector.detectChanges();
      },
    });
  }

  getFormattedAmount(amount: any) {
    if (amount > 0) {
      return thousandsSeparator(amount);
    } else {
      return 0;
    }
  }

  fieldsValidation() {
    const form = this.createDepositForm;
    if (form.valid && !this.insufficientFunds) {
      this.sendCreateDeposit();
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

  checkInsufficientFunds() {
    let amount = this.createDepositForm.controls.amount.value;
    let acc = this.getSelectedAccount;
    if (amount) {
      this.insufficientFunds =
        amount > acc?.actualBalance || amount > acc?.amountBalance;
      this.changeDetector.detectChanges();
    } else {
      this.insufficientFunds = false;
      this.changeDetector.detectChanges();
    }
  }

  onAccChange(event: any) {
    this.checkInsufficientFunds();
  }

  onAmountChange() {
    this.createDepositForm.controls.amount.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe((data: any) => {
        this.checkInsufficientFunds();
      });
  }

  checkDepositTermInput() {
    const val = this.createDepositForm.controls.depositTermInput.value;
    if (!val || Number(val) === 0) {
      if (Number(this.createDepositForm.controls.depositTerm.value) !== 0) {
        this.createDepositForm.controls.depositTermInput.setValue(
          this.createDepositForm.controls.depositTerm.value
        );
      } else {
        this.createDepositForm.patchValue({
          depositTerm: 1,
          depositTermInput: 1,
        });
      }
      this.changeDetector.detectChanges();
    }
  }

  handleKeyPress(event: any) {
    var regex = new RegExp('[0-9]');
    var str = String.fromCharCode(
      !event.charCode ? event.which : event.charCode
    );

    if (regex.test(str)) {
      if (
        Number(event.target.value) === 1 ||
        Number(event.target.value) === 2 ||
        !event.target.value
      ) {
        return true;
      }
      if (!event.target.value && str === '0') {
        event.preventDefault();
        return false;
      }
      event.preventDefault();
      return false;
    }
    event.preventDefault();
    return false;
  }

  getTextDaysPosition() {
    let left = '0';
    if (this.createDepositForm.controls.depositTerm.value < 10) {
      left = '34px';
    }
    if (this.createDepositForm.controls.depositTerm.value > 9) {
      left = '40px';
    }
    if (this.createDepositForm.controls.depositTerm.value > 19) {
      left = '43px';
    }
    if (!this.createDepositForm.controls.depositTermInput.value) {
      return { display: 'none' };
    } else {
      return { left: left };
    }
  }

  depositAmountValidator = (control: FormControl) => {
    if (control.value && this.minAmount) {
      if (control.value < this.minAmount) {
        return { depositMinAmount: true };
      } else {
        return null;
      }
    } else {
      return null;
    }
  };

  onIndividualRateChange() {
    if (!this.createDepositForm.controls.isIndividualRate.value) {
      this.createDepositForm.patchValue({
        depositRate: this.prefill.feeRate,
      });
    }
  }

  putAllAmount() {
    if (this.createDepositForm.controls?.selectedAccount) {
      let allAmount = this.getSelectedAccount.actualBalance;
      if (allAmount) {
        this.createDepositForm.patchValue({
          amount: allAmount,
        });
        this.createDepositForm.controls.amount.markAsTouched();
        this.createDepositForm.controls.amount.markAsDirty();
      }
      this.changeDetector.detectChanges;
    }
  }

  get getSelectedAccount() {
    return this.accountList.find(
      acc => acc.iban === this.createDepositForm.controls.selectedAccount?.value
    );
  }
}
