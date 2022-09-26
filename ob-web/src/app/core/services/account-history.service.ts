/* eslint-disable max-len */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { environment } from '@env/environment';
import {
  ITableColumns,
  ITableRows,
  IDocumentList,
  IAccountDTO,
  IAccountDischarge,
  ICardDischarge,
  ICardDTO,
  IDepositDischarge,
  IDepositDTO,
  IDraftMain,
  IDraftParams,
  ISignHistory,
} from '@app/data/models/account-history-types';
import {
  GET_DOCUMENTS_LIST,
  DELETE_DOCUMENTS,
  SIGN_DOCUMENTS,
  GET_SOCIAL_PAYMENT_BY_ID,
  GET_ACCOUNT_STATEMENTS,
  GET_SALARY_PAYMENT_BY_ID,
  GET_PENSION_PAYMENT_BY_ID,
  GET_ORDER_PAYMENT_BY_ID,
  GET_BUDGET_PAYMENT_BY_ID,
  GET_SIGNERS,
  GET_CARD_STATEMENTS,
  GET_DEPOSIT_STATEMENTS,
  GET_BUDGET_PAYMENT_PDF_REPORT,
  GET_SALARY_PAYMENT_PDF_REPORT,
  GET_SOCIAL_PAYMENT_PDF_REPORT,
  GET_PENSION_PAYMENT_PDF_REPORT,
  GET_ORDER_PAYMENT_PDF_REPORT,
  GET_PAY_TO_CARD_BY_ID,
  GET_CURR_ORDER_V2_BY_ID,
  GET_PAYMENT_DRAFT_LIST,
  GET_PRODUCT_DOCUMENTS,
  GET_SIGN_DOCUMENTS_QUANTITY,
  GET_TRANSFER_ACCOUNT_PAYMENT_PDF_REPORT,
  GET_TRANSFER_CARD_PAYMENT_PDF_REPORT,
  GET_PAY_ORDER_CARDS_BY_ID,
  GET_PAY_TO_ACCOUNTS_BY_ID,
  GET_PAY_TO_PAY_BY_ID,
  GET_ACCOUNT_BALANCE,
  GET_BUDGET_PAYMENT_BY_SAVED_ID,
  GET_ORDER_PAYMENT_BY_SAVED_ID,
  GET_PENSION_PAYMENT_BY_SAVED_ID,
  GET_SALARY_PAYMENT_BY_SAVED_ID,
  GET_SOCIAL_PAYMENT_BY_SAVED_ID,
  DELETE_DRAFT_DOCUMENTS,
  GET_TRANSFER_ACCOUNT_PAYMENT_CARD_PDF_REPORT,
  GET_TRANSFER_CARD_ACCOUNT_PAYMENT_PDF_REPORT,
  GET_SIGNERS_INFO,
  GET_SIGNING_HISTORY,
  GET_DEPOSIT_REQUEST_BY_ID,
  GET_DEPOSIT_CONFROMATION_REPORT_BY_ID,
  GET_DEPOSIT_INFORMATION_REPORT_BY_ID,
  GET_DEPOSIT_REQUEST_REPORT_BY_ID,
  GET_EXCHANGE_BY_ID,
  GET_CURRENCY_CONTRACTS,
  GET_FX_EXCHANGE_PDF_REPORT,
  GET_CORP_CARD_ISSUE_BY_ID,
  GET_ACCOUNT_ISSUE_BY_ID,
  GET_ACCOUNT_CREATE_BY_ID,
  GET_CARD_ISSUE_APPLICATION,
  GET_CHALLENGES,
  GET_SIGN_BY_SIGNATURE,
  GET_OTP_PUSH,
  POST_CHECK_OTP,
  GET_ACCOUNT_PDF_REPORT,
} from '@core/constants/apiUrls';
import {
  dateParsingFormat,
  operationTableColumns,
  statusList,
} from '../constants';
import { errorMessage } from '../helpers';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';

