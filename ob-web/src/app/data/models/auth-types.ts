export interface IToken {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  inactive_period: number;
}
export interface IContracts {
  contractNum: number;
  name: string;
  bin: string;
  kbe: string;
  type: string;
  policy: string;
}

export interface IUser {
  name: string;
  loggedInBy: string;
  iin: string;
  phone: string;
}
export interface ICurrentContract {
  contractNum: number;
  name: string;
  bin: string;
  kbe: string;
  type: string;
  policy: string;
}
export interface IContractAccount {
  id: number;
  iban: string;
  currency: string;
  oldKKBIban: string;
}

export interface IPreApprovedLimit {
  preApprovedLimit: string;
}
export interface IUserInfo {
  user: IUser;
  scope: string;
  currentContract: ICurrentContract;
  currentContractAccounts: IContractAccount[];
  preapprovedLimit: IPreApprovedLimit;
  signatureGroupId: number;
  signatureDocumentaryGroupId: number;
  signatureTreasuryGroupId: number;
}
