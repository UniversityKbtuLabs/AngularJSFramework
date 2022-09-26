import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IAccountInfo } from '@data/models/account-types';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { AccountsService } from '@core/services/accounts.service';
import { ICurrentContract, IUser } from '@data/models/auth-types';
import { LoginService } from '@core/services/login.service';
import { HelperService } from '@core/services/helper.service';

@Component({
  selector: 'ob-open-deposite',
  templateUrl: './open-deposite.component.html',
  styleUrls: ['./open-deposite.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenDepositeComponent
  extends SubscriptionAccumulator
  implements OnInit
{
  public depositOpenForm: FormGroup;
  public deposit: any;
  public user: IUser;
  public currentContract: ICurrentContract;
  accountList: any[] = [];
  selectedAccount: any = null;
  depositSum: number = null;
  dateRange: number = 0;

  constructor(
    private accountsService: AccountsService,
    private changeDetector: ChangeDetectorRef,
    private loginService: LoginService,
    private helperService: HelperService
  ) {
    super();
  }

  ngOnInit(): void {
    this.getPrefill();
    this.getAccounts();
  }

  getPrefill() {
    this.accountsService.getDepositsPrefill().subscribe((val: any) => {
      this.deposit = {
        accountSender: val.accountSender,
        accountSenderId: val.accountSenderId,
        amount: val.amount,
        depositTerm: val.depositTerm,
        feeRate: val.feeRate,
        feeAmount: val.feeAmount,
        individualRateCheck: val.individualRateCheck,
        isRefilAfterConv: val.isRefilAfterConv,
        canOpenDeposit: val.canOpenDeposit,
        isBusinessDay: val.isBusinessDay,
        depositTypeCode: val.depositTypeCode,
        taxRate: val.taxRate,
        version: val.version,
      };
    });
  }

  getAccounts() {
    this.addSubscriber(this.accountsService.getAccountsList());

    this.addSubscriber(
      this.accountsService.currentAccounts.subscribe((data: IAccountInfo[]) => {
        // Подписка на список тек счетов
        let kztAccounts = data.filter(
          acc => acc.currency === 'KZT' && acc.active === 'Y'
        ); // Фильтрация по Тенговым и Активынм счетам
        this.accountList = kztAccounts;
        this.selectedAccount = this.accountList[0];
        this.changeDetector.detectChanges();
      })
    );
  }

  openDeposit() {
    this.deposit.accountSender = this.selectedAccount.iban;
    this.deposit.accountSenderId = this.selectedAccount.dictId;
    this.deposit.amount = this.depositSum;
    this.addSubscriber(this.accountsService.openDeposit(this.deposit));
  }

  getIcon(currency: string): string {
    return this.helperService.getAccountIcon(currency);
  }

  onAccountChange($event: any) {
    console.log(this.selectedAccount);
  }

  dateRangeChange() {
    console.log(this.dateRange);
  }

  depositSumChange() {
    console.log(this.depositSum);
  }
}