type IPaymentType =
  | 'PAY_SOCIAL_V2'
  | 'PAY_SOCIAL'
  | 'PAY_SALARY_V2'
  | 'PAY_SALARY'
  | 'PAY_PENSION_V2'
  | 'PAY_PENSION'
  | 'PAY_ORDER_V2'
  | 'PAY_ORDER'
  | 'PAY_BUDGET_V2'
  | 'PAY_BUDGET'
  | 'PAY_TO_CARD'
  | 'PAY_ORDER_CARDS';
type IProductType = 'DEPOSIT_OPEN';

@Injectable({
  providedIn: 'root',
})
export class AccountHistoryService {
  baseUrl: string = environment.baseUrl;
  page: number = 0;
  isLastPage = new BehaviorSubject<boolean>(false);
  lastPageStatus: Observable<boolean> = this.isLastPage.asObservable();
  listType$: BehaviorSubject<string> = new BehaviorSubject('');
  statusList: any = statusList;
  docsLength$: BehaviorSubject<number> = new BehaviorSubject(0);
  productsLength$: BehaviorSubject<number> = new BehaviorSubject(0);
  docsAmount$: BehaviorSubject<string> = new BehaviorSubject('{"KZT":[0]}');
  signersInfo$: BehaviorSubject<any> = new BehaviorSubject<any>({ length: 0 });
  signersInfoError$: BehaviorSubject<any> = new BehaviorSubject<any>({});
  isLoadingSignersInfo$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  signingHistory$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  isLoadingSigningHistory$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public fingerPrintReport$: BehaviorSubject<any> = new BehaviorSubject<any>(
    ''
  );

  public documentColumns$ = new BehaviorSubject<ITableColumns[]>(
    operationTableColumns
  );

  currentDocumentColumns: Observable<ITableColumns[]> =
    this.documentColumns$.asObservable();

  openedDocument$ = new BehaviorSubject<ITableRows>(null);

  selectedDocuments = new BehaviorSubject<ITableRows[]>([]);
  currentSelectedDocuments: Observable<ITableRows[]> =
    this.selectedDocuments.asObservable();

  documentsChanged = new BehaviorSubject<boolean>(false);
  isDocumentChanged: Observable<boolean> = this.documentsChanged.asObservable();

  operationModal = new BehaviorSubject<string>('close');
  isOperationModalOpen: Observable<string> = this.operationModal.asObservable();

  modalOpen = new BehaviorSubject<boolean>(false);
  isModalOpen: Observable<boolean> = this.modalOpen.asObservable();

  deletedDocuments = new BehaviorSubject<boolean>(false);
  isDocumentsDeleted: Observable<boolean> =
    this.deletedDocuments.asObservable();

  documentsLength = new BehaviorSubject<number>(0);
  documentsQuantity: Observable<number> = this.documentsLength.asObservable();

  constructor(private http: HttpClient, private toastrService: ToastrService) {}

  removeSelected() {
    this.selectedDocuments.next([]);
  }

  addDocument(documents: ITableRows[]) {
    this.selectedDocuments.next(documents);
  }

  changeDocumentsStatus(value: boolean) {
    this.deletedDocuments.next(value);
  }

  changeModalStatus(value: boolean) {
    this.modalOpen.next(value);
  }

  changeDocumentColumns(value: ITableColumns[]) {
    this.documentColumns$.next(value);
  }

  changeLastPageStatus(value: boolean) {
    this.isLastPage.next(value);
  }

  changeDocumentStatus(value: boolean) {
    this.documentsChanged.next(value);
  }

  changeOperationModalState(value: string) {
    this.operationModal.next(value);
  }

  getDocumentsList(
    params: any,
    page: number,
    pageSize: number
  ): Observable<IDocumentList> {
    this.changeDocumentStatus(false);
    return this.http.post<IDocumentList>(
      `${this.baseUrl}${GET_DOCUMENTS_LIST}?pageNum=${page}&pageSize=${pageSize}`,
      params
    );
  }

