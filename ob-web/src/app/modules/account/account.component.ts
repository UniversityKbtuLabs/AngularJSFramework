import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MainService } from '@core/services/main.service';
import { AccountsService } from '@core/services/accounts.service';
import { SubscriptionAccumulator } from '@app/core/helpers/SubscriptionAccumulator';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { fingerprintReport, getIn } from '@app/core/helpers';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { AccountHistoryService } from '@app/core/services/account-history.service';

@Component({
  selector: 'ob-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent
  extends SubscriptionAccumulator
  implements OnInit, OnDestroy
{
  public data: any = null;
  public iban: string = '';
  public type: string = '';
  public isSettingsOpen: boolean = false;
  public isAccountInfoLoading: boolean = false;
  public isLoadingCards: boolean = false;
  public cardsList: any;
  public accInfoSubscription: Subscription;
  public accSubscription: Subscription;
  public cardListSubscr: Subscription;
  public subscrList: any[] = [];
  modalRef?: BsModalRef;
  public previousUrl: string = '';
  public isErrorPage: boolean = false;
  public fragment: string = '';
  public currentAccountLabel: string = '';
  public depositLabel: string = '';
  public cardAccountLabel = '';
  public cardLabel = '';
  public isFingerPrintLoaded: boolean = false;
  public isReportLoaded: boolean = false;

  constructor(
    private changeDetector: ChangeDetectorRef,
    public mainService: MainService,
    public accountsService: AccountsService,
    public activatedRoute: ActivatedRoute,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private router: Router,
    private translate: TranslateService,
    private accountHistoryService: AccountHistoryService
  ) {
    super();
    this.setFingerPrint = this.setFingerPrint.bind(this);
  }

  ngOnInit(): void {
    this.accountHistoryService.fingerPrintReport$.subscribe({
      next: report => {
        if (report) {
          this.isReportLoaded = true;
          this.changeDetector.detectChanges();
        }
      },
    });
    if (!this.accountHistoryService.fingerPrintReport$.value) {
      const callBack = () => {
        this.isFingerPrintLoaded = true;
        fingerprintReport(this.setFingerPrint, () => {
          this.isFingerPrintLoaded = false;
          this.isReportLoaded = true;
        });
        this.changeDetector.detectChanges();
      };
      if (window.requestIdleCallback) {
        window.requestIdleCallback(callBack);
      } else {
        setTimeout(callBack, 500);
      }
    }
    this.activatedRoute.fragment.subscribe(frag => (this.fragment = frag));
    this.accountsService.previousUrl.subscribe(value => {
      this.previousUrl = value;
    });
    this.type = this.router.url.split('/')[1];
    this.accountsService.isAccountSettingsOpen.subscribe((value: boolean) => {
      this.isSettingsOpen = value;
    });
    this.getTranslations();

    this.cardListSubscr = this.accountsService.currentCards.subscribe({
      next: cards => {
        this.cardsList = cards;
        if (this.type === 'card') {
          if (cards.length) {
            this.getAccountById();
          }
        } else {
          this.getAccountById();
        }
        this.changeDetector.detectChanges();
      },
    });

    if (this.type === 'card' && this.cardsList.length === 0) {
      this.addSubscriber(this.accountsService.getCardsList(this.toastr));
    }

    this.addSubscriber(
      this.accountsService.accountInfoLoading$.subscribe({
        next: v => {
          this.isAccountInfoLoading = v;
          this.changeDetector.detectChanges();
        },
      })
    );

    this.addSubscriber(
      this.accountsService.isErrorPage$.subscribe({
        next: v => {
          this.isErrorPage = v;
        },
      })
    );

    this.addSubscriber(
      this.accountsService.isLoadingCard$.subscribe({
        next: v => {
          this.isLoadingCards = v;
          this.changeDetector.detectChanges();
        },
      })
    );

    this.accInfoSubscription =
      this.accountsService.observableAccountInfo$.subscribe({
        next: data => {
          if (Object.keys(data).length) {
            const keys: any = {
              account: {
                name: '',
                amount: 'actualBalance',
                amountLocked: 'amountLocked',
                iban: 'iban',
                currency: 'currency',
                turnOnCredit: 'turnOnCredit',
                turnOnDebet: 'turnOnDebet',
                inRemainder: 'inRemainder',
                outRemainder: 'outRemainder',
                valid: 'active',
                id: 'contractId',
              },
              card: {
                name: 'corpCardType',
                clientName: 'contractName',
                iin: 'iin',
                amount: 'amountBalance',
                iban: 'accountIban',
                currency: 'currencyCode',
                turnOnCredit: 'turnOnCredit',
                turnOnDebet: 'turnOnDebet',
                inRemainder: 'inRemainder',
                outRemainder: 'outRemainder',
                valid: 'valid',
                id: 'contractId',
              },
              'card-account': {
                name: 'corpCardType',
                clientName: 'contractName',
                iin: 'iin',
                amount: 'amountBalance',
                iban: 'accountIban',
                currency: 'currencyCode',
                turnOnCredit: 'turnOnCredit',
                turnOnDebet: 'turnOnDebet',
                inRemainder: 'inRemainder',
                outRemainder: 'outRemainder',
                valid: 'valid',
                id: 'contractId',
                amountBlocked: 'amountBlocked',
              },
            };
            this.data = {
              name:
                this.type !== 'card'
                  ? this.returnName(this.type)
                  : data[keys?.[this.type].name] || this.cardLabel,
              amount: data[keys?.[this.type].amount],
              iban: data[keys?.[this.type].iban],
              currency: data[keys?.[this.type].currency],
              valid: data[keys?.[this.type]?.valid],
              id: data[keys?.[this.type].id],
              level: getIn(data, 'level'),
              clientName: data[keys?.[this.type]?.clientName],
              iin: data[keys?.[this.type]?.iin],
              contractName: data.contractName,
              contractNumber: data.contractNumber,
              cardExpire: data.cardExpire,
              clientIdRef: getIn(data, 'clientIdRef'),
              contractId: getIn(data, 'contractId'),
              amountBlocked: getIn(data, 'amountBlocked'),
              amountLocked: getIn(data, 'amountLocked'),
              absState: getIn(data, 'absState'),
              active: getIn(data, 'active'),
            };
            this.iban = data[keys?.[this.type].iban];
            this.changeDetector.detectChanges();
            if (this.type === 'card') {
              // console.info(`cards: ${this.cardsList.length}`)
            } else {
              this.getAccountById();
            }
          }
        },
      });
  }

  isLoadingPage() {
    const res =
      this.isAccountInfoLoading ||
      this.isLoadingCards ||
      this.isFingerPrintLoaded;
    return res;
  }

  setFingerPrint(report: any) {
    async function getReport(): Promise<any> {
      const zipUtil = await import('lz-string');
      const zipContents = await zipUtil.compressToEncodedURIComponent(report);
      return zipContents;
    }
    getReport()
      .then(res => {
        this.accountHistoryService.fingerPrintReport$.next(res);
        this.isFingerPrintLoaded = false;
        this.changeDetector.detectChanges();
      })
      .catch(err => {
        this.isFingerPrintLoaded = false;
        this.changeDetector.detectChanges();
      });
  }

  returnName(type: string) {
    switch (type) {
      case 'account':
        return this.currentAccountLabel;
      case 'deposit':
        return this.depositLabel;
      case 'card-account':
        return this.cardAccountLabel;
      default:
        return type;
    }
  }

  getTranslations() {
    this.translate
      .get([
        'accounts.current-account',
        'accounts.deposit',
        'accounts.card-account',
      ])
      .subscribe(translates => {
        this.currentAccountLabel = translates['accounts.current-account'];
        this.depositLabel = translates['accounts.deposit'];
        this.cardAccountLabel = translates['accounts.card-account'];
        this.cardLabel = translates['accounts.card'];
      });
  }
  getAccountById() {
    // if (this.accInfoSubscription) {
    // 	this.accInfoSubscription.unsubscribe()
    // }
    const id = this.activatedRoute.snapshot.params['id'];
    let clientIdRef;
    if (this.cardsList) {
      const cardId = parseInt(id, 10);
      if (this.type === 'card') {
        const client = this.cardsList.find((i: any) => i.contractId === cardId);
        if (client) {
          clientIdRef = client.clientIdRef;
        }
      }
      if (this.type === 'card-account') {
        const client = this.cardsList.find(function (c: any) {
          return getIn(c, 'level') === 1 && c.contractId === cardId
            ? c
            : undefined;
        });
        if (client) {
          clientIdRef = client.clientIdRef;
        }
      }
    }

    this.subscrList.push(
      this.accountsService.getAccounById2(id, this.type, clientIdRef, () => {
        if (this.subscrList.length) {
          this.subscrList.forEach(i => i.unsubscribe());
        }
      })
    );
  }

  ngOnDestroy(): void {
    if (this.cardListSubscr) {
      this.cardListSubscr.unsubscribe();
    }
    if (this.subscrList.length) {
      this.subscrList.forEach(i => i.unsubscribe());
    }
    if (this.accInfoSubscription) {
      this.accInfoSubscription.unsubscribe();
    }
    this.accountsService.setAccountInfo([]);
    this.modalService.hide(1);
    this.accountsService.changeAccountSettingsStatus(false); //закрывает настройки при выходе со страницы
  }
}
