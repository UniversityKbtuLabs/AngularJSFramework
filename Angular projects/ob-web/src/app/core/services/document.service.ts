import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  IAccauntantSigner,
  IBudget,
  ICheifSigner,
  IPaymentOsms,
  IPaymentPension,
  IPaymentSalary,
  IPaymentSocial,
  IPayOrder,
  ISigner,
} from '@app/data/models/document-type';
import { IPrefill } from '@app/data/models/payment-types';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { POST_CURRENCY_CONTRACT, UPLOAD_PAYMENT } from '../constants/apiUrls';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private baseUrl = environment.baseUrl;
  firstChiefSigner$: BehaviorSubject<any> = new BehaviorSubject({});
  chiefSigners$: BehaviorSubject<ICheifSigner[]> = new BehaviorSubject([]);

  //используется в настройках
  public signersChief$ = new BehaviorSubject<ISigner[]>([]);
  public signersAccountant$ = new BehaviorSubject<ISigner[]>([]);
  public allSigners$ = new BehaviorSubject<ISigner[]>([]);
  /////////////////////////////////////////////////////////////////////
  public documentFiles$ = new BehaviorSubject<File[]>([]);
  public currencyTransferFiles$ = new BehaviorSubject<File[]>([]);

  accountantSigner$: BehaviorSubject<any> = new BehaviorSubject({
    name: 'Не предусмотрен',
  });
  accountantSigners$: BehaviorSubject<ICheifSigner[]> = new BehaviorSubject([]);

  public dataTemplate$: BehaviorSubject<any> = new BehaviorSubject(null);
  currentTemplate$ = this.dataTemplate$.asObservable();

  constructor(private http: HttpClient) {}

  sendPensionPrefill(body: IPaymentPension): Observable<any> {
    return this.http.post(
      this.baseUrl + '/document-gateway/documents/pay-pension/send',
      body,
      { observe: 'response' }
    );
  }

  savePensionPrefill(body: IPaymentPension): Observable<any> {
    return this.http.post(
      this.baseUrl + '/document-gateway/documents/pay-pension/save',
      body,
      { observe: 'response' }
    );
  }

  sendOSMSPrefill(body: IPaymentOsms): Observable<any> {
    return this.http.post(
      this.baseUrl + '/document-gateway/documents/pay-pension/send-osms',
      body,
      { observe: 'response' }
    );
  }

  saveOSMSPrefill(body: IPaymentOsms): Observable<any> {
    return this.http.post(
      this.baseUrl + '/document-gateway/documents/pay-pension/save',
      body,
      { observe: 'response' }
    );
  }

  sendSocailPrefill(body: IPaymentSocial): Observable<any> {
    return this.http.post(
      this.baseUrl + '/document-gateway/documents/pay-social/send',
      body,
      { observe: 'response' }
    );
  }

  saveSocailPrefill(body: IPaymentSocial): Observable<any> {
    return this.http.post(
      this.baseUrl + '/document-gateway/documents/pay-social/save',
      body,
      { observe: 'response' }
    );
  }

  sendSalaryPrefill(body: IPaymentSalary): Observable<any> {
    return this.http.post(
      this.baseUrl + '/document-gateway/documents/pay-salary/send',
      body,
      { observe: 'response' }
    );
  }

  saveSalaryPrefill(body: IPaymentSalary): Observable<any> {
    return this.http.post(
      this.baseUrl + '/document-gateway/documents/pay-salary/save',
      body,
      { observe: 'response' }
    );
  }

  getPayOrderPrefill(): Observable<IPayOrder> {
    return this.http.get<IPayOrder>(
      this.baseUrl + '/document-gateway/documents/pay-order/pre-fill/default'
    );
  }

  getBudgetPrefill(): Observable<IBudget> {
    return this.http.get<IBudget>(
      this.baseUrl + '/document-gateway/documents/pay-budget/pre-fill/default'
    );
  }

  getSignersChief(): Observable<ICheifSigner[]> {
    return this.http.get<ICheifSigner[]>(
      this.baseUrl +
        '/document-gateway/dictionaries/search-client-signers-chief'
    );
  }

  getSignersAccountant(): Observable<IAccauntantSigner[]> {
    return this.http.get<IAccauntantSigner[]>(
      this.baseUrl +
        '/document-gateway/dictionaries/search-client-signers-accountant'
    );
  }

  getPayOrderCommission(body: any): Observable<any> {
    return this.http.post<Number>(
      this.baseUrl + '/document-gateway/documents/pay-order/get-commission',
      body
    );
  }

  getPayBudgetCommission(body: IBudget): Observable<any> {
    return this.http.post<Number>(
      this.baseUrl + '/document-gateway/documents/pay-budget/get-commission',
      body
    );
  }

  // TODO: Функция возвращает Observable<Object>, а генерик: Number. Что там реально возвращается?
  getPaymentCommission(body: any, type: string): Observable<Object> {
    return this.http.post<Number>(
      this.baseUrl + `/document-gateway/${type}`,
      body
    );
  }

  // TODO: Функция возвращает Observable<Object>, а генерик: Number. Что там реально возвращается?
  getPaymentCommissionP2P(body: any, type: string): Observable<Object> {
    return this.http.get<Number>(
      this.baseUrl + `/document-gateway/${type}`,
      body
    );
  }

  getBetweenAccountTransferCommission(body: any): Observable<Object> {
    return this.http.post<Number>(
      this.baseUrl + `/document-gateway/documents/pay-local/get-commission`,
      body
    );
  }

  sendPayOrder(body: any): Observable<Object> {
    // A2A
    return this.http.post(
      this.baseUrl + '/document-gateway/documents/pay-order/send',
      body,
      { observe: 'response' }
    );
  }

  // postPayToCard(body: any): Observable<Object> {
  //   // A2C
  //   return this.http.post(
  //     this.baseUrl + '/document-gateway/documents/pay-to-card/send',
  //     body,
  //     { observe: 'response' }
  //   );
  // }

  // postPayFromCard(body: any): Observable<Object> {
  //   // c2a
  //   return this.http.post(
  //     this.baseUrl + '/document-gateway/documents/pay-order-from-card/send',
  //     body,
  //     { observe: 'response' }
  //   );
  // }

  sendTransferPayment(body: any): Observable<Object> {
    return this.http.post(
      this.baseUrl + '/document-gateway/documents/pay-local/send',
      body,
      { observe: 'response' }
    );
  }

  savePayOrder(body: any): Observable<any> {
    return this.http.post(
      this.baseUrl + '/document-gateway/documents/pay-order/save',
      body,
      { observe: 'response' }
    );
  }

  sendPayBudget(body: IBudget): Observable<any> {
    return this.http.post(
      this.baseUrl + '/document-gateway/documents/pay-budget/send',
      body,
      { observe: 'response' }
    );
  }

  savePayBudget(body: IBudget): Observable<any> {
    return this.http.post(
      this.baseUrl + '/document-gateway/documents/pay-budget/save',
      body,
      { observe: 'response' }
    );
  }

  getPayOrderById(id: number): Observable<IPayOrder> {
    return this.http.get<IPayOrder>(
      this.baseUrl +
        `/document-gateway/documents/pay-order/get-payment-by-id?sentDocId=${id}`
    );
  }

  getSavedOrderById(id: number): Observable<IPayOrder> {
    return this.http.get<IPayOrder>(
      this.baseUrl +
        `/document-gateway/documents/pay-order/get-payment-by-saved-id?savedDocId=${id}`
    );
  }

  getPayBudgetById(id: number): Observable<IBudget> {
    return this.http.get<IBudget>(
      this.baseUrl +
        `/document-gateway/documents/pay-budget/get-payment-by-id?sentDocId=${id}`
    );
  }

  getSavedBudgetById(id: number): Observable<IBudget> {
    return this.http.get<IBudget>(
      this.baseUrl +
        `/document-gateway/documents/pay-budget/get-payment-by-saved-id?savedDocId=${id}`
    );
  }

  getPaymentsById(type: string, id: number): any {
    return this.http.get(
      this.baseUrl +
        `/document-gateway/documents/${type}/get-payment-by-id?sentDocId=${id}`
    );
  }

  getSavedPaymentsById(type: string, id: number): Observable<any> {
    return this.http.get(
      this.baseUrl +
        `/document-gateway/documents/${type}/get-payment-by-saved-id?savedDocId=${id}`
    );
  }

  getPreFill(type: string): Observable<IPrefill> {
    return this.http.get<IPrefill>(
      `${this.baseUrl}/document-gateway/documents/${type}`
    );
  }

  sendConvertationFx(requestBody: any) {
    return this.http.post(
      `${this.baseUrl}/document-gateway/documents/curr-exchange/fx/send`,
      requestBody
    );
  }

  // 'https://testapi.onlinebank.kz/internal/document-gateway/documents/import-payment/1c',

  uploadPayment(file: FormData, headers: HttpHeaders): Observable<any> {
    return this.http.post<any>(
      `${environment.baseUrl}${UPLOAD_PAYMENT}`,
      file,
      { headers }
    );
  }

  sendCurrencyTransfer(body: any) {
    return this.http.post<any>(
      environment.baseUrl +
        '/document-gateway/documents/curr-order/send-with-files/v2',
      body,
      { observe: 'response' }
    );
  }

  getLocalFile(url: string) {
    return this.http.get<any>(url, {
      params: {},
      responseType: 'blob' as 'json',
    });
  }

  sendCurrencyContract(file: FormData, headers: HttpHeaders): Observable<any> {
    return this.http.post(
      `${this.baseUrl + POST_CURRENCY_CONTRACT}?source=NEW_WEB`,
      file,
      { headers, observe: 'response' }
    );
  }
}
