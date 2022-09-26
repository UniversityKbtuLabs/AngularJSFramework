/* eslint-disable max-len */
import { Injectable } from '@angular/core';
import { ISocketMessage } from '@app/data/models/socket-message-types';
import { environment } from '@env/environment';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import {
  apiKeyParams,
  changePasswdOptions,
  checkApiKey,
  getCardInfo,
  getCertificateInfoOptions,
  getMacAddressOptions,
  getProfileOptions,
  LoadKeyFromTokensParams,
  nativeSignOptions,
  tumarVersionParams,
} from '../constants/socket';
import {
  checkObjectProperty,
  errorMessage,
  showRandomMessage,
} from '../helpers';

@Injectable()
export class SocketService {
  socket: WebSocketSubject<any>;
  data$: BehaviorSubject<any> = new BehaviorSubject<any>({});
  connectionStatus$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  nativeSignError$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  isOtpModal$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isOtpModalObservable$: Observable<boolean> = this.isOtpModal$.asObservable();
  errors$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  tokenPass$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  public defTokenPassess = ['12345678'];
  private alg: { [key: string]: string } = {
    '43578': 'EC 256/512 (GOST 34.310-2004 A)',
    '10810': 'EC 256/512 (GOST 34.310-kz A)',
    '43584': 'EC 256/512 (GOST 34.310-2004 B)',
    '10816': 'EC 256/512 (GOST 34.310-kz B)',
    '43585': 'EC 256/512 (GOST 34.310-2004 C)',
    '10817': 'EC 256/512 (GOST 34.310-kz C)',
    '43596': 'EC 512/1024(GOST 34.10-2012 A)',
    '43597': 'EC 512/1024(GOST 34.10-2012 B)',
    '42065': 'RSA 1536',
    '42066': 'RSA 2048',
    '42067': 'RSA 3072',
    '42068': 'RSA 4096',
    '41029': 'EC 256/512 (GOST 34.310-2004 A/Xch)',
    '41030': 'EC 256/512 (GOST 34.310-2004 B/Xch)',
    '41038': 'EC 512/1024 (GOST 34.10-12 A/Xhc)',
    '41039': 'EC 512/1024 (GOST 34.10-12 B/Xhc)',
    '41041': 'RSA 1536 (Xch)',
    '41042': 'RSA 2048 (Xch)',
    '41043': 'RSA 3072 (Xch)',
    '41044': 'RSA 4096 (Xch)',
  };

  private wsConfig = {
    openObserver: {
      next: (val: any) => {
        console.log('ws opened', val);
        this.connectionStatus$.next(true);
        this.send(getCardInfo); // sents BaseAPI
      },
    },
    url: 'wss://localhost:6127/tumarcsp/',
    closeObserver: {
      next: (val: any) => {
        console.log('ws closed');
      },
    },
  };

  constructor(private toastrService: ToastrService) {}

  connect(cb: any = () => {}) {
    // 'wss://localhost:6127/tumarcsp/'
    this.socket = webSocket(this.returnWsConfig(cb));
    this.socket.subscribe({
      next: message => {
        this.onMessageFromServer(message);
      },
      error: err => {
        cb();
        console.info('ws error', err);
        this.connectionStatus$.next(false);
        errorMessage(
          { message: 'Проверьте подключение токена' },
          this.toastrService
        );
      },
      complete: () => {
        console.info('ws completed');
      },
    });
  }

  returnWsConfig(callBack: any = () => {}) {
    return {
      openObserver: {
        next: (val: any) => {
          callBack();
          console.log('ws opened');
          this.connectionStatus$.next(true);
          // this.send(getCardInfo) // sents BaseAPI
          this.checkApiKey();
        },
      },
      url: 'wss://localhost:6127/tumarcsp/',
      closeObserver: {
        next: (val: any) => {
          console.log('ws closed');
          callBack();
        },
      },
    };
  }

  getCertGostInfo(code: string): string {
    return this.alg[code];
  }

  close() {
    if (this.socket) {
      this.data$.next({});
      this.socket.complete();
    }
  }

  checkApiKey() {
    this.send(checkApiKey);
  }

  setApiKey(cb: any = null) {
    if (cb) {
      this.data$.next({
        ...this.data$.value,
        signedChallenge: undefined,
      });
      this.send(apiKeyParams);
      cb();
    } else {
      this.send(apiKeyParams);
    }
  }

  getVersion() {
    this.send(tumarVersionParams);
  }

  getCertList() {
    this.send(LoadKeyFromTokensParams);
  }

  getProfInfo(profile: string) {
    const options = getProfileOptions;
    options.Param.profile = profile;
    options.Param.pass = this.tokenPass$.value;
    this.send(getProfileOptions);
  }

  getMacAddres() {
    this.send(getMacAddressOptions);
  }

  changeTokenPass(newPass: string, pass: string, profile: string, id: string) {
    const options = { ...changePasswdOptions };
    options.Param.newPass = newPass;
    options.Param.pass = pass;
    options.Param.profile = profile;
    options.Param.id = id;
    this.tokenPass$.next(pass);
    this.send(options);
  }

