/* eslint-disable max-len */
import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { TranslateService } from '@ngx-translate/core';

import { AccountsService } from '@core/services/accounts.service';
import { HelperService } from '@core/services/helper.service';
import moment from 'moment';
import {
  cardReportFormatLists,
  dateFormat,
  reportFormatLists,
  requestDateFormat,
  statementRequestDateFormat,
} from '@app/core/constants';
import {
  GET_ACCOUNT_STATEMENTS_C1,
  GET_ACCOUNT_STATEMENTS_PDF,
  GET_ACCOUNT_STATEMENTS_XLS,
  GET_ACCOUNT_STATEMENTS_МТ940,
  GET_CARD_STATEMENTS_PDF,
  GET_CARD_STATEMENTS_XLSX,
  GET_DEPOSIT_STATEMENTS_PDF,
} from '@app/core/constants/apiUrls';
import {
  cardPeriods,
  errorMessage,
  getIn,
  thousandsSeparator,
} from '@app/core/helpers';
import { filter } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '@core/services/login.service';
import { Subscription } from 'rxjs';

const cards = {
  xlsx: GET_CARD_STATEMENTS_XLSX,
  pdf: GET_CARD_STATEMENTS_PDF,
};
const accounts = {
  xls: GET_ACCOUNT_STATEMENTS_XLS,
  pdf: GET_ACCOUNT_STATEMENTS_PDF,
  '1c': GET_ACCOUNT_STATEMENTS_C1,
  txt: GET_ACCOUNT_STATEMENTS_МТ940,
};

const deposit = {
  xls: GET_DEPOSIT_STATEMENTS_PDF, // TODO XLS ROUTE
  pdf: GET_DEPOSIT_STATEMENTS_PDF,
};

const reportUrl: { [key: string]: { [key: string]: string } } = {
  cards: cards,
  card: cards,
  'card-account': cards,
  accounts: accounts,
  account: accounts,
  deposit: deposit,
};

const today = moment();

