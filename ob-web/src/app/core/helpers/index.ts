/* eslint-disable max-len */
import { PushComponent } from '@app/shared';
import { v4 } from 'uuid';
import moment from 'moment';
import {
  dateFormat,
  dateParsingFormat,
  mmmmDateFormat,
  requestDateFormat,
  statusListKeys,
  timeFormat,
} from '../constants';
import { environment } from '@env/environment';

moment.locale('ru');

export const docNum = () =>
  'ONB' + v4().toString().toUpperCase().substring(0, 6);
export function getIn(data: any, ...keys: any[]) {
  const noData: any = null;
  if (!keys) {
    return noData;
  }
  if (!data) {
    return noData;
  }
  let result = data._root ? data.toJS() : data;
  let indx = 0;
  while (result[keys[indx]] || result[keys[indx]] === 0) {
    result = result[keys[indx]];
    indx++;
  }
  return typeof result === 'object' ? noData : result;
}

export const returnPrevMonth = (dateInput: Date | null) => {
  let yyyy = dateInput.getFullYear();
  let rawMonth = dateInput.getMonth(); // zero based, indexed 0-11
  let rawDay = dateInput.getDate(); // 1-31
  const prevDate = new Date();
  prevDate.setFullYear(yyyy, rawMonth - 1, rawDay);

  return prevDate;
};

export const prohibitedSymbols = () => "\\/':'*<>|$&`~#";

export const getClientError = (error: any) => {
  let err = error;
  if (error.error && error.error.messages && error.error.messages.length) {
    error.error.messages.forEach((element: string, index: number) => {
      // TODO Доработать
      const parsedElm = element.replace(/[^\w\s\\u0400-\u04FF]/gi, '');
      if (!/^[\u0400-\u04FF\0-9]+$/.test(parsedElm)) {
        error.error.messages[index] = 'notifications.unexpected';
        //error.error.messages[index] = 'Произошла неизвестная ошибка';
      }
    });
  } else {
    const isCyrilicMsg = /^[\u0400-\u04FF\d\:.\s:,\s:!\s:.•\-)\s]+$/.test(
      error.message
    );
    err = isCyrilicMsg ? error.message : 'notifications.unexpected';
  }
  return err;
};

export const getError = (error: any) => {
  let err;
  if (error.error && error.error.messages && error.error.messages.length) {
    error.error.messages.forEach((element: string, index: number) => {
      if (!/^[\u0400-\u04FF]+$/.test(element.charAt(0))) {
        // TODO исправить - неправильная проверка
        error.error.messages[index] = 'notifications.unexpected';
      }
    });
    err = error.error.messages.join(' ');
  } else {
    const isCyrilicMsg = /^[\u0400-\u04FF\d\:.\s:,\s:!\s:.•\-)\s]+$/.test(
      error.message
    );
    err = isCyrilicMsg ? error.message : 'notifications.unexpected';
  }
  return err;
};

function showMessage(message: string, toastr: any, type: string) {
  const toast = toastr.show(message, 'Push notification', {
    toastComponent: PushComponent,
    closeButton: true,
    tapToDismiss: false,
    timeOut: 3000,
    extendedTimeOut: 3000,
    positionClass: 'toast-top-right',
    preventDuplicates: true,
  });
  toast.toastRef.componentInstance.notification = {
    title: message,
    type,
  };
}

export const errorMessage = (error: any, toastr: any) => {
  let message = '';
  if (getIn(error, 'status') === 400) {
    let errorObj = getClientError(error);
    let errMessages = errorObj.error.messages.map(function (
      e: string,
      index: number
    ) {
      if (index > 0) {
        return `\n ${e}`;
      }
      return e;
    });
    message = errMessages.join().replaceAll(',', '');
  } else if (getIn(error, 'status') === 401) {
    //const locale = localStorage.getItem('locale');

    message = 'notifications.sessionExpired';
    /*if (locale === 'ru') {
      message =
        'Ваша сессия истекла. Для продолжения работы необходимо авторизоваться в портале Onlinebank.kz';
    } else if (locale === 'kk') {
      message =
        'Ваша сессия истекла. Для продолжения работы необходимо авторизоваться в портале Onlinebank.kz';
    } else {
      message =
        'Your session has expired. To continue your work, you need to log in to Onlinebank.kz';
    } */
  } else {
    message = getError(error);
  }
  showMessage(message, toastr, 'error');
};

