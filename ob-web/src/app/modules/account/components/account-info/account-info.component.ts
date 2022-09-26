import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { HelperService } from '@core/services/helper.service';
import { Router } from '@angular/router';
import { AccountsService } from '@core/services/accounts.service';
import { LoginService } from '@core/services/login.service';
import { ToastrService } from 'ngx-toastr';
import { RequisitesModalComponent } from '@modules/account/components/requisites-modal/requisites-modal.component';
import { errorMessage, getIn, thousandsSeparator } from '@core/helpers';
import { TranslateService } from '@ngx-translate/core';
import { StatusModalComponent } from '../status-modal/status-modal.component';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { accountStatuses } from '@app/core/constants';
@Component({
  selector: 'ob-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountInfoComponent implements OnInit, OnDestroy {
  @Input() accountData: any = null;
  @Input() type: string = '';
  modalRef?: BsModalRef;

  public userContractInfo: any;
  public loading: boolean = false;
  public isLoading: boolean = false;
  public accInfoSubscription: Subscription;
  public actions: any = [];
  public topUpAccount: string = '';
  public statuses: any = {};
  public details: any = null;

  constructor(
    public helperService: HelperService,
    public router: Router,
    private modalService: BsModalService,
    public accountsService: AccountsService,
    private loginService: LoginService,
    private changeDetector: ChangeDetectorRef,
    private toastrService: ToastrService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.getTranslations();
    this.actions = [
      // { title: 'Оплатить поставщику', img: 'cash_1.svg', type: '' },
      { title: this.topUpAccount, img: 'transfer_1.svg', type: 'a2a' },
      // { title: 'Внести наличные', img: 'cash_2.svg', type: '' },
      // { title: 'Снять наличные', img: 'requizites.svg', type: '' },
      // { title: 'Заказать справку', img: 'reference.svg', type: '' },
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
          if (this.accountData) {
            this.getDetails();
          }
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

  getTranslations() {
    this.topUpAccount = this.translate.instant('accounts.actions.top-up');
  }

  isOpenStatus(accountData: any) {
    if (getIn(accountData, 'absState')) {
      if (
        getIn(accountData, 'absState').toLowerCase() === accountStatuses.open
      ) {
        return '';
      } else {
        return 'table_body__img-error';
      }
    } else {
      return '';
    }
  }

  openRequisites() {
    const initialState: any = { id: this.accountData?.id, type: this.type };
    const contractId = this.accountData.contractId;
    const clientIdRef = this.accountData.clientIdRef;
    let cardRequisites = {
      bic: 'HSBKKZKX',
      bankName: 'АО "Народный Банк Казахстана"',
      companyName: this.userContractInfo?.name,
      kbe:
        this.userContractInfo?.kbe ||
        this.userContractInfo?.currentContract?.kbe,
      iin: this.userContractInfo?.bin || this.accountData?.iin,
      iik: this.accountData?.iban,
      currency: this.accountData?.currency,
      clientName: this.accountData?.clientName,
      data: '',
    };
    // if (contractId) { // TODO REMOVE contractId it's NO LONGER USER IN SERVICE
    this.accountsService.getRequisites(contractId).subscribe({
      next: (data: any) => {
        cardRequisites = {
          ...cardRequisites,
          ...data,
          clientIdRef,
          contractId,
        };
        initialState.requisites = cardRequisites;
        // TODO НЕ ПОНЯТНО ПОЧЕМУ ОТДАЕТ НОМЕР СЧЕТА ДРУГОЙ ЧЕМ ОН ЕСТЬ В accountData
        this.modalRef = this.modalService.show(RequisitesModalComponent, {
          class: 'modal-md requisites-modal modal-dialog-centered',
          initialState: initialState,
          id: 1,
        });
      },
      error: error => {
        errorMessage(error, this.toastrService);
      },
    });
    // }
  }

  getDetails() {
    this.accountsService
      .getAccountBlockedInfo(this.accountData.iban)
      .pipe(debounceTime(800), distinctUntilChanged())
      .subscribe({
        next: (data: any) => {
          this.details = data;
          this.changeDetector.detectChanges();
        },
        error: error => {
          errorMessage(error, this.toastrService);
        },
      });
  }

  openStatusDetails() {
    const initialState: any = {};
    const statuses = this.accountsService.statuses;
    if (this.details.result.length > 0) {
      initialState.content = this.details.result?.map((item: any) => ({
        opertype: statuses[item.opertype]
          ? this.translate.instant(statuses[item.opertype])
          : item.opertype,
        amount: item.amount,
        currency: item.currency,
        docdate: item.docdate,
        docnum: item.docnum,
      }));
      initialState.title =
        this.translate.instant(statuses[this.accountData?.absState]) ||
        this.accountData?.absState;
      initialState.status = this.accountData?.absState;
      this.modalRef = this.modalService.show(StatusModalComponent, {
        class: 'modal-md savings-modal modal-dialog-centered',
        initialState: initialState,
        id: 1,
      });
    } else {
      //статус запроса 200 но нужных данных нет
      errorMessage('', this.toastrService);
    }
  }

  doAction(type: string) {
    switch (type) {
      case 'requisites':
        return this.openRequisites();
      case 'counteragent':
        return this.router.navigate([
          `operations/payment/counteragent/${this.accountData.iban}`,
        ]);
      case 'a2a':
        return this.router.navigate(['operations/transfer/accounts/'], {
          queryParams: { iban: this.accountData.iban },
        });
      case 'transfer':
        return this.router.navigate(['operations/transfer/card'], {
          queryParams: { iban: this.accountData.iban },
        });
      case 'settings':
        return this.accountsService.changeAccountSettingsStatus(true);
      default:
        return this.router.navigate([this.router.url]);
    }
  }

  getFormattedActualBalance(amount: any) {
    return thousandsSeparator(amount);
  }

  ngOnDestroy(): void {
    this.modalService.hide(1);
    if (this.accInfoSubscription) {
      this.accInfoSubscription.unsubscribe();
    }
  }

  getContractNumber(accountData: any) {
    if (accountData) {
      let contractNumber = accountData.contractNumber || '';
      if (contractNumber) {
        contractNumber = contractNumber.substr(contractNumber.length - 4);
      }
      return `••${contractNumber}`;
    } else {
      return '';
    }
  }

  getContractName(accountData: any) {
    if (accountData) {
      let contractName = accountData.contractName || '';
      return contractName;
    } else {
      return '';
    }
  }

  getIban(accountData: any) {
    if (accountData) {
      let iban = accountData.iban || '';
      return iban;
    } else {
      return '';
    }
  }
}
