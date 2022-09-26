import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MainService } from '@core/services/main.service';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { AccountsService } from '@core/services/accounts.service';
import {
  IAccountInfo,
  IFormattedAccounts,
  ICardInfo,
  IFormattedKeys,
  IAccountType,
} from '@data/models/account-types';
import { compareCurrency, getIn } from '@app/core/helpers';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
import { dateFormat, requestDateFormat } from '@app/core/constants';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ob-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsComponent
  extends SubscriptionAccumulator
  implements OnInit
{
  public accounts: IAccountInfo[] = [];
  public formattedAccounts: IFormattedAccounts[] = [];

  public cards: ICardInfo[] = [];
  public loans: ICardInfo[] = [];
  public formattedCards: IFormattedAccounts[] = [];

  public deposits: any = [];
  public formattedDeposits: any = [];
  public accountsLength: number = 0;
  public depositsLength: number = 0;
  public creditsLength: number = 0;
  public cardsLength: number = 0;
  public formattedLoans: any = [];
  public lockedLabel: string = '';
  public expirationTime: string = '';
  public checkingAccount: string = '';
  public deposit: string = '';
  public card: string = '';

  constructor(
    public router: Router,
    public activateRouter: ActivatedRoute,
    public accountsService: AccountsService,
    public mainService: MainService,
    private changeDetector: ChangeDetectorRef,
    public toasterService: ToastrService,
    public translate: TranslateService
  ) {
    super();
  }

  ngOnInit() {
    this.accountsService.accountsCounter$.subscribe({
      next: accounts => {
        this.accountsLength = getIn(accounts, 'accounts') || 0;
        this.depositsLength = getIn(accounts, 'deposits') || 0;
        this.creditsLength = getIn(accounts, 'loans') || 0;
        this.cardsLength = getIn(accounts, 'cards') || 0;
        this.changeDetector.detectChanges();
      },
    });
    this.addSubscriber(
      this.accountsService.currentAccounts.subscribe(
        (accounts: IAccountInfo[]) => {
          accounts = accounts.sort(
            (a: any, b: any) =>
              compareCurrency(a, b) || b.actualBalance - a.actualBalance
          );
          const formattedAccounts: IFormattedAccounts[] =
            this.formattingAccounts(accounts, 'accounts');

          this.accounts = accounts;
          this.formattedAccounts = formattedAccounts;

          this.changeDetector.detectChanges();
        }
      )
    );

    this.addSubscriber(
      this.accountsService.currentCards.subscribe((cards: ICardInfo[]) => {
        const formattedCards: IFormattedAccounts[] = this.formattingAccounts(
          cards,
          'cards'
        );

        this.cards = cards;
        this.formattedCards = formattedCards;

        this.changeDetector.detectChanges();
      })
    );

    this.addSubscriber(
      this.accountsService.currentDeposits.subscribe((deposits: any) => {
        const formattedDeposits: any = this.formattingAccounts(
          deposits,
          'deposits'
        );

        this.deposits = deposits;
        this.formattedDeposits = formattedDeposits;

        this.changeDetector.detectChanges();
      })
    );

    this.addSubscriber(
      this.accountsService.currentLimitedLoans$.subscribe(
        (loans: ICardInfo[]) => {
          const formattedCredits: any = this.formattingAccounts(loans, 'loans');

          this.cards = loans;
          this.formattedLoans = formattedCredits;

          this.changeDetector.detectChanges();
        }
      )
    );

    this.addSubscriber(this.accountsService.getLimitedAccountList());
    this.addSubscriber(
      this.accountsService.getLimitedCardList(this.toasterService)
    );
    this.addSubscriber(this.accountsService.getLimitedDepositsList());
    this.addSubscriber(this.accountsService.getLimitedLoansList());
    this.getTranslations();
  }

  getTranslations() {
    this.translate
      .get([
        'accounts.actions.bloked',
        'accounts.expiration-time',
        'accounts.checking-account',
        'acccountSavings.deposit.deposit',
        'cards.name',
      ])
      .subscribe(translations => {
        this.lockedLabel = translations['accounts.actions.bloked'];
        this.expirationTime = translations['accounts.expiration-time'];
        this.checkingAccount = translations['accounts.checking-account'];
        this.deposit = translations['acccountSavings.deposit.deposit'];
        this.card = translations['cards.name'];
      });
  }
  redirectTo() {
    this.router.navigate(['/accounts']);
  }

  formattingAccounts(list: any, type: IAccountType): IFormattedAccounts[] {
    const keys: IFormattedKeys = {
      accounts: {
        id: 'dictId',
        label: 'iban',
        amount: 'actualBalance',
        currency: 'currency',
        name: '',
        status: 'active',
        blockReason: 'lockedReasons',
        absState: 'absState',
      },
      cards: {
        id: 'contractId',
        label: 'accountIban',
        amount: 'amountBalance',
        currency: 'currencyCode',
        name: '',
        status: 'valid',
        blockReason: '',
      },
      deposits: {
        id: 'id',
        label: 'depositClose',
        amount: 'balance',
        currency: 'currencyCode',
        name: '',
        status: 'valid',
        blockReason: 'lockedReasons',
      },
      loans: {
        id: 'id',
        label: 'number',
        amount: 'sdok',
        currency: 'valCode',
        name: '',
        status: 'valid',
        blockReason: 'lockedReasons',
      },
    };

    if (type === 'cards') {
      const cardList: any = [];

      list.forEach((card: any) => {
        if (card.contractOwnerId) {
          cardList.push({
            id: card.contractId,
            label: card.contractName,
            amount: card.amountBalance,
            currency: card.currencyCode,
            name: getIn(card, 'corpCardType') || this.card, // contractType
            number: card.contractNumber,
            status: card.valid,
            blockReason: this.lockedLabel,
          });
        }
      });

      return cardList;
    } else {
      return list.map((item: any) => {
        let label = item[keys[type]['label']];
        if (type === 'deposits' && label) {
          label = `${this.expirationTime} ${moment(
            label,
            requestDateFormat
          ).format(dateFormat)}`;
        }
        return {
          id: item[keys[type]['id']],
          label,
          amount: item[keys[type]['amount']],
          currency: item[keys[type]['currency']],
          name:
            type === 'accounts'
              ? this.checkingAccount
              : type === 'deposits'
              ? this.deposit
              : '',
          status: type === 'deposits' ? 'V' : item[keys[type]['status']],
          blockReason: item[keys[type]?.['blockReason']]?.[0],
          absState: type === 'accounts' ? item[keys[type]['absState']] : '',
        };
      });
    }
  }
}
