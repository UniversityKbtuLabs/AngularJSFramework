import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import {
  IBank,
  IKnp,
  IKnpWithCbc,
  IRegion,
  IUGD,
} from '@data/models/dictionary-types';
import {
  IContentCounteragent,
  ICounteragent,
  // ICounteragent,
  // IKNPFormatted,
} from '@app/data/models/payment-types';
import { errorMessage } from '../helpers';
import {
  GET_DELIVERY_CITIES,
  GET_DEPARTMENT_ADDRESS_BY_CITY,
  GET_DEPARTMENT_CITIES,
  GET_CONTRACT_FILIALS,
  GET_CONTRACT_SUBJECTS,
  GET_CONTRACT_TYPES,
  GET_CURRENCIES,
  GET_FOREIGN_COUNTRIES,
  GET_THIRD_PARTY_COUNTRIES,
  GET_VALCON_CURRENCY_CONTRACTS,
} from '../constants/apiUrls';

@Injectable({
  providedIn: 'root',
})
export class DictionaryService {
  private baseUrl = environment.baseUrl;
  public ugdListLoading$ = new BehaviorSubject<boolean>(false);
  public ugdList$ = new BehaviorSubject<any>([]);
  observableUugdList$ = this.ugdList$.asObservable();
  public counteragents$ = new BehaviorSubject<ICounteragent[]>([]);
  public halykBankContragents = new BehaviorSubject<ICounteragent[]>([]);
  public otherBanksContragents = new BehaviorSubject<ICounteragent[]>([]);

  public counteragentListLoading$ = new BehaviorSubject<boolean>(false);
  public accountInfoLoading$ = new BehaviorSubject<boolean>(false);
  public counteragentList$ = new BehaviorSubject<any>({});
  observableCounteragentList$ = this.counteragentList$.asObservable();

  public accountInfo$ = new BehaviorSubject<any>([]);
  observableAccountInfo$ = this.accountInfo$.asObservable();

  public accountInfoError$ = new BehaviorSubject<any>(null);
  public observableAccInfoErr$ = this.accountInfoError$.asObservable();

  constructor(private http: HttpClient) {}

  searchCounteragent(name: any): Subscription {
    this.counteragentListLoading$.next(true);
    const url = `${this.baseUrl}/document-gateway/dictionaries/search-counteragents?search=${name}&pageNum=0&pageSize=100`;
    return this.http
      .get<IContentCounteragent>(url)
      .subscribe({
        next: (data: any) => this.setContragentList(data),
      })
      .add(() => this.counteragentListLoading$.next(false));
  }

  getCounteragents(): Observable<IContentCounteragent> {
    return this.http.get<IContentCounteragent>(
      this.baseUrl +
        `/document-gateway/dictionaries/search-counteragents?pageNum=0&pageSize=100`
    );
  }

  getCounteragentsPagination(
    num: number,
    pageSize: number
  ): Observable<IContentCounteragent> {
    return this.http.get<IContentCounteragent>(
      this.baseUrl +
        `/document-gateway/dictionaries/search-counteragents?pageNum=${num}&pageSize=${pageSize}`
    );
  }

  getCounteragentsByBankPagination(
    bik: string
  ): Observable<IContentCounteragent> {
    return this.http.get<IContentCounteragent>(
      this.baseUrl +
        `/document-gateway/dictionaries/search-counteragents?search=${bik}`
    );
  }

  getAccountInfoByIban(iban: any, toaster: any): Subscription {
    this.accountInfoLoading$.next(true);
    const url = `${this.baseUrl}/document-gateway/dictionaries/get-counteragent-by-account?account=${iban}`;
    return this.http.get<any>(url).subscribe({
      next: (data: any) => this.setAccountInfo(data),
      error: err => {
        errorMessage(err, toaster);
        this.accountInfoLoading$.next(false);
      },
      complete: () => {
        this.accountInfoLoading$.next(false);
      },
    });
  }

  getRegion(): Observable<IRegion[]> {
    return this.http.get<IRegion[]>(
      this.baseUrl + '/document-gateway/dictionaries/tax-committee-parent'
    );
  }

  getUGD(body: IRegion): Subscription {
    this.ugdListLoading$.next(true);
    return this.http
      .post<IUGD[]>(
        this.baseUrl +
          '/document-gateway/dictionaries/search-tax-committee-by-parent',
        body
      )
      .subscribe(
        (data: any) => {
          this.ugdListLoading$.next(false);
          this.setUgdList(data);
        },
        err => {
          this.ugdListLoading$.next(false);
        }
      )
      .add(() => {
        this.ugdListLoading$.next(false);
      });
  }

  setUgdList(ugds: any): void {
    this.ugdList$.next(ugds);
  }

  setContragentList(data: any): void {
    this.counteragentList$.next(data);
  }

  setAccountInfo(data: any): void {
    // this.counteragentList$.next(data)
    this.accountInfo$.next(data);
  }

  searchKnpWithCbc(search: string, payType: string): Observable<IKnpWithCbc> {
    return this.http.get<IKnpWithCbc>(
      this.baseUrl +
        '/document-gateway/dictionaries/search-knp-cbc-for-budget-payments-by-search-string' +
        `?payType=${payType}&pageNum=0&pageSize=20&search=${search}`
    );
  }

