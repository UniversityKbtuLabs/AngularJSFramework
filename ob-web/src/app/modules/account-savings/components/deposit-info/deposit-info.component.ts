import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { HelperService } from '@core/services/helper.service';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AccountsService } from '@core/services/accounts.service';
import { LoginService } from '@core/services/login.service';
import { ToastrService } from 'ngx-toastr';
import { thousandsSeparator } from '@core/helpers';

@Component({
  selector: 'ob-deposit-info',
  templateUrl: './deposit-info.component.html',
  styleUrls: ['./deposit-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepositInfoComponent implements OnInit {
  @Input() depositData: any = null;
  public userContractInfo: any;
  public loading: boolean = false;
  public isLoading: boolean = false;
  public accInfoSubscription: Subscription;
  public actions = [
    { title: 'Пополнить депозит', img: 'cash_1.svg', type: '' },
    { title: 'Частичное снятие', img: 'transfer_1.svg', type: '' },
    { title: 'Заказать справку', img: 'requizites.svg', type: '' },
  ];

  constructor(
    public helperService: HelperService,
    public router: Router,
    private modalService: BsModalService,
    public accountsService: AccountsService,
    private loginService: LoginService,
    private changeDetector: ChangeDetectorRef,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.loginService.isLoadingUserInfo$.subscribe({
      next: v => {
        this.loading = v;
        this.changeDetector.detectChanges();
      },
    });

    this.accInfoSubscription =
      this.accountsService.accountInfoLoading$.subscribe({
        next: v => {
          this.isLoading = v;
          this.changeDetector.detectChanges();
        },
      });
    this.loginService.userInfoObject$.subscribe({
      next: v => {
        this.userContractInfo = v;
        this.changeDetector.detectChanges();
      },
    });
  }

  doAction(type: string) {
    // switch (type) {
    //     case 'requisites':
    //         return this.openRequisites()
    //     case 'counteragent':
    //         return this.router.navigate([`operations/payment/counteragent/${this.accountData.iban}`])
    //     case "a2a":
    //         return this.router.navigate(['operations/transfer/accounts/'], {
    //             queryParams: { iban: this.accountData.iban },
    //         });
    //     case "transfer":
    //         return this.router.navigate(['operations/transfer/card'], {
    //             queryParams: { iban: this.accountData.iban },
    //         });
    //     case 'settings':
    //         return this.accountsService.changeAccountSettingsStatus(true)
    //     default:
    //         return this.router.navigate([this.router.url])
    // }
  }

  getFormattedActualBalance(amount: any) {
    return thousandsSeparator(amount);
  }

  getIban(depositData: any) {
    if (depositData) {
      let iban = depositData.depositAccount || '';
      return iban;
    } else {
      return '';
    }
  }
}
