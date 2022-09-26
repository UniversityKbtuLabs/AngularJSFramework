export interface IBillInfo {
  accountIban?: string;
  amountBalance?: number;
  amountBlocked?: number;
  amountLimit?: number;
  cardExpire?: string;
  clientId?: number;
  clientIdRef?: number;
  contractId?: number;
  contractName?: string;
  contractNumber?: string;
  contractNumberChild?: string;
  contractOwnerId?: number;
  contractType?: string;
  corpCardType?: string;
  currencyCode?: string;
  dateExpire?: any;
  iin?: string;
  institution?: string;
  level?: number;
  levelName?: string;
  product?: string;
  productCode?: string;
  seeMain?: string;
  valid?: string;
}

export interface ICurrAccountsInfo extends IBillInfo {
  absState?: string;
  accessType?: number;
  accountBranchEQName?: string;
  active?: string;
  actualBalance?: number;
  amountLocked?: number;
  closed?: string;
  currency?: string;
  currentSaldo?: number;
  dictId?: number;
  iban?: string;
  inRemainder?: number;
  oldKKBIban?: string;
  outRemainder?: number;
  turnOnCredit?: number;
  turnOnDebet?: number;
  type?: string;
}
