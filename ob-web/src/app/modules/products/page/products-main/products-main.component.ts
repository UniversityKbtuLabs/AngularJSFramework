import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { productsList } from '@app/core/constants';
import { getIn } from '@app/core/helpers';
import { AccountsService } from '@app/core/services/accounts.service';
import { environment } from '@env/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ob-products-main',
  templateUrl: './products-main.component.html',
  styleUrls: ['./products-main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsMainComponent implements OnInit, OnDestroy {
  public productsList: any = [];
  public tabs: any[] = [];
  public tab: string = 'ALL';
  public requisitesSubscriptionPdf: Subscription;
  public activeSection: string;
  public userProductList: any = {};
  public windowScrolled: boolean = false;
  public isProduction: boolean = environment.production;

  // Subscriptions
  public accountsSubscription: Subscription;
  public accountListSubscription: Subscription;
  public cardListSubscription: Subscription;
  public creditListSubscription: Subscription;
  public depositListSubscription: Subscription;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private router: Router,
    private accountsService: AccountsService,
    private route: ActivatedRoute
  ) {
    if (this.route.snapshot.queryParamMap.get('page')) {
      this.tab = this.route.snapshot.queryParamMap.get('page');
    }
  }

  @HostListener('window:scroll', []) //для появления кнопки скролла наверх
  onWindowScroll() {
    if (
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop > 100
    ) {
      this.windowScrolled = true;
    } else if (
      (this.windowScrolled && window.pageYOffset) ||
      document.documentElement.scrollTop ||
      document.body.scrollTop < 10
    ) {
      this.windowScrolled = false;
    }
  }

  ngOnInit(): void {
    this.accountListSubscription = this.accountsService.getLimitedAccountList();
    this.cardListSubscription = this.accountsService.getLimitedCardList();
    this.depositListSubscription =
      this.accountsService.getLimitedDepositsList();
    this.creditListSubscription = this.accountsService.getLimitedLoansList();

    this.accountsSubscription = this.accountsService.accountsCounter$.subscribe(
      {
        next: accounts => {
          this.userProductList['accounts'] = getIn(accounts, 'accounts') || 0;
          this.userProductList['deposits'] = getIn(accounts, 'deposits') || 0;
          this.userProductList['credits'] = getIn(accounts, 'loans') || 0;
          this.userProductList['cards'] = getIn(accounts, 'cards') || 0;
          this.changeDetector.detectChanges();
        },
      }
    );
    this.onTabChange(this.tab);

    /* TODO в блоке слева должны отображаться только те продукты которые есть у пользователя */
    this.productsList = productsList;
    this.tabs = [
      { name: 'all-products.all-products_and_services', code: 'ALL' },
      { name: 'default.requests', code: 'REQUESTS' },
    ];
  }

  ngOnDestroy(): void {
    if (this.accountsSubscription) {
      this.accountsSubscription.unsubscribe();
    }
    if (this.accountListSubscription) {
      this.accountListSubscription.unsubscribe();
    }
    if (this.creditListSubscription) {
      this.creditListSubscription.unsubscribe();
    }
    if (this.depositListSubscription) {
      this.depositListSubscription.unsubscribe();
    }
    if (this.cardListSubscription) {
      this.cardListSubscription.unsubscribe();
    }
  }

  onTabChange(tabName: any) {
    if (tabName !== this.tab) {
      this.tab = tabName;
      this.router.navigate(['/products'], {
        queryParams: { page: tabName },
      });
      this.changeDetector.detectChanges();
    }
  }

  redirectTo(type: string) {
    if (this.userProductList[type] > 0) {
      //наличие продукта у клиента
      this.router.navigateByUrl('accounts', { state: { type: type } });
    } else {
      if (this.tab === 'REQUESTS') {
        this.onTabChange('ALL');
      }
      this.activeSection = this.getSectionByProduct(type);
      this.scrollToSection(this.activeSection);
      this.changeDetector.detectChanges;
    }
  }

  getSectionByProduct(product: string) {
    //для скролла по навигации к секции
    switch (product) {
      case 'accounts':
      case 'trade-acquiring':
      case 'internet-acquiring':
      case 'homebank':
        return 'paymentAccept';
      case 'cards':
        return 'cards';
      case 'deposits':
        return 'deposits';
      case 'credits':
        return 'credits';
      case 'guarantees':
        return 'guarantees';
      case 'halyk-market':
      case 'halyk-club':
        return 'attractCustomers';
      //case 'certificates':
      case 'encashment':
        return 'encashment';
      case 'top':
        return 'top'; // для скролла вверх
      default:
        return '';
    }
  }

  scrollToSection(section: string) {
    if (section) {
      const anchor = document.querySelector<HTMLAnchorElement>('#' + section);
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