  /* Сервис получения списка всех заявок */
  getProductDocuments(
    params: any,
    page: number,
    pageSize: number
  ): Observable<IDocumentList> {
    return this.http.post<IDocumentList>(
      `${this.baseUrl}${GET_PRODUCT_DOCUMENTS}?pageNum=${page}&pageSize=${pageSize}`,
      params
    );
  }

  getCurrencyContractList(searchValue: string) {
    return this.http.get(
      `${this.baseUrl}${GET_CURRENCY_CONTRACTS}/?search=${searchValue}`
    );
  }
  getPaymentDraftList(
    params: IDraftParams,
    page: number,
    pageSize: number
  ): Observable<IDraftMain> {
    return this.http.post<IDraftMain>(
      `${this.baseUrl}${GET_PAYMENT_DRAFT_LIST}?pageNum=${page}&pageSize=${pageSize}`,
      params
    );
  }

  deleteDocuments(documentsId: any): Observable<any> {
    const params = {
      idList: documentsId,
    };
    return this.http.delete(
      // `${environment.baseUrl}${DELETE_DOCUMENTS.replace('{id}', `[${documentsId}]`)}`
      `${environment.baseUrl}${DELETE_DOCUMENTS}`,
      { params }
    );
  }

  deleteDraftDocuments(documentsId: any): Observable<any> {
    const params = {
      idList: documentsId,
    };
    return this.http.delete(`${environment.baseUrl}${DELETE_DRAFT_DOCUMENTS}`, {
      params,
    });
  }

  signDocuments(
    code: string,
    docIds: any,
    phone: string,
    fingerPrint: any = ''
  ): Observable<any> {
    const params: any = { phone, code, docIds };
    const url = `${environment.baseUrl}${SIGN_DOCUMENTS}`;
    let options: {};
    options = { params };
    if (fingerPrint) {
      options = { headers: { fingerPrint: fingerPrint }, params };
    }
    return this.http.get(url, options);
  }

  signBySignature(body: any): Observable<any> {
    const url = `${environment.baseUrl}${GET_SIGN_BY_SIGNATURE}`;
    let options: {};
    if (this.fingerPrintReport$.value) {
      options = { headers: { fingerPrint: this.fingerPrintReport$.value } };
    }
    return this.http.post(url, body, options);
  }

  getChallenges(id: any): Observable<any> {
    const url = `${this.baseUrl}${GET_CHALLENGES}?docIds=${id}`;
    return this.http.get(url, { responseType: 'text' });
  }

  postCheckOtp(body: any): Observable<any> {
    const requestOptions = {
      headers: {
        'x-csp-client-id': '69d38eee-e2c6-4721-95fe-ae6e2a6895ec',
      },
    };
    const url = `${this.baseUrl}${POST_CHECK_OTP}`;
    return this.http.post(url, body, requestOptions);
  }

  sendOtpPush(commonNameInCaEncoded: string): Observable<any> {
    // TODO MUST BE IMPLEMENTED commonNameInCaEncoded - ?
    const requestOptions = {
      headers: {
        'x-csp-client-id': 'd52d6bbf-643f-4bd2-8f9b-9656d95b24f3',
        responseType: 'text',
      },
    };
    const url = `${this.baseUrl}${GET_OTP_PUSH}?commonNameInCaEncoded=${commonNameInCaEncoded}`;
    return this.http.post(url, {}, requestOptions);
  }

  getSignersInfo(): Subscription {
    // toastr servcie
    this.isLoadingSignersInfo$.next(true);
    return this.http
      .get(`${environment.baseUrl}${GET_SIGNERS_INFO}`)
      .subscribe({
        next: (v: any) => {
          let info = { ...this.signersInfo$.value };
          if (v.length) {
            let signersLength = 0;
            v.forEach((i: any) => {
              if (i.signatureCount) {
                info = { ...info, [i.groupId]: i.signatureCount }; // {1: 2, 2: 1} key = groupId/ value = counter
                signersLength = signersLength + i.signatureCount;
              }
            });
            info.length = signersLength;
          }
          this.signersInfo$.next(info);
          this.isLoadingSignersInfo$.next(false);
        },
        error: error => {
          this.isLoadingSignersInfo$.next(false);
          errorMessage(error, this.toastrService);
        },
      });
  }