  signChallenge(challenge: string, pass: string, profile: string, sn: string) {
    const options = { ...nativeSignOptions };
    options.Param.pass = pass;
    options.Param.data = challenge;
    options.Param.profile = profile;
    options.Param.sn = sn;
    this.tokenPass$.next(pass);
    this.send(options);
  }

  onMessageFromServer(message: any) {
    if (message.result === 'true') {
      this.successHandler(message);
    } else {
      this.errorHandler(message);
    }
  }

  getCertificateInfo() {
    this.send(getCertificateInfoOptions);
  }

  sortCertList(list: any) {
    return list.sort(function (a: any, b: any) {
      const aDate = moment(a.validFrom, 'YYYYMMDDhhmmssZ');
      const bDate = moment(b.validFrom, 'YYYYMMDDhhmmssZ');
      if (aDate.isAfter(bDate, 'second')) {
        return -1;
      } else if (aDate.isSame(bDate, 'second')) {
        return 0;
      } else {
        return 1;
      }
    });
  }

  successHandler(message: any, options: any = null) {
    const data = this.data$.value;

    switch (message.Function) {
      case 'CheckAPIKey': {
        this.data$.next({ ...data, isApiKeyChecked: true });
        this.setApiKey();
        break;
      }
      case 'SetAPIKey': {
        this.data$.next({ ...data, isApiKeyValid: true });
        this.getVersion();
        break;
      }
      case 'GetVersion': {
        this.data$.next({ ...data, version: message.response });
        this.getCertList();
        break;
      }
      case 'LoadKeyFromTokens': {
        this.errors$.next(undefined);
        let certificates = [];
        for (const key in message) {
          if (
            checkObjectProperty(() => message[key].certificateBlob) &&
            this.checkExpireDate(message[key].validTo)
          ) {
            certificates.push(message[key]);
          }
        }

        let filteredCerts = certificates.filter(function (cert: any) {
          const isProduction = environment.production;
          const checkProperty = isProduction
            ? 'OnlineBank CA'
            : 'OnlineBank TEST CA';
          if (cert.keyBlob && cert.issuerDN) {
            console.info(checkProperty);
            let issuerDN = cert.issuerDN.split(';');
            console.info(issuerDN[0]);
            if (
              issuerDN &&
              issuerDN.length &&
              issuerDN[0].includes(checkProperty)
            ) {
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        });
        console.info(filteredCerts);

        if (filteredCerts.length) {
          filteredCerts = this.sortCertList(filteredCerts);
          this.data$.next({
            ...data,
            certificates: filteredCerts,
            isLoadedKeysFromToken: true,
          });

          let profile = '';
          if (sessionStorage.getItem('sn')) {
            const sn = sessionStorage.getItem('sn');
            const cert = filteredCerts.find((c: any) => c.serialNumber === sn);
            if (cert) {
              sessionStorage.setItem('sn', cert.serialNumber);
              profile = cert.profile;
              this.getProfInfo(profile);
            } else {
              showRandomMessage(
                `Сертификат ${sn.substring(0, 5)} не найден`,
                this.toastrService,
                'error'
              );
              this.close();
              return;
            }
          } else {
            profile = sessionStorage.getItem('profile');
            if (profile) {
              this.getProfInfo(profile);
            }
          }
        } else {
          showRandomMessage(
            `Сертификаты отсутствуют`,
            this.toastrService,
            'error'
          );
        }

        break;
      }
      case 'GetProfInfo': {
        this.data$.next({ ...data, isProfileInfoLoaded: true });
        this.getMacAddres();
        break;
      }
      case 'GetMACAddress': {
        // console.info(message)
        this.data$.next({
          ...data,
          isMACAddressLoaded: true,
          macaddr: message.macaddr[0],
        });
        this.getCertificateInfo;
        break;
      }
      case 'ShowInfoCertificate': {
        this.data$.next({
          ...data,
          isCertificateInfoPresent: true,
          serNum: message.SerNum,
        });
        break;
      }
      case 'NativeSign': {
        this.data$.next({ ...data, signedChallenge: message.response });
        break;
      }
      default:
        this.data$.next({ ...data, id: message.id });
        break;
    }
  }

  errorHandler(error: ISocketMessage) {
    switch (error.code) {
      case '10001': {
        errorMessage(
          { message: 'Ошибка лицензионного ключа' },
          this.toastrService
        );
        break;
      }
      case '-2146893807': {
        errorMessage(
          { message: 'Проверьте подключение токена' },
          this.toastrService
        );
        this.errors$.next('token_not_present');
        break;
      }
      case '2148073488': {
        this.tokenPass$.next('');
        this.nativeSignError$.next('Пароль не верный');
        errorMessage({ message: 'Пароль не верный' }, this.toastrService);
        break;
      }
      case '2148073478': {
        errorMessage(
          { message: 'Произошла неизвестная ошибка' },
          this.toastrService
        );
        break;
      }
      default:
        errorMessage(
          { message: 'Произошла неизвестная ошибка' },
          this.toastrService
        );
        break;
    }
  }

  send(message: any) {
    this.socket.next(message);
  }

  checkExpireDate(date: string): boolean {
    const now = moment();
    const validTo = moment(date, 'YYYYMMDDhhmmssZ');
    return validTo.isAfter(now);
  }
}
