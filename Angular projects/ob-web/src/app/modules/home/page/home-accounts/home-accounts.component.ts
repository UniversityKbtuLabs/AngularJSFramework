import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { compareCurrency } from '@app/core/helpers';
import { SubscriptionAccumulator } from '@app/core/helpers/SubscriptionAccumulator';
import { AccountsService } from '@app/core/services/accounts.service';
import { HelperService } from '@app/core/services/helper.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ob-home-accounts',
  templateUrl: './home-accounts.component.html',
  styleUrls: ['./home-accounts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeAccountsComponent
  extends SubscriptionAccumulator
  implements OnInit, OnDestroy
{
  public accounts: any = [];
  public cards: any = [];
  public deposits: any = [];
  public loans: any = [];
  public isLoadingCards: boolean = false;

  isAccountsLoading: boolean = true;
  isCardsLoading: boolean = true;
  isDepositsLoading: boolean = true;
  isLoansLoading: boolean = true;

  private fragment: any;
  public subscriptions: Subscription[] = [];
  cardStatus: string = '';
  accountStatus: string = '';
  cardString: string = '';
  constructor(
    public accountService: AccountsService,
    public changeDetector: ChangeDetectorRef,
    public helperService: HelperService,
    private activeRoute: ActivatedRoute,
    private toasterService: ToastrService,
    private location: Location,
    private router: Router,
    private translate: TranslateService
  ) {
    super();
    this.fragment = this.router.getCurrentNavigation().extras.state?.type;
  }

  ngOnInit() {
    this.location.replaceState('accounts', '', null);
    window.scrollTo(0, 0);
    this.subscriptions.push(this.accountService.getAccountsList());
    this.subscriptions.push(
      this.accountService.getCardsList(this.toasterService)
    );
    this.subscriptions.push(this.accountService.getDepositsList());
    this.subscriptions.push(this.accountService.getLoansList());
    this.accountService.isLoadingCard$.subscribe({
      next: loading => {
        this.isLoadingCards = loading;
        this.changeDetector.detectChanges();
      },
    });
    this.getTranslations();
    let importanceOrder = {
      KZT: 1,
      USD: 2,
      EURO: 3,
    };
    this.accountService.currentAccounts.subscribe((accounts: any) => {
      this.accounts = accounts
        .map((account: any) => ({
          name: this.accountStatus,
          accountInfo: account.iban,
          accountMoreInfo: '',
          amount: account.actualBalance,
          currency: account.currency,
          amountLocked: account.amountLocked,
          active: account.active,
          lockedReasons: account.lockedReasons,
          dictId: account.dictId,
          absState: account.absState,
        }))
        .sort((a: any, b: any) => compareCurrency(a, b) || b.amount - a.amount);

      this.changeDetector.detectChanges();
    });

    this.accountService.currentCards.subscribe((cards: any) => {
      const linkedAccs: any = [];
      const owners: any = {};

      cards?.map((card: any) => {
        if (!card.contractOwnerId) {
          owners[card.contractId] = [
            {
              name: card.accountIban,
              accountInfo: card.contractName,
              accountMoreInfo: card.amountBlocked,
              amount: card.amountBalance,
              currency: card.currencyCode,
              active: card.valid,
              lockedReasons: card.valid !== 'V' ? [this.cardStatus] : [''],
              contractId: card.contractId,
              levelName: card.levelName,
              links: [],
            },
          ];
          linkedAccs.push({
            name: card.corpCardType || 'Карта',
            accountInfo: card.contractName,
            accountMoreInfo: card.amountBlocked,
            amount: card.amountBalance,
            currency: card.currencyCode,
            active: card.valid,
            lockedReasons: card.valid !== 'V' ? [this.cardStatus] : [''],
            contractId: card.contractId,
            levelName: card.levelName,
            links: [],
          });
        }

        return linkedAccs;
      });

      cards.forEach((el: any) => {
        if (Object.keys(owners).includes(el.contractOwnerId?.toString())) {
          owners[el.contractOwnerId]?.[0]?.links?.push({
            name: el.corpCardType || 'Карта',
            accountInfo: `${el.contractName} ${this.helperService.formatIban(
              el.contractNumber,
              'cards'
            )}`,
            accountMoreInfo: el.amountBlocked,
            amount: el.amountBalance,
            currency: el.currencyCode,
            active: el.valid,
            lockedReasons: el.valid !== 'V' ? [this.cardStatus] : [''],
            contractId: el.contractId,
            levelName: el.levelName,
            links: [],
            contractNumber: el.contractNumber,
          });
        }
      });

      this.cards = owners;
      this.changeDetector.detectChanges();
    });

    this.accountService.currentDeposits.subscribe((deposits: any) => {
      this.deposits = deposits?.map((deposit: any) => ({
        dictId: deposit.id,
        name: deposit.depositType,
        accountInfo: deposit.depositClose,
        accountMoreInfo: deposit.bonPaidKzt,
        amount: deposit.depositAmount,
        currency: deposit.currencyCode,
        active: 'Y',
        lockedReasons: [''],
        depositAccount: deposit.depositAccount,
        depositContractNumber: deposit.depositContractNumber,
        type: 'deposit',
        depositClose: deposit.depositClose,
      }));
      this.changeDetector.detectChanges();
    });

    this.accountService.currentLoans$.subscribe((loans: any) => {
      this.loans = loans?.map(function (loan: any) {
        return loan;
      });
      // ({
      //   // name: loan.depositType,
      //   // accountInfo: loan.depositClose,
      //   // accountMoreInfo: loan.bonPaidKzt,
      //   // amount: loan.depositAmount,
      //   currency: loan.currencyCode,
      //   // active: 'Y',
      //   // lockedReasons: [''],
      //   // depositAccount: loan.depositAccount
      // }))
      this.changeDetector.detectChanges();
    });

    /*для проверки на загрузку всех списков*/
    this.addSubscriber(
      this.accountService.accountsLoading$.subscribe({
        next: v => {
          this.isAccountsLoading = v;
          this.changeDetector.detectChanges();
          this.scrollToSection();
        },
      })
    );

    this.addSubscriber(
      this.accountService.cardsLoadingStatus.subscribe({
        next: v => {
          this.isCardsLoading = v;
          this.changeDetector.detectChanges();
          this.scrollToSection();
        },
      })
    );

    this.addSubscriber(
      this.accountService.depositsLoadingStatus.subscribe({
        next: (v: any) => {
          this.isDepositsLoading = v;
          this.changeDetector.detectChanges();
          this.scrollToSection();
        },
      })
    );

    this.addSubscriber(
      this.accountService.loansLoadingStatus$.subscribe({
        next: (v: any) => {
          this.isLoansLoading = v;
          this.changeDetector.detectChanges();
          this.scrollToSection();
        },
      })
    );

    /*для проверки на загрузку всех списков*/
  }

  getTranslations() {
    this.translate
      .get([
        'general.navigation.current-account',
        'cards.card-blocked',
        'cards.name',
      ])
      .subscribe(translations => {
        this.cardStatus = translations['cards.card-blocked'];
        this.accountStatus = translations['general.navigation.current-account'];
        this.cardString = translations['cards.name'];
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.fragment = null;
  }

  scrollToSection() {
    if (
      !this.isAccountsLoading &&
      !this.isCardsLoading &&
      ((this.fragment !== 'deposits' && this.fragment !== 'credits') ||
        !this.isDepositsLoading)
    ) {
      const anchor = document.querySelector<HTMLAnchorElement>(
        '#' + this.fragment
      );
      if (anchor) {
        const eltop = anchor.getBoundingClientRect().top;
        window.scrollBy({
          top: eltop - 200,
          behavior: 'smooth',
        });
      }
    }
  }
}