export const successMessage = (message: string = '', toastr: any) => {
  const msg = message || 'notifications.success';
  showMessage(msg, toastr, 'success');
};

export const showRandomMessage = (
  message: string = '',
  toastr: any,
  type: string
) => {
  // const msg = message || "Успешно";
  showMessage(message, toastr, type);
};

export const thousandsSeparator = (amount: number) =>
  amount
    .toLocaleString('fr', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replace(',00', '');

export const compareCurrency = (a: any, b: any) => {
  let order: any = {
    KZT: 1,
    RUB: 2,
    USD: 3,
    EUR: 4,
    GBP: 5,
    CHF: 6,
    USZ: 7,
  };
  return order[a.currency || a.isoCode] - order[b.currency || b.isoCode] || 0;
};

export function operationTypeMapper(operationType: string) {
  // Список типов документов
  switch (operationType) {
    case 'PAY_SOCIAL_V2':
      return 'Социальный платеж';
    case 'PAY_PENSION_V2':
      return 'Пенсионный платеж';
    case 'PAY_SALARY_V2':
      return 'Выплата зарплаты';
    case 'PAY_BUDGET':
      return 'В бюджет';
    case 'PAY_ORDER_V2':
      return 'Перевод партнеру';
    case 'PAY_ORDER_CARDS':
      return 'Перевод с карты на счет';
    case 'PAY_P2P':
      return 'Перевод с карты на карту';
    case 'PAY_TO_CARD':
      return 'Перевод со счета на карту';
    case 'PAY_MEDICAL_INSURANCE':
      return 'Медицинское страхование ОСМС';
    default:
      return '';
  }
}

const PAYMENT_TYPES = [
  'PAY_ORDER_V2',
  'PAY_SOCIAL_V2',
  'PAY_SALARY_V2',
  'PAY_PENSION_V2',
  'PAY_BUDGET',
  'PAY_MEDICAL_INSURANCE',
];
const TRANSFER_TYPES = ['TRANSFER'];
export const PAYMENT_TRANSFER_TYPES = [
  'PAY_ORDER_V2',
  'PAY_SOCIAL_V2',
  'PAY_SALARY_V2',
  'PAY_PENSION_V2',
  'PAY_ORDER_CARDS',
  'PAY_P2P',
  'PAY_BUDGET',
  'PAY_TO_CARD',
  'PAY_MEDICAL_INSURANCE',
  'CURR_EXCHANGE_FX',
  'ACCOUNT_STATEMENT',
];

export const PAYMENT_TRANSFER_TYPES_PROD = [
  'PAY_ORDER_V2',
  'PAY_SOCIAL_V2',
  'PAY_SALARY_V2',
  'PAY_PENSION_V2',
  'PAY_ORDER_CARDS',
  'PAY_P2P',
  'PAY_BUDGET',
  'PAY_TO_CARD',
  'PAY_MEDICAL_INSURANCE',
  //'CURR_EXCHANGE_FX',
  'ACCOUNT_STATEMENT',
];

export const CURRENCY_CONTROL_TYPES = ['CURR_EXCHANGE_FX'];

export const PRODUCT_TYPES = [
  'DEPOSIT_OPEN',
  'CORP_CARD_ISSUE',
  'MVISA',
  'BLANK_GUARANTEE',
  'ACCOUNT_CREATE',
];

export const PRODUCT_TYPES_PROD = [
  'DEPOSIT_OPEN',
  'CORP_CARD_ISSUE',
  'MVISA',
  //'BLANK_GUARANTEE',
  'ACCOUNT_CREATE',
];
const CARD_TYPES = ['CORP_CARD_ISSUE', 'MVISA'];

/* Параметр фильтра в таблице документов. Функция возврата списка типов документов */
export function returnDocTypes(operationType: string) {
  switch (operationType) {
    case 'ALL':
      if (environment.production) {
        return PAYMENT_TRANSFER_TYPES_PROD;
      } else {
        return PAYMENT_TRANSFER_TYPES;
      }
    case 'PAY_SOCIAL_V2':
    case 'PAY_PENSION_V2':
    case 'PAY_SALARY_V2':
    case 'PAY_BUDGET':
    case 'PAY_MEDICAL_INSURANCE':
    case 'CURR_EXCHANGE_FX':
      return [operationType];
    case 'TRANSFERS':
      return TRANSFER_TYPES;
    case 'PAYMENTS':
      return PAYMENT_TYPES;
    // TODO ЗАЯВКИ
    default:
      return [];
  }
}

export function returnCurrencyControlTypes(operationType: string) {
  switch (operationType) {
    case 'ALL':
      return CURRENCY_CONTROL_TYPES;
    case 'CURR_EXCHANGE_FX':
      return [operationType];
    default:
      return [];
  }
}

export function returnProductTypes(statementType: string) {
  switch (statementType) {
    case 'ALL':
      return PRODUCT_TYPES;
    case 'DEPOSIT_OPEN':
    case 'CORP_CARD_ISSUE':
    case 'MVISA':
    case 'BLANK_GUARANTEE':
    case 'ACCOUNT_CREATE':
      return [statementType];
    case 'CARDS':
      return CARD_TYPES;
    default:
      return [];
  }
}

/* Параметр фильтра в таблице документов. Функция возврата списка статусов документов */
export function getStatusList(type: string, listType: string): any {
  let res;
  if (listType === 'account-statements') {
    res = getStatementsStatusList(type);
  } else {
    res = getDocumentsStatusList(type);
  }
  return res;
}

/* Параметр фильтра в таблице документов. Функция возврата списка статусов документов */
function getDocumentsStatusList(type: string): string[] | undefined {
  switch (type) {
    case 'IN_PROGRESS':
      return [type];
    case 'FAILED':
      return [
        'REJECTION',
        'FAILURE',
        'REFUSED',
        'REJECTED',
        'EXPIRED',
        'SIGN_DEAL_CANCELLED_CLIENT',
      ];
    case 'FULFILLED':
      return ['FULFILLED', 'APPROVED'];
    case 'ALL':
      return undefined;
    default:
      return undefined;
  }
}

/* Параметр фильтра в таблице документов. Функция возврата списка статусов выписок */
export function getStatementsStatusList(type: string): string | undefined {
  switch (type) {
    case 'DEBET':
      return 'DEBET_ONLY';
    case 'CREDIT':
      return 'CREDIT_ONLY';
    case 'ALL':
      return type;
    default:
      return undefined;
  }
}

/* Параметр фильтра в таблице документов. Функция возврата списка типов выписок/ документов/ операций (элемент dropdown) */
export function returnTypeList(type: string) {
  switch (type) {
    case 'operations-history':
    case 'account-statements':
      return [
        { code: 'ALL', name: 'default.allOperations' },
        { code: 'PAYMENTS', name: 'default.payments' },
        { code: 'TRANSFERS', name: 'default.transfers' },
        { code: 'PAY_SALARY_V2', name: 'default.salary_payment' },
        { code: 'PAY_PENSION_V2', name: 'default.pension_payment' },
        { code: 'PAY_SOCIAL_V2', name: 'default.social_payment' },
        { code: 'PAY_MEDICAL_INSURANCE', name: 'default.osms_payment' },
        { code: 'CURR_EXCHANGE_FX', name: 'default.exchangeFX' },
      ];
    case 'documents-signing':
      return [
        { code: 'ALL', name: 'default.all' },
        { code: 'REQUESTS', name: 'default.requests' },
        { code: 'PAYMENTS', name: 'default.payments' },
        { code: 'TRANSFERS', name: 'default.transfers' },
        { code: 'PAY_SALARY_V2', name: 'default.salary_payment' },
        { code: 'PAY_PENSION_V2', name: 'default.pension_payment' },
        { code: 'PAY_SOCIAL_V2', name: 'default.social_payment' },
        { code: 'PAY_MEDICAL_INSURANCE', name: 'default.osms_payment' },
        { code: 'CURR_EXCHANGE_FX', name: 'default.exchangeFX' },
      ];
    case 'product-statements':
      return [
        { code: 'ALL', name: 'default.all' },
        { code: 'ACCOUNT_CREATE', name: 'accounts.accounts' },
        { code: 'CARDS', name: 'accounts.cards' },
        //{ code: "CREDIT", name: "accounts.credits" },
        { code: 'DEPOSIT_OPEN', name: 'accounts.deposits' },
        //{ code: "PAYMENT", name: "products.default.paymentAccept" },
        //{ code: "TRADE_ACQUIRING", name: "products.default.tradeAcquiring" },
        //{ code: "INTERNET_ACQUIRING", name: "products.default.internetAcquiring" },
      ];
    case 'currency-control':
      return [
        { code: 'ALL', name: 'default.all' },
        { code: 'CURR_EXCHANGE_FX', name: 'default.exchangeFX' },
      ];
    default:
      return [];
  }
}

export function returnTypeListProd(type: string) {
  switch (type) {
    case 'operations-history':
    case 'account-statements':
      return [
        { code: 'ALL', name: 'default.allOperations' },
        { code: 'PAYMENTS', name: 'default.payments' },
        { code: 'TRANSFERS', name: 'default.transfers' },
        { code: 'PAY_SALARY_V2', name: 'default.salary_payment' },
        { code: 'PAY_PENSION_V2', name: 'default.pension_payment' },
        { code: 'PAY_SOCIAL_V2', name: 'default.social_payment' },
        { code: 'PAY_MEDICAL_INSURANCE', name: 'default.osms_payment' },
        //{ code: 'CURR_EXCHANGE_FX', name: 'default.exchangeFX' },
      ];
    case 'documents-signing':
      return [
        { code: 'ALL', name: 'default.all' },
        { code: 'REQUESTS', name: 'default.requests' },
        { code: 'PAYMENTS', name: 'default.payments' },
        { code: 'TRANSFERS', name: 'default.transfers' },
        { code: 'PAY_SALARY_V2', name: 'default.salary_payment' },
        { code: 'PAY_PENSION_V2', name: 'default.pension_payment' },
        { code: 'PAY_SOCIAL_V2', name: 'default.social_payment' },
        { code: 'PAY_MEDICAL_INSURANCE', name: 'default.osms_payment' },
        //{ code: 'CURR_EXCHANGE_FX', name: 'default.exchangeFX' },
      ];
    case 'product-statements':
      return [
        { code: 'ALL', name: 'default.all' },
        { code: 'ACCOUNT_CREATE', name: 'accounts.accounts' },
        { code: 'CARDS', name: 'accounts.cards' },
        //{ code: "CREDIT", name: "accounts.credits" },
        { code: 'DEPOSIT_OPEN', name: 'accounts.deposits' },
        //{ code: "PAYMENT", name: "products.default.paymentAccept" },
        //{ code: "TRADE_ACQUIRING", name: "products.default.tradeAcquiring" },
        //{ code: "INTERNET_ACQUIRING", name: "products.default.internetAcquiring" },
      ];
    case 'currency-control':
      return [
        { code: 'ALL', name: 'default.all' },
        { code: 'CURR_EXCHANGE_FX', name: 'default.exchangeFX' },
      ];
    default:
      return [];
  }
}

const today = moment().format(requestDateFormat);
const yesterday = moment().subtract(1, 'days').format(requestDateFormat);
export const month_ago_Obj = moment().subtract(1, 'months');
export const month_ago2 = moment()
  .subtract(30, 'days')
  .format(requestDateFormat);
export const month_ago = month_ago_Obj.format(requestDateFormat);

/* Параметр фильтра в таблице документов. Функция возврата периодов (элемент dropdown) */
export function returnPeriods(type: string, accountType: string = '') {
  if (
    (accountType === 'card' || accountType === 'card-account') &&
    type === 'account-statements'
  ) {
    return [
      {
        name: 'default.today',
        code: 'TODAY',
        startDate: month_ago2,
        endDate: today,
      },
      {
        name: 'default.yesterday',
        code: 'YESTERDAY',
        startDate: yesterday,
        endDate: yesterday,
      },
      {
        name: 'default.month_begining',
        code: 'MONTH_BEGINING',
        startDate: moment().startOf('month').format(requestDateFormat),
        endDate: today,
      },
      {
        name: 'default.specify_period',
        code: 'CUSTOM_PERIOD',
        startDate: today,
        endDate: today,
      },
    ];
  } else {
    switch (type) {
      case 'documents-signing':
        return [
          {
            name: 'default.allPeriod',
            code: 'ALL_PERIOD',
            startDate: undefined,
            endDate: undefined,
          },
          {
            name: 'default.today',
            code: 'TODAY',
            startDate: today,
            endDate: today,
          },
          {
            name: 'default.yesterday',
            code: 'YESTERDAY',
            startDate: yesterday,
            endDate: yesterday,
          },
          {
            name: 'default.month_begining',
            code: 'MONTH_BEGINING',
            startDate: moment().startOf('month').format(requestDateFormat),
            endDate: today,
          },
          {
            name: 'default.half_year',
            code: 'HALF_YEAR',
            startDate: moment().subtract(6, 'months').format(requestDateFormat),
            endDate: today,
          },
          {
            name: 'default.year_begining',
            code: 'YEAR_BEGINING',
            startDate: moment().startOf('year').format(requestDateFormat),
            endDate: today,
          },
          {
            name: 'default.specify_period',
            code: 'CUSTOM_PERIOD',
            startDate: today,
            endDate: today,
          },
        ];
      default:
        return [
          {
            name: 'default.today',
            code: 'TODAY',
            startDate: month_ago,
            endDate: today,
          },
          {
            name: 'default.yesterday',
            code: 'YESTERDAY',
            startDate: yesterday,
            endDate: yesterday,
          },
          {
            name: 'default.month_begining',
            code: 'MONTH_BEGINING',
            startDate: moment().startOf('month').format(requestDateFormat),
            endDate: today,
          },
          {
            name: 'default.half_year',
            code: 'HALF_YEAR',
            startDate: moment().subtract(6, 'months').format(requestDateFormat),
            endDate: today,
          },
          {
            name: 'default.year_begining',
            code: 'YEAR_BEGINING',
            startDate: moment().startOf('year').format(requestDateFormat),
            endDate: today,
          },
          {
            name: 'default.specify_period',
            code: 'CUSTOM_PERIOD',
            startDate: today,
            endDate: today,
          },
        ];
    }
  }
}

export const cardPeriods = [
  {
    code: 'MONTH',
    label: 'Месяц',
    startDate: moment().subtract(30, 'days'),
    endDate: moment(),
  },
  {
    code: 'CUSTOM',
    label: 'Выборочный',
    startDate: moment(),
    endDate: moment(),
  },
];

/* Параметр фильтра в таблице документов. Функция возврата статусов выписок/ операций (элемент вкладка) */
export function loginTabs() {
  return [
    { name: 'auth.phone', code: 'phone' },
    { name: 'auth.esp', code: 'ecp' },
  ];
}

/* Параметр фильтра в таблице документов. Функция возврата статусов выписок/ операций (элемент вкладка) */
export function returnStatusTabs(type: string) {
  switch (type) {
    case 'operations-history':
      return [
        { name: 'default.all', code: 'ALL' },
        { name: 'acccountSavings.credit.performed', code: 'FULFILLED' },
        { name: 'status.in-processing', code: 'IN_PROGRESS' },
        { name: 'status.failure', code: 'FAILED' },
        { name: 'status.created', code: 'DRAFT' },
      ];
    case 'account-statements':
      return [
        { name: 'default.all', code: 'ALL' },
        { name: 'general.operations.outgoing', code: 'DEBET' },
        { name: 'general.operations.inbox', code: 'CREDIT' },
      ];
    case 'product-statements':
      return [
        { name: 'default.all', code: 'ALL' },
        { name: 'acccountSavings.credit.performed', code: 'FULFILLED' },
        { name: 'status.in-processing', code: 'IN_PROGRESS' },
        { name: 'status.failure', code: 'FAILED' },
      ];
    case 'currency-control':
      return [
        { name: 'default.all', code: 'ALL' },
        { name: 'acccountSavings.credit.performed', code: 'FULFILLED' },
        { name: 'status.in-processing', code: 'IN_PROGRESS' },
        { name: 'status.failure', code: 'FAILED' },
      ];
    default:
      return [];
  }
}

export function getRecipientAccount(el: any, type: string) {
  if (
    type === 'CURRENCY_CONTRACT_CHANGE' ||
    type === 'CURRENCY_CONTRACT_REGISTRATION'
  ) {
    return getValue(el, 'ACCOUNT', '');
  } else if (type === 'MAIL_TO_BANK_V2') {
    return getValue(el, 'MAIL_RECIPIENT.BRANCH', '');
  } else {
    return getValue(el, 'ACC_FEE_PAYMENT.ACCOUNT', 'ACC_RECIPIENT');
  }
}

export function getValue(list: any, findName: string, secondFindName: string) {
  return list?.edpContent?.split(';').find((el: any) => {
    let name = el?.split('=')[0];
    if (findName === 'CURRENCY_SENDER') {
      return (
        name === findName ||
        name === 'ACCOUNT_SENDER.CURRENCY' ||
        name === 'CURRENCY'
      );
    } else {
      return name === findName || name === secondFindName;
    }
  });
}

export function getRecipientName(el: any, type: string) {
  if (
    type === 'CURRENCY_CONTRACT_CHANGE' ||
    type === 'CURRENCY_CONTRACT_REGISTRATION'
  ) {
    return getValue(el, 'BANK', '');
  } else if (type === 'MAIL_TO_BANK_V2') {
    return getValue(el, 'MAIL_RECIPIENT.VFULLNAME', '');
  } else {
    return getValue(el, 'RECIPIENT_NAME', 'NAME_RECIPIENT');
  }
}
export function checkObjectProperty(fn: any) {
  try {
    fn();
    return true;
  } catch (error) {
    return undefined;
  }
}

export function transformDraft(data: any) {
  const savedDateObj = moment(data.savedDate, dateParsingFormat);
  let savedDate = savedDateObj.format(mmmmDateFormat);
  const savedTime = savedDateObj.format(timeFormat);

  const recipientAccount = getRecipientName(data, data.documentType);
  const dataObj: any = {
    date: data.valDate,
    checked: false,
    operation: {
      type: '',
      sender: recipientAccount?.split('=')[1],
    },
    type: data.documentType,
    id: data.id,
    status: 'DRAFT',
    amount: data.amount,
    accountRecipient: data.accountRecipient ? data.accountRecipient : '',
    nameRecipient: data.nameRecipient
      ? data.nameRecipient.replaceAll('&quot;', '"')
      : '',
    bankRecipientName: data.bankNameRecipient
      ? data.bankNameRecipient.replaceAll('&quot;', '"')
      : '',
  };

  dataObj.sentDate = savedDate;
  dataObj.sentTime = savedTime;

  return dataObj;
}

export function returnDataObj(data: any) {
  let documentType = data.documentType;
  let edpContentList: string[];
  if (data.edpContent) {
    edpContentList = data.edpContent.split(';');
  }

  let bankRecipientName: string | undefined = edpContentList.find(
    (i: string) => {
      if (i.startsWith('BANK_RECIPIENT.NAME')) {
        return i;
      } else {
        return undefined;
      }
    }
  );
  let accountRecipient: string | undefined = edpContentList.find(
    (i: string) => {
      if (i.startsWith('ACC_RECIPIENT')) {
        return i;
      } else {
        return undefined;
      }
    }
  );

  let knpCode: string | undefined = edpContentList.find((i: string) => {
    if (i.startsWith('KNP_RECIPIENT')) {
      return i;
    } else {
      return undefined;
    }
  });

  let nameRecipient: string | undefined = edpContentList.find((i: string) => {
    if (i.startsWith('NAME_RECIPIENT')) {
      return i;
    } else {
      return undefined;
    }
  });
  if (bankRecipientName) {
    bankRecipientName = bankRecipientName.split('=')[1];
  }
  if (accountRecipient) {
    accountRecipient = accountRecipient.split('=')[1];
  }
  if (knpCode) {
    knpCode = knpCode.split('=')[1];
  }
  if (nameRecipient) {
    nameRecipient = nameRecipient.split('=')[1];
  }

  const currency: string = getValue(data, 'CURRENCY_SENDER', 'NULL');

  let amount: number;
  if (documentType === 'CURR_EXCHANGE_FX') {
    amount = Number(getValue(data, 'AMOUNT_SENDER', 'NULL').split('=')[1]);
  } else {
    amount = data.amount;
  }

  const recipientInfo = getRecipientName(data, data.documentType);
  const recipientAccount = getRecipientAccount(data, data.documentType);

  const sentDateObj = moment(data.sentDate, dateParsingFormat);
  const sentDate = sentDateObj.format(mmmmDateFormat);
  const sentTime = sentDateObj.format(timeFormat);
  let cardHolder = '';
  let depositType = '';
  let recipient = '';
  const contentList = edpContentList.join();
  if (contentList.includes('TYPE_OF_CARD') && contentList.includes('FIO')) {
    const cardHolderField: string | undefined = edpContentList.find(
      (i: string) => {
        if (i.startsWith('FIO')) {
          return i;
        } else {
          return undefined;
        }
      }
    );
    if (cardHolderField) {
      cardHolder = cardHolderField.split('=')[1];
    }
  }

  if (contentList.includes('DEPOSIT_TYPE')) {
    const deposit: string | undefined = edpContentList.find((i: string) => {
      if (i.startsWith('DEPOSIT_TYPE')) {
        return i;
      } else {
        return undefined;
      }
    });
    if (deposit) {
      depositType = deposit.split('=')[1];
    }
  }
  let convertContract = '';
  if (
    contentList.includes('OPERATION') &&
    contentList.includes('ACC_RECIPIENT.ACCOUNT')
  ) {
    const convertation: string | undefined = edpContentList.find(
      (i: string) => {
        if (i.startsWith('ACC_RECIPIENT.ACCOUNT')) {
          return i;
        } else {
          return undefined;
        }
      }
    );
    const contract: string | undefined = edpContentList.find((i: string) => {
      if (i.startsWith('CONTRACT')) {
        return i;
      } else {
        return undefined;
      }
    });
    if (convertation) {
      recipient = convertation.split('=')[1];
    }
    if (contract) {
      convertContract = contract.split('=')[1];
    }
  }

  const res = {
    checked: false,

    operation: {
      type: recipientInfo?.split('=')[1],
      sender: recipientAccount?.split('=')[1],
    },
    recipient,
    convertContract,
    bankRecipient: getIn(data, 'edpContent'),
    documentNumber: data.docNum,
    iin: recipientAccount?.split('=')[1],
    amount: amount,
    currency: currency?.split('=')[1],
    status: data.status,
    id: data.id,
    needSign: data.needSign,
    signed: data.signed,
    type: data.documentType,
    statusHistory: data.statusHistory,
    statusDetails: data.statusDetails,
    signatureStatus: data.signatureStatus,
    bankRecipientName, // БАНК ПОЛУЧАТЕЛЬ - ПОЛЕ ДЕТАЛИ ОПЕРАЦИИ
    accountRecipient,
    nameRecipient,
    sentDate,
    sentTime,
    signHistory: data.signHistory,
    knpCode,
    isToday: data.isToday,
    isAnotherDate: data.isAnotherDate,
    cardHolder,
    depositType,
  };

  return res;
}

export function requestsFormatter(data: any) {
  const currency = getValue(data, 'CURRENCY', 'NULL');
  const accountSender = getValue(data, 'ACCOUNT_SENDER', 'NULL');
  const clientName = getValue(data, 'FIO', 'NULL');
  const recipientAccount = getRecipientAccount(data, data.documentType);
  const sentDateObj = moment(data.sentDate, dateParsingFormat);
  const sentDate = sentDateObj.format(mmmmDateFormat);
  const sentTime = sentDateObj.format(timeFormat);
  const depositType = getValue(data, 'DEPOSIT_TYPE', 'NULL');
  return {
    sentDate: sentDate,
    sentTime: sentTime,
    checked: false,
    operation: {
      type: data.documentType,
      sender: recipientAccount?.split('=')[1],
    },
    documentNumber: data.docNum,
    iin: recipientAccount?.split('=')[1],
    amount: data.amount,
    currency: currency?.split('=')[1],
    status: data.status,
    id: data.id,
    needSign: data.needSign,
    signed: data.signed,
    type: data.documentType,
    statusHistory: data.statusHistory,
    signHistory: data.signHistory,
    statusDetails: data.statusDetails,
    signatureStatus: data.signatureStatus,
    accountRecipient: accountSender?.split('=')[1],
    nameRecipient: clientName?.split('=')[1],
    depositType: depositType?.split('=')[1],
  };
}

export function returnAccStatementObj(el: any) {
  return {
    id: el.id,
    checked: false,
    date: moment(el.statementDate, dateParsingFormat).format(dateFormat),
    operation: {
      type: el.nameRecipient,
      sender: el.paymentPurpose,
    },
    documentNumber: el.documentNumber,
    iin: el.rnnRecipient,
    amount: el.amountSender,
    currency: el.currency,
    accountRecipient: el.accountRecipient,
    accountSender: el.accountSender,
    knpCode: el.knpCode,
    statementReceiver: el.statementReceiver,
    type: PAYMENT_TRANSFER_TYPES[PAYMENT_TRANSFER_TYPES.length - 1],
  };
}

export function returnCardStatementObj(el: any) {
  return {
    id: el.id,
    checked: false,
    date: moment(el.statementDate, dateParsingFormat).format(dateFormat),
    operation: {
      type: el.transactionType,
      details: el.transactionDetails,
    },
    amount: el.transactionAmount,
    currency: el.currency,
  };
}

export function checkIsAnotherDay(item: any, index: number, data: any) {
  let isToday: boolean = false;
  let isAnotherDate: boolean = false;
  const todayDateObj = moment();
  const dateField = item.savedDate ? 'savedDate' : 'sentDate';
  const sentDateObj = moment(item[dateField], dateParsingFormat);
  const todayAsSentDate =
    todayDateObj.format(dateFormat) === sentDateObj.format(dateFormat);

  if (index > 0) {
    const prevDateObject = moment(
      data[index - 1][dateField],
      dateParsingFormat
    );

    if (todayAsSentDate) {
      isToday = true;
      if (
        todayDateObj.format(dateFormat) === prevDateObject.format(dateFormat)
      ) {
        isToday = false;
      }
    } else {
      if (
        sentDateObj.format(dateFormat) !== prevDateObject.format(dateFormat)
      ) {
        isAnotherDate = true;
      }
    }
  } else {
    if (todayAsSentDate) {
      isToday = true;
    } else {
      isAnotherDate = true;
    }
  }

  return {
    isToday,
    isAnotherDate,
  };
}

//например 1 день, 3 дня, 20 дней
export function getNounByNumbers(iNumber: number, aEndings: string[]) {
  let sEnding, i;
  iNumber = iNumber % 100;
  if (iNumber >= 11 && iNumber <= 19) {
    sEnding = aEndings[2];
  } else {
    i = iNumber % 10;
    switch (i) {
      case 1:
        sEnding = aEndings[0];
        break;
      case 2:
      case 3:
      case 4:
        sEnding = aEndings[1];
        break;
      default:
        sEnding = aEndings[2];
    }
  }
  return sEnding;
}

declare var Fingerprint: any;
export const fingerprintReport = function (succCb: any, errCb: any = () => {}) {
  var options = {
    debug: false,
    excludes: {
      ping: true,
      wsPing: true,
      plugins: true,
    },
  };
  try {
    if (Fingerprint) {
      Fingerprint.get(options, function (json: any) {
        succCb(json);
      });
    }
  } catch (error) {
    console.info(error);
    if (errCb) {
      errCb();
    }
  }

  // Fingerprint.get(options, function (json: any) {
  //   cB(json)
  // });
};

export const compareTariffs = (a: string, b: string) => {
  let order: any = {
    ECONOM: 1,
    ALEM: 2,
    TENDER: 3,
    DRIVE: 4,
  };
  return order[a] - order[b];
};

export function getTariffColor(tarifName: string) {
  switch (tarifName) {
    case 'ECONOM':
      return { backgroundColor: '#42D4B0' };
    case 'ALEM':
      return { backgroundColor: '#A6DF5D' };
    case 'TENDER':
      return { backgroundColor: '#F2C94C' };
    case 'DRIVE':
      return { backgroundColor: '#EE741B' };
    default:
      return null;
  }
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) {
    return '0 B';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
