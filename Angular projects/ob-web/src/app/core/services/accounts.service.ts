import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { environment } from '@env/environment';
import {
  IAccountInfo,
  ICardInfo,
  ICreateAccount,
  ICreateBusinessCard,
  ICreateDeposit,
  IDetailsInfo,
} from '@data/models/account-types';
import {
  GET_ACCOUNT_BY_ID,
  GET_REQUISITES,
  GET_CARD_BY_ID,
  GET_DEPOSIT_BY_ID,
  POST_STATEMENTS_REFRESH,
  GET_REQUISITES_PDF,
  GET_CARD_REQUISITES,
  GET_CARD_REQUISITES_PDF,
  GET_DEPOSITS,
  GET_LOANS,
  GET_LOAN_DETAILS,
  GET_LOAN_LINE,
  GET_DEPOSITS_PREFILL,
  OPEN_DEPOSIT,
  GET_CREATE_ACCOUNT_PREFILL,
  GET_CREATE_ACCOUNT_CURRENCIES,
  GET_CREATE_ACCOUNT_DIVISIONS,
  SEND_CREATE_ACCOUNT,
  GET_DEPOSIT_STATEMENTS_PDF,
  GET_LOAN_PAYMENT_INFO,
  GET_DEPOSIT_REWARD,
  SEND_CREATE_BUSINESS_CARD,
  GET_LIMITED_DEPOSITS,
  GET_LIMITED_LOANS,
  GET_ACCOUNT_BLOCKED_INFO,
} from '@core/constants/apiUrls';
import { catchError } from 'rxjs/operators';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { errorMessage, getError, getIn, successMessage } from '../helpers';
import { ToastrService } from 'ngx-toastr';
import { WELCOME } from '../constants/pathnames';