  getSigningHistory(id: string): Subscription {
    this.isLoadingSigningHistory$.next(true);
    return this.http
      .get(`${environment.baseUrl}${GET_SIGNING_HISTORY}/${id}`)
      .subscribe({
        next: (v: any) => {
          this.isLoadingSigningHistory$.next(false);
          if (v.signedList && v.signedList.length) {
            let signedList: ISignHistory[] = [];
            signedList = v.signedList.map((item: any) => ({
              ...item,
              mDate: moment(item.date, dateParsingFormat).toString(),
            }));
            signedList = signedList.sort((a: any, b: any) => {
              const res =
                new Date(b.mDate).getTime() - new Date(a.mDate).getTime();
              if (res < 0) {
                return -1;
              } else if (res > 0) {
                return 1;
              } else {
                return 0;
              }
            });
            this.signingHistory$.next(signedList);
          } else {
            this.signingHistory$.next([]);
          }
        },
        error: error => {
          this.isLoadingSigningHistory$.next(false);
          errorMessage(error, this.toastrService);
        },
      });
  }

  getPaymentById(type: IPaymentType, id: string): Observable<any> {
    const urls = {
      PAY_SOCIAL_V2: GET_SOCIAL_PAYMENT_BY_ID,
      PAY_SALARY_V2: GET_SALARY_PAYMENT_BY_ID,
      PAY_PENSION_V2: GET_PENSION_PAYMENT_BY_ID,
      PAY_ORDER_V2: GET_ORDER_PAYMENT_BY_ID,
      PAY_BUDGET_V2: GET_BUDGET_PAYMENT_BY_ID,
      PAY_SOCIAL: GET_SOCIAL_PAYMENT_BY_ID,
      PAY_SALARY: GET_SALARY_PAYMENT_BY_ID,
      PAY_PENSION: GET_PENSION_PAYMENT_BY_ID,
      PAY_ORDER: GET_ORDER_PAYMENT_BY_ID,
      PAY_BUDGET: GET_BUDGET_PAYMENT_BY_ID,
      PAY_TO_CARD: GET_PAY_TO_CARD_BY_ID,
      CURR_ORDER_V2: GET_CURR_ORDER_V2_BY_ID,
      PAY_ORDER_CARDS: GET_PAY_ORDER_CARDS_BY_ID,
      PAY_TO_ACCOUNTS: GET_PAY_TO_ACCOUNTS_BY_ID,
      PAY_P2P: GET_PAY_TO_PAY_BY_ID,
      PAY_MEDICAL_INSURANCE: GET_PENSION_PAYMENT_BY_ID,
      CURR_EXCHANGE_FX: GET_EXCHANGE_BY_ID,
    };
    return this.http.get(`${this.baseUrl}${urls[type]}`, {
      params: { sentDocId: id },
    });
  }

  getPaymentBySavedId(type: IPaymentType, id: string): Observable<any> {
    const urls = {
      PAY_SOCIAL_V2: GET_SOCIAL_PAYMENT_BY_SAVED_ID,
      PAY_SALARY_V2: GET_SALARY_PAYMENT_BY_SAVED_ID,
      PAY_PENSION_V2: GET_PENSION_PAYMENT_BY_SAVED_ID,
      PAY_ORDER_V2: GET_ORDER_PAYMENT_BY_SAVED_ID,
      PAY_BUDGET_V2: GET_BUDGET_PAYMENT_BY_SAVED_ID,
      PAY_SOCIAL: GET_SOCIAL_PAYMENT_BY_SAVED_ID,
      PAY_SALARY: GET_SALARY_PAYMENT_BY_SAVED_ID,
      PAY_PENSION: GET_PENSION_PAYMENT_BY_SAVED_ID,
      PAY_ORDER: GET_ORDER_PAYMENT_BY_SAVED_ID,
      PAY_BUDGET: GET_BUDGET_PAYMENT_BY_SAVED_ID,
      PAY_MEDICAL_INSURANCE: GET_PENSION_PAYMENT_BY_SAVED_ID,

      //TODO
      PAY_TO_CARD: GET_PAY_TO_CARD_BY_ID,
      CURR_ORDER_V2: GET_CURR_ORDER_V2_BY_ID,
      PAY_ORDER_CARDS: GET_PAY_ORDER_CARDS_BY_ID,
      PAY_TO_ACCOUNTS: GET_PAY_TO_ACCOUNTS_BY_ID,
      PAY_P2P: GET_PAY_TO_PAY_BY_ID,
    };
    return this.http.get(`${this.baseUrl}${urls[type]}`, {
      params: { savedDocId: id },
    });
  }

