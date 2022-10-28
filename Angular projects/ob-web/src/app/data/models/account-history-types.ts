export interface ITableColumns {
  status: boolean;
  name: string;
  label: string;
  readOnly: boolean;
}

interface IRowOperation {
  type: string;
  sender?: string;
  details?: string;
}
export interface ITableRows {
  id?: number;
  checked?: boolean;
  date?: string;
  operation?: IRowOperation;
  documentNumber?: string;
  iin?: string;
  amount?: number;
  currency?: string;
  status?: string;
  needSign?: string;
  signed?: string;
  type?: string;
  statusHistory?: string;
  signatureStatus: string;
  statusDetails?: string;
  signHistory: ISignHistory[];
  accountRecipient?: string;
  accountSender?: string;
  nameRecipient?: string;
  bankRecipientName?: string;
  statementReceiver?: string;
  sentDate?: string;
  sentTime?: string;
  isToday: boolean;
  isAnotherDate: boolean;
  knpCode: string;
  cardHolder: string;
  depositType?: string;
}

export interface ISignHistory {
  date?: string;
  description: string;
  name: string;
}
export interface IDocumentInfo {
  id: number;
  docNum: string;
  amount: number;
  sentDate: string;
  edpContent: string;
  externalSystemData: string | null;
  documentType: string;
  documentSubType: string;
  status: string;
  statusDetails: string;
  statusHistory: string;
  signatureStatus: string;
  signHistory: ISignHistory[];
  signed: string;
  needSign: string;
  tag: string | null;
  contractId: number;
  recipient: string;
  purpose: string;
}

