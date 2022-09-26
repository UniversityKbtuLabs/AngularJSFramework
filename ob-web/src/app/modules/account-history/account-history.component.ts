/* eslint-disable max-len */
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  TemplateRef,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, take } from 'rxjs/operators';

import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { AccountHistoryService } from '@app/core/services/account-history.service';
import {
  ITableRows,
  ITableColumns,
  IDocumentInfo,
  IDocumentList,
  // IAccountDischarge,
  // IAccount,
  IOperationType,
  IDraftParams,
  IDraftMain,
  IOperationDate,
} from '@app/data/models/account-history-types';
import {
  checkIsAnotherDay,
  errorMessage,
  getError,
  getIn,
  getStatusList,
  month_ago_Obj,
  requestsFormatter,
  returnAccStatementObj,
  returnDataObj,
  returnDocTypes,
  returnPeriods,
  returnStatusTabs,
  returnTypeList,
  transformDraft,
  returnCardStatementObj,
  returnProductTypes,
  returnCurrencyControlTypes,
  PRODUCT_TYPES,
  PRODUCT_TYPES_PROD,
  returnTypeListProd,
} from '@app/core/helpers';
import { AccountsService } from '@app/core/services/accounts.service';
import { returnRequestBody, returnTableColumns } from '@app/core/constants';
import moment from 'moment';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AccountModalComponent } from '../all-accounts/components/account-modal/account-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { ConstantTranslationsService } from '@app/core/services/constant-translations.service';
import { ToastrService } from 'ngx-toastr';
import { OperationsService } from '@app/core/services/operations.service';
import { addSubtract } from 'ngx-bootstrap/chronos/moment/add-subtract';
import { environment } from '@env/environment';

/*
    Контейнер отвечающий за отображение списков: 
    - Операции
    - Выписки по счету
    - Документы на подпись(вкл списки заявок)
       
    Разделение списков определяется по типу(type) принимаего контейнером. Допустимые типы:
    - operations-history
    - account-statements
    - documents-signing
    - product-statements

    Контейнер имеет фильтрацию согласно:
      1. Типа документа
      2. Статуса документа
      3. Даты документа
      4. Данных строки поиска
    
    Типы документов: 
      Все документы
      Заявки
      Платежи 
      Переводы
      Зарплатный платеж
      Пенсионный платеж
      Социальный платеж
    
    Тип документа устанавливается выбором из списка документов(элемент dropdown)

    Статусы документа:
      Все
      Создано
      В обработке
      Отклонено

    Статус документа устанавливается выбором из списка вкладок(элемент tabs)
    
    Даты документов определяются по датам начала и конца (элемент date picker)
    
    Данные строки поиска задаются в поисковой строке(элемент input)
*/

const dateFormat = 'YYYY-MM-DD';
const zeroTime = '00:00:00';