  getSigners(): Observable<any> {
    return this.http.get(`${this.baseUrl}${GET_SIGNERS}`);
  }

  /* Сервис по выпискам счета */
  getAccountStatements(
    iban: string,
    dateEnd: string,
    dateStart: string,
    other: any,
    page: number,
    pageSize: number
  ): Observable<IAccountDischarge> {
    const params: IAccountDTO = {
      account: iban,
      amount: other.amount,
      amountMax: other.amountMax,
      amountMin: other.amountMin,
      counterAgentAccount: other.counterAgentAccount,
      counterAgentIDN: other.counterAgentIDN,
      counterAgentName: other.counterAgentName,
      dateEnd: dateEnd,
      dateStart: dateStart,
      documentNumber: other.documentNumber,
      orderASC: other.orderASC,
      orderBy: other.orderBy,
      statementType: other.statementType,
    };
    let options;
    options = {};
    if (this.fingerPrintReport$.value) {
      const headerDict = {
        fingerPrint: this.fingerPrintReport$.value,
      };
      options = { headers: new HttpHeaders(headerDict) };
    }
    const url = `${this.baseUrl}${GET_ACCOUNT_STATEMENTS}?pageNum=${page}&pageSize=${pageSize}`;
    return this.http.post<IAccountDischarge>(url, params, options);
  }

  getAccountBalance(
    iban: string,
    dateEnd: string,
    dateStart: string
  ): Observable<IAccountDischarge> {
    // https://testapi.onlinebank.kz/internal/account-gateway/accounts/search-statement-balance?iban=KZ286010221000058850&dateStart=2022-04-05&dateEnd=2022-04-05
    return this.http.post<IAccountDischarge>(
      `${this.baseUrl}${GET_ACCOUNT_BALANCE}?iban=${iban}&dateStart=${dateStart}&dateEnd=${dateEnd}`,
      {}
    );
  }

  /* Сервис по корп-карточным выпискам */
  getCardDischarge(
    contractId: string,
    dateEnd: string,
    dateStart: string,
    page: number,
    pageSize: number
  ): Observable<ICardDischarge> {
    const params: any = {
      contractId: +contractId,
      rootContractId: null,
      level: 1,
      currency: null,
      dateEnd: dateEnd,
      dateStart: dateStart,
      orderASC: false,
    };
    let options = {};
    if (this.fingerPrintReport$.value) {
      const headerDict = {
        fingerPrint: this.fingerPrintReport$.value,
      };
      options = { headers: new HttpHeaders(headerDict) };
    }

    const url = `${this.baseUrl}${GET_CARD_STATEMENTS}?pageNum=${page}&pageSize=${pageSize}`;
    return this.http.post<ICardDischarge>(url, params, options);
  }

  /* Сервис по депозитным выпискам */
  getDepositStatements(
    depositAccount: string,
    dateEnd: string,
    dateStart: string
  ): Observable<IDepositDischarge> {
    const params: IDepositDTO = {
      depositAccount: depositAccount,
      clientCode: null,
      currency: null,
      dateEnd: dateEnd,
      dateStart: dateStart,
      orderASC: false,
    };
    return this.http.post<IDepositDischarge>(
      `${this.baseUrl}${GET_DEPOSIT_STATEMENTS}?pageNum=${this.page}&pageSize=20`,
      params
    );
  }