@Component({
  selector: 'ob-account-modal',
  templateUrl: './account-modal.component.html',
  styleUrls: ['./account-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountModalComponent implements OnInit, OnDestroy {
  public type: any = ''; // account type
  public selectedFormat: string = 'pdf';
  public accountsList: any = [];
  public iban: any;
  public level: any = 1;
  public selectedAccount: any;
  public startDate: any;
  public endDate: any;
  public click: boolean = false;
  public error: string = '';
  public loading: boolean = false;
  public formatList: any;
  public isExtended: any;
  public modalType: any;
  public requisites: any;
  public isCard: boolean = false;
  public reportSubscription: Subscription;
  public reportResSubscription: Subscription;
  maxPickerDate: any = today.toDate();
  minDate: any = undefined;
  public subscriptions: Subscription[] = [];
  public isAccountOpened: boolean = false;
  public periodError: boolean = false;
  public periodErrorMessage = '';
  public fileName: any = '';

  visa = './assets/icons/ic_visa.svg';
  masterCard = './assets/icons/ic_master_card.svg';

  public periodOptions = [
    {
      code: 'MONTH',
      label: this.translate.instant('general.time.month'),
      startDate: moment().subtract(1, 'months'),
      endDate: today,
    },
    {
      code: 'HALF_YEAR',
      label: this.translate.instant('general.time.half-year'),
      startDate: moment().subtract(6, 'months'),
      endDate: today,
    },
    {
      code: 'YEAR',
      label: this.translate.instant('general.time.year'),
      startDate: moment().subtract(1, 'years'),
      endDate: today,
    },
    {
      code: 'CUSTOM',
      label: this.translate.instant('general.time.selected'),
      startDate: today,
      endDate: today,
    },
  ];
  public currentPeriod: any;
  public selectPlaceholder: { [key: string]: string } = {};
  public fingerPrint: any;

  constructor(
    public bsModalRef: BsModalRef,
    public modalOptions: ModalOptions,
    public accountService: AccountsService,
    public changeDetector: ChangeDetectorRef,
    public helperService: HelperService,
    private router: Router,
    private translate: TranslateService,
    private toastr: ToastrService,
    private loginService: LoginService
  ) {
    this.type = this.modalOptions?.initialState?.type;
    this.iban = this.modalOptions?.initialState?.iban;
    this.level = this.modalOptions?.initialState?.level;
    this.accountsList = this.modalOptions?.initialState?.accountsList;
    this.isExtended = this.modalOptions?.initialState?.isExtended;
    this.getStatements = this.getStatements.bind(this);
    this.startDate = this.modalOptions?.initialState?.startDate;
    this.endDate = this.modalOptions?.initialState?.endDate;
    this.modalType = this.modalOptions?.initialState?.modalType;
    this.fileName = this.modalOptions?.initialState?.fileName;
  }

  ngOnInit(): void {
    if (this.isExtended && this.type.includes('card')) {
      this.isCard = true;
      this.periodOptions = cardPeriods;
    }
    this.getRequisites = this.getRequisites.bind(this);
    this.getDepositStatements = this.getDepositStatements.bind(this);
    this.formatList =
      this.type === 'card' ||
      this.type === 'cards' ||
      this.type === 'card-account'
        ? cardReportFormatLists
        : reportFormatLists;
    if (this.startDate && this.endDate) {
      this.startDate = moment(this.startDate, requestDateFormat).format(
        statementRequestDateFormat
      );
      this.endDate = moment(this.endDate, requestDateFormat).format(
        statementRequestDateFormat
      );
    }
    this.getTranslations();
    this.currentPeriod = this.periodOptions[0];

    if ((this.type === 'cards' || this.type === 'card') && this.isExtended) {
      this.accountService.currentCards.subscribe({
        next: data => {
          if (data.length) {
            if (this.modalType === 'statements') {
              this.accountsList = data.filter(
                i => getIn(i, 'level') === 3 || getIn(i, 'level') === 1
              );
            } else {
              this.accountsList = data.filter(i => getIn(i, 'level') === 3);
            }
            this.selectedAccount = this.accountsList[0];
            this.changeDetector.detectChanges();
          }
        },
      });
    }

    if (
      this.type === 'accounts' ||
      (this.type === 'accounts' && this.isExtended)
    ) {
      this.accountService.currentAccounts.subscribe({
        next: data => {
          if (data.length) {
            const temp = data.sort(function (a, b) {
              return b.actualBalance - a.actualBalance;
            });

            this.selectedAccount = temp[0];
            this.accountsList = data;
            this.changeDetector.detectChanges();
          }
        },
      });
    }

    if (this.isExtended) {
      this.startDate = this.currentPeriod.startDate.toDate();
      this.endDate = this.currentPeriod.endDate.toDate();
    }
    this.accountService.isReportLoading$.subscribe({
      next: v => {
        this.loading = v;
        this.changeDetector.detectChanges();
      },
    });

    this.accountService.reportError$.subscribe({
      next: v => {
        this.error = v;
        this.changeDetector.detectChanges();
      },
    });

    this.reportResSubscription = this.accountService.report$
      .pipe(filter(i => i))
      .subscribe({
        next: r => {
          this.formatToPdf(r);
          if (this.reportSubscription) {
            this.reportSubscription.unsubscribe();
          }
        },
        error: err => {
          errorMessage(err, this.toastr);
        },
        complete: () => {
          console.info('report completed');
        },
      });

    this.loginService.userInfoObject$.subscribe(value => {
      this.subscriptions.push(
        this.accountService
          .getRequisites(value.currentContract.contractNum)
          .subscribe((data: any) => {
            this.requisites = data;
          })
      );
    });
  }

  ngOnDestroy(): void {
    this.accountService.reportError$.next(null);
    this.accountService.isReportLoading$.next(false);
    this.accountService.report$.next(null);
    // this.accountService.report$.unsubscribe()
    if (this.reportSubscription) {
      this.reportSubscription.unsubscribe();
    }
    if (this.reportResSubscription) {
      this.reportResSubscription.unsubscribe();
    }
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  getTranslations() {
    this.translate
      .get([
        'default.select_account',
        'default.select_card',
        'default.select_deposit',
        'default.select_credit',
        'error.wrong-period',
        'error.enter-valid-period',
      ])
      .subscribe(translations => {
        this.selectPlaceholder.cards = translations['default.select_card'];
        this.selectPlaceholder.accounts =
          translations['default.select_account'];
        this.selectPlaceholder.deposits =
          translations['default.select_deposit'];
        this.selectPlaceholder.credits = translations['default.select_credit'];
        this.periodErrorMessage =
          translations['error.enter-valid-period'] +
          '. \n' +
          translations['error.wrong-period'];
      });
  }

  closeModal() {
    this.bsModalRef.hide();
    this.click = false;
  }

  changeSelectedFormat = (value: string) => {
    this.error = null;
    this.selectedFormat = value;
  };

  getAccountsList() {
    if (this.type !== 'cards' && this.type !== 'card') {
      return this.accountsList;
    } else {
      const newAccList: any = [];
      Object.keys(this.accountsList)?.forEach((account: any) => {
        newAccList.push(this.accountsList[account][0]);
        this.accountsList[account][0].links.forEach((nestedAccount: any) => {
          newAccList.push(nestedAccount);
        });
      });
      return newAccList;
    }
  }

  getAccountInfo(acc: any) {
    let info = { title: '', description: '', key: '' };

    if (this.type === 'accounts') {
      info.title = acc.iban;
      info.description = thousandsSeparator(acc.actualBalance);
    } else if (this.type === 'deposits') {
      // TODO REFACTOR IT LATER
      info.title = acc.depositAccount; //  CURRENTLY UNREACHABLE CODE
      info.description = this.helperService.formatAmount(acc.amount);
    } else if (this.type === 'cards' || this.type === 'card') {
      // TODO ЗАПУТАНО title / description ПЕРЕПУТАНЫ
      if (acc.level === 1) {
        //карт-счет
        info.title = acc.accountIban;
        info.description = thousandsSeparator(acc.amountBalance);
      } else {
        const contractName = acc.contractName || '';
        let contractNumber = '';
        if (acc.contractNumber && acc.contractNumber.length) {
          contractNumber = acc.contractNumber.substr(
            acc.contractNumber.length - 4
          );
          if (contractNumber) {
            contractNumber = `••${contractNumber}`;
          }
        }

        info.title = `${contractName}${contractNumber}`;
        info.description = thousandsSeparator(acc.amountBalance);
        info.key = acc.contractId;
      }
    }
    return info;
  }

  getImage(acc: any) {
    let icon = this.visa;
    if (acc.level) {
      // Карта или Карт-счет
      if (acc.level === 1) {
        // Карт-счет
        icon = this.helperService.getAccountIcon(
          acc.currency || acc.currencyCode,
          acc.active,
          this.type
        );
      }
      if (acc.level === 3) {
        // Карта
        const firstChar = acc.contractNumber && acc.contractNumber.charAt(0);
        if (firstChar === '5') {
          icon = this.masterCard;
        }
      }
    } else {
      // Счет / депозит / кредит
      icon = this.helperService.getAccountIcon(
        acc.currency || acc.currencyCode,
        acc.active,
        this.type
      );
    }
    return icon;
  }

  download(params: any) {
    // TODO: (Review) От этой подписки нужно так же отписаться в "onOnDestroy"
    this.reportSubscription = this.accountService.getStatementsReport(
      params,
      this.toastr
    );
  }

  formatToPdf(response: HttpResponse<any>) {
    let format = this.selectedFormat;
    this.reportResSubscription.unsubscribe();
    const a = document.createElement('a');
    const objURL = URL.createObjectURL(response.body);
    a.href = objURL;
    let fileName = this.translate.instant(this.fileName) || 'File';
    const startDate = moment(this.startDate, statementRequestDateFormat).format(
      dateFormat
    );
    const endDate = moment(this.endDate, statementRequestDateFormat).format(
      dateFormat
    );
    const period =
      startDate !== endDate ? `${startDate}-${endDate}` : `${startDate}`;
    fileName = `${fileName} ${period}.${format === '1c' ? 'txt' : format}`;
    a.setAttribute('download', `${fileName}`);
    a.click();
    URL.revokeObjectURL(objURL);
    this.closeModal();
  }

  getStatements() {
    if (this.periodError) {
      errorMessage({ message: this.periodErrorMessage }, this.toastr);
      return;
    }
    const url = this.router.url.split('/');
    this.click = true;
    let dateStart = this.startDate;
    let dateEnd = this.endDate;
    if (this.isExtended) {
      dateStart = this.currentPeriod.startDate.format(
        statementRequestDateFormat
      );
      dateEnd = this.currentPeriod.endDate.format(statementRequestDateFormat);
    }
    let type;
    let account;
    let level;
    let contractId = url[url.length - 1];
    if (this.isExtended) {
      if (getIn(this.selectedAccount, 'level') === 3) {
        level = 3;
        type = 'card';
        account = this.selectedAccount.accountIban;
        contractId = getIn(this.selectedAccount, 'contractId');
      }
      if (this.type === 'cards' && getIn(this.selectedAccount, 'level') === 1) {
        // карт-счет
        level = 1;
        type = 'card-account';
        account = this.selectedAccount.accountIban;
        contractId = getIn(this.selectedAccount, 'contractId');
      }
      if (this.type === 'accounts' || this.type === 'account') {
        type = 'accounts';
        account = this.selectedAccount.iban;
        level = 1;
      }
    } else {
      type = this.type;
      account = this.iban;
      if (type === 'card') {
        level = 3;
      }
      if (type === 'account' || type === 'card-account') {
        level = 1;
      }
    }

    const params: any = {
      dateStart,
      dateEnd,
      account,
      type,
      format: this.selectedFormat,
      contractId,
      rootContractId: null,
      level,
      currency: null,
      orderASC: false,
      url: reportUrl[this.type][this.selectedFormat],
    };

    if (this.type === 'card-account' || type === 'card-account') {
      params.rootContractId = contractId;
    }
    // TODO закрыто скачивание депозитов
    if (
      params.account &&
      (this.type === 'account' || this.type === 'accounts')
    ) {
      this.download(params);
    }
    if (
      params.contractId &&
      (this.type === 'card' ||
        this.type === 'cards' ||
        this.type === 'card-account')
    ) {
      this.download(params);
    }
  }

  changePeriodOption(code: string) {
    const period = this.periodOptions.find(o => o.code === code);
    this.currentPeriod = period;
    this.startDate = period.startDate.toDate();
    this.endDate = period.endDate.toDate();
  }

  calcDays() {
    const diff = moment(this.endDate).diff(this.startDate, 'days');
    const sd = moment(this.startDate).format(dateFormat);
    const ed = moment(this.endDate).format(dateFormat);
    if (diff === 0 && sd !== ed) {
      return 1;
    } else {
      return diff;
    }
  }

  periodChange(oldDate: any, value: string) {
    const periodObj = this.periodOptions[this.periodOptions.length - 1];
    const date = moment(oldDate);
    if (value === 'startDate') {
      const endDate = moment(this.endDate);
      periodObj.startDate = date;
      periodObj.endDate = endDate;
    } else {
      const startDate = moment(this.startDate);
      periodObj.startDate = startDate;
      periodObj.endDate = date;
    }
    this.currentPeriod = periodObj;
    this.changeDetector.detectChanges();
  }

  /* Функция ручного выбора дат начала и конца */

  changeDate(event: any, period: string) {
    if (period === 'startDate') {
      if (event?.toString() === 'Invalid Date' || !event) {
        this.startDate = null; //очищает поле если не валидная дата
        return;
      } else {
        if (event > new Date()) {
          this.startDate = new Date(); //макс дата сегодня (пользователь может писать не выбрав из календаря даты из будущего)
        } else {
          this.startDate = event;
        }
        if (
          this.type === 'card' ||
          this.type === 'cards' ||
          this.type === 'card-account'
        ) {
          if (this.calcDays() > 30) {
            this.periodError = false;
            let mObject = moment(event);
            mObject = mObject.add(30, 'days');
            let newEndDate = mObject.toDate();
            this.endDate = newEndDate;
            this.periodChange(newEndDate, 'endDate');
          } else if (this.calcDays() < 0) {
            this.periodError = true;
            errorMessage({ message: this.periodErrorMessage }, this.toastr);
          } else {
            this.periodError = false;
            this.currentPeriod.startDate = moment(this.startDate);
          }
        } else {
          if (this.calcDays() < 0) {
            this.periodError = true;
            errorMessage({ message: this.periodErrorMessage }, this.toastr);
          } else {
            this.periodError = false;
            this.currentPeriod.startDate = moment(this.startDate);
          }
        }
      }
    } else {
      if (event?.toString() === 'Invalid Date' || !event) {
        this.endDate = null;
        return;
      } else {
        if (event > new Date()) {
          this.endDate = new Date();
        } else {
          this.endDate = event;
        }
        if (
          this.type === 'card' ||
          this.type === 'cards' ||
          this.type === 'card-account'
        ) {
          if (this.calcDays() > 30) {
            this.periodError = false;
            let mObject = moment(event);
            mObject = mObject.subtract(30, 'days');
            let newStartDate = mObject.toDate();
            this.startDate = newStartDate;
            this.periodChange(newStartDate, 'startDate');
          } else if (this.calcDays() < 0) {
            this.periodError = true;
            errorMessage({ message: this.periodErrorMessage }, this.toastr);
          } else {
            this.periodError = false;
            this.currentPeriod.endDate = moment(this.endDate);
          }
        } else {
          if (this.calcDays() < 0) {
            this.periodError = true;
            errorMessage({ message: this.periodErrorMessage }, this.toastr);
          } else {
            this.periodError = false;
            this.currentPeriod.endDate = moment(this.endDate);
          }
        }
      }
    }
  }

  getRequisites() {
    let ibans: string[] = [];
    if (this.selectedAccount) {
      const accInfo =
        getIn(this.selectedAccount, 'iban') ||
        getIn(this.selectedAccount, 'accountIban');
      if (accInfo) {
        ibans.push(accInfo);
      }
      if (this.type === 'account' || this.type === 'accounts') {
        this.subscriptions.push(
          this.accountService.getRequisitesPdf(
            ibans,
            this.requisites.contractName,
            this.bsModalRef
          )
        );
      } else if (
        this.type === 'card' ||
        this.type === 'cards' ||
        this.type === 'card-account'
      ) {
        const clientIdRef = getIn(this.selectedAccount, 'clientIdRef');
        const contractId = getIn(this.selectedAccount, 'contractId');
        this.subscriptions.push(
          this.accountService.getCardRequisitesReport(
            clientIdRef,
            contractId,
            this.bsModalRef,
            this.toastr
          )
        );
      }
      // TODO deposits not implemented
    } else {
      errorMessage('Счет не выбран', this.toastr);
    }
  }

  onChange(contractId: any) {
    if (this.accountsList.length) {
      const account = this.accountsList.find(
        (a: any) => a.contractId === contractId
      );
      if (account) {
        this.selectedAccount = account;
      }
    }
  }

  onOpenAccount() {
    this.isAccountOpened = true;
  }

  onCloseAccount() {
    this.isAccountOpened = false;
  }

  getModalHeight() {
    if (
      this.isAccountOpened &&
      this.modalType !== 'statements' &&
      this.accountsList.length > 1
    ) {
      if (this.accountsList.length >= 4) {
        return { height: '320px' };
      } else {
        return { height: `${130 + 46 * this.accountsList.length}px` };
      }
    } else {
      return {};
    }
  }

  getDepositStatements() {
    if (this.periodError) {
      errorMessage({ message: this.periodErrorMessage }, this.toastr);
      return;
    }
    this.click = true;
    let dateStart = this.currentPeriod.startDate.format(requestDateFormat);
    let dateEnd = this.currentPeriod.endDate.format(requestDateFormat);

    let body: any = {
      dateStart: dateStart,
      dateEnd: dateEnd,
      orderASC: false,
      orderBy: 'statementDate',
      statementType: 'ALL',
    };

    this.subscriptions.push(
      this.accountService.getDepositStatementsReport(body)
    );
  }
}