@Component({
  selector: 'ob-account-history',
  templateUrl: './account-history.component.html',
  styleUrls: ['./account-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountHistoryComponent
  extends SubscriptionAccumulator
  implements OnInit, OnDestroy
{
  /* Переменные для разделения списка документов */
  @Input() listType: string = '';
  @Input() iban: string = '';
  //@Input() accountData: IAccountInfo | undefined;
  /*** Фильтр ****/
  /*   
        1. Переменные фильтра по типу документа 
            operationTabs - типы операций
            operationType - выбранный тип операции
    */
  public operationTabs: IOperationType[];
  public operationType: IOperationType;
  /*   
        2. Переменные фильтра по статусу документа 
            statusTabs - статусы операций
            currentStatus - выбранный статус операции
    */
  public statusTabs: IOperationType[];
  public currentStatus: string;
  /*   
        3. Переменные фильтра по дате
            startDate - дата С
            endDate - дата По
    */
  public startDate: Date;
  public endDate: Date;
  public dateTabs: IOperationDate[];
  public period: IOperationDate;

  /* 4. Переменная фильтра строка поиска */
  public searchString = new FormControl();
  public documentNumber = new FormControl();
  public amountFrom = new FormControl();
  public amountTo = new FormControl();

  /* Объект фильтра */
  public filter$ = new BehaviorSubject<any>({});
  public observableFilter$ = this.filter$.asObservable();

  // ??
  public modalTemplate: TemplateRef<any>;
  public params: string = '';
  public nodata: boolean = false;
  /* 
        Переменные таблицы
            tableColumns - поля
            rows - табличные данные 
            maxSize - максимальное кол-во элементов пагинации
            totalElements - общее кол-во элементов
            currentPage - текущая страницы
    */
  public tableColumns: ITableColumns[] = [];
  public rows: ITableRows[] = [];
  public maxSize = 7;
  public totalElements: number;
  public currentPage = 0;
  public isFirst: boolean = false;
  public isLast: boolean = false;

  // loader
  public loading: boolean = false;
  public isLoadingBalances: boolean = false;
  public isLoadingSignersInfo: boolean = false;

  // Ошибки
  public error: string = '';

  /* Переменные для работы с выписками */
  @Input() accountType: string = '';
  @Input() accountData: any;

  public balances: any;

  modalRef?: BsModalRef;

  /* Максимальная и минимальная даты выбора календаря */
  maxDate: Date = new Date();
  minDate: any = undefined;

  public accStatementTitle: any = {};

  public ACCOUNT_CREATE: '';
  public CURRENCY_CONTRACT_CHANGE: '';
  public CURRENCY_CONTRACT_REGISTRATION: '';
  public CURRENCY_CONTROL_DOCUMENT: '';
  public CURR_EXCHANGE_FX: '';
  public CURR_EXCHANGE_V2: '';
  public CURR_ORDER_RUBLE: '';
  public CURR_ORDER_V2: '';
  public CORPORATE_CARDS_DEACTIVATE_RISK: '';
  public CURRENCY_MAIL_TO_BANK: '';
  public CREDIT_EARLY_REPAYMENT: '';
  public CURR_EXCHANGE_FX_CASH: '';
  public CURR_ORDER_INNER: '';
  public CORP_CARD_ISSUE: '';
  public CURR_ORDER_CARDS: '';
  public CRED_LIMIT_REQUEST: '';
  public CASHOUT: '';
  public DEPOSIT_OPEN: '';
  public DEPOSIT_PARTRETURN: '';
  public DEPOSIT_REFILL: '';
  public DEBT_INFO: '';
  public DP_CRT: '';
  public GUARANTEE_COVERED_HALYK: '';
  public PAY_BUDGET: '';
  public PAY_MEDICAL_INSURANCE: '';
  public PAY_ORDER_V2: '';
  public PAY_PENSION_V2: '';
  public PAY_SALARY_V2: '';
  public PAY_SOCIAL_V2: '';
  public PAY_INSURANCE: '';
  public PAY_BY_PHONE: '';
  public PAY_ORDER_DAMU: '';
  public PAY_ORDER_CARDS: '';
  public MAIL_TO_BANK_V2: '';
  public TCR: '';
  public TEMPLATE_PAY_ORDER_V2: '';
  public BLANK_GUARANTEE: string = '';
  public PAY_TO_ACCOUNT: string = '';
  public PAY_P2P: string = '';
  public PAY_TO_CARD: string = '';
  public PAY_BETWEEN_ACCOUNTS: string = '';
  //toggle all filters
  public showAllFilters: boolean = false;
  // Подписки
  public opListSubscription: Subscription;
  public signerInfoSubscr: Subscription;

  public periodError: boolean = false;
  public periodErrorMessage = '';
  public resetFilterSubject: Subject<boolean> = new Subject<boolean>();
  public serverError: string = '';
  public orderASC: boolean = false;
  public orderBy: string = 'statementDate';

  constructor(
    public dischargeHistoryService: AccountHistoryService,
    public changeDetector: ChangeDetectorRef,
    public activatedRoute: ActivatedRoute,
    public accountsService: AccountsService,
    private modalService: BsModalService,
    private translate: TranslateService,
    private constantTranslationsService: ConstantTranslationsService,
    private toastr: ToastrService,
    public operationsService: OperationsService
  ) {
    super();
    this.nodata = false;
    this.searchString = new FormControl('', []);
    this.documentNumber = new FormControl('', []);
    this.amountFrom = new FormControl('', []);
    this.amountTo = new FormControl('', []);
    this.fetchStatements = this.fetchStatements.bind(this);
    this.resetFilter = this.resetFilter.bind(this);
  }

  ngOnInit(): void {
    this.signerInfoSubscr =
      this.dischargeHistoryService.isLoadingSignersInfo$.subscribe({
        next: v => {
          this.isLoadingSignersInfo = v;
        },
      });

    if (this.listType !== 'documents-signing') {
      this.startDate = month_ago_Obj.toDate();
      this.endDate = new Date();
    }
    if (
      (this.accountType === 'card' || this.accountType === 'card-account') &&
      this.listType === 'account-statements'
    ) {
      let mObject = moment(this.maxDate);
      mObject = mObject.subtract(30, 'days');
      this.startDate = mObject.toDate();
    }
    this.params = this.accountType;
    this.dischargeHistoryService.listType$.next(this.listType);
    this.tableColumns = returnTableColumns(this.listType);
    if (environment.production) {
      this.operationTabs = returnTypeListProd(this.listType);
    } else {
      this.operationTabs = returnTypeList(this.listType);
    }
    this.operationType = this.operationTabs[0];
    this.statusTabs = returnStatusTabs(this.listType);
    this.currentStatus = this.statusTabs.length
      ? this.statusTabs[0].code
      : undefined;
    this.dateTabs = returnPeriods(this.listType, this.accountType);
    this.period = this.dateTabs[0]; // TODO [0]

    this.accountsService.reportError$.subscribe({
      next: v => {
        this.error = v;
        this.changeDetector.detectChanges();
      },
    });

    this.getTranslations();

    this.filter$.next({
      currentStatus: this.currentStatus,
      operationType: this.operationType.code,
      startDate: this.period.startDate,
      endDate: this.period.endDate,
      searchString: this.searchString.value,
      documentNumber: this.documentNumber.value,
      amountFrom: this.amountFrom.value,
      amountTo: this.amountTo.value,
      page: this.currentPage,
      typeList: this.listType,
    });

    this.addSubscriber(
      this.dischargeHistoryService.listType$.pipe(take(1)).subscribe({
        next: v => {
          // this.dischargeHistoryService.listType$.complete()
        },
      })
    );

    this.addSubscriber(
      this.observableFilter$.subscribe({
        next: v => {
          this.getDocumentsList();
        },
      })
    );

    this.searchString.valueChanges // Подписка на строку поиска
      .pipe(debounceTime(1200))
      .forEach(value => {
        const val = /^\d+$/.test(value); // проверка на присутствие цифр
        const idn = value.replace(/\s+/g, '');
        if (!this.periodError) {
          this.filter$.next({ ...this.filter$.value, searchString: value });
        }
      });

    this.documentNumber.valueChanges // Подписка на строку поиска
      .pipe(debounceTime(1200))
      .forEach(value => {
        if (this.documentNumber.valid) {
          let nValue = value.replace(/\s+/g, '');
          // if (/^\d+$/.test(nValue)) {
          //     nValue = parseInt(nValue, 10)
          // }
          if (!this.periodError) {
            this.filter$.next({
              ...this.filter$.value,
              documentNumber: nValue,
            });
          }
        }
      });

    this.amountFrom.valueChanges // Подписка на строку поиска
      .pipe(debounceTime(1200))
      .forEach(value => {
        if (this.amountFrom.value !== '') {
          let nValue = value.replace(/\s+/g, '');
          // if (/^\d+$/.test(nValue)) {
          //     nValue = parseInt(nValue, 10)
          // }
          if (!this.periodError) {
            this.filter$.next({ ...this.filter$.value, amountFrom: nValue });
          }
        }
      });

    this.amountTo.valueChanges // Подписка на строку поиска
      .pipe(debounceTime(1200))
      .forEach(value => {
        if (this.amountTo.value !== '') {
          let nValue = value.replace(/\s+/g, '');
          // if (/^\d+$/.test(nValue)) {
          //     nValue = parseInt(nValue, 10)
          // }
          if (!this.periodError) {
            this.filter$.next({ ...this.filter$.value, amountTo: nValue });
          }
        }
      });

    this.addSubscriber(
      // Подписка на открытие мод окна, по откр запрос списка
      this.dischargeHistoryService.isModalOpen.subscribe((value: boolean) => {
        if (value) {
          // this.getOperationsList();
        }
      })
    );
    //Для показа статистики в зависимости от периода для счетов
    if (this.params === 'account') {
      this.getAccountBalance();
    }

    this.getUserRigths();
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
  returnDatePeriods() {
    if (
      this.accountType.includes('card') &&
      this.listType === 'account-statements'
    ) {
      return this.dateTabs.slice(0, 3);
    } else {
      return this.dateTabs;
    }
  }

  getTranslations() {
    this.translate
      .get([
        'operations.default.accountStatement',
        'operations.default.depositStatement',
        'operations.default.cardStatement',
        'error.wrong-period',
        'error.enter-valid-period',
        'operations.default.cardAccountStatement',
        'error.server_error',
        'operations.type.ACCOUNT_CREATE',
        'operations.type.CURRENCY_CONTRACT_CHANGE',
        'operations.type.CURRENCY_CONTRACT_REGISTRATION',
        'operations.type.CURRENCY_CONTROL_DOCUMENT',
        'operations.type.CURR_EXCHANGE_FX',
        'operations.type.CURR_EXCHANGE_V2',
        'operations.type.CURR_ORDER_RUBLE',
        'operations.type.CURR_ORDER_V2',
        'operations.type.CORPORATE_CARDS_DEACTIVATE_RISK',
        'operations.type.CURRENCY_MAIL_TO_BANK',
        'operations.type.CREDIT_EARLY_REPAYMENT',
        'operations.type.CREDIT_EARLY_REPAYMENT',
        'operations.type.CURR_EXCHANGE_FX_CASH',
        'operations.type.CURR_ORDER_INNER',
        'operations.type.CORP_CARD_ISSUE',
        'operations.type.CURR_ORDER_CARDS',
        'operations.type.CRED_LIMIT_REQUEST',
        'operations.type.CORPORATE_CARDS_DEACTIVATE_RISK',
        'operations.type.DEPOSIT_OPEN',
        'operations.type.DEPOSIT_PARTRETURN',
        'operations.type.DEPOSIT_REFILL',
        'operations.type.DEBT_INFO',
        'operations.type.DP_CRT',
        'operations.type.GUARANTEE_COVERED_HALYK',
        'operations.type.PAY_BUDGET',
        'operations.type.PAY_MEDICAL_INSURANCE',
        'operations.type.PAY_ORDER_V2',
        'operations.type.PAY_PENSION_V2',
        'operations.type.PAY_SALARY_V2',
        'operations.type.PAY_SOCIAL_V2',
        'operations.type.PAY_INSURANCE',
        'operations.type.PAY_BY_PHONE',
        'operations.type.PAY_ORDER_DAMU',
        'operations.type.PAY_ORDER_CARDS',
        'operations.type.MAIL_TO_BANK_V2',
        'operations.type.TCR',
        'operations.type.TEMPLATE_PAY_ORDER_V2',
        'operations.type.BLANK_GUARANTEE',
        'operations.type.PAY_TO_ACCOUNT',
        'operations.type.PAY_P2P',
        'operations.type.PAY_TO_CARD',
        'operations.type.PAY_BETWEEN_ACCOUNTS',
        'operations.default.amount',
        'operations.payment-confirmation.doc-number',
        'operations.payment-confirmation.time',
        'operations.default.withdrawal-account',
        'operations.payment-confirmation.receiver-account',
        'operations.status.needSign',
        'operations.status.signed',
      ])
      .subscribe(translations => {
        this.accStatementTitle.card =
          translations['operations.default.cardStatement'];
        this.accStatementTitle['card-account'] =
          translations['operations.default.cardStatement'];
        this.accStatementTitle.deposit =
          translations['operations.default.depositStatement'];
        this.accStatementTitle.account =
          translations['operations.default.accountStatement'];
        this.accStatementTitle['card-account'] =
          translations['operations.default.cardAccountStatement'];
        this.periodErrorMessage =
          translations['error.enter-valid-period'] +
          '. \n' +
          translations['error.wrong-period'];
        this.serverError = translations['error.server_error'];
        this.ACCOUNT_CREATE = translations['operations.type.ACCOUNT_CREATE'];
        this.CURRENCY_CONTRACT_CHANGE =
          translations['operations.type.CURRENCY_CONTRACT_CHANGE'];
        this.CURRENCY_CONTRACT_REGISTRATION =
          translations['operations.type.CURRENCY_CONTRACT_REGISTRATION'];

        this.CURRENCY_CONTROL_DOCUMENT =
          translations['operations.type.CURRENCY_CONTROL_DOCUMENT'];
        this.CURR_EXCHANGE_FX =
          translations['operations.type.CURR_EXCHANGE_FX'];
        this.CURR_EXCHANGE_V2 =
          translations['operations.type.CURR_EXCHANGE_V2'];

        this.CURR_ORDER_RUBLE =
          translations['operations.type.CURR_ORDER_RUBLE'];
        this.CURR_ORDER_V2 = translations['operations.type.CURR_ORDER_V2'];
        this.CORPORATE_CARDS_DEACTIVATE_RISK =
          translations['operations.type.CORPORATE_CARDS_DEACTIVATE_RISK'];

        this.CURRENCY_MAIL_TO_BANK =
          translations['operations.type.CURRENCY_MAIL_TO_BANK'];
        this.CREDIT_EARLY_REPAYMENT =
          translations['operations.type.CREDIT_EARLY_REPAYMENT'];
        this.CREDIT_EARLY_REPAYMENT =
          translations['operations.type.CREDIT_EARLY_REPAYMENT'];

        this.CURR_EXCHANGE_FX_CASH =
          translations['operations.type.CURR_EXCHANGE_FX_CASH'];
        this.CURR_ORDER_INNER =
          translations['operations.type.CURR_ORDER_INNER'];
        this.CORP_CARD_ISSUE = translations['operations.type.CORP_CARD_ISSUE'];

        this.CURR_ORDER_CARDS =
          translations['operations.type.CURR_ORDER_CARDS'];
        this.CRED_LIMIT_REQUEST =
          translations['operations.type.CRED_LIMIT_REQUEST'];
        this.CASHOUT =
          translations['operations.type.CORPORATE_CARDS_DEACTIVATE_RISK'];

        this.DEPOSIT_OPEN = translations['operations.type.DEPOSIT_OPEN'];
        this.DEPOSIT_PARTRETURN =
          translations['operations.type.DEPOSIT_PARTRETURN'];
        this.DEPOSIT_REFILL = translations['operations.type.DEPOSIT_REFILL'];

        this.DEBT_INFO = translations['operations.type.DEBT_INFO'];
        this.DP_CRT = translations['operations.type.DP_CRT'];
        this.GUARANTEE_COVERED_HALYK =
          translations['operations.type.GUARANTEE_COVERED_HALYK'];

        this.PAY_BUDGET = translations['operations.type.PAY_BUDGET'];
        this.PAY_MEDICAL_INSURANCE =
          translations['operations.type.PAY_MEDICAL_INSURANCE'];
        this.PAY_ORDER_V2 = translations['operations.type.PAY_ORDER_V2'];

        this.PAY_PENSION_V2 = translations['operations.type.PAY_PENSION_V2'];
        this.PAY_SALARY_V2 = translations['operations.type.PAY_SALARY_V2'];
        this.PAY_SOCIAL_V2 = translations['operations.type.PAY_SOCIAL_V2'];

        this.PAY_INSURANCE = translations['operations.type.PAY_INSURANCE'];
        this.PAY_BY_PHONE = translations['operations.type.PAY_BY_PHONE'];
        this.PAY_ORDER_DAMU = translations['operations.type.PAY_ORDER_DAMU'];

        this.PAY_ORDER_CARDS = translations['operations.type.PAY_ORDER_CARDS'];
        this.MAIL_TO_BANK_V2 = translations['operations.type.MAIL_TO_BANK_V2'];
        this.TCR = translations['operations.type.TCR'];

        this.TEMPLATE_PAY_ORDER_V2 =
          translations['operations.type.TEMPLATE_PAY_ORDER_V2'];
        this.BLANK_GUARANTEE = translations['operations.type.BLANK_GUARANTEE'];
        this.PAY_TO_ACCOUNT = translations['operations.type.PAY_TO_ACCOUNT'];
        this.PAY_P2P = translations['operations.type.PAY_P2P'];
        this.PAY_TO_CARD = translations['operations.type.PAY_TO_CARD'];
        this.PAY_BETWEEN_ACCOUNTS =
          translations['operations.type.PAY_BETWEEN_ACCOUNTS'];
      });
  }

  ngOnDestroy() {
    this.dischargeHistoryService.page = 0;
    if (this.signerInfoSubscr) {
      this.signerInfoSubscr.unsubscribe();
    }
  }

  /* Статус handler, при изменении запрашивает список */
  onStatusChange(value: string): void {
    this.currentStatus = value;
    this.filter$.next({ ...this.filter$.value, currentStatus: value });
  }

  changePage(page: any): void {
    if (page.page !== this.currentPage) {
      this.dischargeHistoryService.docsAmount$.next('{"KZT":[0]}');
      this.dischargeHistoryService.docsLength$.next(0);
      this.dischargeHistoryService.selectedDocuments.next([]);
      // TODO: Subscription не добавлен для последующего удаления в хуке "ngOnDestroy"
      this.getOperationsList(page.page - 1);
    }
    /* Задает фокус на поле поиска после пагинации */
    const searchStringElm = document.getElementById('searchString');
    if (searchStringElm) {
      setTimeout(() => {
        document.getElementById('searchString').blur();
      }, 0);
      document.getElementById('searchString').focus();
    }
  }

  /* Метод изменения типа операции/ документа/ выписки */
  onOpTypeChange(type: any) {
    this.dischargeHistoryService.docsAmount$.next('{"KZT":[0]}');
    this.dischargeHistoryService.docsLength$.next(0);
    this.dischargeHistoryService.selectedDocuments.next([]);
    this.filter$.next({ ...this.filter$.value, operationType: type.code });
  }

  /* Метод изменения периода операции/ документа/ выписки */
  onPeriodChange(period: any) {
    this.dischargeHistoryService.docsAmount$.next('{"KZT":[0]}');
    this.dischargeHistoryService.docsLength$.next(0);
    this.dischargeHistoryService.selectedDocuments.next([]);
    this.filter$.next({
      ...this.filter$.value,
      startDate: period.startDate,
      endDate: period.endDate,
    });
  }

  periodChange(oldDate?: any, value?: string) {
    const date = moment(oldDate).format(dateFormat);
    if (value === 'startDate') {
      const endDate = moment(this.endDate).format(dateFormat);
      this.filter$.next({
        ...this.filter$.value,
        startDate: date,
        endDate: endDate,
      });
    } else {
      const startDate = moment(this.startDate).format(dateFormat);
      this.filter$.next({
        ...this.filter$.value,
        endDate: date,
        startDate: startDate,
      });
    }

    if (this.params === 'account') {
      this.getAccountBalance(); //меняется статистика в зависимости от периода для счетов
    }
  }
  /* Функция ручного выбора дат начала и конца */
  changeDate(event: any, period: string) {
    if (period === 'startDate') {
      if (event?.toString() === 'Invalid Date' || !event) {
        this.startDate = null; //очищает поле если не валидная дата
        return;
      } else {
        if (event > new Date()) {
          this.startDate = new Date(); //макс дата сегодня (пользователь может писать даты из будущего)
        } else {
          this.startDate = event;
        }
        if (
          this.accountType === 'card' ||
          this.accountType === 'cards' ||
          this.accountType === 'card-account'
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
            this.periodChange(this.startDate, period);
          }
        } else {
          if (this.calcDays() < 0) {
            this.periodError = true;
            errorMessage({ message: this.periodErrorMessage }, this.toastr);
          } else {
            this.periodError = false;
            this.periodChange(this.startDate, period);
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
          this.accountType === 'card' ||
          this.accountType === 'cards' ||
          this.accountType === 'card-account'
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
            this.periodChange(this.endDate, period);
          }
        } else {
          if (this.calcDays() < 0) {
            this.periodError = true;
            errorMessage({ message: this.periodErrorMessage }, this.toastr);
          } else {
            this.periodError = false;
            this.periodChange(this.endDate, period);
          }
        }
      }
    }
    this.changeDetector.detectChanges();
  }

  /* 
        Метод запроса списка выписок по датам и номеру счета(или по id) 
        dateStart: дата С, 
        dateEnd: дата По,
        accountType: Тип выписки (карточный или по счету)
    */
  getStatements(
    dateStart: string,
    dateEnd: string,
    accountType: string,
    other: any,
    page: number = 0
  ) {
    const start = `${dateStart} ${zeroTime}`;
    const end = `${dateEnd} ${zeroTime}`;
    this.nodata = false;
    const nextCb = (data: any) => {
      this.loading = false;
      this.totalElements = data.totalElements;
      this.isFirst = data.isFirst;
      this.isLast = data.isLast;
      let rowsList;
      if (accountType === 'account') {
        rowsList = data.content.length
          ? data.content.map((el: any) => returnAccStatementObj(el))
          : [];
      } else {
        rowsList = data.statements?.length
          ? data.statements?.map((el: any) => returnCardStatementObj(el))
          : [];
      }

      this.dischargeHistoryService.changeLastPageStatus(data.isLast);
      if (rowsList.length === 0) {
        this.nodata = true;
      }
      this.rows = rowsList;
      this.currentPage = data.currentPage + 1;
      this.dischargeHistoryService.changeDocumentStatus(false);
    };
    const finallyCb = () => {
      this.loading = false;
      this.changeDetector.detectChanges();
    };

    if (accountType === 'account') {
      other.orderASC = this.orderASC;
      other.orderBy = this.orderBy;
      this.dischargeHistoryService
        .getAccountStatements(this.iban, end, start, other, page, 10)
        .subscribe(
          data => nextCb(data),
          (err: any) => {
            this.loading = false;
            this.isLoadingBalances = false;
            this.error = getError(err);
            this.changeDetector.detectChanges();
          }
        )
        .add(() => finallyCb());
    } else if (accountType === 'card' || accountType === 'card-account') {
      this.loading = false;
      this.changeDetector.detectChanges();
      const id = this.activatedRoute.snapshot.params['id'];
      this.dischargeHistoryService
        .getCardDischarge(id, end, start, page, 10)
        .subscribe({
          next: data => nextCb(data),
          error: (err: any) => {
            this.loading = false;
            this.isLoadingBalances = false;
            this.error = getError(err);
            this.changeDetector.detectChanges();
          },
        })
        .add(() => finallyCb());
    } else {
      // TODO: Сервисов по получению выписок по остальным продуктам пока нет
      setTimeout(() => {
        this.nodata = true;
        this.error = '';
        this.loading = false;
        this.isLoadingBalances = false;
        this.changeDetector.detectChanges();
      }, 1300);
    }
  }

  getUserRigths() {
    this.operationsService.checkRightsToSign().subscribe({
      next: (data: boolean) => {
        this.operationsService.userRightsToSign$.next(data);
        this.changeDetector.detectChanges();
      },
      error: (error: any) => {
        errorMessage(error, this.toastr);
      },
    });
  }

  /* 
        метод запроса списка операций/ документов/ выписки
        page: Страница 
        operationType: Тип операции
        typeList: Тип списка
    */
  getDocumentsList(page: number = 0): void {
    this.addSubscriber(this.getOperationsList(page));
  }

  getPaymentDraftParams(
    dateRangeStart: string,
    dateRangeEnd: string,
    other: any
  ): IDraftParams {
    const idn = other.idn;
    return {
      accountRecipient: other.account,
      accountSender: undefined,
      amount: undefined,
      baseFields: {
        contractId: undefined,
        dateRangeEnd,
        dateRangeStart,
        editDocId: undefined,
        orderASC: false,
        orderBy: 'DATE',
        signatureStatus: undefined,
        statuses: undefined,
      },
      bicBankRecipient: undefined,
      documentNumber: undefined,
      documentTypeList: [
        'PAY_ORDER',
        'PAY_ORDER_V2',
        'PAY_ORDER_CARDS',
        'PAY_SOCIAL',
        'PAY_SOCIAL_V2',
        'PAY_SALARY',
        'PAY_SALARY_V2',
        'PAY_PENSION',
        'PAY_PENSION_V2',
        'PAY_MEDICAL_INSURANCE',
        'PAY_BY_PHONE',
        'PAY_P2P',
        'PAY_BUDGET',
      ],
      idnRecipient: /^\d+$/.test(idn) ? idn : undefined,
      nameRecipient: /^\d+$/.test(idn) ? undefined : idn,
    };
  }

  /* 
        Метод зпроса списка заявок по продуктам
        page: Страница
        productType: тип продукта

    */

  getProductStatements(page: number = 0, body: any) {
    this.dischargeHistoryService.getProductDocuments(body, page, 10).subscribe({
      next: data => {
        if (data.content && data.content.length) {
          this.nodata = false;
          this.dischargeHistoryService.page += 1;
          this.totalElements = data.totalElements;
          this.isFirst = data.isFirst;
          this.isLast = data.isLast;

          const rowsList = data.content.map(
            (item: IDocumentInfo, index: number) => {
              const dateInfo = checkIsAnotherDay(item, index, data.content);
              const nItem = requestsFormatter(item) as any;
              nItem.isToday = dateInfo.isToday;
              nItem.isAnotherDate = dateInfo.isAnotherDate;
              return nItem;
            }
          );
          this.dischargeHistoryService.changeLastPageStatus(data.isLast);
          this.rows = this.getChangedRowList(rowsList);
          this.dischargeHistoryService.changeDocumentStatus(false);
          this.currentPage = data.currentPage + 1;
        } else {
          this.rows = [];
          this.nodata = true;
        }
        this.loading = false;
        this.changeDetector.detectChanges();
      },
      error: err => {
        this.error = 'Ошибка на сервере';
        this.loading = false;
        this.changeDetector.detectChanges();
      },
    });
  }

  /* 
        Метод запроса списка черновиков платежей 
        page: Номер страницы
        accountNumber: Номер счета
    */
  getPaymentDrafts(body: any, page: number = 0): void {
    // const params: IDraftParams = this.getPaymentDraftParams(dateStart, dateEnd, { idn: this.searchString.value, account: other.accountNumber })
    this.loading = true;
    this.error = '';

    this.dischargeHistoryService
      .getPaymentDraftList(body, page, 10)
      .subscribe(
        (data: IDraftMain) => {
          if (data.content && data.content.length) {
            this.nodata = false;
            this.totalElements = data.totalElements;
            this.isFirst = data.isFirst;
            this.isLast = data.isLast;

            const rowsList: ITableRows[] = data.content.map(
              (item: any, index: number) => {
                const dateInfo = checkIsAnotherDay(item, index, data.content);
                const nItem = transformDraft(item);
                nItem.isToday = dateInfo.isToday;
                nItem.isAnotherDate = dateInfo.isAnotherDate;
                nItem.operation = {
                  type: this.setRowOperationType(nItem),
                };
                return nItem;
              }
            );

            this.rows = rowsList;
            this.currentPage = data.currentPage + 1;
          } else {
            this.rows = [];
            this.nodata = true;
          }
        },
        (err: any) => {
          this.error = 'Ошибка на сервере'; // TODO
        }
      )
      .add(() => {
        this.loading = false;
        this.changeDetector.detectChanges();
      });
  }

  /* 
        Метод пред запроса списков выписок, операций и документов
         page - номер страницы 
         при типе списка account-statements запрашивает список выписок
         при типах списка operations-history/ documents-signing запрашивает список операций и документов
    */
  // TODO: Не указан тип того, что возвращает эта функция, а она может вернуть как Subscription так и null
  getOperationsList(page: number) {
    const {
      operationType,
      currentStatus,
      startDate,
      endDate,
      searchString,
      typeList,
      documentNumber,
      amountFrom,
      amountTo,
    } = this.filter$.value;
    const documentTypeList = this.getDocumentTypeList(operationType);
    const statuses = getStatusList(currentStatus, typeList);
    let signatureStatus: string;
    if (currentStatus === 'FULFILLED') {
      signatureStatus = 'SUFFICIENT';
    }
    const other = {
      listType: typeList,
      searchString,
      statuses,
      signatureStatus,
      documentNumber,
      amountFrom,
      amountTo,
      orderASC: false,
      orderBy: 'statementDate',
    };
    let body = returnRequestBody(
      startDate,
      endDate,
      documentTypeList,
      other,
      '',
      typeList
    );
    this.loading = true;
    this.error = '';
    if (typeList === 'account-statements') {
      // Блок списка выписок
      const content = {
        amountMax: amountTo,
        amountMin: amountFrom,
        statementType: statuses,
        counterAgentName: searchString,
        documentNumber: documentNumber,
      };
      this.getStatements(startDate, endDate, this.params, content, page);
      return null;
    } else if (typeList === 'product-statements') {
      // Блок списка заявок по продуктам
      this.getProductStatements(page, body);
      return null;
    } else {
      // Блок списка операций и документов
      if (operationType === 'TRANSFERS') {
        body = returnRequestBody(startDate, endDate, [], other, 'TRANSFER');
      }
      const successCb = (data: IDocumentList, objectFormater: any) => {
        if (data.content && data.content.length) {
          this.nodata = false;
          this.dischargeHistoryService.page += 1;
          this.totalElements = data.totalElements;
          this.isFirst = data.isFirst;
          this.isLast = data.isLast;

          const rowsList = data.content.map(
            (item: IDocumentInfo, index: number) => {
              const dateInfo = checkIsAnotherDay(item, index, data.content);
              const nItem = objectFormater(item);
              nItem.isToday = dateInfo.isToday;
              nItem.isAnotherDate = dateInfo.isAnotherDate;
              return nItem;
            }
          );
          this.dischargeHistoryService.changeLastPageStatus(data.isLast);
          this.rows = this.getChangedRowList(rowsList);
          this.dischargeHistoryService.changeDocumentStatus(false);
          this.currentPage = data.currentPage + 1;
        } else {
          this.rows = [];
          this.nodata = true;
        }
        this.loading = false;
        this.changeDetector.detectChanges();
      };

      if (currentStatus === 'DRAFT') {
        this.getPaymentDrafts(body, page);
        return null;
      } else {
        if (operationType === 'REQUESTS') {
          this.dischargeHistoryService
            .getProductDocuments(body, page, 10)
            .subscribe({
              next: v => {
                successCb(v, requestsFormatter);
              },
            });
          return null;
        } else {
          /* обработка и форматирование данных для таблицы списки операций и документов */
          // console.info(body);
          return this.dischargeHistoryService
            .getDocumentsList(body, page, 10)
            .subscribe({
              next: (data: IDocumentList) => successCb(data, returnDataObj),
              error: err => {
                errorMessage(err, this.toastr);
                this.error = this.serverError;
                this.loading = false;
                this.nodata = false;
                this.changeDetector.detectChanges();
              },
            });
        }
      }
    }
  }

  changeTable(): void {
    this.dischargeHistoryService.changeDocumentColumns(this.tableColumns);
  }

  resetFilter(): void {
    // TODO REFACTOR TOO MANY REQUESTS
    this.periodError = false;

    if (this.amountFrom.value) {
      this.amountFrom.patchValue('');
    }

    if (this.amountTo.value) {
      this.amountTo.patchValue('');
    }

    if (this.searchString.value) {
      this.searchString.patchValue('');
    }

    if (this.documentNumber.value) {
      this.documentNumber.patchValue('');
    }

    this.currentPage = 0;
    if (this.listType === 'documents-signing') {
      this.startDate = null;
      this.endDate = null;
      this.filter$.next({
        ...this.filter$.value,
        amountFrom: '',
        amountTo: '',
        searchString: '',
        documentNumber: '',
        startDate: '',
        endDate: '',
      });
      this.resetFilterSubject.next(false); //для сброса checkbox "выбрать все"
      this.changeDetector.detectChanges();
    } else {
      if (
        this.accountType === 'card' ||
        this.accountType === 'cards' ||
        this.accountType === 'card-account'
      ) {
        let mObject = moment(this.maxDate);
        mObject = mObject.subtract(30, 'days');
        this.startDate = mObject.toDate();
        this.endDate = new Date();
        this.filter$.next({
          ...this.filter$.value,
          amountFrom: '',
          amountTo: '',
          searchString: '',
          documentNumber: '',
          startDate: moment(this.startDate).format(dateFormat),
          endDate: moment(new Date()).format(dateFormat),
        });
      } else {
        this.orderASC = false;
        this.orderBy = 'statementDate';
        this.startDate = month_ago_Obj.toDate();
        this.endDate = new Date();
        this.filter$.next({
          ...this.filter$.value,
          amountFrom: '',
          amountTo: '',
          searchString: '',
          documentNumber: '',
          startDate: moment(month_ago_Obj.toDate()).format(dateFormat),
          endDate: moment(new Date()).format(dateFormat),
        });
      }
    }

    this.changeDetector.detectChanges();
  }

  fetchStatements() {
    if (!this.periodError) {
      const { startDate, endDate } = this.filter$.value;
      const initialState: any = {
        type: this.accountType,
        iban: this.iban,
        startDate,
        endDate,
        level: getIn(this.accountData, 'level'),
        fileName: this.accStatementTitle[this.accountType],
        modalType: 'statements',
      };
      this.modalRef = this.modalService.show(AccountModalComponent, {
        initialState: initialState,
        id: 1,
      });
    } else {
      errorMessage({ message: this.periodErrorMessage }, this.toastr);
    }
  }

  getChangedRowList(rowsList: ITableRows[]): ITableRows[] {
    rowsList.map((item: ITableRows) => {
      item.operation.type = this.setRowOperationType(item);
    });
    return rowsList;
  }

  getAccountBalance() {
    const { startDate, endDate } = this.filter$.value;
    this.isLoadingBalances = true;
    this.dischargeHistoryService
      .getAccountBalance(this.iban, endDate, startDate)
      .subscribe({
        next: v => {
          this.balances = {
            ...v,
            currency: getIn(this.accountData, 'currency'),
          };
          this.isLoadingBalances = false;
          this.changeDetector.detectChanges();
        },
        error: error => {
          this.isLoadingBalances = false;
          errorMessage(error, this.toastr);
          this.changeDetector.detectChanges();
        },
      });
  }

  setRowOperationType(item: ITableRows): string {
    if (item.knpCode === '342' && item.type === 'PAY_ORDER_V2') {
      return this.translate.instant(
        this.constantTranslationsService.PAY_BETWEEN_ACCOUNTS
      );
    } else {
      switch (item.type) {
        case 'ACCOUNT_CREATE':
          return this.ACCOUNT_CREATE;
        case 'BLANK_GUARANTEE':
          return this.BLANK_GUARANTEE;
        case 'CURRENCY_CONTRACT_CHANGE':
          return this.CURRENCY_CONTRACT_CHANGE;
        case 'CURRENCY_CONTRACT_REGISTRATION':
          return this.CURRENCY_CONTRACT_REGISTRATION;
        case 'CURRENCY_CONTROL_DOCUMENT':
          return this.CURRENCY_CONTROL_DOCUMENT;
        case 'CURR_EXCHANGE_FX':
          return this.CURR_EXCHANGE_FX;
        case 'CURR_EXCHANGE_V2':
          return this.CURR_EXCHANGE_V2;
        case 'CURR_ORDER_RUBLE':
          return this.CURR_ORDER_RUBLE;
        case 'CURR_ORDER_V2':
          return this.CURR_ORDER_V2;
        case 'CORPORATE_CARDS_DEACTIVATE_RISK':
          return this.CORPORATE_CARDS_DEACTIVATE_RISK;
        case 'CURRENCY_MAIL_TO_BANK':
          return this.CURRENCY_MAIL_TO_BANK;
        case 'CREDIT_EARLY_REPAYMENT':
          return this.CREDIT_EARLY_REPAYMENT;
        case 'CURR_EXCHANGE_FX_CASH':
          return this.CURR_EXCHANGE_FX_CASH;
        case 'CURR_ORDER_INNER':
          return this.CURR_ORDER_INNER;
        case 'CORP_CARD_ISSUE':
          return this.CORP_CARD_ISSUE;
        case 'CURR_ORDER_CARDS':
          return this.CURR_ORDER_CARDS;
        case 'CRED_LIMIT_REQUEST':
          return this.CRED_LIMIT_REQUEST;
        case 'CASHOUT':
          return this.CASHOUT;
        case 'DEPOSIT_OPEN':
          return this.DEPOSIT_OPEN;
        case 'DEPOSIT_PARTRETURN':
          return this.DEPOSIT_PARTRETURN;
        case 'DEPOSIT_REFILL':
          return this.DEPOSIT_REFILL;
        case 'DEBT_INFO':
          return this.DEBT_INFO;
        case 'DP_CRT':
          return this.DP_CRT;
        case 'GUARANTEE_COVERED_HALYK':
          return this.GUARANTEE_COVERED_HALYK;
        case 'PAY_BUDGET':
          return this.PAY_BUDGET;
        case 'PAY_MEDICAL_INSURANCE':
          return this.PAY_MEDICAL_INSURANCE;
        case 'PAY_ORDER_V2':
          return this.PAY_ORDER_V2;
        case 'PAY_PENSION_V2':
          return this.PAY_PENSION_V2;
        case 'PAY_SALARY_V2':
          return this.PAY_SALARY_V2;
        case 'PAY_SOCIAL_V2':
          return this.PAY_SOCIAL_V2;
        case 'PAY_INSURANCE':
          return this.PAY_INSURANCE;
        case 'PAY_BY_PHONE':
          return this.PAY_BY_PHONE;
        case 'PAY_ORDER_DAMU':
          return this.PAY_ORDER_DAMU;
        case 'PAY_ORDER_CARDS':
          return this.PAY_BETWEEN_ACCOUNTS;
        case 'MAIL_TO_BANK_V2':
          return this.MAIL_TO_BANK_V2;
        case 'TCR':
          return this.TCR;
        case 'TEMPLATE_PAY_ORDER_V2':
          return this.TEMPLATE_PAY_ORDER_V2;
        case 'PAY_P2P':
          return this.PAY_P2P;
        case 'PAY_TO_CARD':
          return this.PAY_BETWEEN_ACCOUNTS;
        default:
          return item.operation.type;
      }
    }
  }

  /* 
    Метод возврата типов списка документов
    product-statements - Список заявок по выпуску продуктов
    currency-control - Валютный контроль
    returnDocTypes - Общий список документов(лента операций)
  */
  getDocumentTypeList(operationType: any) {
    switch (this.listType) {
      case 'product-statements':
        return returnProductTypes(operationType);
      case 'currency-control':
        return returnCurrencyControlTypes(operationType);
      case 'documents-signing':
        const docTypes = returnDocTypes(operationType);
        if (environment.production) {
          return [...docTypes, ...PRODUCT_TYPES_PROD];
        } else {
          return [...docTypes, ...PRODUCT_TYPES];
        }
      default:
        return returnDocTypes(operationType);
    }
  }

  sortByField(field: string) {
    // Сортировка пользователем по полям (выписка)
    if (this.orderBy !== field) {
      this.orderASC = false;
    } else {
      this.orderASC = !this.orderASC;
    }
    this.orderBy = field;
    this.getOperationsList(this.currentPage - 1);
  }
}
