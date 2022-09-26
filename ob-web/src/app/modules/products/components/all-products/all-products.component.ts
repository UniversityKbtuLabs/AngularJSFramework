import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ob-all-products',
  templateUrl: './all-products.component.html',
  styleUrls: ['./all-products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllProductsComponent implements OnInit {
  public recommendationList: any = [];
  public savingList: any = [];
  public cardList: any = [];
  public guaranteeList: any = [];
  public aquaringList: any = [];
  public marketList: any = [];
  public creditList: any = [];
  public salaryBanner: any;
  public encashmentBanner: any;
  public downloadAppBanner: any;

  constructor() {}

  ngOnInit(): void {
    this.recommendationList = [
      {
        title: 'products.default.pos-terminal',
        btnText: 'all-products.send-request',
        description: {
          text: 'all-products.text.recommendations-text-1',
        },
        image: 'aquaring1',
        backgroundColor: '#BAC6F3',
      },
      {
        title: 'products.default.overdraft',
        btnText: 'accounts.addCredit',
        description: {
          text: 'all-products.text.recommendations-text-2',
        },
        image: 'credit1',
        backgroundColor: '#94A7ED',
      },
      {
        title: 'Halyk Club',
        btnText: 'all-products.send-request',
        description: {
          text: 'all-products.text.recommendations-text-3',
        },
        image: 'market1',
        backgroundColor: '#95EFD6',
      },
    ];
    this.savingList = [
      {
        title: 'products.deposits.сumulative',
        btnText: 'accounts.addDeposit',
        description: {
          list: [
            'all-products.text.savings-text-1-list-1',
            'all-products.text.savings-text-1-list-2',
          ],
        },
        image: 'deposit1',
        backgroundColor: '#D1F5FF',
      },
      {
        title: 'products.deposits.flexible',
        btnText: 'accounts.addDeposit',
        description: {
          list: [
            'all-products.text.savings-text-2-list-1',
            'all-products.text.savings-text-2-list-2',
          ],
        },
        image: 'deposit2',
        backgroundColor: '#B5E8F7',
      },
      {
        title: 'products.deposits.express',
        btnText: 'accounts.addDeposit',
        description: {
          list: [
            'all-products.text.savings-text-3-list-1',
            'all-products.text.savings-text-3-list-2',
          ],
        },
        image: 'deposit3',
        backgroundColor: '#AFCFFF',
        url: '/products/create/deposit?type=express',
      },
    ];
    this.cardList = [
      {
        title: 'cards.digital',
        btnText: 'all-products.open-card',
        description: {
          text: 'all-products.text.cards-text-1',
        },
        image: 'black_card',
      },
      {
        title: 'cards.business',
        btnText: 'all-products.open-card',
        description: {
          text: 'all-products.text.cards-text-2',
        },
        image: 'gray_card',
        url: '/products/create/business-card',
      },
      {
        title: 'cards.self-encashment',
        btnText: 'all-products.open-card',
        description: {
          text: 'all-products.text.cards-text-3',
        },
        image: 'gray_card',
      },
      {
        title: 'cards.customs',
        btnText: 'all-products.open-card',
        description: {
          text: 'all-products.text.cards-text-4',
        },
        image: 'gray_card',
      },
    ];
    this.guaranteeList = [
      {
        title: 'products.guarantees.digital-tender-guarantee',
        btnText: 'all-products.open-card',
        description: {
          list: [
            'all-products.text.guarantees-text-3-list-1',
            'all-products.text.guarantees-text-3-list-2',
          ],
        },
        image: 'guarantee2',
        backgroundColor: '#D3F9E2',
      },
      {
        title: 'products.guarantees.uncovered',
        btnText: 'all-products.open-card',
        description: {
          list: ['all-products.text.guarantees-text-1-list-1'],
        },
        image: 'guarantee1',
        backgroundColor: '#D3EBF9',
      },
      {
        title: 'products.guarantees.covered',
        btnText: 'all-products.open-card',
        description: {
          list: [
            'all-products.text.guarantees-text-2-list-1',
            'all-products.text.guarantees-text-2-list-2',
            'all-products.text.guarantees-text-2-list-3',
          ],
        },
        image: 'guarantee3',
        backgroundColor: '#FAF5C2',
      },
    ];
    this.aquaringList = [
      {
        title: 'products.accounts.business',
        btnText: 'all-products.send-request',
        description: {
          text: 'all-products.text.aquaring-text-1',
        },
        image: 'account1',
        url: '/products/create/account',
        disabled: false,
      },
      {
        title: 'products.default.pos-terminal',
        btnText: 'all-products.send-request',
        description: {
          text: 'all-products.text.aquaring-text-2',
        },
        image: 'aquaring1',
        disabled: true,
      },
      {
        title: 'products.default.epay-aquaring',
        btnText: 'all-products.send-request',
        description: {
          text: 'all-products.text.aquaring-text-3',
        },
        image: 'aquaring2',
        disabled: true,
      },
      {
        title: 'products.default.halyk-pos-app',
        btnText: 'all-products.send-request',
        description: {
          text: 'all-products.text.aquaring-text-4',
        },
        image: 'aquaring4',
        disabled: true,
      },
      {
        title: 'products.default.get-payment-hb',
        btnText: 'all-products.send-request',
        description: {
          text: 'all-products.text.aquaring-text-5',
        },
        image: 'aquaring5',
        disabled: true,
      },
      {
        title: 'Halyk QR',
        btnText: 'all-products.send-request',
        description: {
          text: 'all-products.text.aquaring-text-6',
        },
        image: 'aquaring3',
        disabled: true,
      },
    ];
    this.marketList = [
      {
        title: 'Halyk Club',
        btnText: 'all-products.send-request',
        description: {
          text: 'all-products.text.market-text-1',
          list: [
            'all-products.text.market-text-1-list-1',
            'all-products.text.market-text-1-list-2',
          ],
        },
        image: 'market1',
      },
      {
        title: 'Halyk Market',
        btnText: 'all-products.send-request',
        description: {
          list: [
            'all-products.text.market-text-2-list-1',
            'all-products.text.market-text-2-list-2',
            'all-products.text.market-text-2-list-3',
          ],
        },
        image: 'market2',
      },
    ];
    this.creditList = [
      {
        title: 'products.default.overdraft',
        btnText: 'all-products.send-request',
        description: {
          text: 'all-products.text.credit-text-1',
          list: [
            'all-products.text.credit-text-1-list-1',
            'all-products.text.credit-text-1-list-2',
          ],
        },
        image: 'credit1',
      },
      {
        title: 'products.credits.pos-terminal-credit',
        btnText: 'all-products.send-request',
        description: {
          list: [
            'all-products.text.credit-text-2-list-1',
            'all-products.text.credit-text-2-list-2',
          ],
        },
        image: 'credit2',
      },
      {
        title: 'products.credits.business-medium',
        btnText: 'all-products.send-request',
        description: {
          list: [
            'all-products.text.credit-text-3-list-1',
            'all-products.text.credit-text-3-list-2',
            'all-products.text.credit-text-3-list-3',
          ],
        },
        image: 'credit3',
      },
      {
        title: 'products.credits.hb-express',
        btnText: 'all-products.send-request',
        description: {
          list: [
            'all-products.text.credit-text-4-list-1',
            'all-products.text.credit-text-4-list-2',
            'all-products.text.credit-text-4-list-3',
          ],
        },
        image: 'credit4',
      },
      {
        title: 'products.credits.hb-businessman',
        btnText: 'all-products.send-request',
        description: {
          list: [
            'all-products.text.credit-text-5-list-1',
            'all-products.text.credit-text-5-list-2',
            'all-products.text.credit-text-5-list-3',
          ],
        },
        image: 'credit5',
      },
    ];
    this.salaryBanner = {
      title: 'products.default.salary-project',
      btnText: 'products.default.connect',
      description: {
        list: [
          'all-products.text.salary-banner-list-1',
          'all-products.text.salary-banner-list-2',
          'all-products.text.salary-banner-list-3',
        ],
      },
      image: 'salary_banner',
      backgroundColor: '#DAD3FD',
    };
    this.encashmentBanner = {
      title: 'products.default.business-encashment',
      btnText: 'products.default.connect',
      description: {
        list: [
          'all-products.text.encashment-banner-list-1',
          'all-products.text.encashment-banner-list-2',
          'all-products.text.encashment-banner-list-3',
        ],
      },
      image: 'encashment_banner',
    };
    this.downloadAppBanner = {
      title: 'products.default.ob-mobile-app',
      description: {
        text: 'all-products.text.dowload-app-banner-text',
      },
      image: 'download_banner',
      backgroundColor: '#263238',
    };
  }
}
