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
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AccountsService } from '@core/services/accounts.service';
import { LoginService } from '@core/services/login.service';
import { ToastrService } from 'ngx-toastr';
import { thousandsSeparator } from '@core/helpers';
import { TranslateService } from '@ngx-translate/core';
import { ModalSavingsInfoComponent } from '../modal-savings-info/modal-savings-info.component';

@Component({
  selector: 'ob-credit-info',
  templateUrl: './credit-info.component.html',
  styleUrls: ['./credit-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditInfoComponent implements OnInit {
  @Input() creditData: any = null;
  public userContractInfo: any;
  public loading: boolean = false;
  public isLoading: boolean = false;
  public accInfoSubscription: Subscription;
  public actions: any = [];
  public partialRepayment: string = '';
  public earlyRepayment: string = '';
  public creditInfo: string = '';
  public statementLabel: string = '';
  modalRef?: BsModalRef;

  constructor(
    public helperService: HelperService,
    public router: Router,
    private modalService: BsModalService,
    public accountsService: AccountsService,
    private loginService: LoginService,
    private changeDetector: ChangeDetectorRef,
    private toastrService: ToastrService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.actions = [
      {
        title: 'acccountSavings.credit.partial-repayment',
        img: 'credit_expences.svg',
        type: '',
      },
      {
        title: 'acccountSavings.credit.early-repayment',
        img: 'credit_expences_all.svg',
        type: '',
      },
      {
        title: 'acccountSavings.credit.credit-info',
        img: 'credit_requisites.svg',
        type: 'creditInfo',
      },
      {
        title: 'accounts.actions.order-certificate',
        img: 'credit_reference.svg',
        type: '',
      },
    ];
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
    switch (type) {
      case 'creditInfo':
        return this.openInfoModal();
      default:
        return;
    }
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

  getIban(creditData: any) {
    if (creditData) {
      let iban = creditData.depositAccount || '';
      return iban;
    } else {
      return '';
    }
  }

  openInfoModal() {
    const initialState: any = { data: this.creditData };
    this.modalRef = this.modalService.show(ModalSavingsInfoComponent, {
      class: 'modal-md savings-modal modal-mt-120',
      initialState: initialState,
      id: 1,
    });
  }
}