  searchKnp(query: any, payType: string): Observable<IKnp[]> {
    const params = query
      ? `query=${query}&payType=${payType}`
      : `payType=${payType}`;
    return this.http.get<IKnp[]>(
      this.baseUrl + `/document-gateway/dictionaries/search-knp?${params}`
    );
  }

  getBankName(bankIban: number): Observable<IBank> {
    return this.http.get<IBank>(
      this.baseUrl +
        `/document-gateway/dictionaries/get-bank-by-iban/?iban=${bankIban}`
    );
  }

  getBankList() {
    return this.http.get<any>(
      this.baseUrl + '/document-gateway/dictionaries/search-banks'
    );
  }

  getDepartmentCities(): Observable<any> {
    return this.http.get<any>(this.baseUrl + GET_DEPARTMENT_CITIES);
  }

  getDepartmentAddressByCity(city: string): Observable<any> {
    return this.http.post(
      this.baseUrl + GET_DEPARTMENT_ADDRESS_BY_CITY,
      { city: city },
      { observe: 'response' }
    );
  }

  getDeliveryCities(): Observable<any> {
    return this.http.get<any>(this.baseUrl + GET_DELIVERY_CITIES);
  }

  getCurrencies(): Observable<any> {
    return this.http.get<any>(this.baseUrl + GET_CURRENCIES);
  }

  getContractTypes(): Observable<any> {
    return this.http.get<any>(this.baseUrl + GET_CONTRACT_TYPES);
  }

  getSubjectList(): Observable<any> {
    return this.http.get<any>(this.baseUrl + GET_CONTRACT_SUBJECTS);
  }

  getForeignCountryList(): Observable<any> {
    const url = this.baseUrl + GET_FOREIGN_COUNTRIES + '?pageSize=500';
    return this.http.get<any>(`${url}`);
  }

  getThirdPartyTypeList(): Observable<any> {
    return this.http.get<any>(this.baseUrl + GET_THIRD_PARTY_COUNTRIES);
  }

  getBranchList(): Observable<any> {
    return this.http.get<any>(this.baseUrl + GET_CONTRACT_FILIALS);
  }

  getCurrencyControlUnk(): Observable<any> {
    return this.http.get<any>(
      this.baseUrl +
        `/document-gateway/dictionaries/currcontrol/search-unk-contracts`
    );
  }

  getAllCurrencyControlCountries(): Observable<any> {
    return this.http.get<any>(
      this.baseUrl +
        `/document-gateway/dictionaries/currcontrol/search-countries?pageSize=500`
    );
  }

  getCurrencyTransferCounteragents(): Observable<any> {
    return this.http.get<any>(
      this.baseUrl +
        '/document-gateway/dictionaries/search-counteragents-curr-order?pageSize=10000'
    );
  }

  getForeignBanks(data: any): Observable<any> {
    let params = new HttpParams()
      .set('isBic', data.isBic || false)
      .set('pageNum', data.pageNum)
      .set('search', data.search || '')
      .set('pageSize', data.pageSize);
    return this.http.get<any>(
      this.baseUrl + `/document-gateway/dictionaries/search-foreign-banks`,
      { params: params }
    );
  }

  getCurrencyTransferKnp(query: any): Observable<IKnp[]> {
    return this.http.get<IKnp[]>(
      this.baseUrl +
        `/document-gateway/dictionaries/search-knp-by-priority?query=${query}`
    );
  }

  getTransferOperationCodeRub(): Observable<any> {
    return this.http.get<any>(
      this.baseUrl + '/document-gateway/dictionaries/search-operation-code'
    );
  }

  getTransferPurposeCodeUae(): Observable<any> {
    //UAE Эмираты
    return this.http.get<any>(
      this.baseUrl +
        '/document-gateway/dictionaries/currcontrol?dictName=transaction-type-code-uae' /*'/document-gateway/dictionaries/search-transfer-purpose'*/
    );
  }

  getTransferPurposeCodeKgs(): Observable<any> {
    return this.http.get<any>(
      this.baseUrl + '/document-gateway/dictionaries/search-knp-kgs'
    );
  }

  getTransferPurposeCodeCny(): Observable<any> {
    return this.http.get<any>(
      this.baseUrl +
        '/document-gateway/dictionaries/currcontrol?dictName=transaction-type-code-cny'
    );
  }

  getOperationTypeCode(): Observable<any> {
    return this.http.get<any>(
      this.baseUrl +
        '/document-gateway/dictionaries/currcontrol?dictName=transaction-type-code-rub'
    );
  }

  getCurrencyBudgetPaymentType(): Observable<any> {
    // field n-10
    return this.http.get<any>(
      this.baseUrl +
        '/document-gateway/dictionaries/currcontrol?dictName=transfer-n10'
    );
  }

  getCurrencyBudgetPaymentReason(): Observable<any> {
    // field n-6
    return this.http.get<any>(
      this.baseUrl +
        '/document-gateway/dictionaries/currcontrol?dictName=transfer-n6'
    );
  }
}
