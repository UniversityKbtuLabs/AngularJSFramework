import { GUARANTEES_STATUSES } from '@modules/guarantees/dictionaries/guarantees-statuses';

export const LOGIN = '/login';
export const WELCOME = '/home';
export const OPERATIONS = '/operations';
export const PRODUCTS = '/products';
export const HOME_OPERATIONS = '/home/operations';
export const SETTINGS = '/settings';

export const PAYMENT = OPERATIONS + '/payment';
export const CONTRAGENT = PAYMENT + '/counteragent';
export const SALARY = PAYMENT + '/salary';
export const RETIREMENT = PAYMENT + '/retirement';
export const SOCIAL = PAYMENT + '/social';
export const OSMS = PAYMENT + '/osms';
export const BUDGET = PAYMENT + '/budget';
export const IMPORT_PAYMENT = PAYMENT + '/import';
export const CONFIRM = PAYMENT + '/:type' + '/confirm';
export const SIGN_CONFIRM = PAYMENT + '/:type' + '/sign-confirm';

export const TRANSFER = OPERATIONS + '/transfer';
export const ACCOUNTS = TRANSFER + '/accounts';
export const CARD = TRANSFER + '/card';
export const TRANSFER_CONFIRM = TRANSFER + '/:type' + '/confirm';

export const GUARANTEES = '/guarantees/';
export const GUARANTEES_NEW = GUARANTEES + GUARANTEES_STATUSES.new;
export const GUARANTEES_EXISTING = GUARANTEES + GUARANTEES_STATUSES.existing;

export const TARIFFS = SETTINGS + '/tariffs';
export const CURRENCY_CONTROL = '/currency-control';
export const CURRENCY_CONTROL_CONTRACT_CREATE =
  '/currency-control/contract-creation';

export const CONVERTATION = CURRENCY_CONTROL + '/convertation';
export const CURRENCY_TRANSFER = CURRENCY_CONTROL + '/currency-transfer';
