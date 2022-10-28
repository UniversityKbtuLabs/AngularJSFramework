export interface IPayOrder {
  id?: number;
  docDate?: string;
  valDate?: string;
  docNum?: string;
  amount?: string;
  nameRecipient?: string;
  accountRecipient?: string;
  idnRecipient?: string;
  bankNameRecipient?: string;
  bicBankRecipient?: string;
  nameSender?: string;
  accountSender?: string;
  bicMiddleBank?: string;
  accountMiddleBank?: string;
  middleBankName?: string;
  cbcCode?: string;
  cbcName?: string;
  knpCode?: string;
  knpName?: string;
  urgent?: string;
  purpose?: string;
  infoRecipient?: string;
  currencyContractExists?: boolean;
  vinCode?: string;
  kbe?: string;
  chief?: string;
  chiefAccountant?: string;
  isNdsCountFlag?: boolean;
  els?: string;
  subType?: string;
  period?: string;
  taxCommitteeParent?: string;
  source?: string;
}

export interface ICheifSigner {
  id: number;
  name: string;
}

export interface IAccauntantSigner {
  id: number;
  name: string;
}

export class ISigner {
  id: number;
  name: string;
  type: string;

  constructor(id: number, name: string, type: string) {
    this.id = id;
    this.name = name;
    this.type = type;
  }
}

export interface IPayBudget {
  taxCommitteeName: string;
  bin: string;
  cbc: string;
  knp: string;
  purpose: string;
  amount: number;
  noVinCode: boolean;
  vinCode: string;
  period: string;
}

export interface IBudget {
  id?: number;
  docDate?: string;
  valDate?: string;
  docNum?: string;
  amount?: string;
  nameSender?: string;
  accountSender?: string;
  nameRecipient?: string;
  accountRecipient?: string;
  irsRecipient?: string;
  binRecipient?: string;
  secoRecipient?: string;
  bankNameRecipient?: string;
  bicBankRecipient?: string;
  routeType?: string;
  noCommission?: number;
  noAutoAuth?: string;
  residencySender?: string;
  secoSender?: string;
  eqFee?: string;
  opType?: string;
  feeCcy?: string;
  orkoUrgent?: string;
  kbe?: string;
  chief?: string;
  chiefAccountant?: string;
  isTemplate?: boolean;
  templateName?: string;
  knpCode?: string;
  source?: string;
  subType?: string;
  payBudgetList?: IPayBudget[];
}

export interface IPension {
  firstName: string;
  lastName: string;
  middleName: string;
  firstNameReg: string;
  lastNameReg: string;
  middleNameReg: string;
  iin: string;
  amount: 0;
  sic: string;
  birthday: string;
  period: string;
  payType: string;
}

export interface IPaymentOsms {
  id: string;
  docDate: string;
  valDate: string;
  docNum: string;
  amount: number;
  nameRecipient: string;
  accountRecipient: string;
  idnRecipient: string;
  nameSender: string;
  accountSender: string;
  bankNameRecipient: string;
  bicBankRecipient: string;
  knpCode: string;
  knpName: string;
  purpose: string;
  infoRecipient: string;
  urgent: string;
  kbe: string;
  chief: string;
  chiefAccountant: string;
  subType: string;
  pensionList: IPension[];
  source: string;
  comission?: string;
  collectivePeriod?: string;
  collectivePeriodDate?: string;
}

export interface ISalary {
  firstName: string;
  lastName: string;
  middleName: string;
  iin: string;
  amount: number;
  account: string;
  employeeId: number;
}

export interface IPaymentSalary {
  id: string;
  docDate: string;
  valDate: string;
  docNum: string;
  amount: number;
  nameRecipient: string;
  accountRecipient: string;
  idnRecipient: string;
  nameSender: string;
  accountSender: string;
  bankNameRecipient: string;
  bicBankRecipient: string;
  knpCode: string;
  knpName: string;
  purpose: string;
  infoRecipient: string;
  urgent: string;
  kbe: string;
  chief: string;
  chiefAccountant: string;
  accountSenderCurrency: string;
  subType: string;
  salaryList: ISalary[];
  source: string;
  comission?: string;
}

export interface ISocial {
  firstName: string;
  lastName: string;
  middleName: string;
  iin: string;
  amount: string;
  birthday: string;
  period: string;
  payType: string;
}

export interface IPaymentSocial {
  id: string;
  docDate: string;
  valDate: string;
  period: string;
  docNum: string;
  amount: number;
  nameRecipient: string;
  accountRecipient: string;
  idnRecipient: string;
  nameSender: string;
  accountSender: string;
  bankNameRecipient: string;
  bicBankRecipient: string;
  knpCode: string;
  knpName: string;
  purpose: string;
  infoRecipient: string;
  chief: string;
  chiefAccountant: string;
  kbe: string;
  urgent: string;
  subType: string;
  socialList: ISocial[];
  source: string;
  comission?: string;
  collectivePeriod?: string;
  collectivePeriodDate?: string;
}

export interface IPaymentPension {
  id: string;
  docDate: string;
  valDate: string;
  docNum: string;
  amount: number;
  nameRecipient: string;
  accountRecipient: string;
  idnRecipient: string;
  nameSender: string;
  accountSender: string;
  bankNameRecipient: string;
  bicBankRecipient: string;
  knpCode: string;
  knpName: string;
  purpose: string;
  infoRecipient: string;
  urgent: string;
  kbe: string;
  chief: string;
  chiefAccountant: string;
  subType: string;
  pensionList: IPension[];
  source: string;
  comission?: string;
  collectivePeriod?: string;
  collectivePeriodDate?: string;
}

export interface ITransferAccounts {
  accountSender: 'KZ566010251000041806';
  accountSenderCurrency: 'KZT';
  bicBankRecipient: 'HSBKKZKX';
  chief: 'Шарапаев Дмитрий Анатольевич';
  chiefAccountant: 'Не предусмотрен';
  currencyContractExists: false;
  docDate: '2022-01-20';
  docNum: 'ONB29D224';
  purpose: 'Перевод между своими счетами';
  source: 'MOBILE';
  valDate: '2022-01-20';
  kbe: '19';
  idnRecipient: '940640000716';
  nameRecipient: 'МАРГАРИТА';
  amount: 0.0;
}
