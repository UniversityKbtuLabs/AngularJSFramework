export interface IKnp {
  id: number;
  code: string;
  name: string;
  payOrder: string;
  showPriority: number;
  shortName: string;
}

export interface IRegion {
  parentId: string;
  parentName: string;
}

export interface IUGD {
  id: number;
  bin: string;
  name: string;
  bic: string;
  iik: string;
  code: string;
}
export interface IBudgetPayment {
  id: number;
  knp: string;
  knpName: string;
  cbc: string;
  cbcName: string;
  payType: string;
  priority: number;
}
export interface IKnpWithCbc {
  content: IBudgetPayment[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  numberOfElements: number;
  isFirst: boolean;
  isLast: boolean;
}

export interface IBank {
  bankLogoURI: string;
  bankName: string;
  bankShortName: string;
  bic: string;
  code: string;
  id: number;
}
