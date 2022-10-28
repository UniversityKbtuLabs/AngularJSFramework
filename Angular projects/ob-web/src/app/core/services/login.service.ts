import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '@env/environment';
import { LOGIN, WELCOME } from '@core/constants/pathnames';
import { IToken, IContracts, IUserInfo } from '@data/models/auth-types';
import { systemErrors } from '@app/core/constants';
import { errorMessage, showRandomMessage } from '@core/helpers';
import { v4 } from 'uuid';
import { ICheifSigner } from '@data/models/document-type';
import { distinctUntilChanged } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { DocumentService } from '@core/services/document.service';
import { AccountsService } from '@core/services/accounts.service';
import { OperationsService } from '@core/services/operations.service';
import { DictionaryService } from '@core/services/dictionary.service';
import { SocketService } from './socket.service';
import {
  GET_TARIFF_STATISTICS,
  GET_TARIFFS_PACKAGES_BY_CONTRACT_BY_GROUP,
  GET_TARIFFS_PACKAGE_CHARGE,
  GET_TARIFF_INFO_BY_ID,
  SEND_CONNECT_TARIFF,
  DISABLE_TARIFF,
  GET_CHALLENGE,
  POST_VALIDATE_BY_SIGNATURE,
} from '../constants/apiUrls';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private baseUrl = environment.baseUrl;
  public isContractChanged$ = new BehaviorSubject<boolean>(true);

  prefillContracts: any = [];
  prefilContractNum: number | string = 0;

  authorized = new BehaviorSubject<boolean>(false);
  isAuthorized: Observable<boolean> = this.authorized.asObservable();

  contracts: BehaviorSubject<any> = new BehaviorSubject('');
  currentContracts = this.contracts.asObservable();

  defaultContract: BehaviorSubject<number> = new BehaviorSubject(0);
  selectedContract = this.defaultContract.asObservable();

  defaultUser: BehaviorSubject<string> = new BehaviorSubject('');
  selectedUser = this.defaultUser.asObservable();

  currentContractCircleColor: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);

  userInfo$: BehaviorSubject<string> = new BehaviorSubject('');
  userInfoObject$: BehaviorSubject<any> = new BehaviorSubject({});
  isLoadingUserInfo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  currentUser = this.userInfo$.asObservable();
  userInfoSubject$ = this.userInfoObject$.asObservable();

  socketData$: BehaviorSubject<any> = new BehaviorSubject<any>({});

  options = {
    headers: new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    ),
  };

  public loginError: BehaviorSubject<any> = new BehaviorSubject<any>({});
  currentLoginError = this.loginError.asObservable();

  public isLoading$ = new BehaviorSubject<boolean>(false);
  isSmsLoading$ = this.isLoading$.asObservable();

  public isSmsSent = new BehaviorSubject(false);
  smsStatus = this.isSmsSent.asObservable();

  public isCodeComponent = new BehaviorSubject(false);
  codeComponent = this.isCodeComponent.asObservable();

  /*changes*/

  public timeLeft$ = new BehaviorSubject<number>(120);

  public subscriptionResult$: Subscription;

  public isNumberSend$ = new BehaviorSubject<boolean>(false);
  public isRegistered$ = new BehaviorSubject<boolean>(true);

  public isTokenLoading$ = new BehaviorSubject<boolean>(false);
  public fingerPrintReport$: BehaviorSubject<string> =
    new BehaviorSubject<string>('');
  public codeChallenge$: BehaviorSubject<string> = new BehaviorSubject<string>(
    ''
  );
  public isGettingCodeChallenge$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  /*changes */

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService,
    private toastrService: ToastrService,
    private documentService: DocumentService,
    private accountService: AccountsService,
    private operationsService: OperationsService,
    private dictionaryService: DictionaryService,
    private socketService: SocketService
  ) {}

  setAuthorizedStatus(val: boolean): void {
    this.authorized.next(val);
  }

  changeSmsStatus(value: boolean) {
    this.isSmsSent.next(value);
  }

  changeCodeComponentVisible(value: boolean) {
    this.isCodeComponent.next(value);
  }

  changeLoginError(val: any) {
    this.loginError.next(val);
  }

  setErrorMessage(message: string) {
    // TODO УДАЛИТЬ ДУБЛИ
    this.loginError.next(message);
  }

  setFingerPrint(report: any) {
    this.fingerPrintReport$.next(report);
  }

  getChallenge(): Subscription {
    this.isGettingCodeChallenge$.next(true);
    const url = `${this.baseUrl}${GET_CHALLENGE}`;
    // const options =
    return this.http
      .get(url, {
        responseType: 'text',
      })
      .subscribe({
        next: res => {
          this.isGettingCodeChallenge$.next(false);
          this.codeChallenge$.next(res);
        },
        error: err => {
          this.isGettingCodeChallenge$.next(false);
          let errMsg =
            'Произошла неизвестная ошибка. Попробуйте повторить позже.';
          if (err.status >= 500 && err.error) {
            try {
              const prsdError = JSON.parse(err.error);
              if (prsdError.messages.length) {
                errMsg = prsdError.messages + '';
              }
            } catch (error) {
              console.info(error);
            }
          } else {
            if (err.error && err.error.messages && err.error.messages.length) {
              errMsg = err.error.messages + '';
            }
          }
        },
      });
  }

  getChallenge2(): Observable<any> {
    const url = `${this.baseUrl}${GET_CHALLENGE}`;
    return this.http.get(url, { responseType: 'text' });
  }

  validateBySignature(body: any = {}): Subscription {
    const params = new URLSearchParams({
      client_id: environment.auth.clientID,
      response_type: 'code',
      code_challenge:
        '539a374ff43dce2e894fd4061aa545e6f7f5972d40ee9a1676901fb92125ffee',
      code_challenge_method: 'sha-256',
      'no-redirect': '1',
    });
    this.isTokenLoading$.next(true);
    const url = `${this.baseUrl}${POST_VALIDATE_BY_SIGNATURE}?${params}`;
    let headerDict: {};
    headerDict = {
      'Content-Type': 'application/json',
    };
    if (this.fingerPrintReport$.value) {
      headerDict = {
        'Content-Type': 'application/json',
        fingerPrint: this.fingerPrintReport$.value,
      };
    }
    return this.http
      .post(url, body, {
        headers: new HttpHeaders(headerDict),
        responseType: 'text',
      })
      .subscribe({
        next: (data: any) => {
          const redirect = data.toString().split('?');
          const code = redirect[1].split('=')[1];
          this.getToken(code);
        },
        error: (err: any) => {
          this.isTokenLoading$.next(false);
          this.isLoading$.next(false);
          let error: { [key: string]: string };
          error = { message: '', systemMessage: '' };
          error.message =
            'Произошла неизвестная ошибка. Попробуйте повторить позже.';
          let errObject: any;
          try {
            errObject = JSON.parse(err.error);
            if (errObject && errObject.messages && errObject.messages.length) {
              error = { ...errObject, message: errObject.messages + '' };
              if (errObject.systemMessage && errObject.systemMessage.length) {
                const systemMessage = systemErrors.find((i: any) =>
                  errObject.systemMessage.includes(i.error) ? i : undefined
                );
                if (systemMessage) {
                  error = { ...error, systemMessage: systemMessage.code };
                } else {
                  showRandomMessage(
                    errObject.messages,
                    this.toastrService,
                    'error'
                  );
                  return;
                }
              }
            }
          } catch (error) {
            console.info(error);
            errorMessage(error, this.toastrService);
          }
          errorMessage(error, this.toastrService);
          if (!body.certificate) {
            this.changeLoginError(error);
          }
        },
      });
  }

  getSmsCode(phoneNumber: string): Subscription {
    this.isLoading$.next(true);
    const url = `${this.baseUrl}/oauth2-gateway/authentication/get-push-or-sms/${phoneNumber}?codePurpose=AUTH`;
    let options: {};
    options = {
      responseType: 'text',
    };
    if (this.fingerPrintReport$.value) {
      options = {
        headers: { fingerPrint: this.fingerPrintReport$.value },
        responseType: 'text',
      };
    }
    return this.http.get(url, options).subscribe({
      next: res => {
        this.changeLoginError({});
        this.changeSmsStatus(true);
        this.changeCodeComponentVisible(true);
        this.isNumberSend$.next(true);
        this.isLoading$.next(false);
      },
      error: err => {
        let errMsg =
          'Произошла неизвестная ошибка. Попробуйте повторить позже.';
        if (err.status >= 500 && err.error) {
          try {
            const prsdError = JSON.parse(err.error);
            if (prsdError.messages.length) {
              errMsg = prsdError.messages + '';
            }
          } catch (error) {
            console.info(error);
          }
        } else {
          if (err.error && err.error.messages && err.error.messages.length) {
            errMsg = err.error.messages + '';
          }
        }

        this.changeLoginError({ message: errMsg });
        this.isLoading$.next(false);
      },
      complete: () => {
        // console.info('completed smsCode service')
      },
    });
  }

  getToken(code: string): void {
    this.isTokenLoading$.next(true);
    let body = new URLSearchParams();
    body.set('client_id', environment.auth.clientID);
    body.set('grant_type', 'authorization_code');
    body.set('code_verifier', 'some_string');
    body.set('code', code);

    this.http
      .post<IToken>(`${this.baseUrl}/oauth2-gateway/oauth2/token`, body, {
        headers: this.options.headers,
      })
      .subscribe({
        next: (data: any) => {
          this.setСookie('access_token', data, 3600 * 24, '/');
          this.setСookie('refresh_token', data, 3600 * 24, '/');
          const token = v4();
          sessionStorage.setItem('token', token);
          localStorage.setItem('token', token);
          this.getPrefill();
          this.isLoading$.next(false);
          this.changeSmsStatus(false); // remove Назад btn from the view
          this.changeCodeComponentVisible(false);
          this.router.navigate([WELCOME]);
        },
        error: (err: any) => {
          this.isTokenLoading$.next(false);
          this.changeLoginError(err.messages?.[0]);
        },
        complete: () => {
          this.isTokenLoading$.next(false);
          this.socketService.data$.next({});
        },
      });
  }

  setСookie(name: string, value: any, expires: number, path: string) {
    this.cookieService.set(
      name,
      value[name],
      Math.floor(value.expires_in / expires),
      path
    );
    this.setAuthorizedStatus(true);
  }

  /* Метода запроса смс кода */
  public validateSmsCode(
    phone: string,
    password: string,
    body: any,
    errCb: any
  ): Subscription {
    if (!this.isLoading$.value) {
      this.isLoading$.next(true);
      const url = `${this.baseUrl}/oauth2-gateway/oauth2/auth/validate-by-app-or-sms/${phone}/${password}`;
      let headerDict: {};
      headerDict = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };
      if (this.fingerPrintReport$.value) {
        headerDict = {
          'Content-Type': 'application/x-www-form-urlencoded',
          fingerPrint: this.fingerPrintReport$.value,
        };
      }
      return this.http
        .post(url, body, {
          headers: new HttpHeaders(headerDict),
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
              'Произошла неизвестная ошибка. Попробуйте повторить позже.';
            this.isNumberSend$.next(false);
            this.isRegistered$.next(false);
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
            this.changeLoginError(error);
          },
        });
    } else {
      return null;
    }
  }

  public isAuthenticated() {
    let token = this.cookieService.get('access_token');
    if (token) {
      return true;
    } else {
      return false;
    }
  }

  public getContracts(): Observable<IContracts[]> {
    return this.http.get<IContracts[]>(
      this.baseUrl + '/oauth2-gateway/users/contracts'
    );
  }

  setContracts(value: any) {
    this.contracts.next(value);
  }

  setContractNum(contractNum: number): Observable<any> {
    return this.http.get(
      this.baseUrl + '/oauth2-gateway/users/set-current-contract/' + contractNum
    );
  }

  getUserInfo(): Observable<IUserInfo> {
    return this.http.get<IUserInfo>(
      this.baseUrl + '/oauth2-gateway/users/user-info'
    );
  }

  setDefaultContract(contract: number) {
    this.defaultContract.next(contract);
  }

  setUser(name: string) {
    this.defaultUser.next(name);
  }

  setUserInfo(body: any) {
    this.userInfo$.next(body);
  }

  logout() {
    this.socketData$.next({});
    this.cookieService.deleteAll('/');
    sessionStorage.clear();
    this.setAuthorizedStatus(false);
    this.router.navigate([LOGIN]);
  }

  setCircleColor(contracts: IContracts[], contractNum: number) {
    for (let i: number = 0; i < contracts.length; i++) {
      if (contracts[i].contractNum === contractNum) {
        this.currentContractCircleColor.next(i);
        break;
      }
    }
  }

  getPrefill(): void {
    this.isContractChanged$.next(false);
    // TODO: (Review) Тут создается подписка на "getContracts" и потом не удаляется
    this.getContracts().subscribe(val => {
      this.contracts.next(val);
      this.prefillContracts = val;
      this.setCircleColor(
        this.prefillContracts,
        Number(this.prefilContractNum)
      );
    });

    this.isLoadingUserInfo$.next(true);
    // TODO: (Review) Тут создается подписка на "getUserInfo" и потом не удаляется
    this.getUserInfo().subscribe({
      next: (value: IUserInfo) => {
        this.userInfoObject$.next(value);
        this.defaultContract.next(value.currentContract.contractNum);
        this.defaultUser.next(value.user.name);
        this.userInfo$.next(value.currentContract.name);
        this.prefilContractNum = value.currentContract.contractNum;
        this.setCircleColor(this.prefillContracts, this.prefilContractNum);
        this.isLoadingUserInfo$.next(false);
        // TODO: (Review) Тут создается подписка на "postStatementsRefresh" и потом не удаляется
        this.accountService.postStatementsRefresh().subscribe({
          next: v => {
            this.isContractChanged$.next(false);
          },
        });
      },
      error: error => {
        this.isLoadingUserInfo$.next(false);
        errorMessage(error, this.toastrService);
      },
    });
    // TODO: (Review) Тут создается подписка на "" и потом не удаляется
    this.documentService.getSignersChief().subscribe((data: ICheifSigner[]) => {
      if (data && data.length) {
        this.documentService.firstChiefSigner$.next(data[0]);
        this.documentService.chiefSigners$.next(data);
      } else {
        this.documentService.chiefSigners$.next([]);
      }
    });
    // TODO: (Review) Тут создается подписка на "getSignersAccountant" и потом не удаляется
    this.documentService.getSignersAccountant().subscribe({
      next: (data: any) => {
        if (data.length) {
          this.documentService.accountantSigner$.next(data[0]);
          this.documentService.accountantSigners$.next(data);
        } else {
          this.documentService.accountantSigners$.next([]);
        }
      },
    });
    // TODO: (Review) Тут создается подписка на "getStaffList" и потом не удаляется
    this.operationsService
      .getStaffList()
      .pipe(distinctUntilChanged())
      .subscribe(data => {
        this.operationsService.staffList.next(data.content);
      });
    // TODO: (Review) Тут создается подписка на "getCounteragents" и потом не удаляется
    this.dictionaryService
      .getCounteragents()
      .pipe(distinctUntilChanged())
      .subscribe(data => {
        this.dictionaryService.counteragents$.next(data.content);
      });
  }

  getTariffPackageCharge(): Observable<any> {
    const headers = new HttpHeaders().set(
      'Content-Type',
      'text/plain; charset=utf-8'
    );
    return this.http.get(this.baseUrl + GET_TARIFFS_PACKAGE_CHARGE, {
      headers,
      responseType: 'text',
    });
  }

  getTariffsPackagesByContractByGroup(): Observable<any> {
    return this.http.get(
      this.baseUrl + GET_TARIFFS_PACKAGES_BY_CONTRACT_BY_GROUP
    );
  }

  getTariffInfoById(id: number | string): Observable<any> {
    return this.http.get(
      this.baseUrl + `${GET_TARIFF_INFO_BY_ID}?tarifId=${id}`
    );
  }

  sendConnectTariff(body: any): Observable<any> {
    return this.http.post(this.baseUrl + SEND_CONNECT_TARIFF, body, {
      observe: 'response',
    });
  }

  getTariffStatistics(): Observable<any> {
    return this.http.get(this.baseUrl + GET_TARIFF_STATISTICS);
  }

  disableTariff(id: any): Observable<any> {
    return this.http.post(
      this.baseUrl + `${DISABLE_TARIFF}?tariffId=${id}`,
      null,
      {
        observe: 'response',
      }
    );
  }
}
