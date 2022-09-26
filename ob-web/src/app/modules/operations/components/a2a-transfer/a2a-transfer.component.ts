/* eslint-disable max-len */
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { requestDateFormat } from '@app/core/constants';
import { docNum, errorMessage, getIn } from '@app/core/helpers';
import { SIGN_CONFIRM, TRANSFER_CONFIRM } from '@app/core/constants/pathnames';
import { SubscriptionAccumulator } from '@app/core/helpers/SubscriptionAccumulator';
import { CustomvalidationService } from '@app/core/services/customvalidation.service';
import { DocumentService } from '@app/core/services/document.service';
import { HelperService } from '@app/core/services/helper.service';
import { OperationsService } from '@app/core/services/operations.service';
import { TRANSFER_DETAILS } from '@app/data/models/p2p-types';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AccountHistoryService } from '@app/core/services/account-history.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ob-a2a-transfer',
  templateUrl: './a2a-transfer.component.html',
  styleUrls: ['./a2a-transfer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class A2ATransferComponent
  extends SubscriptionAccumulator
  implements OnInit, OnDestroy
{
  accountList: any[] = [];
  accountFromList: any[] = [];
  accountToList: any[] = [];
  cardList: any[] = [];
  kztCurrencyBalance: any[] = [];

  accountFrom: any;
  accountTo: any;

  commission: string = '';
  defaultPrefill: any;
  editTemplate: any;
  transferForm: FormGroup;
  isEditDocNum: boolean = false;
  visa = './assets/icons/ic_visa.svg';
  masterCard = './assets/icons/ic_master_card.svg';
  selectAccount: any;

  accountListLoading: boolean = false;
  corpCardsLoading: boolean = false;
  isLoading: boolean = false;
  formLoading: boolean = false;
  isSearchableTarget: boolean = false;
  isSearchableSrc: boolean = false;

  notFound: string;
  public transferSubType: string = ''; // Заголовок перевода
  id: number;
  public prefilSubscr: Subscription;
  public commissionSubscr: Subscription;
  public transferBetweenInfo: boolean = false;
  public senderIban: string = '';
  public emptyFieldsError: string = '';
  public insufficientFunds: boolean = false;
  public isEmptyBalance: boolean = false;

  constructor(
    private fb: FormBuilder,
    public route: ActivatedRoute,
    public router: Router,
    private customValidator: CustomvalidationService,
    private translate: TranslateService,
    private helperService: HelperService,
    public operationsService: OperationsService,
    public changeDetector: ChangeDetectorRef,
    private toastr: ToastrService,
    private documentService: DocumentService,
    private accountHistoryService: AccountHistoryService
  ) {
    super();
    this.transferForm = this.fb.group({
      accountFrom: [null, this.customValidator.accountFromValidator],
      accountTo: [null, this.customValidator.accountToValidator],
      amount: ['', Validators.required],
      docNum: [' ', this.customValidator.docNumValidator],
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
    this.getTranslations();
    this.getCorporateAccounts();
    this.getCurrentAccounts();
    this.getValueChanges();
    this.id = this.route.snapshot.params['id'];
    this.route.queryParams.subscribe(params => {
      const iban = params['iban'];
      if (iban) {
        this.senderIban = iban;
        this.changeDetector.detectChanges();
      }
    });
    if (this.id && localStorage.getItem('operation-info')) {
      let operationDetails = JSON.parse(localStorage.getItem('operation-info'));
      this.getTransferById(operationDetails.type, this.id);
    } else if (this.editTemplate) {
      this.edit();
    } else {
      this.getPrefill();
    }
  }

  get transferFormControl() {
    return this.transferForm.controls;
  }

  ngOnDestroy(): void {
    if (this.prefilSubscr) {
      this.prefilSubscr.unsubscribe();
    }
    if (this.commissionSubscr) {
      this.commissionSubscr.unsubscribe();
    }
  }

  getPrefill(): void {
    let nDocNum = docNum();
    let nDocDate = moment().format(requestDateFormat);
    this.prefilSubscr = this.operationsService
      .getTransferPrefill('/pay-local/pre-fill/default')
      .subscribe({
        next: (data: any) => {
          this.defaultPrefill = data;
          if (!data.docDate) {
            this.defaultPrefill.docDate = nDocDate;
          }
          this.transferForm.patchValue({ docNum: nDocNum });
        },
        error: error => {
          errorMessage(error, this.toastr);
        },
      });
  }

  edit() {
    this.defaultPrefill = this.editTemplate;
    this.transferForm.patchValue({
      docNum: this.editTemplate.docNum,
      accountFrom: this.editTemplate.accountSender,
      accountTo: this.editTemplate.accountRecipient,
      amount: this.editTemplate.amount,
    });
  }

  getValueChanges() {
    this.transferForm.get('accountFrom').valueChanges.subscribe(item => {
      const iban = item;
      const nAccount = this.getAccountFrom();
      let selectedItem = this.cardList.findIndex(
        item => item.accountIban === iban
      );
      if (selectedItem > -1) {
        this.accountToList = this.kztCurrencyBalance; // c карты можно на счет
      } else {
        this.accountToList = this.accountList; // c cчета на карту или счет
      }

      if (nAccount?.actualBalance <= 0 || nAccount?.amountBalance <= 0) {
        this.isEmptyBalance = true;
      } else {
        this.isEmptyBalance = false;
      }

      const sum = this.transferForm.get('amount').value;
      if (sum) {
        this.insufficientFunds =
          sum > nAccount?.actualBalance || sum > nAccount?.amountBalance; // Проверка достаточности средств
        this.changeDetector.detectChanges();
      } else {
        this.insufficientFunds = false;
      }
    });

    this.transferForm.get('accountTo').valueChanges.subscribe(item => {
      const iban = item;
      let selectedItem = this.cardList.findIndex(
        item => item.accountIban === iban
      );
      if (selectedItem > -1) {
        this.accountFromList = this.kztCurrencyBalance; // от карты на счет
      } else {
        this.accountFromList = this.accountList;
      }
    });

    this.transferForm.get('amount').valueChanges.subscribe(v => {
      if (v) {
        if (v > 0) {
          const nAccount = this.getAccountFrom();
          if (nAccount) {
            this.insufficientFunds =
              v > nAccount?.actualBalance || v > nAccount?.amountBalance;
            this.changeDetector.detectChanges();
          }
        }
      } else {
        this.insufficientFunds = false;
      }
    });

    this.transferForm.valueChanges
      .pipe(debounceTime(600), distinctUntilChanged())
      .subscribe(_ => {
        this.formLoading = true;
        this.getCommission();
        this.changeDetector.detectChanges();
      });
  }

  returnRequestBody(accountSender: any, accountRecipient: any) {
    this.checkTransferType();
    let bodyParams = {
      docNum: this.transferFormControl.docNum.value,
      docDate: this.defaultPrefill.docDate,
      valDate: this.defaultPrefill.valDate,
      amount: this.transferFormControl.amount.value,
      accountSender: accountSender,
      accountRecipient: accountRecipient,
      docType: this.transferSubType,
      bicBankRecipient: TRANSFER_DETAILS.bicBankRecipient,
      source: TRANSFER_DETAILS.source,
      comission: this.commission || '0',
    };
    return bodyParams;
  }

  checkTransferType() {
    let indexAccountTo = this.kztCurrencyBalance.findIndex(
      item => item?.iban === this.transferFormControl.accountTo.value
    );
    let indexAccountFrom = this.kztCurrencyBalance.findIndex(
      item => item?.iban === this.transferFormControl.accountFrom.value
    );

    let indexCardTo = this.cardList.findIndex(
      item => item?.accountIban === this.transferFormControl.accountTo.value
    );
    let indexCardFrom = this.cardList.findIndex(
      item => item?.accountIban === this.transferFormControl.accountFrom.value
    );

    if (indexAccountTo > -1 && indexAccountFrom > -1) {
      this.transferSubType = 'PAY_ORDER_V2';
    } else if (indexAccountFrom > -1 && indexCardTo > -1) {
      this.transferSubType = 'PAY_TO_CARD';
    } else if (indexCardFrom > -1 && indexAccountTo > -1) {
      this.transferSubType = 'PAY_ORDER_CARDS';
    }
  }

  getCommission(): void {
    if (this.transferForm.valid) {
      let requestBody = this.returnRequestBody(
        this.transferFormControl.accountFrom.value || {},
        this.transferFormControl.accountTo.value || {}
      );
      this.formLoading = true;
      this.commissionSubscr = this.documentService
        .getBetweenAccountTransferCommission(requestBody)
        .subscribe({
          next: (data: any) => {
            this.commission = data;
            this.formLoading = false;
            this.changeDetector.detectChanges();
          },
          error: (error: any) => {
            this.formLoading = false;
            errorMessage(error, this.toastr);
            this.changeDetector.detectChanges();
          },
        });
    } else {
      this.formLoading = false;
    }
  }

  getCorporateAccounts(): void {
    // Текущие КОРПОРАТИВНЫЕ СЧЕТА
    this.corpCardsLoading = true;
    this.addSubscriber(
      this.operationsService
        .getContracts_v2()
        .subscribe(
          result => {
            let filteredResult = result.filter(
              v => v.level === 3 && v.contractType === 'C' // Фильтрация по картам Level 3(карты)
            );
            this.cardList = filteredResult;
            const tempList = [...this.accountList, ...filteredResult];
            if (
              !this.transferForm.get('accountTo').value &&
              this.senderIban &&
              tempList.length &&
              tempList.findIndex(i => i.iban === this.senderIban) > -1
            ) {
              const senderAcc = tempList.find(i => i.iban === this.senderIban);
              if (senderAcc) {
                this.transferForm.patchValue({
                  accountTo: senderAcc.iban,
                });
              }
            }
            this.accountList = tempList;
            this.accountToList = [...this.accountToList, ...filteredResult]; // init values
            this.accountFromList = [...this.accountFromList, ...filteredResult]; // init values
          },
          error => errorMessage(error, this.toastr)
        )
        .add(() => {
          setTimeout(() => {
            this.corpCardsLoading = false;
            this.changeDetector.detectChanges();
          }, 2000);
        })
    );
  }

  getCurrentAccounts(): void {
    // ТЕКУЩИЕ СЧЕТА с балансами
    this.accountListLoading = true;
    this.addSubscriber(
      this.operationsService
        .getAccountsList()
        .subscribe(
          (result: any) => {
            this.kztCurrencyBalance = result.filter(
              (balance: any) => balance.currency === 'KZT'
            );

            //   const iban = this.router.url.split("/")?.[4];
            this.accountList = [
              ...this.accountList,
              ...this.kztCurrencyBalance,
            ];

            this.accountToList = [
              ...this.accountToList,
              ...this.kztCurrencyBalance,
            ]; // init values
            const srcList = [
              ...this.accountFromList,
              ...this.kztCurrencyBalance,
            ];
            if (
              !this.transferForm.get('accountTo').value &&
              this.accountToList.length &&
              this.senderIban &&
              this.accountToList.findIndex(i => i.iban === this.senderIban) > -1
            ) {
              this.transferForm.patchValue({
                accountTo: this.senderIban,
              });
            }
            this.accountFromList = srcList; // init values
          },
          error => errorMessage(error, this.toastr)
        )
        .add(() => {
          setTimeout(() => {
            this.accountListLoading = false;
            this.changeDetector.detectChanges();
          }, 2000);
        })
    );
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

  getTranslations() {
    this.translate
      .get([
        'operations.default.comissionHint',
        'operations.p2p.cardNumber',
        'operations.p2p.selectAccount',
        'default.not_found',
        'error.empty_fields_present',
      ])
      .subscribe(translations => {
        (this.commission = translations['operations.default.comissionHint']),
          (this.selectAccount = translations['operations.p2p.selectAccount']);
        this.notFound = translations['default.not_found'];
        this.emptyFieldsError = translations['error.empty_fields_present'];
      });
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

  isFieldValid(field: string) {
    const formField = this.transferForm.get(field);
    return (
      (!formField.valid && formField.touched && !formField.pristine) ||
      (!formField.valid && formField.dirty && !formField.pristine)
    );
  }

  displayFieldClass(field: string) {
    return { 'is-invalid': this.isFieldValid(field) };
  }

  convertToFixed() {
    return this.transferFormControl.amount.value
      ? parseInt(this.transferFormControl.amount.value).toFixed(2)
      : '0.00';
  }
  onOpenOnCloseTarget(isOn: boolean) {
    this.isSearchableTarget = !isOn;
  }

  onOpenOnCloseSrc(isOn: boolean) {
    this.isSearchableSrc = !isOn;
  }

  onSubmit() {
    if (this.transferForm.valid) {
      this.isLoading = true;

      const requestBody = this.returnRequestBody(
        this.transferFormControl.accountFrom.value || {},
        this.transferFormControl.accountTo.value || {}
      );
      const queryParams = {
        template: requestBody,
        operationType: 'accounts',
      };
      this.router.navigate([SIGN_CONFIRM.replace(':type', 'accounts')]);
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

  docNumChange(value: any) {
    this.transferFormControl.docNum.setValue(value);
  }

  getTransferById(type: any, id: number) {
    this.addSubscriber(
      this.accountHistoryService.getPaymentById(type, id.toString()).subscribe(
        (res: any) => {
          this.getPrefill();
          this.transferForm.patchValue({
            accountFrom: res?.accountSender || res?.senderIban,
            accountTo: res?.accountRecipient || res?.recipientIban,
            amount: res?.amount,
          });

          Object.values(this.transferForm.controls).forEach(field => {
            field.markAsTouched();
            field.updateValueAndValidity();
          });
        },
        () => {
          this.formLoading = true;
          this.getCommission();
          this.changeDetector.detectChanges();
        }
      )
    );
  }

  transferBetweenInfoShow() {
    this.transferBetweenInfo = !this.transferBetweenInfo;
  }

  getAccountFrom() {
    const selectedAcc = this.transferForm.get('accountFrom').value;
    const nAccount = this.accountFromList.find((acc: any) => {
      const iban = acc.iban || acc.accountIban;
      if (iban === selectedAcc) {
        return acc;
      }
    });
    return nAccount;
  }
}