type SelectedAccType = any;

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  private baseUrl: string = environment.baseUrl;
  public previousUrl = new BehaviorSubject<string>(WELCOME);

  public accounts = new BehaviorSubject<IAccountInfo[]>([]);
  currentAccounts: Observable<IAccountInfo[]> = this.accounts.asObservable();
  public accountsLoading$ = new BehaviorSubject<boolean>(false);
  accountsLoadingStatus: Observable<boolean> =
    this.accountsLoading$.asObservable();

  // для запрос аккаунта по ID
  public accountInfo$ = new BehaviorSubject<any>({});
  public creditPaymentInfo$ = new BehaviorSubject<any>({});
  observableAccountInfo$ = this.accountInfo$.asObservable();
  public accountInfoLoading$ = new BehaviorSubject<boolean>(false);
  public creditPaymentInfoLoading$ = new BehaviorSubject<boolean>(false);

  public cards = new BehaviorSubject<ICardInfo[]>([]);
  currentCards: Observable<ICardInfo[]> = this.cards.asObservable();
  public isLoadingCard$ = new BehaviorSubject<boolean>(false);
  cardsLoadingStatus: Observable<boolean> = this.isLoadingCard$.asObservable();

  public deposits = new BehaviorSubject([]);
  currentDeposits = this.deposits.asObservable();
  public loans$ = new BehaviorSubject([]);
  currentLoans$ = this.loans$.asObservable();
  public limitedLoans$ = new BehaviorSubject([]);
  currentLimitedLoans$ = this.limitedLoans$.asObservable();
  public isLoadingDeposit$ = new BehaviorSubject<boolean>(false);
  depositsLoadingStatus: Observable<boolean> =
    this.isLoadingDeposit$.asObservable();
  public isLoadingLoans$ = new BehaviorSubject<boolean>(false);
  loansLoadingStatus$: Observable<boolean> =
    this.isLoadingLoans$.asObservable();
  // Подписка на ошибку для счетов, карт, депозитов, кредитов на главной странице
  public isErrorLimitedLoans$ = new BehaviorSubject<boolean>(false);
  limitedLoansError: Observable<boolean> =
    this.isErrorLimitedLoans$.asObservable();
  public isErrorLimitedAccounts$ = new BehaviorSubject<boolean>(false);
  limitedAccountsError: Observable<boolean> =
    this.isErrorLimitedAccounts$.asObservable();
  public isErrorLimitedCards$ = new BehaviorSubject<boolean>(false);
  limitedCardsError: Observable<boolean> =
    this.isErrorLimitedCards$.asObservable();
  public isErrorLimitedDeposits$ = new BehaviorSubject<boolean>(false);
  limitedDepositsError: Observable<boolean> =
    this.isErrorLimitedDeposits$.asObservable();

  private selectedAccount$ = new BehaviorSubject<SelectedAccType>(null);
  currentSelectedAccount: Observable<SelectedAccType> =
    this.selectedAccount$.asObservable();

  public accountSettings = new BehaviorSubject<boolean>(false);
  isAccountSettingsOpen: Observable<boolean> =
    this.accountSettings.asObservable();

  public isReportLoading$ = new BehaviorSubject<boolean>(false);
  public report$ = new BehaviorSubject<any>(null);
  public reportError$ = new BehaviorSubject<any>(null);

  public accountsCounter$: BehaviorSubject<any> = new BehaviorSubject<any>({});

  public isErrorPage$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  public productTemplate$: BehaviorSubject<any> = new BehaviorSubject(null);
  currentProductTemplate$ = this.productTemplate$.asObservable();

  public cardNames: any = {
    'Карта для бизнеса': 'cards.business',
    'Таможенная карта ЮЛ': 'cards.customs',
    'Цифровая карта': 'cards.digital',
    'Карта ИП': 'cards.ip',
  };

  public statuses: any = {
    Закрыт: 'status.closed',
    Арестован: 'status.arrested',
    'Арест следователя': 'error.arrest',
    'Без движений': 'status.no-movement',
  };

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  changeAccountSettingsStatus(value: boolean): void {
    this.accountSettings.next(value);
  }

  setAccounts(accs: IAccountInfo[]): void {
    this.accounts.next(accs);
  }

  setCards(cards: ICardInfo[]): void {
    this.cards.next(cards);
  }

  setDeposits(deposits: any): void {
    this.deposits.next(deposits);
  }

  setLoans(data: any): void {
    this.loans$.next(data);
  }

  setLimitedLoans(data: any): void {
    this.limitedLoans$.next(data);
  }

  setSelectedAccount(data: SelectedAccType): void {
    this.selectedAccount$.next(data);
  }

  getSelectedAccount() {
    return this.selectedAccount$.value;
  }

  getAccountsList(): Subscription {
    this.accountsLoading$.next(true);
    return this.http
      .get<IAccountInfo[]>(
        `${this.baseUrl}/account-gateway/accounts/current-accounts-with-balance-v2`
      )
      .subscribe({
        next: (data: IAccountInfo[]) => {
          const accCounter = this.accountsCounter$.value;
          this.accountsCounter$.next({ ...accCounter, accounts: data.length });
          this.setAccounts(data);
          this.accountsLoading$.next(false);
        },
        error: error => {
          errorMessage(error, this.toastr);
          this.accountsLoading$.next(false);
        },
      });
  }

  getLimitedAccountList(): Subscription {
    this.accountsLoading$.next(true);
    this.isErrorLimitedAccounts$.next(false);
    return this.http
      .get<any>(
        `${this.baseUrl}/account-gateway/accounts/current-accounts-with-balance-limit-v2?pageSize=3`
      )
      .subscribe({
        next: data => {
          const accCounter = this.accountsCounter$.value;
          this.accountsCounter$.next({
            ...accCounter,
            accounts: data.totalElements,
          });
          this.setAccounts(data.content);
          this.accountsLoading$.next(false);
        },
        error: error => {
          errorMessage(error, this.toastr);
          this.isErrorLimitedAccounts$.next(true);
          this.accountsLoading$.next(false);
        },
      });
  }

  getAccounById2(
    id: number,
    type: string,
    clientIdRef: number = undefined,
    unsubscribeCb: any
  ): Subscription {
    let clIdRef = clientIdRef;
    this.accountInfoLoading$.next(true);
    const apis: any = {
      account: GET_ACCOUNT_BY_ID,
      card: GET_CARD_BY_ID,
      deposit: GET_DEPOSIT_BY_ID,
      'card-account': GET_CARD_BY_ID,
    };
    let url = `${this.baseUrl}${apis[type]}/${id}`;
    if (type === 'card' || type === 'card-account') {
      if (this.cards.value && this.cards.value.length) {
        const card = this.cards.value.find(function (i: any) {
          if (type === 'card') {
            return i.contractId === Number(id) ? i : undefined;
          } else {
            if (getIn(i, 'level') === 1 && i.contractId === Number(id)) {
              return i;
            } else {
              return undefined;
            }
          }
        });
        if (card) {
          clIdRef = card.clientIdRef;
        }
      }
      url = `${this.baseUrl}${apis[type]}/${clIdRef}/${id}`;
    }
    return this.http.get<any>(`${url}`).subscribe({
      next: (data: any) => {
        this.isErrorPage$.next(false);
        this.setAccountInfo(data);
        this.accountInfoLoading$.next(false);
        unsubscribeCb();
      },
      error: error => {
        this.isErrorPage$.next(true);
        this.accountInfoLoading$.next(false);
        unsubscribeCb();
      },
    });
  }

  setAccountInfo(data: any): void {
    this.accountInfo$.next(data);
  }

  getAccounById(id: number, type: string): Observable<IDetailsInfo> {
    const apis: any = {
      account: GET_ACCOUNT_BY_ID,
      card: GET_CARD_BY_ID,
      deposit: GET_DEPOSIT_BY_ID,
    };
    return this.http.get<IDetailsInfo>(`${this.baseUrl}${apis[type]}/${id}`);
  }

  getCardsList(toaster: any): Subscription {
    // SETS CARD LIST
    this.isLoadingCard$.next(true);
    return this.http
      .get<ICardInfo[]>(`${this.baseUrl}${GET_CARD_BY_ID}`)
      .subscribe({
        next: (data: ICardInfo[]) => {
          const cards = data.filter(i => getIn(i, 'level') === 3);
          const accCounter = this.accountsCounter$.value;
          this.accountsCounter$.next({ ...accCounter, cards: cards.length });
          this.setCards(data);
          this.isLoadingCard$.next(false);
        },
        error: err => {
          this.isLoadingCard$.next(false);
          errorMessage(err, toaster);
        },
      });
  }

  getLimitedCardList(toaster?: any): Subscription {
    // SETS CARD LIST
    this.isLoadingCard$.next(true);
    this.isErrorLimitedCards$.next(false);
    return this.http
      .get<any>(
        `${this.baseUrl}/account-gateway/corp-cards/current-corp-contracts-limit?pageSize=3`
      )
      .subscribe({
        next: data => {
          const accCounter = this.accountsCounter$.value;
          this.accountsCounter$.next({
            ...accCounter,
            cards: data.totalElements,
          });
          this.setCards(data.content);
          this.isLoadingCard$.next(false);
        },
        error: err => {
          this.isLoadingCard$.next(false);
          this.isErrorLimitedCards$.next(true);
          errorMessage(err, toaster || this.toastr);
        },
      });
  }

  getLimitedDepositsList(): Subscription {
    this.isLoadingDeposit$.next(true);
    this.isErrorLimitedDeposits$.next(false);
    return this.http
      .post(`${this.baseUrl}${GET_LIMITED_DEPOSITS}`, {})
      .subscribe({
        next: (data: any) => {
          this.setDeposits(data.content);
          const accCounter = this.accountsCounter$.value;
          this.accountsCounter$.next({
            ...accCounter,
            deposits: data.totalElements,
          });
          this.isLoadingDeposit$.next(false);
        },
        error: (err: any) => {
          const error = getError(err);
          this.isLoadingDeposit$.next(false);
          this.isErrorLimitedDeposits$.next(true);
          errorMessage(error, this.toastr);
        },
      });
  }

  getDepositsList(): Subscription {
    this.isLoadingDeposit$.next(true);
    return this.http.post(`${this.baseUrl}${GET_DEPOSITS}`, {}).subscribe({
      next: (data: any) => {
        this.setDeposits(data);
        const accCounter = this.accountsCounter$.value;
        this.accountsCounter$.next({ ...accCounter, deposits: data.length });
        this.isLoadingDeposit$.next(false);
      },
      error: (err: any) => {
        const error = getError(err);
        this.isLoadingDeposit$.next(false);
        errorMessage(error, this.toastr);
      },
    });
  }

  getDepositsPrefill() {
    return this.http.get(`${this.baseUrl}${GET_DEPOSITS_PREFILL}`);
  }

  getLoansList(): Subscription {
    this.isLoadingLoans$.next(true);
    return this.http.post(`${this.baseUrl}${GET_LOANS}`, {}).subscribe({
      next: (data: any) => {
        // array.slice(0, n)
        this.setLoans(data);
        const accCounter = this.accountsCounter$.value;
        this.accountsCounter$.next({ ...accCounter, loans: data.length });
        this.isLoadingLoans$.next(false);
      },
      error: (err: any) => {
        const error = getError(err);
        console.info(error);
        this.isLoadingLoans$.next(false);
        errorMessage(error, this.toastr);
      },
    });
  }

  getLimitedLoansList(): Subscription {
    this.isLoadingLoans$.next(true);
    this.isErrorLimitedLoans$.next(false);
    return this.http.post(`${this.baseUrl}${GET_LIMITED_LOANS}`, {}).subscribe({
      next: (data: any) => {
        // array.slice(0, n)
        this.setLimitedLoans(data.content);
        const accCounter = this.accountsCounter$.value;
        this.accountsCounter$.next({
          ...accCounter,
          loans: data.totalElements,
        });
        this.isLoadingLoans$.next(false);
      },
      error: (err: any) => {
        const error = getError(err);
        this.isLoadingLoans$.next(false);
        this.isErrorLimitedLoans$.next(true);
        errorMessage(error, this.toastr);
      },
    });
  }

  getLoanDetails(id: number): Subscription {
    this.accountInfoLoading$.next(true);
    return this.http
      .post(`${this.baseUrl}${GET_LOAN_DETAILS}`, { id: id })
      .subscribe({
        next: (data: any) => {
          this.isErrorPage$.next(false);
          this.setAccountInfo(data);
          this.accountInfoLoading$.next(false);
        },
        error: error => {
          this.isErrorPage$.next(true);
          this.accountInfoLoading$.next(false);
        },
      });
  }

  getLoanPaymentInfo(id: number) {
    this.creditPaymentInfoLoading$.next(true);
    return this.http
      .post(`${this.baseUrl}${GET_LOAN_PAYMENT_INFO}`, { id: id })
      .subscribe({
        next: (data: any) => {
          this.creditPaymentInfo$.next(data);
          this.creditPaymentInfoLoading$.next(false);
        },
        error: error => {
          this.creditPaymentInfoLoading$.next(false);
        },
      });
  }

  getLoanLine(id: number): Subscription {
    this.accountInfoLoading$.next(true);
    return this.http
      .post(`${this.baseUrl}${GET_LOAN_LINE}`, { id: id })
      .subscribe({
        next: (data: any) => {
          this.isErrorPage$.next(false);
          this.setAccountInfo(data);
          this.accountInfoLoading$.next(false);
        },
        error: error => {
          this.isErrorPage$.next(true);
          this.accountInfoLoading$.next(false);
        },
      });
  }

  getStatementsReport(params: any, toastr: any): Subscription {
    this.isReportLoading$.next(true);
    const accParams: any = {
      account: params.account,
      dateEnd: params.dateEnd,
      dateStart: params.dateStart,
      orderASC: params.format === 'txt',
      orderBy: 'statementDate',
      statementType: 'ALL',
      // documentNumber: null,
      // amount: null,
      // amountMax: null,
      // amountMin: null,
      // counterAgentAccount: null,
      // counterAgentIDN: null,
      // counterAgentName: null,
    };
    let body = accParams;
    if (
      params.type === 'deposit' ||
      params.type === 'card' ||
      params.type === 'card-account'
    ) {
      body = {
        contractId: +params.contractId,
        level: params.level,
        dateEnd: params.dateEnd,
        dateStart: params.dateStart,
        orderASC: false,
      };
      if (params.type === 'card-account') {
        body.rootContractId = +params.rootContractId;
      }
    }
    return this.http
      .post(`${this.baseUrl}${params.url}`, body, {
        observe: 'response',
        responseType: 'blob',
      })
      .subscribe({
        next: response => {
          this.report$.next(response);
          this.isReportLoading$.next(false);
        },
        error: err => {
          errorMessage(err, toastr);
          this.isReportLoading$.next(false);
        },
      });
  }

  getRequisites(id: number) {
    return this.http.post(`${this.baseUrl}${GET_REQUISITES}`, {
      contractId: id,
    });
  }

  getAccountBlockedInfo(iban: string) {
    return this.http.get(
      `${this.baseUrl}${GET_ACCOUNT_BLOCKED_INFO}/?iban=${iban}`
    );
  }

  getCardRequisites(clientIdRef: number, contractId: number) {
    return this.http.get(
      `${this.baseUrl}${GET_CARD_REQUISITES}/${clientIdRef}/${contractId}`
    );
  }

  getCardRequisitesReport(
    clientIdRef: number,
    contractId: number,
    bsModalRef: BsModalRef,
    toastr: any
  ): Subscription {
    this.isReportLoading$.next(true);
    return this.http
      .post(
        `${this.baseUrl}${GET_CARD_REQUISITES_PDF}/${clientIdRef}/${contractId}`,
        {},
        {
          observe: 'response',
          responseType: 'blob',
        }
      )
      .subscribe({
        next: (response: any) => {
          const a = document.createElement('a');
          const objURL = URL.createObjectURL(response.body);
          a.href = objURL;
          a.setAttribute('download', `Реквизиты ${name}.pdf`);
          a.click();
          URL.revokeObjectURL(objURL);
          bsModalRef.hide();
        },
        error: error => [errorMessage(error, toastr)],
      })
      .add(() => {
        this.isReportLoading$.next(false);
      });
  }

  getRequisitesPdf(
    accounts: any[],
    name: string,
    bsModalRef: BsModalRef
  ): Subscription {
    this.isReportLoading$.next(true);
    return this.http
      .post(`${this.baseUrl}${GET_REQUISITES_PDF}`, accounts, {
        observe: 'response',
        responseType: 'blob',
      })
      .pipe(
        catchError(async (error: any) => {
          this.isReportLoading$.next(false);
          const messages = JSON.parse(await error.error.text()).messages;
          this.reportError$.next(messages);
          throw new Error(error.message);
        })
      )
      .subscribe((response: any) => {
        const a = document.createElement('a');
        const objURL = URL.createObjectURL(response.body);
        a.href = objURL;
        a.setAttribute('download', `Реквизиты ${name}.pdf`);
        a.click();
        URL.revokeObjectURL(objURL);
        bsModalRef.hide();
      })
      .add(() => {
        this.isReportLoading$.next(false);
      });
  }

  getDepositStatementsReport(body: any): Subscription {
    this.isReportLoading$.next(true);
    return this.http
      .post(`${this.baseUrl}${GET_DEPOSIT_STATEMENTS_PDF}`, body, {
        observe: 'response',
        responseType: 'blob',
      })
      .subscribe(
        (response: any) => {
          this.report$.next(response);
        },
        error => {
          const messages = JSON.parse(error.error.text()).messages;
          this.reportError$.next(messages);
          throw new Error(error.message);
        }
      )
      .add(() => {
        this.isReportLoading$.next(false);
      });
  }

  postStatementsRefresh(): Observable<any> {
    return this.http.post(`${this.baseUrl}${POST_STATEMENTS_REFRESH}`, {});
  }

  checkCounteragent(bin: string): Observable<any> {
    return this.http.post(
      this.baseUrl +
        '/document-gateway/check-counteragent?bin=' +
        bin +
        '&source=WEB',
      {}
    );
  }

  getCheckCountragentInfo(bin: string): Observable<any> {
    return this.http.get(
      this.baseUrl + '/document-gateway/check-counteragent/info?bin=' + bin
    );
  }

  getCheckCountragentList(): Observable<any> {
    return this.http.get(
      this.baseUrl + '/document-gateway/check-counteragent/list'
    );
  }

  getCreateAccountPrefill(): Observable<any> {
    return this.http.get(this.baseUrl + GET_CREATE_ACCOUNT_PREFILL);
  }

  getCreateAccountCurrencies(): Observable<any> {
    return this.http.get(this.baseUrl + GET_CREATE_ACCOUNT_CURRENCIES);
  }

  getCreateAccountDivisions(): Observable<any> {
    return this.http.get(this.baseUrl + GET_CREATE_ACCOUNT_DIVISIONS);
  }

  sendCreateAccount(body: ICreateAccount): Observable<any> {
    return this.http.post(this.baseUrl + SEND_CREATE_ACCOUNT, body, {
      observe: 'response',
    });
  }

  sendCreateDeposit(deposit: ICreateDeposit): Observable<any> {
    return this.http.post(`${this.baseUrl}${OPEN_DEPOSIT}`, deposit, {
      observe: 'response',
    });
  }

  getDepositReward(body: any) {
    return this.http.post(this.baseUrl + GET_DEPOSIT_REWARD, body);
  }

  sendCreateBusinessCard(body: ICreateBusinessCard): Observable<any> {
    return this.http.post(`${this.baseUrl}${SEND_CREATE_BUSINESS_CARD}`, body, {
      observe: 'response',
    });
  }
}
