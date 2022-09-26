/* eslint-disable max-len */
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { BsModalRef, ModalOptions, BsModalService } from 'ngx-bootstrap/modal';
import { AccountsService } from '@app/core/services/accounts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { getError, successMessage } from '@app/core/helpers';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ob-requisites-modal',
  templateUrl: './requisites-modal.component.html',
  styleUrls: ['./requisites-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequisitesModalComponent implements OnInit, OnDestroy {
  public requisites: any;
  public requisitesData: any;
  public mail: string = '';
  public requisitesCopy: any = '';
  public type: any = '';
  public requisitiesDetails: string = '';
  private contractId: any;
  public smsGreetings: string;
  public smsTheme: string;
  public sending_requisites: string;
  public accounts: any;
  public loading: boolean = false;
  public isRequisitsLoading = false;
  public isRequestError = false;
  public error = '';
  public requisitesSubscription: Subscription;
  public requisitesSubscriptionPdf: Subscription;
  public cardSubscription: Subscription;
  public fioLabel: string = '';
  public iinLabel: string = '';
  public iikLabel: string = '';
  public bicLabel: string = '';
  public binLabel: string = '';
  public bankLabel: string = '';
  public kbeLabel: string = '';
  public currencyLabel: string = '';
  public nameLabel: string = '';
  public copyNotification: string = '';

  constructor(
    public bsModalRef: BsModalRef,
    public accountsService: AccountsService,
    public activatedRoute: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
    private toastr: ToastrService,
    private modalOptions: ModalOptions,
    private bsModalService: BsModalService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {
    this.contractId = this.modalOptions?.initialState?.id;
    this.type = this.modalOptions?.initialState?.type;
    this.requisites = this.modalOptions?.initialState?.requisites;
    this.copy = this.copy.bind(this);
    this.openMail = this.openMail.bind(this);
    this.convetToPDF = this.convetToPDF.bind(this);
    this.getCardRequisites = this.getCardRequisites.bind(this);
  }

  ngOnInit(): void {
    this.getTranslation();
    if (this.type === 'account') {
      this.getAccountRequisites();
    } else if (this.type === 'card' || this.type === 'card-account') {
      this.requisitesCopy = this.copyText(this.requisites);
    }

    this.accountsService.isReportLoading$.subscribe({
      next: v => {
        this.loading = v;
        this.changeDetector.detectChanges();
      },
    });
  }

  closeModal() {
    this.bsModalService.hide(1);
  }

  getTranslation() {
    this.translate
      .get([
        'requisites.greeting',
        'requisites.my-requisites',
        'requisites.action_sending_requisites',
        'requisites.card_holder',
        'requisites.iin_holder',
        'default.iik',
        'operations.payments.bic',
        'default.idn-bin',
        'default.bank',
        'default.currency',
        'operations.default.kbe',
        'toast-messages.success.copiedToBuffer',
        'default.name',
      ])
      .subscribe({
        next: translations => {
          this.smsGreetings = translations['requisites.greeting'];
          this.smsTheme = translations['requisites.my-requisites'];
          this.sending_requisites =
            translations['requisites.action_sending_requisites'];
          this.fioLabel = translations['requisites.card_holder'];
          this.iinLabel = translations['requisites.iin_holder'];
          this.iikLabel = translations['default.iik'];
          this.bicLabel = translations['operations.payments.bic'];
          this.binLabel = translations['default.idn-bin'];
          this.bankLabel = translations['default.bank'];
          this.kbeLabel = translations['operations.default.kbe'];
          this.currencyLabel = translations['default.currency'];
          this.nameLabel = translations['default.name'];
          this.copyNotification =
            translations['toast-messages.success.copiedToBuffer'];
        },
      });
  }

  getAccountRequisites() {
    this.isRequisitsLoading = true;
    this.isRequestError = false;
    this.requisitesSubscription = this.accountsService
      .getRequisites(this.contractId)
      .subscribe({
        next: (data: any) => {
          const url = this.router.url.split('/');
          const account = data.accounts.find(
            (account: any) => +account.dictId === +url[url.length - 1]
          );

          const parsedRequisites = {
            bic: data?.bankBic,
            bankName: data?.bankName,
            companyName: data?.contractName || data?.companyName,
            kbe: data?.kbe,
            iin: data?.iin,
            iik: account?.iban,
            currency: account?.currency,
          };

          this.accounts = data.accounts;
          this.requisites = parsedRequisites;
          this.isRequisitsLoading = false;
          this.requisitesCopy = this.copyText(parsedRequisites);
          this.changeDetector.detectChanges();
        },
        error: err => {
          this.isRequisitsLoading = false;
          this.isRequestError = true;
          this.error = getError(err);
          this.changeDetector.detectChanges();
        },
      });
  }

  convetToPDF() {
    let ibans: string[] = [];
    const url = this.router.url.split('/');
    const accId = +url[url.length - 1];
    const account = this.accounts.find(
      (account: any) => +account.dictId === accId
    );
    if (account) {
      ibans.push(account.iban);
      this.requisitesSubscriptionPdf = this.accountsService.getRequisitesPdf(
        ibans,
        this.requisites.companyName,
        this.bsModalRef
      );
    }
  }

  getCardRequisites() {
    this.cardSubscription = this.accountsService.getCardRequisitesReport(
      this.requisites.clientIdRef,
      this.requisites.contractId,
      this.bsModalRef,
      this.toastr
    );
  }

  copyText(parsedRequisites: any) {
    const {
      companyName,
      clientName,
      iin,
      iik,
      bankName,
      kbe,
      currency,
      bic,
      contractName,
    } = parsedRequisites;

    if (this.type === 'card') {
      return `${
        clientName
          ? `
      ${this.fioLabel}: ${clientName}`
          : ''
      }
      ${iin ? `${this.iinLabel}: ${iin}` : ''}
      ${iik ? `${this.iikLabel}: ${iik}` : ''}
      ${this.bankLabel}: ${bankName}
      ${this.kbeLabel}: ${kbe}
      ${currency ? `${this.currencyLabel}: ${currency}` : ''}
      ${this.bicLabel}: ${bic}`;
    } else if (this.type === 'card-account') {
      return `${
        clientName
          ? `
      ${this.nameLabel}: ${contractName || companyName}`
          : ''
      }
      ${iin ? `${this.binLabel}: ${iin}` : ''}
      ${iik ? `${this.iikLabel}: ${iik}` : ''}
      ${this.bankLabel}: ${bankName}
      ${this.kbeLabel}: ${kbe}
      ${currency ? `${this.currencyLabel}: ${currency}` : ''}
      ${this.bicLabel}: ${bic}`;
    } else {
      return `${
        companyName
          ? `
      ${this.nameLabel}: ${companyName || contractName}`
          : ''
      }
      ${iin ? `${this.binLabel}: ${iin}` : ''}
      ${iik ? `${this.iikLabel}: ${iik}` : ''}
      ${this.bankLabel}: ${bankName}
      ${this.kbeLabel}: ${kbe}
      ${currency ? `${this.currencyLabel}: ${currency}` : ''}
      ${this.bicLabel}: ${bic}`;
    }
  }

  copy() {
    navigator.clipboard
      .writeText(this.requisitesCopy)
      .then(() => successMessage(this.copyNotification, this.toastr));
  }

  openMail() {
    window.location.href = `mailto:?subject=${encodeURIComponent(
      `${this.smsTheme}`
    )}
		&body=${encodeURIComponent(
      `${this.smsGreetings}.\n\n${this.sending_requisites}.\n${this.requisitesCopy}`
    )}`;
  }

  ngOnDestroy(): void {
    this.accountsService.isReportLoading$.next(false);
    this.accountsService.reportError$.next(null);
    this.accountsService.report$.next(null);
    this.bsModalService.hide(1);
    if (this.requisitesSubscription) {
      this.requisitesSubscription.unsubscribe();
    }
    if (this.requisitesSubscriptionPdf) {
      this.requisitesSubscriptionPdf.unsubscribe();
    }
    if (this.cardSubscription) {
      this.cardSubscription.unsubscribe();
    }
  }
}
