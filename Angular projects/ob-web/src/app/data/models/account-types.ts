export interface TabsObject {
  code: string;
  value: string;
}

export type Tabs = TabsObject[];

export interface IAccountInfo {
  absState?: string;
  accessType?: number;
  accountBranchEQName?: string | null;
  active?: string;
  actualBalance: number;
  amountLocked: number;
  closed?: string;
  contractId: number;
  currency: string;
  currentSaldo: number;
  dictId: number;
  iban: string;
  inRemainder: number;
  lockedReasons: string[];
  oldKKBIban: string;
  outRemainder: number;
  turnOnCredit: number;
  turnOnDebet: number;
  type?: string | null;
}

export interface ICardInfo {
  accountIban: string;
  amountBalance: number;
  amountBlocked?: number;
  amountLimit?: number;
  cardExpire?: string;
  clientId?: number;
  clientIdRef?: number;
  contractId: number;
  contractName?: string;
  contractNumber?: string;
  contractNumberChild?: string;
  contractOwnerId?: number;
  contractType: string;
  corpCardType?: string;
  currencyCode: string;
  dateExpire?: string;
  iin?: string;
  institution?: string;
  level?: number;
  levelName?: string;
  prodStatus?: string;
  product?: string;
  productCode?: string;
  seeMain?: string;
  valid?: string;
}

export type IDetailsInfo = IAccountInfo | ICardInfo;

export interface IFormattedAccounts {
  id: number;
  label: string;
  amount: number;
  currency: string;
  name: string;
  status: string;
  blockReason: string;
}

export interface IFormattedAccountKeys {
  id: string;
  label: string;
  amount: string;
  currency: string;
  name: string;
  status: string;
  blockReason: string;
}
export interface IFormattedAccount {
  id: string;
  label: string;
  amount: string;
  currency: string;
  name: string;
  status: string;
  blockReason: string;
  absState: string;
}
export interface IFormattedKeys {
  accounts: IFormattedAccount;
  cards: IFormattedAccountKeys;
  deposits: IFormattedAccountKeys;
  loans: IFormattedAccountKeys;
}

export type IAccountType = 'accounts' | 'cards' | 'deposits' | 'loans';

export interface ICreateAccount {
  docDate?: string;
  docNum?: string;
  clientName?: string;
  clientNameInternational?: string;
  bin?: string;
  residencyCode?: string;
  currency?: string;
  eqBaseNum?: string;
  secoCode?: string;
  branch?: string;
  branchCode?: string;
  chief?: string;
  chiefAccountant?: string;
  isSpecAcc?: boolean;
  source?: string;
}

export interface ICreateDeposit {
  docDate: string;
  docNum: string;
  accountSender: string;
  accountSenderId: string;
  amount: string;
  depositTerm: number;
  feeRate: string;
  feeAmount: string;
  individualRateCheck: boolean;
  isRefilAfterConv: boolean;
  canOpenDeposit: boolean;
  isBusinessDay: boolean;
  depositTypeCode: string;
  taxRate: string;
  version: string;
}

export interface ICreateBusinessCard {
  docNum: string;
  aimOfOpen: string;
  balanceAccounting: string;
  cardGettingType: string;
  cardType: string;
  codeWord: string;
  departmentAddress?: {
    branchAddress: string;
    city: string;
  };
  deliveryAddress?: {
    apartment?: string | undefined;
    building: string;
    city: string;
    street: string;
  };
  iin: string;
  phoneNum: string;
  other?: {};
}
