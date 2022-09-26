/* eslint-disable max-len */
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
  AfterViewChecked,
  ElementRef,
} from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AccountHistoryService } from '@app/core/services/account-history.service';
import { HelperService } from '@app/core/services/helper.service';
import {
  ISignHistory,
  ITableRows,
} from '@app/data/models/account-history-types';
import { errorMessage, getIn } from '@app/core/helpers';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ConstantTranslationsService } from '@app/core/services/constant-translations.service';
import { OperationsService } from '@app/core/services/operations.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import { operationPeriod, periodFormat } from '@app/core/constants';
import { Router } from '@angular/router';

@Component({
  selector: 'ob-table-modal',
  templateUrl: './table-modal.component.html',
  styleUrls: ['./table-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableModalComponent
  implements OnInit, OnDestroy, AfterViewChecked
{
  public operationDetails: any = {};
  public signers: any = [];
  public operationInfo: ITableRows | null = null;
  public errorMessage: string = '';
  public employerList: any = [];
  public isRejected: boolean = false;
  public rejectionDetails: string = '';
  public type: string = '';
  public emailGreetings: string;
  public emailTheme: string;
  public emailContent: string;
  public emailPaymentTitle: string;
  public emailTransferTitle: string;
  public emailCurrentActionTitle: string;
  public depositRequestApplication: string;
  public depositRequestConfirmation: string;
  public accountRequestApplication: string;
  public corpCardRequestApplication: string;
  public timeAndValueDate: string;
  public openSigners: boolean;
  public signingHistory: ISignHistory[] = [];

  //тип операции
  public operationTypeName: string = '';

  //loader
  public isLoading: boolean = true;
  public isLoadingSigningHistory: boolean = false;
  public showEmployeeTable: boolean = false;
  public employeesPage: number = 0;
  public bankName = '';

  public isBankIconExists: boolean = true;

  @ViewChild('tableModal') tableModalEl: any;
  @ViewChild('bankIcon') bankIconElement: any;
  public subscriptions: Subscription[] = [];
  public isAccountUrl: boolean;

  constructor(
    public bsModalRef: BsModalRef,
    public accountHistoryService: AccountHistoryService,
    private changeDetector: ChangeDetectorRef,
    public helperService: HelperService,
    public activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private translate: TranslateService,
    public constantTranslation: ConstantTranslationsService,
    private operationsService: OperationsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.operationsService.changeTableModalVisible(true);
    setTimeout(() => {
      this.getPaymentDetails();
    }, 0);
    this.accountHistoryService.isLoadingSigningHistory$.subscribe({
      next: v => {
        this.isLoadingSigningHistory = v;
      },
    });

    const operationInfo = JSON.parse(localStorage.getItem('operation-info'));
    this.bankName = operationInfo.bankRecipientName;
    const status = getIn(operationInfo, 'status');
    const signatureStatus = getIn(operationInfo, 'signatureStatus');
    if (status === 'NEWDOC' && signatureStatus === 'INSUFFICIENT') {
      operationInfo.status = 'SIGN_DEAL';
    }
    if (status === 'REJECTION' || status === 'REJECTED') {
      this.isRejected = true;
      this.rejectionDetails = getIn(operationInfo, 'statusDetails');
    }
    // if (signatureStatus === "SUFFICIENT") {
    this.accountHistoryService.signingHistory$.subscribe({
      next: (v: any) => {
        this.signingHistory = v;
      },
    });
    // }

    this.operationInfo = operationInfo;
    if (operationInfo.status === 'DRAFT') {
      this.timeAndValueDate =
        operationInfo.date.split('-').reverse().join('.') +
        ', ' +
        operationInfo.sentTime;
    } else {
      if (
        operationInfo?.statusHistory !== null &&
        operationInfo?.statusHistory
      ) {
        let splittedDate = operationInfo?.statusHistory
          .split(';')[0]
          .split(',')[1]
          .replaceAll('-', '.')
          .replace(' ', '.')
          .replace(':', '.')
          .split('.');
        this.timeAndValueDate =
          splittedDate[0] +
          ' ' +
          this.translate.instant(this.helperService.getMonth(splittedDate[1])) +
          ' ' +
          splittedDate[2] +
          ', ' +
          splittedDate[3] +
          ':' +
          splittedDate[4];
      }
    }

    this.getTranslation();
    this.getPageType();
  }

  getPageType() {
    this.isAccountUrl = this.router.url.includes('account');
    this.changeDetector.detectChanges();
  }

  ngAfterViewChecked(): void {
    this.operationsService.isTableModalVisible$.subscribe((value: boolean) => {
      if (!value) {
        this.tableModalEl.nativeElement.className = 'displayNone';
      } else {
        this.tableModalEl.nativeElement.className = 'displayBlock';
      }
    });
    if (
      this.bankIconElement &&
      this.operationDetails.bankNameRecipient &&
      !this.isLoading
    ) {
      this.checkBankIcon();
    }
  }

  ngOnDestroy(): void {
    this.closeModal();
    // localStorage.removeItem('operation-info');
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  getTranslation() {
    this.translate
      .get([
        'emailDetails.greeting',
        'emailDetails.my-operations',
        'emailDetails.action_sending_payment',
        'emailDetails.action_sending_transfer',
        'products.deposits.depositRequestApplication',
        'products.deposits.depositRequestConfirmation',
        'products.deposits.accountRequestApplication',
        'products.deposits.corpCardRequestApplication',
      ])
      .subscribe(translations => {
        this.emailGreetings = translations['emailDetails.greeting'];
        this.emailTheme = translations['emailDetails.my-operations'];
        this.emailPaymentTitle =
          translations['emailDetails.action_sending_payment'];
        this.emailTransferTitle =
          translations['emailDetails.action_sending_transfer'];
        this.depositRequestApplication =
          translations['products.deposits.depositRequestApplication'];
        this.depositRequestConfirmation =
          translations['products.deposits.depositRequestConfirmation'];
        this.accountRequestApplication =
          translations['products.deposits.accountRequestApplication'];
        this.corpCardRequestApplication =
          translations['products.deposits.corpCardRequestApplication'];
      });
  }

  closeModal() {
    this.bsModalRef.hide();
    // this.router.navigate(['home/welcome']);
  }

  getPaymentDetails() {
    const operationInfo = JSON.parse(localStorage.getItem('operation-info'));
    this.type = operationInfo.type;
    if (
      getIn(operationInfo, 'signatureStatus') === 'SUFFICIENT' ||
      (!getIn(operationInfo, 'signatureStatus') &&
        getIn(operationInfo, 'status') === 'NEWDOC')
    ) {
      this.accountHistoryService.getSigningHistory(`${this.operationInfo.id}`);
    }
    if (
      this.operationDetails.knpCode === '342' &&
      operationInfo.type === 'PAY_ORDER_V2'
    ) {
      this.getInfoById(
        'PAY_TO_ACCOUNTS',
        operationInfo.id,
        operationInfo.status
      );
    } else {
      this.getInfoById(
        operationInfo.type,
        operationInfo.id,
        operationInfo.status
      );
    }
    this.getEmailContent();
  }

  getInfoById(type: any, id: string, status: string) {
    this.isLoading = true;
    if (status === 'DRAFT') {
      this.subscriptions.push(
        this.accountHistoryService.getPaymentBySavedId(type, id).subscribe(
          (data: any) => {
            this.operationDetails = data;
            this.employerList =
              data.pensionList || data.salaryList || data.socialList;
            this.operationDetails.operationTypeName =
              this.getOperationTypeName(type);
            this.isLoading = false;
            this.changeDetector.detectChanges();
          },
          err => {
            // this.errorMessage = err?.messages?.[0];
            // this.modalService.hide(1);
            errorMessage(err, this.toastr);
            this.isLoading = false;
            this.changeDetector.detectChanges();
          }
        )
      );
    } else if (
      this.operationInfo.type === 'DEPOSIT_OPEN' ||
      this.operationInfo.type === 'CORP_CARD_ISSUE' ||
      this.operationInfo.type === 'ACCOUNT_CREATE'
    ) {
      this.subscriptions.push(
        this.accountHistoryService.getProductById(type, id).subscribe(
          (data: any) => {
            this.operationDetails = data;
            this.operationDetails.operationTypeName =
              this.getOperationTypeName(type);
            this.isLoading = false;
            this.changeDetector.detectChanges();
          },
          err => {
            this.modalService.hide(1);
            errorMessage(err, this.toastr);
            this.isLoading = false;
            this.changeDetector.detectChanges();
          }
        )
      );
    } else {
      if (this.operationInfo.type !== 'ACCOUNT_STATEMENT') {
        this.subscriptions.push(
          this.accountHistoryService.getPaymentById(type, id).subscribe(
            (data: any) => {
              this.operationDetails = data;
              this.employerList =
                data.pensionList || data.salaryList || data.socialList;
              this.operationDetails.operationTypeName =
                this.getOperationTypeName(type);
              this.isLoading = false;
              this.changeDetector.detectChanges();
            },
            err => {
              // this.errorMessage = err?.messages?.[0];
              this.modalService.hide(1);
              errorMessage(err, this.toastr);
              this.isLoading = false;
              this.changeDetector.detectChanges();
            }
          )
        );
      } else {
        this.isLoading = false;
        this.changeDetector.detectChanges();
      }
    }
  }

  returnDeliveryLocation() {
    const city = this.operationDetails.city
      ? `${this.operationDetails.city}`
      : '';
    const street = this.operationDetails.street
      ? `, ${this.operationDetails.street}`
      : '';
    const home = this.operationDetails.home
      ? `, ${this.operationDetails.home}`
      : '';
    const apartment = this.operationDetails.apartment
      ? `, ${this.operationDetails.apartment}`
      : '';
    const res = `${city}${street}${home}${apartment}`;
    return res || '';
  }

  getSigners() {
    const signersList: any = [];
    if (this.operationInfo.signatureStatus === 'INSUFFICIENT') {
      const signed = this.operationInfo?.signed?.split(',');
      let needSign: string[] = [];
      let signList = this.operationInfo?.needSign;

      if (signList) {
        signList = this.operationInfo?.needSign.replace(/[0-9]/g, '');
        signList = signList.replace(/[:]/g, '');
        needSign = signList.split(',');
      }
      if (needSign.length) {
        needSign.forEach(signer => {
          if (signer) {
            signersList.push({
              content: signer,
              label: this.translate.instant(this.constantTranslation.needSign),
              status: false,
            });
          }
        });
      }

      if (signed) {
        signed.forEach(signer => {
          if (signer) {
            signersList.push({
              content: signer,
              label: this.translate.instant(this.constantTranslation.signed),
              status: true,
            });
          }
        });
      }
      return signersList;
    } else if (this.operationInfo.signatureStatus === 'SUFFICIENT') {
      const signHistory = this.operationInfo.signHistory || this.signingHistory;
      if (signHistory) {
        signHistory.forEach(signer => {
          if (signer) {
            signersList.push({
              content: signer,
              label: this.translate.instant(this.constantTranslation.signed),
              status: true,
            });
          }
        });
      }
      return signersList;
    } else {
      if (
        getIn(this.operationInfo, 'status') === 'NEWDOC' &&
        !getIn(this.operationInfo, 'signatureStatus')
      ) {
        const signHistory = this.signingHistory;
        if (signHistory) {
          signHistory.forEach(signer => {
            if (signer) {
              signersList.push({
                content: signer,
                label: this.translate.instant(this.constantTranslation.signed),
                status: true,
              });
            }
          });
        }
        return signersList;
      }

      return [];
    }
  }

  getFormattedPeriod(period: string) {
    return moment(period, operationPeriod).format(periodFormat);
  }

  getStatusHistory() {
    const statusList = this.operationInfo?.statusHistory?.split(';');
    let statusWithoutEmpty: any = [];

    statusList?.map((status: any) => {
      if (status && status.indexOf(',') > -1) {
        statusWithoutEmpty.push(status.split(','));
      }
    });
    if (
      this.operationInfo.status === 'NEWDOC' &&
      this.operationInfo.signatureStatus === 'SUFFICIENT'
    ) {
      let date = statusWithoutEmpty[statusWithoutEmpty.length - 1][1];
      statusWithoutEmpty.push(['IN_PROGRESS', date]);
    }

    return statusWithoutEmpty;
  }

  getOperationTypeName(operationType: string): string {
    if (
      this.operationDetails.knpCode === '342' &&
      operationType === 'PAY_ORDER_V2'
    ) {
      return this.translate.instant(
        this.constantTranslation.PAY_BETWEEN_ACCOUNTS
      );
    } else {
      switch (operationType) {
        case 'PAY_SOCIAL_V2':
          return this.translate.instant(this.constantTranslation.PAY_SOCIAL_V2);
        case 'PAY_PENSION_V2':
          return this.translate.instant(
            this.constantTranslation.PAY_PENSION_V2
          );
        case 'PAY_SALARY_V2':
          return this.translate.instant(this.constantTranslation.PAY_SALARY_V2);
        case 'PAY_BUDGET':
          return this.translate.instant(this.constantTranslation.PAY_BUDGET);
        case 'PAY_ORDER_V2':
          return this.translate.instant(this.constantTranslation.PAY_ORDER_V2);
        case 'PAY_ORDER_CARDS':
          return this.translate.instant(
            this.constantTranslation.PAY_BETWEEN_ACCOUNTS
          );
        case 'PAY_P2P':
          return this.translate.instant(this.constantTranslation.PAY_P2P);
        case 'PAY_TO_CARD':
          return this.translate.instant(
            this.constantTranslation.PAY_BETWEEN_ACCOUNTS
          );
        case 'PAY_MEDICAL_INSURANCE':
          return this.translate.instant(
            this.constantTranslation.PAY_MEDICAL_INSURANCE
          );
        case 'DEPOSIT_OPEN':
          return this.translate.instant(this.constantTranslation.DEPOSIT_OPEN);
        case 'CORP_CARD_ISSUE':
          return this.translate.instant(
            this.constantTranslation.CORP_CARD_ISSUE
          );
        case 'ACCOUNT_CREATE':
          return this.translate.instant(
            this.constantTranslation.ACCOUNT_CREATE
          );
        case 'CURR_EXCHANGE_FX':
          return this.translate.instant(
            this.constantTranslation.CURR_EXCHANGE_FX
          );
        default:
          return '';
      }
    }
  }

  formatDate(date: string): string {
    const newDate = new Date(date);
    return moment(newDate).format('DD.MM.YYYY');
  }

  getEmailContent() {
    this.emailContent = ` ${this.translate.instant(
      this.constantTranslation.amount
    )}: ${this.operationDetails.amount}₸ \n ${this.translate.instant(
      this.constantTranslation.docNum
    )}: ${this.operationDetails.docNum} ${this.translate.instant(
      this.constantTranslation.date
    )}: ${this.operationDetails.docDate} \n ${this.translate.instant(
      this.constantTranslation.accountSender
    )}:
    ${
      this.operationDetails?.accountSender ||
      this.operationDetails?.senderIban ||
      this.operationDetails?.senderCardMask
    } \n
    ${this.translate.instant(this.constantTranslation.accountRecipient)}: ${
      this.operationDetails?.accountRecipient ||
      this.operationDetails?.recipientIban ||
      this.operationDetails?.receiverCardMask
    }`;
    if (
      this.type === 'PAY_TO_ACCOUNTS' ||
      this.type === 'PAY_ORDER_CARDS' ||
      this.type === 'PAY_P2P' ||
      this.type === 'PAY_TO_CARD'
    ) {
      this.emailCurrentActionTitle = this.emailTransferTitle;
    } else {
      this.emailCurrentActionTitle = this.emailPaymentTitle;
    }
  }

  sendToEmail() {
    window.location.href = `mailto:?subject=${encodeURIComponent(
      `${this.emailTheme}`
    )}
		&body=${encodeURIComponent(`${this.emailGreetings}.`)}${encodeURIComponent(
      `\n\n${this.emailCurrentActionTitle}.\n\n`
    )}${encodeURIComponent(this.emailContent)}`;
  }

  employeeTableShow() {
    this.showEmployeeTable = !this.showEmployeeTable;
  }

  changePage(page: PageChangedEvent) {
    if (page.page !== this.employeesPage) {
      // this.getOperationsList(page.page - 1)
    }
  }

  openSignersList() {
    this.openSigners = !this.openSigners;
  }

  checkBankIcon() {
    const value = getComputedStyle(
      this.bankIconElement?.nativeElement
    ).getPropertyValue('background-image');
    if (value === 'none') {
      this.isBankIconExists = false;
    } else {
      this.isBankIconExists = true;
    }
    this.changeDetector.detectChanges();
  }

  returnDepositFileName(reportType: string) {
    switch (reportType) {
      case 'request':
        return `${this.depositRequestApplication} ${
          this.operationDetails.docNum ||
          this.operationInfo.documentNumber ||
          ''
        }`;
      case 'conformation':
        return `${this.depositRequestConfirmation} ${
          this.operationDetails.docNum ||
          this.operationInfo.documentNumber ||
          ''
        }`;
      default:
        return (
          this.operationDetails.docNum ||
          this.operationInfo.documentNumber ||
          ''
        );
    }
  }

  returnAccountFileName(reportType: string) {
    switch (reportType) {
      case 'request':
        return `${this.accountRequestApplication} ${
          this.operationDetails.docNum ||
          this.operationInfo.documentNumber ||
          ''
        }`;
      case 'conformation':
        return `${this.depositRequestConfirmation} ${
          this.operationDetails.docNum ||
          this.operationInfo.documentNumber ||
          ''
        }`;
      default:
        return (
          this.operationDetails.docNum ||
          this.operationInfo.documentNumber ||
          ''
        );
    }
  }

  returnCardFileName(reportType: string) {
    switch (reportType) {
      case 'request':
        return `${this.corpCardRequestApplication} ${
          this.operationDetails.docNum ||
          this.operationInfo.documentNumber ||
          ''
        }`;
      case 'conformation':
        return `${this.depositRequestConfirmation} ${
          this.operationDetails.docNum ||
          this.operationInfo.documentNumber ||
          ''
        }`;
      default:
        return (
          this.operationDetails.docNum ||
          this.operationInfo.documentNumber ||
          ''
        );
    }
  }

  downloadProductPdf(reportType: string, formType: string) {
    let fileName = '';
    if (formType === 'DEPOSIT_OPEN') {
      fileName = this.returnDepositFileName(reportType);
    } else if (formType === 'ACCOUNT_CREATE') {
      fileName = this.returnAccountFileName(reportType);
    } else if (formType === 'CORP_CARD_ISSUE') {
      fileName = this.returnCardFileName(reportType);
    } else {
      fileName =
        this.operationDetails.docNum || this.operationInfo.documentNumber || '';
    }

    const successCb = (data: any) => {
      let blob: any = window.URL.createObjectURL(
        new Blob([data], { type: 'application/pdf' })
      );
      let a = document.createElement('a');
      a.href = blob;
      a.setAttribute('download', `${fileName}.pdf`);
      a.click();
      URL.revokeObjectURL(blob);
    };
    const errCb = (err: any) => {
      errorMessage(err, this.toastr);
    };

    if (formType === 'DEPOSIT_OPEN') {
      this.accountHistoryService
        .getDepositInfoPdf(reportType, this.operationInfo.id)
        .subscribe({
          next: successCb,
          error: errCb,
        });
    } else if (formType === 'ACCOUNT_CREATE') {
      this.accountHistoryService
        .getAccountInfoPdf(this.operationInfo.id)
        .subscribe({
          next: successCb,
          error: errCb,
        });
    } else if (formType === 'CORP_CARD_ISSUE') {
      this.accountHistoryService
        .getCardInfoPdf(this.operationInfo.id)
        .subscribe({
          next: successCb,
          error: errCb,
        });
    } else {
      console.info(formType);
    }
  }

  numberWithCommas(amount: number) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
}
