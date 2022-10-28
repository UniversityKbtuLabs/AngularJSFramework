import { IDocumentsRequestBody } from '@app/data/models/account-history-types';

export function returnTableColumns(type: string, other: any = {}) {
  switch (type) {
    case 'operations-history':
      return operationTableColumns;
    case 'currency-control':
      return operationTableColumns;
    case 'documents-signing':
      return operationTableColumns;
    case 'product-statements':
      return productStatementTableColumns;
    // return returnDocumentColumns(other.operationType)
    case 'contract-list':
      return contractListTableColumns;
    default:
      return statementTableColumns;
  }
}

export const systemErrors = [
  { error: 'oauth.expired.sms_code', code: 'smsCodeExpired' },
  { error: 'oauth.not_found.phone', code: 'notFoundPhone' },
  { error: 'oauth.incorrect.sms_code', code: 'incorrectSmsCode' },
  { error: 'certificate.not_exists', code: 'certificateNotExists' },
  { error: 'oauth.attempts_exceeded.code', code: 'attemptsExceededCode' },
];

export const mobileOperators = [
  '700',
  '701',
  '702',
  '705',
  '707',
  '708',
  '747',
  '771',
  '775',
  '776',
  '777',
  '778',
];

/* 
    Метод возврата тела запроса списка документов
*/
export function returnRequestBody(
  dateRangeStart: string /* Дата начала */,
  dateRangeEnd: string /* Дата конца */,
  documentTypeList: string[] = [] /* список типов документов */,
  other: any /* доп параметры */,
  documentType: string = '',
  listType: string = ''
) {
  let body: IDocumentsRequestBody;
  const idn = other.searchString;
  let nameRecipient, idnRecipient, searchText;

  if (listType === 'product-statements') {
    searchText = other.searchString;
  } else {
    nameRecipient = /^\d+$/.test(idn) ? undefined : idn;
    idnRecipient = /^\d+$/.test(idn) ? idn : undefined;
  }
  body = {
    baseFields: {
      orderASC: false,
      orderBy: 'DATE',
      dateRangeStart,
      dateRangeEnd,
      signatureStatus: other.signatureStatus || undefined,
      statuses: other.statuses || undefined,
    },
    // documentType: 'REGULAR',
    documentTypeList,
    documentType,
    // documentSubType: 'REGULAR',
    idnRecipient: idnRecipient || undefined,
    nameRecipient: nameRecipient || undefined,
    documentNumber: other.documentNumber || undefined,
    amountFrom: other.amountFrom || undefined,
    amountTo: other.amountTo || undefined,
    searchText: searchText || undefined,
  };
  if (other.listType && other.listType === 'documents-signing') {
    body.baseFields.signatureStatus = 'MY_SIGNATURE';
    body.baseFields.statuses = ['NEWDOC'];
    body.source = 'WEB';
  }
  return body;
}

export const dateParsingFormat = 'YYYY-MM-DD hh:mm:ss';
export const dateFormat = 'DD.MM.YYYY';
export const requestDateFormat = 'YYYY-MM-DD';
export const statementRequestDateFormat = 'YYYY-MM-DD 00:00:00';
export const mmmmDateFormat = 'DD MMMM YYYY';
export const timeFormat = 'HH:mm';
export const todayFormat = 'DD MMMM';
export const operationPeriod = 'MMYYYY';
export const periodFormat = 'MMMM YYYY';

