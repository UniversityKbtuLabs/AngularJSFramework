import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OPERATIONS, PRODUCTS, WELCOME } from '@core/constants/pathnames';
import { TranslateService } from '@ngx-translate/core';
import { thousandsSeparator } from '@app/core/helpers';
import { HelperService } from '@core/services/helper.service';

@Component({
  selector: 'ob-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationComponent implements OnInit {
  public sum: any = '';
  public name: any = '';
  public receiver: any = '';
  public operationType: string = '';
  public title: string = '';
  public isSigned: boolean = false;
  public signedTitle: string = '';
  public productType: string = '';
  public currency: string = '';
  public phoneNum: string = '';
  public cardType: string = '';
  public type: string = '';
  public tariffType: string = '';
  public cardDeliveryType: string = 'department';
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private helperService: HelperService
  ) {
    if (this.route.snapshot.paramMap.get('sum')) {
      this.sum = this.route.snapshot.paramMap.get('sum');
      this.currency = this.route.snapshot.paramMap.get('currency');
      this.name = this.route.snapshot.paramMap.get('name');
      this.receiver = this.route.snapshot.paramMap.get('receiver');
      this.isSigned = JSON.parse(this.route.snapshot.paramMap.get('isSigned'));
      this.type = this.route.snapshot.paramMap.get('type');
      this.operationType =
        this.route.snapshot.paramMap.get('operationType') || 'payment';
    } else if (this.route.snapshot.paramMap.get('productType')) {
      this.isSigned = JSON.parse(this.route.snapshot.paramMap.get('isSigned'));
      this.productType = this.route.snapshot.paramMap.get('productType');
      this.currency = this.route.snapshot.paramMap.get('currency');
      this.sum = this.route.snapshot.paramMap.get('amount');
      this.phoneNum = this.route.snapshot.paramMap.get('phone');
      this.cardType = this.route.snapshot.paramMap.get('cardType');
    }
  }

  ngOnInit(): void {
    this.tariffType = this.route.snapshot.params['tariffName'];
    this.translate
      .get([
        'operations.default.readyToSign',
        'operations.transfers.readyToSign',
        'operations.default.newPayment',
        'operations.transfers.newTransfer',
        'operations.payments.signedPayment',
        'operations.transfers.signedTransfer',
      ])
      .subscribe(translations => {
        const isPayment = this.operationType === 'payment';
        if (isPayment) {
          this.title = translations['operations.default.readyToSign'];
          this.signedTitle = translations['operations.payments.signedPayment'];
        } else {
          this.title = translations['operations.transfers.readyToSign'];
          this.signedTitle =
            translations['operations.transfers.signedTransfer'];
        }
      });

    this.cardDeliveryType = localStorage.getItem('deliveryType');
  }

  onSuccess() {
    this.router.navigate(['/home/operations'], {
      // Переход к списку подписания
      queryParams: { operation: this.operationType, isSigning: true },
    });
  }

  onNavigate() {
    this.router.navigate([OPERATIONS]);
  }

  navigateProducts() {
    this.router.navigate([PRODUCTS], {
      queryParams: { page: 'ALL' },
    });
  }

  navigateRequests() {
    this.router.navigate([PRODUCTS], {
      queryParams: { page: 'REQUESTS' },
    });
  }

  navigateSettings() {
    this.router.navigate(['settings/tariffs']);
  }

  getFormattedAmount(amount: number | string) {
    return thousandsSeparator(Number(amount));
  }

  navigateMain() {
    this.router.navigate([WELCOME]);
  }

  getCurrency() {
    return this.helperService.formatCurrency(this.currency);
  }
}