  savePaymentReport(id: number, type: string): Observable<any> {
    let url = '';
    if (type === 'PAY_SALARY' || type === 'PAY_SALARY_V2') {
      url = GET_SALARY_PAYMENT_PDF_REPORT;
    } else if (type === 'PAY_SOCIAL' || type === 'PAY_SOCIAL_V2') {
      url = GET_SOCIAL_PAYMENT_PDF_REPORT;
    } else if (type === 'PAY_PENSION' || type === 'PAY_PENSION_V2') {
      url = GET_PENSION_PAYMENT_PDF_REPORT;
    } else if (type === 'PAY_BUDGET' || type === 'PAY_BUDGET_V2') {
      url = GET_BUDGET_PAYMENT_PDF_REPORT;
    } else if (type === 'PAY_ORDER' || type === 'PAY_ORDER_V2') {
      url = GET_ORDER_PAYMENT_PDF_REPORT;
    } else if (type === 'PAY_TO_CARD') {
      url = GET_TRANSFER_ACCOUNT_PAYMENT_CARD_PDF_REPORT;
    } else if (type === 'PAY_ORDER_CARDS') {
      url = GET_TRANSFER_CARD_ACCOUNT_PAYMENT_PDF_REPORT;
    } else if (type === 'PAY_P2P') {
      url = GET_TRANSFER_CARD_PAYMENT_PDF_REPORT;
    } else if (type === 'PAY_MEDICAL_INSURANCE') {
      url = GET_PENSION_PAYMENT_PDF_REPORT;
    } else if (type === 'CURR_EXCHANGE_FX') {
      url = GET_FX_EXCHANGE_PDF_REPORT;
    }

    return this.http.get(`${this.baseUrl}${url}`, {
      params: { sentDocId: id },
      responseType: 'blob' as 'json',
    });
  }

  saveAccountReport(id: number, account: string): Observable<any> {
    return this.http.get(`${this.baseUrl}${GET_ACCOUNT_PDF_REPORT}`, {
      params: { account: account, statementId: id },
      responseType: 'blob' as 'json',
    });
  }

  getSignDocumentsQuantity(): Observable<number> {
    return this.http.get<number>(
      `${this.baseUrl}${GET_SIGN_DOCUMENTS_QUANTITY}`
    );
  }

  getProductById(type: IProductType, id: string): Observable<any> {
    const urls = {
      DEPOSIT_OPEN: GET_DEPOSIT_REQUEST_BY_ID,
      CORP_CARD_ISSUE: GET_CORP_CARD_ISSUE_BY_ID,
      ACCOUNT_CREATE: GET_ACCOUNT_ISSUE_BY_ID,
    };
    return this.http.get(`${this.baseUrl}${urls[type]}`, {
      params: { sentDocId: id },
    });
  }

  getCardInfoPdf(id: number | string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}${GET_CARD_ISSUE_APPLICATION}`,
      { sentDocId: id },
      {
        responseType: 'blob',
      }
    );
  }

  getAccountInfoPdf(id: number | string): Observable<any> {
    const url = `${this.baseUrl}${GET_ACCOUNT_CREATE_BY_ID}?sentDocId=${id}`;
    return this.http.get(url, { responseType: 'blob' });
  }

  getDepositInfoPdf(type: string, id: number | string): Observable<any> {
    let url = '';
    switch (type) {
      case 'info':
        url = GET_DEPOSIT_INFORMATION_REPORT_BY_ID;
        break;
      case 'request':
        url = GET_DEPOSIT_REQUEST_REPORT_BY_ID;
        break;
      case 'conformation':
        url = GET_DEPOSIT_CONFROMATION_REPORT_BY_ID;
        break;
      default:
        break;
    }
    return this.http.post(`${this.baseUrl}${url}?sentDocId=${id}`, null, {
      responseType: 'blob',
    });
  }
}
