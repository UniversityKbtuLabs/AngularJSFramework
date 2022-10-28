/* eslint-disable max-len */
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { CONFIRM } from '@core/constants/pathnames';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { DocumentService } from '@app/core/services/document.service';
import { AccountHistoryService } from '@app/core/services/account-history.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { OperationsService } from '@app/core/services/operations.service';
import { SmsModalComponent } from '@app/shared/components/sms-modal/sms-modal.component';
import { ConfirmModalComponent } from '@app/shared';
import { LoginService } from '@app/core/services/login.service';
import { errorMessage, getIn, successMessage } from '@app/core/helpers';
import { Subscription } from 'rxjs';
import { opeartions2FA, returnOperationType } from '@app/core/constants';
import { SocketService } from '@app/core/services/socket.service';
import { TokenKeyModalComponent } from '@app/modules/ecp/token-key-modal/token-key-modal.component';
import { HelperService } from '@app/core/services/helper.service';

@Component({
  selector: 'ob-new-doc-buttons',
  templateUrl: './new-doc-buttons.component.html',
  styleUrls: ['./new-doc-buttons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewDocButtonsComponent implements OnInit, OnDestroy {
  modalRef?: BsModalRef;
  @Input() status: string = '';
  @Input() operation: any = null;
  @Input() operationInfo: any = null;
  @Output() clickToEmail = new EventEmitter();
  public signRights: boolean = false;
  public phoneNumber: string;
  public subscriptions: Subscription[] = [];
  private operationType = '';
  public userInfo: any;
  public docDeletedNotification: string = '';
  public docDeleteWarning: string = '';
  public deleteLabel: string = '';
  public cancelLabel: string = '';
  public signingHistory: any[];
  public isAccountUrl: boolean = false;

  constructor(
    public documentService: DocumentService,
    public router: Router,
    public translate: TranslateService,
    public accountHistoryService: AccountHistoryService,
    public toastr: ToastrService,
    private modalService: BsModalService,
    public operationsService: OperationsService,
    private loginService: LoginService,
    private changeDetector: ChangeDetectorRef,
    private socketService: SocketService,
    private helperService: HelperService
  ) {
    this.sendToSign = this.sendToSign.bind(this);
    this.deleteDocument = this.deleteDocument.bind(
      this,
      this.operationInfo?.id
    );
    this.changeDocument = this.changeDocument.bind(this);
    // this.signingDocuments = this.signingDocuments.bind(this);
    this.confirmPayment = this.confirmPayment.bind(this);
    this.savePdfReport = this.savePdfReport.bind(this);
    this.sendToEmail = this.sendToEmail.bind(this);
    this.directlySignDraft = this.directlySignDraft.bind(this);
    this.isSignedByMe = this.isSignedByMe.bind(this);
    this.canSign = this.canSign.bind(this);
    this.returnClassName = this.returnClassName.bind(this);
  }

  ngOnInit(): void {
    this.loginService.userInfoObject$.subscribe({
      next: v => {
        this.phoneNumber = getIn(v, 'user', 'phone');
        this.changeDetector.detectChanges();
        this.userInfo = v;
      },
    });
    this.accountHistoryService.openedDocument$.subscribe({
      next: value => {
        if (value) {
          const amountList: any = {};
          if (!value.currency) {
            value.currency = 'KZT';
          }

          if (!amountList[value.currency]) {
            amountList[value.currency] = [value.amount];
          } else {
            amountList[value.currency] = [
              +amountList[value.currency] + +value.amount,
            ];
          }
          this.accountHistoryService.docsLength$.next(1);
          this.accountHistoryService.docsAmount$.next(
            JSON.stringify(amountList)
          );
        }
      },
    });

    this.operationsService.isUserRightsToSign$.subscribe((rights: boolean) => {
      this.signRights = rights;
      this.changeDetector.detectChanges();
    });

    this.getTranslations();
    this.accountHistoryService.signingHistory$.subscribe({
      next: history => {
        if (history && history.length) {
          this.signingHistory = history.map((item: any) => item.name);
        }
      },
    });

    this.getPageType();
    this.getTranslations();
    this.accountHistoryService.signingHistory$.subscribe({
      next: history => {
        if (history && history.length) {
          this.signingHistory = history.map((item: any) => item.name);
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  getPageType() {
    this.isAccountUrl = this.router.url.includes('account');
    this.changeDetector.detectChanges();
  }

  getTranslations() {
    this.translate
      .get([
        'toast-messages.warning.doc-delete',
        'operations.default.delete',
        'general.actions.cancel',
        'toast-messages.success.doc-deleted',
      ])
      .subscribe(translations => {
        this.docDeleteWarning =
          translations['toast-messages.warning.doc-delete'];
        this.docDeletedNotification =
          translations['toast-messages.success.doc-deleted'];
        this.deleteLabel = translations['general.actions.yes'];
        this.cancelLabel = translations['general.actions.no'];
      });
  }

  isSignedByMe(): boolean {
    const signed = this.operationInfo.signed || this.signingHistory;
    if (signed && signed.includes(getIn(this.userInfo, 'user', 'name'))) {
      return true;
    }
    return false;
  }

  canSign(): boolean {
    if (getIn(this.operationInfo, 'status') === 'DRAFT') {
      return true;
    } else {
      const needSign = this.operationInfo.needSign;
      const signed = this.operationInfo.signed;
      const singersInfo = signed + needSign;
      if (
        singersInfo &&
        singersInfo.includes(getIn(this.userInfo, 'user', 'name'))
      ) {
        return true;
      }
      return false;
    }
  }

  sendToSignConfirm(type: string, signed: boolean) {
    this.router.navigate([
      CONFIRM.replace(':type', 'payment'),
      {
        sum: this.operation.amount,
        receiver:
          this.operation?.bankNameRecipient || this.operation?.nameRecipient,
        isSigned: signed,
      },
    ]);
  }

  sendToSign(): void {
    const type = this.operationInfo.type;
    const successCb = (data: any) => {
      this.sendToSignConfirm(returnOperationType(type), false);
    };
    const errorCb = (error: any) => errorMessage(error, this.toastr);

    if (type === 'PAY_ORDER_V2') {
      this.subscriptions.push(
        this.documentService.sendPayOrder(this.operation).subscribe({
          next: successCb,
          error: errorCb,
        })
      );
    } else if (type === 'PAY_BUDGET') {
      this.subscriptions.push(
        this.documentService.sendPayBudget(this.operation).subscribe({
          next: successCb,
          error: errorCb,
        })
      );
    } else if (type === 'PAY_MEDICAL_INSURANCE') {
      this.subscriptions.push(
        this.documentService.sendOSMSPrefill(this.operation).subscribe({
          next: successCb,
          error: errorCb,
        })
      );
    } else if (type === 'PAY_SOCIAL_V2') {
      this.subscriptions.push(
        this.documentService.sendSocailPrefill(this.operation).subscribe({
          next: successCb,
          error: errorCb,
        })
      );
    } else if (type === 'PAY_SALARY_V2') {
      this.subscriptions.push(
        this.documentService.sendSalaryPrefill(this.operation).subscribe({
          next: successCb,
          error: errorCb,
        })
      );
    } else if (type === 'PAY_PENSION_V2') {
      this.subscriptions.push(
        this.documentService.sendPensionPrefill(this.operation).subscribe({
          next: successCb,
          error: errorCb,
        })
      );
    }
  }

  sendToEmail() {
    this.clickToEmail.emit(true);
  }

  deleteDocument() {
    this.operationsService.changeTableModalVisible(false);
    let initialState = {
      text: this.docDeleteWarning + '?',
      btnConfirm: this.deleteLabel,
      btnCancel: this.cancelLabel,
    };
    this.modalRef = this.modalService.show(ConfirmModalComponent, {
      initialState,
      class: 'modal-dialog-centered',
      id: 5,
    });
    this.modalRef.content.onClose.subscribe((result: boolean) => {
      if (result) {
        if (this.status === 'DRAFT') {
          this.subscriptions.push(
            this.accountHistoryService
              .deleteDraftDocuments(this.operationInfo.id)
              .subscribe(
                () => {
                  successMessage(this.docDeletedNotification, this.toastr);
                  this.accountHistoryService.changeModalStatus(true);
                },
                err => {
                  errorMessage(err, this.toastr);
                  this.accountHistoryService.changeModalStatus(true);
                }
              )
          );
        } else {
          this.subscriptions.push(
            this.accountHistoryService
              .deleteDocuments(this.operationInfo.id)
              .subscribe({
                next: () => {
                  successMessage(this.docDeletedNotification, this.toastr);
                  this.accountHistoryService.changeModalStatus(true);
                },
                error: err => {
                  errorMessage(err, this.toastr);
                  this.accountHistoryService.changeModalStatus(true);
                },
              })
          );
        }
      }
    });
  }

  getPaymentType() {
    const type = this.operationInfo.type;

    switch (type) {
      case 'PAY_ORDER_V2':
        return 'operations/payment/counteragent';
      case 'PAY_SOCIAL_V2':
        return 'operations/payment/social';
      case 'PAY_SALARY_V2':
        return 'operations/payment/salary';
      case 'PAY_PENSION_V2':
        return 'operations/payment/retirement';
      case 'PAY_MEDICAL_INSURANCE':
        return 'operations/payment/osms';
      case 'PAY_BUDGET':
        return 'operations/payment/budget';
      case 'PAY_ORDER_CARDS':
        return 'operations/transfer/accounts';
      case 'PAY_P2P':
        return 'operations/transfer/card';
      case 'PAY_TO_CARD':
        return 'operations/transfer/accounts';
      case 'CURR_EXCHANGE_FX':
        return 'currency-control/convertation';
      default:
        return 'operations/payment/counteragent';
    }
  }

  returnClassName() {
    const status = getIn(this.operationInfo, 'status');
    const signatureStatus = getIn(this.operationInfo, 'signatureStatus');
    if (status === 'NEWDOC' && signatureStatus === 'SUFFICIENT') {
      return 'hidden';
    } else {
      if (status === 'NEWDOC' || (status === 'DRAFT' && !this.signRights)) {
        return '';
      } else {
        return 'hidden';
      }
    }
  }

  changeDocument() {
    const url = this.getPaymentType();
    this.modalService.hide();
    if (
      this.operationInfo.knpCode === '342' &&
      this.operationInfo.type === 'PAY_ORDER_V2'
    ) {
      this.router.navigate([
        'operations/transfer/accounts' + `/${this.operationInfo.id}`,
      ]);
    } else {
      this.router.navigate([url + `/${this.operationInfo.id}`]);
    }
  }

  returnRedirectRoute(operationType: string) {
    switch (operationType) {
      case 'DEPOSIT_OPEN':
        return 'products/create/deposit/confirm';
      default:
        return '/home';
    }
  }

  returnProductType(operationType: string) {
    switch (operationType) {
      case 'DEPOSIT_OPEN':
        return 'deposit';
      default:
        return '';
    }
  }

  confirmPayment() {
    // при платеже Партнеру
    const closeModal = () => this.modalRef.hide();
    const type = this.operationInfo.type;
    const is2FAOperation = opeartions2FA.includes(type);
    const initialState: any = {
      operationId: this.operationInfo.id,
      closeModal,
      router: this.router,
      is2FA: is2FAOperation,
    };

    this.modalService.hide(1);
    if (
      getIn(this.loginService.userInfoObject$.value, 'user', 'loggedInBy') ===
      'signature'
    ) {
      const route = this.returnRedirectRoute(this.operation.type);
      const productType = this.returnProductType(
        this.operation.type || this.operationInfo.type
      );
      console.info(productType);
      initialState.successCb = () => {
        this.router.navigate([
          route,
          {
            productType,
            amount:
              getIn(this.operationInfo, 'amount') ||
              getIn(this.operation, 'amount') ||
              0,
            isSigned: true,
            currency: this.helperService.formatCurrency(
              getIn(this.operation, 'accountSenderCurrency')
            ),
          },
        ]);
      };
      this.modalRef = this.modalService.show(TokenKeyModalComponent, {
        class: 'modal-dialog-centered',
        initialState,
        id: 2,
      });
      this.socketService.connect(() => {
        console.info('ws callback');
      });
    } else {
      this.modalRef = this.modalService.show(SmsModalComponent, {
        class: 'modal-dialog-centered',
        initialState,
        id: 2,
      });
    }
  }

  savePdfReport() {
    const type = getIn(this.operationInfo, 'type');

    type === 'ACCOUNT_STATEMENT' && this.downloadAccountReport();

    type !== 'ACCOUNT_STATEMENT' &&
      this.subscriptions.push(
        this.accountHistoryService
          .savePaymentReport(this.operationInfo.id, type)
          .subscribe({
            next: (data: any) => {
              this.translate.get(`operations.type.${type}`).subscribe({
                next: (translation: string) => {
                  let fileName = translation;
                  if (
                    this.operation.docNum ||
                    this.operationInfo.documentNumber
                  ) {
                    fileName = `${translation} ${
                      this.operation.docNum || this.operationInfo.documentNumber
                    }`;
                  }
                  if (type === 'PAY_ORDER_V2') {
                    fileName = `${this.operationInfo.documentNumber}_${this.operation.nameRecipient}_${this.operation.amount}_${this.operationInfo.sentDate}`;
                    fileName = fileName.trim();
                  }
                  let blob: any = window.URL.createObjectURL(
                    new Blob([data], { type: 'application/pdf' })
                  );
                  let a = document.createElement('a');
                  a.href = blob;
                  a.setAttribute('download', `${fileName}.pdf`);
                  a.click();
                  URL.revokeObjectURL(blob);
                },
                error: err => {
                  errorMessage(err, this.toastr);
                },
              });
            },
            error: err => {
              errorMessage(err, this.toastr);
            },
          })
      );
  }

  downloadAccountReport() {
    this.accountHistoryService
      .saveAccountReport(
        this.operationInfo.id,
        this.operationInfo.accountSender
      )
      .subscribe({
        next: (data: any) => {
          let blob: any = window.URL.createObjectURL(
            new Blob([data], { type: 'application/pdf' })
          );
          let a = document.createElement('a');
          a.href = blob;
          a.setAttribute(
            'download',
            `${this.operationInfo.documentNumber}-${this.operationInfo.date}.pdf`
          );
          a.click();
          URL.revokeObjectURL(blob);
        },
        error: err => {
          errorMessage(err, this.toastr);
        },
      });
  }

  directlySignDraft() {
    const type = this.operationInfo.type;
    const successCb = (data: any) => {
      this.operationType = returnOperationType(type);
      this.confirmSign(data.body);
    };
    const errorCb = (error: any) => errorMessage(error, this.toastr);
    if (type === 'PAY_ORDER_V2') {
      this.subscriptions.push(
        this.documentService.sendPayOrder(this.operation).subscribe({
          next: successCb,
          error: errorCb,
        })
      );
    } else if (type === 'PAY_BUDGET') {
      this.subscriptions.push(
        this.documentService.sendPayBudget(this.operation).subscribe({
          next: successCb,
          error: errorCb,
        })
      );
    } else if (type === 'PAY_MEDICAL_INSURANCE') {
      this.subscriptions.push(
        this.documentService.sendOSMSPrefill(this.operation).subscribe({
          next: successCb,
          error: errorCb,
        })
      );
    } else if (type === 'PAY_SOCIAL_V2') {
      this.subscriptions.push(
        this.documentService.sendSocailPrefill(this.operation).subscribe({
          next: successCb,
          error: errorCb,
        })
      );
    } else if (type === 'PAY_SALARY_V2') {
      this.subscriptions.push(
        this.documentService.sendSalaryPrefill(this.operation).subscribe({
          next: successCb,
          error: errorCb,
        })
      );
    } else if (type === 'PAY_PENSION_V2') {
      this.subscriptions.push(
        this.documentService.sendPensionPrefill(this.operation).subscribe({
          next: successCb,
          error: errorCb,
        })
      );
    }
  }

  confirmSign(id: number) {
    this.modalService.hide(1);
    const initialState: any = { operationId: id, isDirectlySign: true };
    if (
      getIn(this.loginService.userInfoObject$.value, 'user', 'loggedInBy') ===
      'signature'
    ) {
      const type = this.operationInfo.type;
      const is2FAOperation = opeartions2FA.includes(type);
      const closeModal = () => this.modalRef.hide();
      initialState.closeModal = closeModal;
      initialState.successCb = () => {
        this.sendToSignConfirm(this.operationType, true);
      };
      initialState.is2FA = is2FAOperation;
      this.modalRef = this.modalService.show(TokenKeyModalComponent, {
        class: 'modal-dialog-centered',
        initialState,
        id: 2,
      });
      this.socketService.connect(() => {
        console.info('ws callback');
      });
    } else {
      this.modalRef = this.modalService.show(SmsModalComponent, {
        class: 'modal-dialog-centered',
        initialState,
        backdrop: 'static',
        id: 2,
      });
      this.modalRef.content.statusDirectlySign.subscribe((status: boolean) => {
        if (status) {
          this.sendToSignConfirm(this.operationType, true);
          this.modalService.hide(2);
        }
      });
    }
  }
}
