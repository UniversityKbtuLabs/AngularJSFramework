export interface IP2PRequest {
  amount?: number;
  cardIdFrom?: number;
  cardIdTo?: number;
  cardTo: string;
  cardToName: string;
}

export interface IP2PSecuredRequest {
  phone?: string;
  code?: string;
  p2PRequest?: IP2PRequest;
}

export interface IBankBIN {
  id?: number;
  bank?: string;
  issuingSystem?: string;
  bankLogoURI?: string;
  issuerIdentificationNumber?: string;
}

export interface IStaff {
  id?: number;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  birthDay?: string;
  account?: string;
  iin?: string;
  amount?: string | number;
}

export interface ITransferInfo {
  name: string;
  title: string;
  commissionUrl: string;
}

export type ITransferList = 'accounts' | 'cards';

export interface ITransfer {
  accounts: ITransferInfo;
}

export const PAY_ORDER_PREFILL = 'pay-order/pre-fill/default';
export const PAY_TO_CARD_PREFILL = 'pay-to-card/pre-fill';
export const PAY_FROM_CARD_PREFILL = 'pay-order-from-card/pre-fill/default';

export interface ITransferPrefillResponse {
  accountRecipient?: string;
  accountSender?: string;
  amount?: number;
  accountMiddleBank?: string;
  bankNameRecipient?: string;
  bicBankRecipient?: string;
  docDate?: string;
  valDate?: string;
  docNum?: string;
  nameRecipient?: string;
  idnRecipient?: string;
  nameSender?: string;
  bicMiddleBank?: string;
  id?: number;
  middleBankName?: string;
  cbcCode?: string;
  cbcName?: string;
  knpCode?: string;
  knpName?: string;
  urgent?: boolean;
  purpose?: string;
  infoRecipient?: string;
  currencyContractExists?: boolean;
  vinCode?: string;
  kbe?: number;
  chief?: string;
  chiefAccountant?: string;
  isNdsCountFlag?: boolean;
  els?: string;
  subType?: string;
  period?: string;
  taxCommitteeParent?: string;
  source?: string;
}

const defaultPrefill = {
  accountRecipient: '',
  accountSender: '',
  amount: 0,
  accountMiddleBank: '',
  bankNameRecipient: '',
  bicBankRecipient: '',
  docDate: '',
  valDate: '',
  docNum: '',
  nameRecipient: '',
  idnRecipient: '',
  nameSender: '',
  bicMiddleBank: '',
  id: 0,
  middleBankName: '',
  cbcCode: '',
  cbcName: '',
  knpCode: '',
  knpName: '',
  urgent: false,
  purpose: '',
  infoRecipient: '',
  currencyContractExists: false,
  vinCode: '',
  kbe: 0,
  chief: '',
  chiefAccountant: '',
  isNdsCountFlag: false,
  els: '',
  subType: '',
  period: '',
  taxCommitteeParent: '',
  source: '',
};

export const TRANSFER_DETAILS = {
  bicBankRecipient: 'HSBKKZKX',
  bankNameRecipient: 'АО "Народный Банк Казахстана"', // Для A2C
  accountSenderCurrency: 'KZT',
  currencyContractExists: false,
  purpose: 'Перевод между своими счетами',
  // Для A2C
  purposeA2C:
    'Переводы клиентом денег с одного своего текущего счета, открытого в банке, ' +
    'на другой свой текущий счет, открытый в данном банке',
  source: 'WEB',
  chiefAccountant: 'Не предусмотрен',
  knpCode: '342', // TODO from user-info
  defaultPrefill,
  // Для A2C
  knpName:
    'Переводы клиентом денег с одного своего текущего счета, открытого в банке, на другой свой ' +
    'текущий счет, открытый в данном банке',
  kbe: 17,
};

export interface ITransferRequestBody {
  // Body запроса коммиссии
  accountSender?: string; // a2a
  accountRecipient?: string;
  accountSenderCurrency: string;
  amount: number;
  bicBankRecipient: string;
  bankNameRecipient?: string;
  chief: string;
  chiefAccountant: string;
  currencyContractExists: boolean;
  docDate: string;
  docNum: string;
  purpose: string;
  source: string;
  valDate: string;
  kbe: number;
  idnRecipient: string;
  nameRecipient: string;
  knpCode: string;
  knpName?: string; // a2c
  recipientIban?: string; // a2c
  senderIban?: string; // a2c
}

export interface IA2AComissionBodyRequest {
  // Body запроса коммиссии
  accountRecipient?: string;
  accountSender?: string; // a2a
  amount: number;
  bicBankRecipient: string;
  chief: string;
  chiefAccountant: string;
  currencyContractExists: boolean;
  docDate: string;
  docNum: string;
  idnRecipient: string;
  kbe: number;
  knpCode: string;
  nameRecipient: string;
  purpose: string;
  source: string;
  valDate: string;
}

export interface IA2CComissionBodyRequest {
  // Body запроса коммиссии
  accountSender?: string; // a2a
  amount: number;
  bicBankRecipient: string;
  chief: string;
  chiefAccountant: string;
  currencyContractExists: boolean;
  docDate: string;
  docNum: string;
  purpose: string;
  source: string;
  valDate: string;
  kbe: number;
  knpCode: string;
  recipientIban?: string; // a2c
  senderIban?: string; // a2c
}

export interface IA2CTransferBodyRequest {
  amount?: number;
  bicBankRecipient?: string;
  chief?: string;
  chiefAccountant?: string;
  currencyContractExists?: boolean;
  docDate?: string;
  docNum?: string;
  purpose?: string;
  source?: string;
  valDate?: string;
  kbe?: number;
  knpCode?: string;
  recipientIban?: string; // a2c
  senderIban?: string; // a2c
}

export interface IC2ATransferRequestBody {
  // Body запроса коммиссии
  accountSender?: string; // a2a
  accountRecipient?: string;
  amount: number;
  bicBankRecipient: string;
  bankNameRecipient?: string;
  chief: string;
  chiefAccountant: string;
  docDate: string;
  docNum: string;
  purpose: string;
  source: string;
  valDate: string;
  idnRecipient: string;
  nameRecipient: string;
  knpCode: string;
  knpName?: string; // a2c
  recipientIban?: string; // a2c
  senderIban?: string; // a2c
}
