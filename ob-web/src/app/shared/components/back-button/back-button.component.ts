import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { depositTypes } from '@app/core/constants';
import { TranslateService } from '@ngx-translate/core';
import { GUARANTEES_STATUSES } from '@modules/guarantees/dictionaries/guarantees-statuses';
import { GUARANTEES } from '@core/constants/pathnames';
import { SubscriptionAccumulator } from '@app/core/helpers/SubscriptionAccumulator';

@Component({
  selector: 'ob-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackButtonComponent
  extends SubscriptionAccumulator
  implements OnInit
{
  @Input() currentPage: string = '';
  linkList: any[] = [];
  fragment: string = '';

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    public translate: TranslateService,
    private changeDetector: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.linkList = this.initLinks();
    this.onUrlChanges();
  }

  onUrlChanges() {
    this.addSubscriber(
      this.router.events.subscribe((event: any) => {
        if (event instanceof NavigationEnd) {
          this.linkList = this.initLinks();
          this.changeDetector.detectChanges();
        }
      })
    );
  }

  initLinks(): any[] {
    switch (this.currentPage) {
      case 'home_accounts':
        return this.getHomeAccountLinks();
      // return [
      //     {name: 'Все счета', path: '', active: true},
      // ]
      case 'home_operations':
        return [
          {
            name: 'default.texts.transactionsAndRequest',
            path: '',
            active: true,
          },
        ];
      case 'account':
        return this.getAccountLinks();
      case 'operation':
        return this.getOperationLinks();
      case 'product':
        return this.getProductLinks();
      case 'currency_controll':
        return this.getCurrencyControlLinks();
      case 'profile':
        return this.getProfileLinks();
      case GUARANTEES:
        return this.getGuaranteesLinks();
      default:
        return [];
    }
  }

  getHomeAccountLinks() {
    this.activeRoute.fragment.subscribe(frag => (this.fragment = frag));
    switch (this.fragment) {
      case 'all-accounts':
        return [{ name: 'accounts.allAccounts', path: '', active: true }];
      case 'accounts':
        return [{ name: 'accounts.allAccounts', path: '', active: true }];

      case 'cards':
        return [{ name: 'accounts.allAccounts', path: '', active: true }];
      case 'deposits':
        return [{ name: 'accounts.allAccounts', path: '', active: true }];
      default:
        return [{ name: 'accounts.allAccounts', path: '', active: true }];
    }
  }

  getAccountLinks() {
    let type = this.router.url.split('/')[1];
    if (type === 'account') {
      return [
        {
          name: 'accounts.allAccounts',
          path: 'accounts',
          active: false,
          fragment: 'accounts',
        },
        { name: 'general.navigation.current-account', path: '', active: true },
      ];
    } else if (type === 'card') {
      return [
        {
          name: 'accounts.allAccounts',
          path: 'accounts',
          active: false,
          fragment: 'cards',
        },
        { name: 'general.navigation.current-card', path: '', active: true },
      ];
    } else if (type === 'card-account') {
      return [
        {
          name: 'accounts.allAccounts',
          path: 'accounts',
          active: false,
          fragment: 'cards',
        },
        {
          name: 'general.navigation.current-card-account',
          path: '',
          active: true,
        },
      ];
    } else if (type === 'deposit') {
      return [
        {
          name: 'accounts.allAccounts',
          path: 'accounts',
          active: false,
          fragment: 'deposits',
        },
        { name: 'general.navigation.current-deposit', path: '', active: true },
      ];
    } else {
      return [
        {
          name: 'accounts.allAccounts',
          path: 'accounts',
          active: false,
          fragment: 'credits',
        },
        { name: 'general.navigation.current-credit', path: '', active: true },
      ];
    }
  }

  getGuaranteesLinks() {
    const routeParts = this.router.url.split('/');
    const status = routeParts.length > 2 ? routeParts[2] : '';
    if (status === GUARANTEES_STATUSES.new) {
      return [
        { name: 'default.guarantees', path: 'guarantees', active: false },
        { name: 'guarantee.newGuarantee', path: '', active: true },
      ];
    } else if (status === GUARANTEES_STATUSES.existing) {
      return [
        { name: 'default.guarantees', path: 'guarantees', active: false },
        { name: 'guarantee.currentGuarantee', path: '', active: true },
      ];
    }
    return [];
  }

  navigate(link: any) {
    if (link.fragment) {
      this.router.navigateByUrl(link.path, { state: { type: link.fragment } });
    } else if (link.queryParam) {
      this.router.navigate([link.path], { queryParams: link.queryParam });
    } else {
      this.router.navigate([link.path]);
    }
  }

  navigateHome() {
    this.router.navigate(['/home']);
  }

  private getOperationLinks() {
    let operationType = this.activeRoute.snapshot.paramMap.get('operationType');
    let type = this.activeRoute.snapshot.paramMap.get('type');
    if (operationType === 'payment') {
      switch (type) {
        case 'counteragent':
          return [
            {
              name: 'home.welcome.operation',
              path: '/operations',
              active: false,
            },
            { name: 'operations.countragent.title', path: '', active: true },
          ];
        case 'salary':
          return [
            {
              name: 'home.welcome.operation',
              path: '/operations',
              active: false,
            },
            { name: 'operations.type.PAY_SALARY_V2', path: '', active: true },
          ];
        case 'budget':
          return [
            {
              name: 'home.welcome.operation',
              path: '/operations',
              active: false,
            },
            { name: 'operations.type.PAY_BUDGET', path: '', active: true },
          ];
        case 'retirement':
          return [
            {
              name: 'home.welcome.operation',
              path: '/operations',
              active: false,
            },
            { name: 'operations.type.PAY_PENSION_V2', path: '', active: true },
          ];
        case 'social':
          return [
            {
              name: 'home.welcome.operation',
              path: '/operations',
              active: false,
            },
            { name: 'operations.type.PAY_SOCIAL_V2', path: '', active: true },
          ];
        case 'osms':
          return [
            {
              name: 'home.welcome.operation',
              path: '/operations',
              active: false,
            },
            {
              name: 'operations.type.PAY_MEDICAL_INSURANCE',
              path: '',
              active: true,
            },
          ];
        case 'accounts':
          return [
            {
              name: 'home.welcome.operation',
              path: '/operations',
              active: false,
            },
            {
              name: 'operations.type.PAY_BETWEEN_ACCOUNTS',
              path: '',
              active: true,
            },
          ];
        case 'card':
          return [
            {
              name: 'home.welcome.operation',
              path: '/operations',
              active: false,
            },
            { name: 'operations.type.PAY_P2P', path: '', active: true },
          ];
        default:
          return [];
      }
    } else {
      switch (type) {
        case 'accounts':
          return [
            {
              name: 'home.welcome.operation',
              path: '/operations',
              active: false,
            },
            {
              name: 'operations.type.PAY_BETWEEN_ACCOUNTS',
              path: '',
              active: true,
            },
          ];
        case 'card':
          return [
            {
              name: 'home.welcome.operation',
              path: '/operations',
              active: false,
            },
            { name: 'operations.type.PAY_P2P', path: '', active: true },
          ];
        default:
          return [];
      }
    }
  }

  getProductLinks() {
    let productType = this.activeRoute.snapshot.paramMap.get('productType');
    let path = this.router.url;
    if (path.includes('create')) {
      switch (productType) {
        case 'account':
          return [
            { name: 'menu.products', path: '/products', active: false },
            {
              name: 'products.accounts.openAccountTitle',
              path: '',
              active: true,
            },
          ];
        case 'deposit':
          let depositType = this.activeRoute.snapshot.queryParamMap.get('type');
          depositTypes.includes(depositType) ? '' : (depositType = '');
          return !depositType
            ? [
                { name: 'menu.products', path: '/products', active: false },
                { name: 'products.deposits.deposit', path: '', active: true },
              ]
            : [
                { name: 'menu.products', path: '/products', active: false },
                {
                  name: `products.deposits.${depositType}`,
                  path: '',
                  active: true,
                },
              ];
        case 'business-card':
          return [
            { name: 'menu.products', path: '/products', active: false },
            { name: 'cards.business', path: '', active: true },
          ];
        default:
          return [];
      }
    } else {
      return [];
    }
  }

  private getCurrencyControlLinks() {
    let path = this.router.url.split('/');
    if (
      path.includes('convertation') ||
      path.includes('convertation?template=edit')
    ) {
      return [
        {
          name: 'menu.currency-control',
          path: '/currency-control',
          active: false,
        },
        {
          name: 'operations.type.CURR_EXCHANGE_V2',
          path: '/currency-control/convertation',
          active: true,
        },
      ];
    } else if (
      path.includes('currency-transfer') ||
      path.includes('currency-transfer?template=edit')
    ) {
      return [
        {
          name: 'menu.currency-control',
          path: '/currency-control',
          active: false,
        },
        {
          name: 'currencyControl.currencyTransfer.name',
          path: '/currency-control/currency-transfer',
          active: true,
        },
      ];
    } else if (path.includes('halykfx')) {
      return [
        {
          name: 'exchange.halykFx',
          path: '/currency-control/halykfx',
          active: true,
        },
      ];
    } else if (
      path.includes('contract-creation') ||
      path.includes('contract-creation?template=edit')
    ) {
      return [
        {
          name: 'menu.currency-control',
          path: '/currency-control',
          active: false,
        },
        {
          name: 'operations.type.add_currency_contract',
          path: '/currency-control/contract-creation',
          active: true,
        },
      ];
    } else {
      return [];
    }
  }

  getProfileLinks() {
    let path = this.router.url.split('/');
    if (path.length === 3 && path[1] === 'settings') {
      return [
        { name: 'menu.settings', path: '/settings/company', active: true },
      ];
    } else if (path.length > 3 && path[2] === 'tariffs') {
      return this.getTariffLinks();
    } else {
      return [];
    }
  }

  getTariffLinks() {
    let path = this.router.url.split('/');
    if (path.includes('all')) {
      return [
        { name: 'menu.settings', path: '/settings/company', active: false },
        {
          name: 'settings.tarif.title',
          path: '/settings/tariffs',
          active: true,
        },
      ];
    } else if (path.includes('connect')) {
      const tariffName = this.activeRoute.snapshot.params['tariffName'];
      return [
        { name: 'menu.settings', path: '/settings/company', active: false },
        {
          name: 'settings.tarif.title',
          path: '/settings/tariffs',
          active: false,
        },
        {
          name: 'settings.tarif.connectTariff',
          path: `/settings/tariffs/connect/${tariffName}`,
          active: true,
        },
      ];
    } else if (path.includes('details')) {
      const tariffName = this.activeRoute.snapshot.params['tariffName'];
      const tariffId = this.activeRoute.snapshot.params['tariffid'];
      return [
        { name: 'menu.settings', path: '/settings/company', active: false },
        {
          name: 'settings.tarif.title',
          path: '/settings/tariffs',
          active: false,
        },
        {
          name: 'settings.tarif.tariffInfo',
          path: `/settings/tariffs/connect/${tariffName}/${tariffId}`,
          active: true,
        },
      ];
    } else {
      return [];
    }
  }
}