export const operationTableColumns = [
  {
    status: true,
    name: 'operation',
    label: 'default.operation',
    readOnly: true,
  },
  {
    status: true,
    name: 'operation',
    label: 'operations.default.details',
    readOnly: true,
  },
  {
    status: true,
    name: 'amount',
    label: 'operations.payments.sum',
    readOnly: true,
  },
];
export const statementTableColumns = [
  {
    status: true,
    name: 'operation',
    label: 'default.date',
    readOnly: false,
  },
  {
    status: true,
    name: 'operation',
    label: 'operations.default.details',
    readOnly: true,
  },
  {
    status: true,
    name: 'amount',
    label: 'operations.payments.sum',
    readOnly: false,
  },
];
export const productStatementTableColumns = [
  {
    status: true,
    name: 'operation',
    label: 'default.applications',
    readOnly: true,
  },
  {
    status: true,
    name: 'operation',
    label: 'products.default.details',
    readOnly: true,
  },
  { status: true, name: 'amount', label: 'default.status', readOnly: true },
];
export const contractListTableColumns = [
  {
    status: true,
    name: 'contragent',
    label: 'default.contragent',
    readOnly: true,
  },
  {
    status: true,
    name: 'contract-number',
    label: 'currencyControl.contracts.number',
    readOnly: true,
  },
  {
    status: true,
    name: 'amount',
    label: 'currencyControl.contracts.date',
    readOnly: true,
  },
  {
    status: true,
    name: 'operation',
    label: 'currencyControl.contracts.expiryDate',
    readOnly: true,
  },
  {
    status: true,
    name: 'amount',
    label: 'operations.payments.sum',
    readOnly: true,
  },
];
export const statusList = {
  DRAFT: {
    clName: 'new-doc',
    icon: './assets/icons/newdoc.svg',
    label: 'status.just-created',
  },
  NEWDOC: {
    clName: 'sign',
    icon: './assets/icons/forSign.svg',
    label: 'status.for-signature',
  },
  INJECTED: {
    clName: 'new-doc',
    icon: './assets/icons/newdoc.svg',
    label: 'status.injected',
  },
  SIGN_DEAL: {
    clName: 'sign',
    icon: './assets/icons/forSign.svg',
    label: 'status.for-signature',
  },
  IN_PROGRESS: {
    clName: 'in-progress',
    icon: './assets/icons/inProgress.svg',
    label: 'status.in-progress',
  },
  PENDING: {
    clName: 'in-progress',
    icon: './assets/icons/inProgress.svg',
    label: 'status.pending',
  },
  CORRECTION: {
    clName: 'in-progress',
    icon: './assets/icons/inProgress.svg',
    label: 'status.correction',
  },
  REWORK: {
    clName: 'in-progress',
    icon: './assets/icons/rework.svg',
    label: 'status.rework',
  },
  FULFILLED: {
    clName: 'approved',
    icon: './assets/icons/approved.svg',
    label: 'status.fulfilled',
  },
  APPROVED: {
    clName: 'approved',
    icon: './assets/icons/approved.svg',
    label: 'status.fulfilled',
  },
  SUFFICIENT: {
    clName: 'approved',
    icon: './assets/icons/approved.svg',
    label: 'status.sufficient',
  },
  SIGN_DEAL_COMPLETED: {
    clName: 'approved',
    icon: './assets/icons/approved.svg',
    label: 'status.sign-deal-completed',
  },
  FAILURE: {
    clName: 'failure',
    icon: './assets/icons/failure.svg',
    label: 'status.failure',
  },
  REJECTED: {
    clName: 'failure',
    icon: './assets/icons/failure.svg',
    label: 'status.failure',
  },
  REJECTION: {
    clName: 'failure',
    icon: './assets/icons/failure.svg',
    label: 'status.failure',
  },
  REFUSED: {
    clName: 'failure',
    icon: './assets/icons/failure.svg',
    label: 'status.failure',
  },
  SIGN_DEAL_CANCELLED_CLIENT: {
    clName: 'failure',
    icon: './assets/icons/failure.svg',
    label: 'status.sign-deal-cancelled-client',
  },
  EXPIRED: {
    clName: 'failure',
    icon: './assets/icons/failure.svg',
    label: 'status.expired',
  },
  REMOVED: {
    clName: 'failure',
    icon: './assets/icons/failure.svg',
    label: 'status.removed',
  },
};

