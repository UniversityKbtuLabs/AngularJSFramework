import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';

import {
  GET_KNP_BY_CODE,
  PAY_PENSION,
  CONTRACTS_V2,
  GET_SAVED_CARDS,
  GET_SMS,
  SEND_BY_APP_CODE,
  GET_BANK_BY_ISSUER_IDENTIFICATION_NUMBER,
  GET_STAFF_LIST,
  DELETE_BY_ID_STAFF,
  ADD_NEW_STAFF,
  EDIT_STAFF,
  GET_FULL_INFO_BY_IIN_FROM_GBDFL,
  CURRENT_ACCOUNTS_BALANCED,
  DELETE_BY_ID_STAFF_LIST,
  GET_CARD_BY_ID,
  GET_HAS_RIGHTS_TO_SIGN,
  SEND_SIGN_P2P,
  GET_CONVERTATION_PREFILL,
  GET_EXCHANGE_PURPOSES,
  GET_VALCON_CONTRACTS,
  GET_SALARY_UNICODES,
  GET_CURRENCY_CONTRACT_PARAMS,
  CHECK_OPERDAY,
  VALIDATE_FX,
  HANDSHAKE_CREATE,
  GET_CURRENCY_CONTRACT_PREFILL,
  GET_CURRENCY_TRANSFER_PREFILL,
} from '@core/constants/apiUrls';
import { IKNP, IPrefill, IPaymentSendParams } from '@data/models/payment-types';
import {
  IEmployee,
  IFullInfoByIin,
  StaffDictionaries,
} from '@data/models/common-types';
import { IP2PSecuredRequest } from '@data/models/p2p-types';
import { IBillInfo, ICurrAccountsInfo } from '@data/models/bill-types';
import { environment } from '@env/environment';
import { IToken } from '@app/data/models/auth-types';
import { systemErrors } from '@app/core/constants';
import { errorMessage, getError } from '../helpers';
import { ToastrService } from 'ngx-toastr';
import { convertUpdateArguments } from '@angular/compiler/src/compiler_util/expression_converter';

@Injectable({
  providedIn: 'root',
})
export class OperationsService {
  selectedEmployee = new BehaviorSubject<IEmployee[]>([]);

  isSelect = new BehaviorSubject<boolean>(false);
  isConfirm = new Subject<boolean>();
  refresh$ = new Subject<void>();
  public staffList = new BehaviorSubject<IEmployee[]>([]);
  public halykBankStaffList = new BehaviorSubject<IEmployee[]>([]);
  public otherBanksStaffList = new BehaviorSubject<IEmployee[]>([]);

  public isLoading$ = new BehaviorSubject<boolean>(false);
  public numberSendError$ = new BehaviorSubject<string>('');
  public isNumberSend$ = new BehaviorSubject<boolean>(false);
  public isTokenLoading$ = new BehaviorSubject<boolean>(false);

  tableModalVisible$ = new BehaviorSubject<boolean>(true);
  isTableModalVisible$: Observable<boolean> =
    this.tableModalVisible$.asObservable();

  userRightsToSign$ = new BehaviorSubject<boolean>(true);
  isUserRightsToSign$: Observable<boolean> =
    this.userRightsToSign$.asObservable();

  convertationRefreshTime$ = new BehaviorSubject<number>(179);

  // public smsCodeValidatorSubscr$: Subscription

  staffListLastPage$ = new BehaviorSubject<number>(1);
  currenStaffListLastPage$: Observable<number> =
    this.staffListLastPage$.asObservable();
  public fxCurrentRates = new BehaviorSubject<any[]>([]);
  public fxCurrentRatesLoading = new BehaviorSubject<boolean>(false);

  public fxCurrencyDescriptions = new BehaviorSubject<any[]>([]);
  public fxCurrencyDescriptionsLoading = new BehaviorSubject<boolean>(false);

  public fxCurrencyTypeList = new BehaviorSubject<any[]>([]);
  public fxCurrencyTypeListLoading = new BehaviorSubject<boolean>(false);