export interface IDocumentList {
  content: IDocumentInfo[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  numberOfElements: number;
  isFirst: boolean;
  isLast: boolean;
}

// ***Account***
export interface IAccount {
  accountRecipient?: string;
  accountRecipientBranch?: string;
  accountRecipientCode?: string;
  accountRecipientSuffix?: string;
  accountSender?: string;
  accountSenderBranch?: string;
  accountSenderCode?: string;
  accountSenderSuffix?: string;
  accountant?: string;
  amountRecipient?: number;
  amountSender?: number;
  cbc?: string;
  chief?: string;
  colvirRefer?: string;
  currency?: string;
  dateProvRecipient?: Date | string;
  dateProvSender?: Date | string;
  dateRecipient?: Date | string;
  dateSender?: Date | string;
  dateUpdate?: Date | string;
  dateVal?: Date | string;
  dateValueRecipient?: Date | string;
  dateValueSender?: Date | string;
  docDate?: string;
  documentNumber?: string;
  eqReference?: string;
  id?: number;
  kbeRecipient?: string;
  kbeSender?: string;
  knp?: string;
  knpCode?: string;
  mfoRecipient?: string;
  mfoSender?: string;
  nameRecipient?: string;
  nameSender?: string;
  paymentPurpose?: string;
  purposeRecipient?: string;
  purposeSender?: string;
  recipientBankName?: string;
  rnnRecipient?: string;
  rnnSender?: string;
  senderBankName?: string;
  statementDate?: Date | string;
  statementReceiver?: string;
  timeUpdate?: Date | string;
  transferCodeReceive?: string;
  transferCodeSend?: string;
  transferNameReceive?: string;
  transferNameSend?: string;
}

export interface IAccountDischarge {
  content?: IAccount[];
  totalElements?: number;
  totalPages?: number;
  currentPage?: number;
  numberOfElements?: number;
  isFirst?: boolean;
  isLast?: boolean;
}

export interface IAccountDTO {
  account?: string;
  amount?: string;
  amountMax?: string;
  amountMin?: string;
  counterAgentAccount?: string;
  counterAgentIDN?: string;
  counterAgentName?: string;
  dateEnd?: string;
  dateStart?: string;
  documentNumber?: string;
  orderASC?: boolean;
  orderBy?: string;
  statementType?: string;
}

// ***Card***
export interface ICard {
  amountBalance?: number;
  contractName?: string;
  currency?: string;
  entryId?: number;
  id?: number;
  requestedContractId?: number;
  statementDate?: Date | string;
  subCard?: string;
  subCardId?: number;
  transactionAmount?: number;
  transactionCity?: string;
  transactionCountry?: string;
  transactionCurrency?: string;
  transactionDate?: string;
  transactionDetails?: string;
  transactionFeeAmount?: number;
  transactionType?: string;
}

export interface ICardDischarge {
  cardNumber?: string;
  statements?: ICard[];
  contractId?: number;
  totalCredit?: string;
  totalDebet?: string;
  totalFee?: string;
  turnOver?: string;
  totalCreditQty?: string;
  totalDebetQty?: string;
  turnOverNumber?: number;
}

export interface ICardDTO {
  contractId?: number;
  rootContractId?: null;
  level?: number;
  currency?: null;
  dateEnd?: string;
  dateStart?: string;
  orderASC?: boolean;
}

// ***Deposit***
export interface IDeposit {
  clientCode?: string;
  contractNumber?: string;
  currencyCode?: string;
  depositAccount?: string;
  depositAmount?: number;
  depositClose?: string;
  depositOpen?: string;
  depositTerm?: number;
  id?: number;
  pay?: number;
  payNat?: number;
  rate?: number;
  reward?: number;
  rewardNat?: number;
  saldo?: number;
  saldoNat?: number;
  saldoPrc?: number;
  saldoPrcNat?: number;
  stmtColvirId?: number;
  tax?: number;
  taxNat?: number;
  taxRate?: number;
}

export interface IDepositDischarge {
  content: IDeposit[];
  currentPage: number;
  isFirst: boolean;
  isLast: boolean;
  numberOfElements: number;
  totalElements: number;
  totalPages: number;
}

export interface IDepositDTO {
  depositAccount?: string;
  clientCode?: null;
  currency?: null;
  dateEnd?: Date | string;
  dateStart?: Date | string;
  orderASC?: boolean;
}

export interface IOperationType {
  name: string;
  code: string;
}

export interface IOperationDate {
  name: string;
  code: string;
  startDate: string;
  endDate: string;
}

export interface IDraftBaseFields {
  contractId?: number;
  dateRangeEnd: string;
  dateRangeStart: string;
  editDocId?: number;
  orderASC: boolean;
  orderBy: string;
  signatureStatus?: string;
  statuses?: string[];
}
export interface IDraftParams {
  accountRecipient?: string;
  accountSender?: string;
  amount?: number;
  baseFields: IDraftBaseFields;
  bicBankRecipient?: string;
  documentNumber?: number;
  documentTypeList: string[];
  idnRecipient?: string;
  nameRecipient?: string;
}

export interface IDraft {
  id: number;
  docNum: string;
  amount: number;
  docDate?: string;
  valDate: string;
  savedDate: string;
  documentType: string;
  nameRecipient: string;
  contractNum?: string;
  purpose: string;
  accountRecipient: number;
  idnRecipient: string;
  nameSender?: string;
  accountSender?: string;
  bankNameRecipient: string;
  bicBankRecipient: string;
  knpCode?: number;
  knpName?: string;
  chief?: string;
  chiefAccountant?: string;
  branchName?: string;
}

export interface IDraftMain {
  content: IDraft[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  numberOfElements: number;
  isFirst: boolean;
  isLast: boolean;
}

// body = {
// 	baseFields: {
// 		orderASC: false,
// 		orderBy: 'DATE',
// 		dateRangeStart,
// 		dateRangeEnd,
// 		signatureStatus: other.signatureStatus || undefined,
// 		statuses: other.statuses || undefined
// 	},
// 	documentType: 'REGULAR',
// 	documentTypeList,
// 	documentSubType: 'REGULAR',
// 	idnRecipient: /^\d+$/.test(idn) ? idn : undefined,
// 	nameRecipient: /^\d+$/.test(idn) ? undefined : idn
// }

export interface IDocumentsRequestBody {
  baseFields: {
    orderASC: boolean;
    orderBy: 'DATE';
    dateRangeStart: string;
    dateRangeEnd: string;
    signatureStatus: string;
    statuses: String[] | undefined;
  };
  // documentType: string,
  documentTypeList: string[];
  documentType: string;
  // documentSubType: string,
  idnRecipient: string | undefined;
  nameRecipient?: string | undefined;
  searchText?: string | undefined;
  documentNumber?: number;
  amountFrom?: number;
  amountTo?: number;
  source?: string;
}