export const statusListKeys = Object.keys(statusList);

export const reportFormatLists = [
  { code: 'pdf', label: 'PDF' },
  { code: 'xls', label: 'Excel' },
  { code: '1c', label: '1C' },
  { code: 'txt', label: 'МТ940' },
];

export const cardReportFormatLists = [
  { code: 'pdf', label: 'PDF' },
  { code: 'xlsx', label: 'Excel' },
  // { code: '1C', label: '1C' },
  // { code: 'mt', label: 'MT' },
];

export const redirectRoutes = ['account', 'card', 'deposit', 'credit'];

export const depositTypes = ['сumulative', 'flexible', 'express'];
export const depositMinAmount = [
  { name: 'express', minAmount: 2000 },
  //{ name: 'сumulative', minAmount: null },
  //{ name: 'flexible', minAmount: null }
];
export const currencyTransferCurrencies = [
  'USD',
  'RUB',
  'EUR',
  'GBP',
  'CNY',
  'KGS',
]; //['USD','RUB', 'EUR', 'CHF', 'GBP', 'KGS', 'JPY', 'CNY', 'AED', 'CAD', 'SEK', 'AUD', 'TRY', 'TJS', 'UZS']

export const accountStatuses = {
  open: 'открыт',
};

export const FILE_SIZE_20MB = 20 * 1024 * 1024; //20mb

export const returnOperationType = (code: string): string => {
  switch (code) {
    case 'PAY_ORDER_V2':
      return 'counteragent';
    case 'PAY_BUDGET':
      return 'budget';
    case 'PAY_MEDICAL_INSURANCE':
      return 'osms';
    case 'PAY_SOCIAL_V2':
      return 'social';
    case 'PAY_SALARY_V2':
      return 'salary';
    case 'PAY_PENSION_V2':
      return 'retirement';
    default:
      return '';
  }
};

export const opeartions2FA = [
  'PAY_ORDER_V2',
  'counteragent', // Платеж контрагенту
  'CURR_ORDER_V2',
  'CURR_ORDER_RUBLE',
  'PAY_SALARY_V2', // Зарплатный платеж
  'salary', // Зарплатный платеж
  'accounts', // Перевод м/у счетами
];

export const productsList = [
  {
    title: 'products.default.finance',
    list: [
      { icon: 'accounts', text: 'accounts.accounts', type: 'accounts' },
      { icon: 'cards', text: 'accounts.cards', type: 'cards' },
      { icon: 'deposits', text: 'accounts.deposits', type: 'deposits' },
      { icon: 'credits', text: 'accounts.credits', type: 'credits' },
    ],
  },
  {
    title: 'products.default.paymentAccept',
    list: [
      {
        icon: 'trade-acquiring',
        text: 'products.default.tradeAcquiring',
        type: 'trade-acquiring',
      },
      {
        icon: 'internet-acquiring',
        text: 'products.default.internetAcquiring',
        type: 'internet-acquiring',
      },
      {
        icon: 'homebank',
        text: 'products.default.get-payment-hb',
        type: 'homebank',
      },
    ],
  },
  {
    title: 'products.default.purchaseTenders',
    list: [
      {
        icon: 'guarantees',
        text: 'products.default.guarantees',
        type: 'guarantees',
      },
    ],
  },
  {
    title: 'products.default.attract-customers',
    list: [
      { icon: 'halyk-market', text: 'Halyk Market', type: 'halyk-market' },
      { icon: 'halyk-club', text: 'Halyk Club', type: 'halyk-club' },
    ],
  },
  {
    title: 'products.default.services',
    list: [
      // { Отключен на бою
      //   icon: 'certificate',
      //   text: 'products.default.certificates',
      //   type: 'certificates',
      // },
      {
        icon: 'encashment',
        text: 'products.default.encashment',
        type: 'encashment',
      },
    ],
  },
];
