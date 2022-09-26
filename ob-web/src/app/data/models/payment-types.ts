export interface IKNPFormatted {
  code: string;
  label: string;
  description: string;
}

export interface IKNP {
  id: number;
  code: string;
  name: string;
  payOrder?: string;
  showPriority?: string | null;
  shortName: string;
}

export interface IPaymentInfo {
  name: string;
  title: string;
  url: string;
  commissionUrl: string;
  code: string;
}

export interface IPayment {
  osms: IPaymentInfo;
  retirement: IPaymentInfo;
  salary: IPaymentInfo;
  social: IPaymentInfo;
}

export type IPaymentsList = 'osms' | 'retirement' | 'salary' | 'social';

export interface IPrefill {
  description?: string;
  currencyContractExists?: boolean;
  els?: string;
  id?: number;
  infoRecipient?: string;
  isNdsCountFlag?: boolean;
  kbe?: string;
  ndsCountFlag?: boolean;
  period?: string;
  purpose?: string;
  source?: string;
  subType?: string;
  taxCommitteeParent?: string;
  urgent?: boolean;
  docDate: string;
  example?: string;
  valDate: string;
  docNum: string;
  minLength: number;
  maxLength: number;
  amount: number;
  nameRecipient: string;
  accountRecipient: string;
  idnRecipient: string;
  bankNameRecipient?: string;
  bicBankRecipient: string;
  nameSender?: string;
  accountSender: string;
  bicMiddleBank?: string;
  accountMiddleBank?: string;
  middleBankNam?: string;
  cbcCode?: string;
  cbcName?: string;
  knpCode: string;
  knpName: string;
  vinCode: string;
  chief: string;
  chiefAccountant: string;
}

export interface IEmployeeInfo {
  id: number;
  firstName: string;
  lastName: string;
  birthday: string;
  payType: string | null;
  iin: string;
  period: string;
  amount: 1000;
}

export interface IEmployeeInfo {
  id: number;
  firstName: string;
  lastName: string;
  birthday: string;
  payType: string | null;
  iin: string;
  period: string;
  amount: 1000;
}

export interface IPaymentSendParams {
  accountRecipient: string;
  accountSender: string;
  amount: number;
  bankNameRecipient: string;
  bicBankRecipient: string;
  chief: string;
  chiefAccountant: string;
  docDate: string;
  docNum: string;
  id: number;
  idnRecipient: string;
  kbe: string;
  knpCode: string;
  knpName: string;
  nameRecipient: string;
  nameSender: string;
  pensionList: IEmployeeInfo[];
  purpose: string;
  urgent: boolean;
  valDate: string;
}

export interface ICounteragent {
  id: number;
  account: string;
  name: string;
  city: string;
  country: string;
  bankName: string;
  bankBic: string;
  residencyName: string;
  residencyCode: string;
  secoName: string;
  secoCode: string;
  kpp: string;
  inn: string;
  idn: string;
  bankAddress: string;
  bankCountry: string;
  bankCity: string;
  bankAccount: string;
  bankNatCode: string;
}

export interface IContentCounteragent {
  content: ICounteragent[];
  currentPage: number;
  isFirst: boolean;
  isLast: boolean;
  numberOfElements: number;
  totalElements: number;
  totalPages: number;
}
