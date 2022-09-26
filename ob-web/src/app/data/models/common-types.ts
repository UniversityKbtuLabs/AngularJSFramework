export interface DropDownList {
  code: string;
  value: string;
}

export interface ListTypes {
  code: string;
  label: string;
}

export interface AccountOperations {
  code: string;
  value: string;
  icon: string;
  actions: DropDownList[];
}

export interface CodeNameDictionary {
  id: number;
  code: string;
  name: string;
}

export interface IEmployee {
  id?: number | null;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  birthDay?: string | Date;
  birthday?: string | Date;
  account?: string;
  iin?: string;
  amount?: number;
  checked?: boolean;
  period?: string | Date;
  sic?: string;
  payType?: string;
  firstNameReg?: string;
  lastNameReg?: string;
  middleNameReg?: string;
  bankName?: string;
}

export interface StaffDictionaries {
  content?: IEmployee[];
  totalElements?: number;
  totalPages?: number;
  currentPage?: number;
  numberOfElements?: number;
  isFirst?: boolean;
  isLast?: boolean;
}

export interface IPushNotification {
  title: string;
  type: string;
}

export interface IUserInfo {
  name: string;
  companyName: string;
}

export interface IDocument {
  beginDate?: string | Date;
  birthDate?: string | Date;
  endDate?: string | Date;
  iIvalidityDate?: string | Date;
  invalidityDateSpecified?: boolean;
  issueOrganization?: string;
  issueOrganizationCode?: string;
  name?: string;
  number?: string;
  patronymic?: string;
  status?: string;
  statusCode?: string;
  surname?: string;
  type?: string;
  typeCode?: string;
}

export interface IFullInfoByIin {
  birthCity?: string;
  birthCountryCode?: string;
  birthCountryNameRu?: string;
  birthDate?: string | Date;
  birthDistrictCode?: string;
  birthDistrictNameRu?: string;
  birthRegionCode?: string;
  birthRegionNameRu?: string;
  building?: string;
  city?: string;
  countryCode?: string;
  countryNameRu?: string;
  districtCode?: string;
  districtNameRu?: string;
  document: IDocument;
  foreignRegionName?: string;
  genderCode?: string;
  genderNameRu?: string;
  name?: string;
  patronymic?: string;
  regionCode?: string;
  regionNameRu?: string;
  requestGBDFLResult?: string;
  street?: string;
  surname?: string;
  citizenshipCountryCode?: string;
  citizenshipCountryNameRu?: string;
  lifeStatusCode?: string;
}
export interface IPaymentOperation {
  receiver?: string;
  sum?: string;
}
