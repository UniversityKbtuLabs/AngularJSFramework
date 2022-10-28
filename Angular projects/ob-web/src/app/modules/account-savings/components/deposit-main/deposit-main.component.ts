import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { MainService } from '@core/services/main.service';
import { AccountsService } from '@core/services/accounts.service';
import { ActivatedRoute } from '@angular/router';
import { HelperService } from '@core/services/helper.service';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '@core/services/login.service';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { getIn, successMessage, thousandsSeparator } from '@core/helpers';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ob-deposit-main',
  templateUrl: './deposit-main.component.html',
  styleUrls: ['./deposit-main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepositMainComponent
  extends SubscriptionAccumulator
  implements OnInit
{
  @Input() depositData: any = null;
  public isAccountInfoLoading: boolean = false;
  public isLoadingUserInfo: boolean = false;
  public isReportLoading: boolean = false;
  public rewardRate: string = '';
  public dateOpen: string = '';
  public dateClose: string = '';
  public iban: string = '';
  public copiedNotification: string = '';
  public currency: string = '';
  public docNumber: string = '';

  constructor(
    private changeDetector: ChangeDetectorRef,
    public mainService: MainService,
    public accountsService: AccountsService,
    public activatedRoute: ActivatedRoute,
    private helperService: HelperService,
    private toastr: ToastrService,
    private loginService: LoginService,
    public translate: TranslateService
  ) {
    super();
  }

  ngOnInit(): void {
    this.addSubscriber(
      this.accountsService.accountInfoLoading$.subscribe({
        next: v => {
          this.isAccountInfoLoading = v;
          this.changeDetector.detectChanges();
        },
      })
    );

    this.loginService.isLoadingUserInfo$.subscribe({
      next: v => {
        this.isLoadingUserInfo = v;
        this.changeDetector.detectChanges();
      },
    });

    this.addSubscriber(
      this.accountsService.isReportLoading$.subscribe(val => {
        this.isReportLoading = val;
        this.changeDetector.detectChanges();
      })
    );
    this.getTranslations();
  }

  getTranslations() {
    this.translate
      .get([
        'acccountSavings.deposit.rewardRate',
        'acccountSavings.deposit.dateOpen',
        'acccountSavings.deposit.dateClose',
        'acccountSavings.deposit.iban',
        'toast-messages.success.copied',
        'default.currency',
        'default.documentNumber',
      ])
      .subscribe(translations => {
        this.rewardRate = translations['acccountSavings.deposit.rewardRate'];
        this.dateOpen = translations['acccountSavings.deposit.dateOpen'];
        this.dateClose = translations['acccountSavings.deposit.dateClose'];
        this.iban = translations['acccountSavings.deposit.iban'];
        this.copiedNotification = translations['toast-messages.success.copied'];
        this.currency = translations['default.currency'];
        this.docNumber = translations['default.documentNumber'];
      });
  }

  getDate(date: string) {
    if (date) {
      let splittedDate: string[] = date.split('-');
      return (
        splittedDate[2] +
        ' ' +
        this.translate.instant(this.helperService.getMonth(splittedDate[1])) +
        ' ' +
        splittedDate[0]
      );
    } else {
      return '';
    }
  }

  getCurrency(cur: string): string {
    if (cur) {
      return this.helperService.formatCurrency(cur);
    } else {
      return '';
    }
  }

  copyDeposit() {
    navigator.clipboard.writeText(
      this.rewardRate +
        ': ' +
        this.depositData?.depositRate +
        '%,\n' +
        this.currency +
        ': ' +
        this.depositData?.currencyCode +
        ',\n' +
        (this.depositData?.depositOpen
          ? this.dateOpen +
            ': ' +
            this.getDate(this.depositData?.depositOpen) +
            ',\n'
          : '') +
        (this.depositData?.depositClose
          ? this.dateClose +
            ': ' +
            this.getDate(this.depositData?.depositClose) +
            ',\n'
          : '') +
        this.iban +
        ': ' +
        this.depositData.depositAccount +
        ',\n' +
        this.docNumber +
        ': ' +
        this.depositData?.depositContractNumber
    );
    successMessage(this.copiedNotification, this.toastr);
  }

  changeDate(date: string) {
    if (date) {
      let splittedDate = date.split('-');
      let month: number = Number(splittedDate[1]);
      let day: number = Number(splittedDate[2]);
      let year: number = Number(splittedDate[0]);
      day = day + 29;
      if (day / this.helperService.getDaysInMonth(year, month - 1) > 1) {
        day = day % this.helperService.getDaysInMonth(year, month - 1);
        month = month + 1;
      }
      if (month / 12 > 1) {
        month = month % 12;
        year = year + 1;
      }
      return (
        year +
        '-' +
        (month > 9 ? month : '0' + month) +
        '-' +
        (day > 9 ? day : '0' + day)
      );
    } else {
      return '';
    }
  }

  getReward() {
    if (getIn(this.depositData, 'bonPaidKzt')) {
      return thousandsSeparator(getIn(this.depositData, 'bonPaidKzt'));
    } else {
      return 0;
    }
  }
}
