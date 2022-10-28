/* eslint-disable max-len */
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { HelperService } from '@app/core/services/helper.service';
import { IAccountInfo } from '@app/data/models/account-types';
import { Router } from '@angular/router';
import { RequisitesModalComponent } from '../requisites-modal/requisites-modal.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { errorMessage, getIn, thousandsSeparator } from '@app/core/helpers';
import { AccountsService } from '@app/core/services/accounts.service';
import { LoginService } from '@app/core/services/login.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ob-card-info',
  templateUrl: './card-info.component.html',
  styleUrls: ['./card-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardInfoComponent implements OnInit, OnChanges, OnDestroy {
  @Input() cardData: any = null;
  @Input() type: string = '';
  modalRef?: BsModalRef;

  public userContractInfo: any;
  public loading: boolean = false;
  public isLoading: boolean = false;
  public accInfoSubscription: Subscription;
  public cardInfoSubscr: Subscription;

  public actions: any[] = [
    // { title: "Сделать перевод", img: "transfer_1.svg", type: "transfer" },
    // { title: "Пополнить карту", img: "cash_1.svg", type: "" },
    // { title: "Реквизиты", img: "requizites.svg", type: "requisites" },
    // { title: "Настройки", img: "cash_2.svg", type: /*'settings'*/ "" },
  ];

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

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.accountData?.currentValue?.currency === 'KZT' &&
      changes.accountData?.currentValue?.type === 'account'
    ) {
      this.actions.unshift({
        title: this.translate.instant('instructions.stepThreeTitle'),
        img: 'payment_1.svg',
        type: 'counteragent',
      });
    }
  }

  returnDescription(account: any) {
    if (account) {
      if (getIn(account, 'level') === 3) {
        const contractName = account.contractName || '';
        let contractNumber = account.contractNumber || '';
        if (contractNumber) {
          contractNumber = contractNumber.substr(contractNumber.length - 4);
        }
        return `${contractName}••${contractNumber}`;
      } else {
        return account.iban;
      }
    } else {
      return '';
    }
  }

  openRequisites() {
    const initialState: any = { id: this.cardData?.id, type: 'card' };
    const clientIdRef = this.cardData.clientIdRef;
    const contractId = this.cardData.contractId;
    const iin = this.userContractInfo?.bin || this.cardData?.iin;
    let cardRequisites = {
      bic: 'HSBKKZKX',
      bankName: 'АО "Народный Банк Казахстана"',
      companyName: this.userContractInfo?.currentContract.name,
      kbe:
        this.userContractInfo?.kbe ||
        this.userContractInfo?.currentContract?.kbe,
      iin,
      iik: this.cardData?.iban,
      currency: this.cardData?.currency,
      clientName: this.cardData?.clientName,
      data: '',
    };
    if (clientIdRef && contractId) {
      initialState.requisites = { ...cardRequisites, clientIdRef, contractId };
      this.modalRef = this.modalService.show(RequisitesModalComponent, {
        class: 'modal-md requisites-modal modal-dialog-centered',
        initialState: initialState,
        id: 1,
      });
    }
  }

  doAction(type: string) {
    switch (type) {
      case 'requisites':
        return this.openRequisites();
      case 'counteragent':
        return this.router.navigate([
          `operations/payment/counteragent/${this.cardData.iban}`,
        ]);
      case 'a2a':
        return this.router.navigate(['operations/transfer/accounts/'], {
          queryParams: { iban: this.cardData.iban },
        });
      case 'transfer':
        return this.router.navigate(['operations/transfer/card'], {
          queryParams: { iban: this.cardData.iban },
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
    if (this.cardInfoSubscr) {
      this.cardInfoSubscr.unsubscribe();
    }
  }

  getContractName(cardData: any) {
    if (cardData) {
      let contractName = cardData.contractName || '';
      return contractName;
    } else {
      return '';
    }
  }

  getContractNumber(cardData: any) {
    if (cardData) {
      let contractNumber = cardData.contractNumber || '';
      if (contractNumber) {
        contractNumber = contractNumber.substr(contractNumber.length - 4);
      }
      return `••${contractNumber}`;
    } else {
      return '';
    }
  }

  getCardExpire(cardData: any) {
    if (cardData) {
      let cardExpire: string = cardData.cardExpire || '';
      if (cardExpire) {
        cardExpire = cardExpire.substr(2, 2) + '/' + cardExpire.substr(0, 2);
      }
      return cardExpire;
    } else {
      return '';
    }
  }
}