  public fxHistoryRates = new BehaviorSubject<any[]>([]);

  public fxTradingSignals = new BehaviorSubject<any[]>([]);
  public fxTradingSignalsLoading = new BehaviorSubject<boolean>(false);

  options = {
    headers: new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    ),
  };

  constructor(private http: HttpClient, private toastrService: ToastrService) {}

  addEmployee(employees: IEmployee[]) {
    this.selectedEmployee.next(employees);
  }

  getTransferPrefill(type: string): Observable<IPrefill> {
    return this.http.get<IPrefill>(
      `${environment.baseUrl}/document-gateway/documents/${type}`
    );
  }

  getKnpByCode(
    code: string = '',
    paymentType: string = ''
  ): Observable<IKNP[]> {
    const params: { code: string; payType?: string } = { code };
    if (paymentType) {
      params.payType = paymentType;
    }
    return this.http.get<IKNP[]>(`${environment.baseUrl}${GET_KNP_BY_CODE}`, {
      params,
    });
  }

  payPensionPayment(params: IPaymentSendParams): Observable<any> {
    return this.http.post(`${environment.baseUrl}${PAY_PENSION}`, params);
  }

  getContracts_v2(): Observable<IBillInfo[]> {
    return this.http.get<IBillInfo[]>(
      `${environment.baseUrl}${GET_CARD_BY_ID}`
    );
  }

  getSavedCards(): Observable<any> {
    return this.http.get(`${environment.baseUrl}${GET_SAVED_CARDS}`);
  }

  getAccountsList(): Observable<ICurrAccountsInfo[]> {
    return this.http.get<ICurrAccountsInfo[]>(
      `${environment.baseUrl}${CURRENT_ACCOUNTS_BALANCED}`
    );
  }

  getBankByIssuerIdentificationNumber(bin: any): Observable<any> {
    return this.http.get(
      `${environment.baseUrl}${GET_BANK_BY_ISSUER_IDENTIFICATION_NUMBER}?issuerIdentificationNumber=${bin}`
    );
  }

  getSms(phone: string | null): Observable<Object> {
    return this.http.get(`${environment.baseUrl}${GET_SMS}${phone}`);
  }

  getToken(code: string): void {
    this.isTokenLoading$.next(true);
    let body = new URLSearchParams();
    body.set('client_id', environment.auth.clientID);
    body.set('grant_type', 'authorization_code');
    body.set('code_verifier', 'some_string');
    body.set('code', code);
    // TODO: (Review) Тут создается подписка и потом не удаляется
    this.http
      .post<IToken>(
        `${environment.baseUrl}/oauth2-gateway/oauth2/token`,
        body,
        {
          headers: this.options.headers,
        }
      )
      .subscribe({
        next: (data: any) => {
          // this.setСookie('access_token', data, 3600 * 24, '/')
          // this.setСookie('refresh_token', data, 3600 * 24, '/')
          this.isLoading$.next(false);
          // this.changeSmsStatus(false) // remove Назад btn from the view
          // this.changeCodeComponentVisible(false)
          // this.router.navigate([WELCOME])
        },
        error: (err: any) => {
          // this.changeLoginError(err
          console.info(err);
        },
        complete: () => {
          this.isTokenLoading$.next(false);
        },
      });
  }

  public validateSmsCode(
    phone: string,
    password: string,
    body: any,
    errCb: any
  ): Subscription {
    console.info('sending sms');
    if (!this.isLoading$.value) {
      this.isLoading$.next(true);
      const url = `${environment.baseUrl}/oauth2-gateway/oauth2/auth/validate-by-sms/${phone}/${password}`;
      return this.http
        .post(url, body, {
          headers: this.options.headers,
          responseType: 'text',
        })
        .subscribe({
          next: (data: any) => {
            const redirect = data.toString().split('?');
            const code = redirect[1].split('=')[1];
            this.getToken(code);
          },
          error: (err: any) => {
            let error: { [key: string]: string };
            error = { message: '', systemMessage: '' };
            error.message =
              'Произошла не известная ошибка. Попробуйте повторить позже.';
            this.isNumberSend$.next(false);
            // this.isRegistered$.next(false)
            this.isLoading$.next(false);
            let errObject: any;
            try {
              errObject = JSON.parse(err.error);
              if (
                errObject &&
                errObject.messages &&
                errObject.messages.length
              ) {
                error = { ...errObject, message: errObject.messages + '' };
                if (errObject.systemMessage && errObject.systemMessage.length) {
                  const systemMessage = systemErrors.find((i: any) =>
                    errObject.systemMessage.includes(i.error) ? i : undefined
                  );
                  if (systemMessage) {
                    error = { ...error, systemMessage: systemMessage.code };
                  }
                }
              }
            } catch (error) {
              console.info(error);
            }
            if (errCb && error.systemMessage) {
              errCb(error.systemMessage);
            }
          },
          // complete: () => {
          // 	// console.info(this.smsCodeValidatorSubscr$)
          // }
        });
    } else {
      return null;
    }
  }

  getSmsCode(phoneNumber: string, toasterService: any): Subscription {
    this.isLoading$.next(true);
    this.numberSendError$.next('');
    const url = `${environment.baseUrl}/oauth2-gateway/authentication/get-push-or-sms/${phoneNumber}?codePurpose=SIGN`;
    // TODO: (Review) Тут создается подписка и потом не удаляется
    return this.http.get(url, { responseType: 'text' }).subscribe({
      next: res => {
        this.isNumberSend$.next(true);
        this.isLoading$.next(false);
      },
      error: err => {
        let errMsg =
          'Произошла не известная ошибка. Попробуйте повторить позже.';
        if (err.status >= 500 && err.error) {
          try {
            const prsdError = JSON.parse(err.error);
            if (prsdError.messages.length) {
              errMsg = prsdError.messages;
            }
          } catch (error) {
            console.info(error);
          }
        } else {
          errMsg = getError(err);
        }
        this.numberSendError$.next(errMsg);
        this.isLoading$.next(false);
      },
      complete: () => {
        console.info('completed smsCode service');
      },
    });
  }

  sendByAppCode(dto: IP2PSecuredRequest): Observable<any> {
    return this.http.post(`${environment.baseUrl}${SEND_SIGN_P2P}`, dto, {
      observe: 'response',
    });
  }

  getStaffList(): Observable<StaffDictionaries> {
    return this.http.get<StaffDictionaries>(
      `${environment.baseUrl}${GET_STAFF_LIST}`
    );
  }

  getStaffListPage(
    pageNum: number,
    pageSize: number
  ): Observable<StaffDictionaries> {
    return this.http.get<StaffDictionaries>(
      `${environment.baseUrl}${GET_STAFF_LIST}?pageNum=${pageNum}&pageSize=${pageSize}`
    );
  }

  deleteByIdStaff(id: number) {
    return this.http.delete(
      `${environment.baseUrl}${DELETE_BY_ID_STAFF}?staffId=${id}`
    );
  }

  deleteByIdStaffList(ids: number[]) {
    return this.http.delete(
      `${environment.baseUrl}${DELETE_BY_ID_STAFF_LIST}`,
      { body: ids }
    );
  }

  addNewStaff(dto: IEmployee): Observable<IEmployee> {
    return this.http.post<IEmployee>(
      `${environment.baseUrl}${ADD_NEW_STAFF}`,
      dto
    );
  }

  editStaff(dto: IEmployee): Observable<IEmployee> {
    return this.http.post<IEmployee>(
      `${environment.baseUrl}${EDIT_STAFF}`,
      dto
    );
  }

  getUserInfoByInn(iin: number): Observable<any> {
    return this.http.get<any>(
      `${environment.baseUrl}${GET_FULL_INFO_BY_IIN_FROM_GBDFL}?iin=${iin}`
    );
  }

  changeTableModalVisible(value: boolean) {
    this.tableModalVisible$.next(value);
  }

  checkRightsToSign(): Observable<boolean> {
    return this.http.get<boolean>(
      `${environment.baseUrl}${GET_HAS_RIGHTS_TO_SIGN}`
    );
  }

  getConvertationPrefill() {
    return this.http.get<any>(
      `${environment.baseUrl}${GET_CONVERTATION_PREFILL}`
    );
  }

  getExchangePurposes() {
    return this.http.get<any>(`${environment.baseUrl}${GET_EXCHANGE_PURPOSES}`);
  }

  getValconContracts() {
    return this.http.get<any>(`${environment.baseUrl}${GET_VALCON_CONTRACTS}`);
  }

  initRate(senderCurrency: string, recepientCurrency: string) {
    return this.http.get<any>(
      `${environment.baseUrl}` +
        '/fx-gateway/rates/client?currencies=' +
        senderCurrency +
        ',' +
        recepientCurrency
    );
  }

  getFXCurrentRates() {
    return this.http.get<any>(
      `${environment.baseUrl}` + '/fx-gateway/rates/client/all'
    );
  }

  getFXCurrencyInfo() {
    return this.http.get<any>(
      `${environment.baseUrl}` + '/fx-gateway/rates/currencies/all'
    );
  }

  getFXTradingSignals() {
    return this.http.get<any>(
      `${environment.baseUrl}` + '/fx-gateway/signal/get-signals'
    );
  }

  addFXTradingSignal(body: any) {
    return this.http.post<any>(
      `${environment.baseUrl}` + '/fx-gateway/signal/save-signal',
      body
    );
  }

  deleteFXTradingSignal(id: string | number) {
    return this.http.delete<any>(
      `${environment.baseUrl}` + '/fx-gateway/signal/delete-signal/' + id
    );
  }

  getHistoryRates(pairName: string, startDate: string) {
    return this.http.get<any>(
      `${environment.baseUrl}` +
        '/fx-gateway/rates/history/' +
        pairName +
        '?startDate=' +
        startDate
    );
  }

  getCurrencyContractParams(body: any) {
    return this.http.post<any>(
      `${environment.baseUrl}${GET_CURRENCY_CONTRACT_PARAMS}`,
      body
    );
  }

  checkOperday() {
    return this.http.get<any>(`${environment.baseUrl}${CHECK_OPERDAY}`);
  }

  validateFX(body: any) {
    return this.http.post<any>(`${environment.baseUrl}${VALIDATE_FX}`, body);
  }

  createHandShake(body: any) {
    return this.http.post<any>(
      `${environment.baseUrl}${HANDSHAKE_CREATE}`,
      body
    );
  }

  pollHandShake(id: number) {
    return this.http.get<any>(
      `${environment.baseUrl}` + '/fx-gateway/handshake/' + id
    );
  }

  approveHandshake(id: number) {
    return this.http.post(
      `${environment.baseUrl}` + '/fx-gateway/handshake/approve/' + id,
      {}
    );
  }

  deleteHandShake(id: number) {
    return this.http.delete(
      `${environment.baseUrl}` + '/fx-gateway/handshake/' + id
    );
  }

  getExchangeById(id: number) {
    return this.http.get(
      `${environment.baseUrl}` +
        '/document-gateway/documents/curr-exchange/get-exchange-by-id?sentDocId=' +
        id
    );
  }

  getSalaryUnicodes(): Observable<any> {
    return this.http.get<any>(environment.baseUrl + GET_SALARY_UNICODES);
  }

  getCurrencyContractPrefill() {
    return this.http.get<any>(
      `${environment.baseUrl}${GET_CURRENCY_CONTRACT_PREFILL}`
    );
  }

  getCurrencyTransferPrefill(currency: string): Observable<any> {
    return this.http.get<any>(
      environment.baseUrl +
        `/document-gateway/${GET_CURRENCY_TRANSFER_PREFILL}?currency=${currency}`
    );
  }

  getCurrencyTransferCommission(body: any) {
    return this.http.post<any>(
      environment.baseUrl +
        '/document-gateway/documents/curr-order/get-commission',
      body
    );
  }
}
