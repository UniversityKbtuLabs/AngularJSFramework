import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
  ViewChild,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
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
  selector: 'ob-operation-actions',
  templateUrl: './operation-actions.component.html',
  styleUrls: ['./operation-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationActionsComponent implements OnInit, OnDestroy, OnChanges {
  modalRef?: BsModalRef;
  @Input() status: string = '';
  @Input() operation: any = null;
  public signRights: boolean = false;
  public phoneNumber: string;
  public subscriptions: Subscription[] = [];
  public operationDetails: any;
  public userInfo: any;
  private operationType = '';
  @ViewChild('dropdown') dropdownElem: any;
  @Input() show: boolean = false;
  @Output() isOpen: EventEmitter<boolean> = new EventEmitter<boolean>(false);
  public docDeletedNotification: string = '';
  public docDeleteWarning: string = '';
  public deleteLabel: string = '';
  public cancelLabel: string = '';
  public depositRequestApplication: string;
  public depositRequestConfirmation: string;
  @Input() type: string = '';

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
    this.deleteDocument = this.deleteDocument.bind(this, this.operation?.id);
    this.changeDocument = this.changeDocument.bind(this);
    this.confirmPayment = this.confirmPayment.bind(this);
    this.savePdfReport = this.savePdfReport.bind(this);
    this.directlySignDraft = this.directlySignDraft.bind(this);
  }

  ngOnInit(): void {
    this.loginService.userInfoObject$.subscribe({
      next: v => {
        this.phoneNumber = getIn(v, 'user', 'phone');
        this.changeDetector.detectChanges();
        this.userInfo = v;
      },
    });
    this.getTranslations();
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

    if (
      this.operation.status === 'NEWDOC' &&
      this.operation.signatureStatus === 'INSUFFICIENT'
    ) {
      this.status = 'SIGN_DEAL';
    }

    this.operationsService.isUserRightsToSign$.subscribe((rights: boolean) => {
      this.signRights = rights;
    });
  }

  getTranslations() {
    this.translate
      .get([
        'toast-messages.warning.doc-delete',
        'operations.default.delete',
        'general.actions.cancel',
        'toast-messages.success.doc-deleted',
        'products.deposits.depositRequestApplication',
        'products.deposits.depositRequestConfirmation',
      ])
      .subscribe(translations => {
        this.docDeleteWarning =
          translations['toast-messages.warning.doc-delete'];
        this.docDeletedNotification =
          translations['toast-messages.success.doc-deleted'];
        this.deleteLabel = translations['general.actions.yes'];
        this.cancelLabel = translations['general.actions.no'];
        this.depositRequestApplication =
          translations['products.deposits.depositRequestApplication'];
        this.depositRequestConfirmation =
          translations['products.deposits.depositRequestConfirmation'];
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.show = changes.show.currentValue;
    if (this.dropdownElem) {
      this.dropdownElem.isOpen = this.show;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  canSign(): boolean {
    if (getIn(this.operation, 'status') === 'DRAFT') {
      return true;
    } else {
      const needSign = this.operation.needSign;
      const signed = this.operation.signed;
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

  isSignedByMe(): boolean {
    const signed = this.operation.signed;
    if (signed && signed.includes(getIn(this.userInfo, 'user', 'name'))) {
      return true;
    }
    return false;
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
    const type = this.operation.type;
    if (type === 'PAY_ORDER_V2') {
      this.subscriptions.push(
        this.documentService.sendPayOrder(this.operationDetails).subscribe(
          (data: any) => {
            if (data.status === 200) {
              this.sendToSignConfirm('counteragent', false);
            }
          },
          (error: any) => {
            if (error.status === 400) {
              this.translate.get('error.empty_fields_present').subscribe({
                next: (translation: string) => {
                  errorMessage({ message: translation }, this.toastr);
                },
              });
            } else {
              errorMessage(error, this.toastr);
            }
          }
        )
      );
    } else if (type === 'PAY_BUDGET') {
      this.subscriptions.push(
        this.documentService.sendPayBudget(this.operationDetails).subscribe({
          next: () => {
            this.sendToSignConfirm('budget', false);
          },
          error: (error: any) => {
            if (error.status === 400) {
              this.translate.get('error.empty_fields_present').subscribe({
                next: (translation: string) => {
                  errorMessage({ message: translation }, this.toastr);
                },
              });
            } else {
              errorMessage(error, this.toastr);
            }
          },
        })
      );
    } else if (type === 'PAY_MEDICAL_INSURANCE') {
      this.subscriptions.push(
        this.documentService.sendOSMSPrefill(this.operationDetails).subscribe(
          (data: any) => {
            if (data.status === 200) {
              this.sendToSignConfirm('osms', false);
            }
          },
          error => {
            if (error.status === 400) {
              this.translate.get('error.empty_fields_present').subscribe({
                next: (translation: string) => {
                  errorMessage({ message: translation }, this.toastr);
                },
              });
            } else {
              errorMessage(error, this.toastr);
            }
          }
        )
      );
    } else if (type === 'PAY_SOCIAL_V2') {
      this.subscriptions.push(
        this.documentService.sendSocailPrefill(this.operationDetails).subscribe(
          (data: any) => {
            if (data.status === 200) {
              this.sendToSignConfirm('social', false);
            }
          },
          error => {
            if (error.status === 400) {
              this.translate.get('error.empty_fields_present').subscribe({
                next: (translation: string) => {
                  errorMessage({ message: translation }, this.toastr);
                },
              });
            } else {
              errorMessage(error, this.toastr);
            }
          }
        )
      );
    } else if (type === 'PAY_SALARY_V2') {
      this.subscriptions.push(
        this.documentService.sendSalaryPrefill(this.operationDetails).subscribe(
          (data: any) => {
            if (data.status === 200) {
              this.sendToSignConfirm('salary', false);
            }
          },
          error => {
            if (error.status === 400) {
              this.translate.get('error.empty_fields_present').subscribe({
                next: (translation: string) => {
                  errorMessage({ message: translation }, this.toastr);
                },
              });
            } else {
              errorMessage(error, this.toastr);
            }
          }
        )
      );
    } else if (type === 'PAY_PENSION_V2') {
      this.subscriptions.push(
        this.documentService
          .sendPensionPrefill(this.operationDetails)
          .subscribe(
            (data: any) => {
              if (data.status === 200) {
                this.sendToSignConfirm('retirement', false);
              }
            },
            error => {
              if (error.status === 400) {
                this.translate.get('error.empty_fields_present').subscribe({
                  next: (translation: string) => {
                    errorMessage({ message: translation }, this.toastr);
                  },
                });
              } else {
                errorMessage(error, this.toastr);
              }
            }
          )
      );
    }
  }

  deleteDocument() {
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
              .deleteDraftDocuments(this.operation.id)
              .subscribe(
                () => {
                  successMessage(this.docDeletedNotification, this.toastr);
                },
                err => {
                  errorMessage(err, this.toastr);
                }
              )
          );
        } else {
          this.subscriptions.push(
            this.accountHistoryService
              .deleteDocuments(this.operation.id)
              .subscribe({
                next: () => {
                  successMessage(this.docDeletedNotification, this.toastr);
                },
                error: err => {
                  errorMessage(err, this.toastr);
                },
              })
          );
        }
      }
    });
  }

  getPaymentType() {
    const type = this.operation.type;

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
      case 'PAY_TO_CARD_V2':
        return 'operations/transfer/accounts';
      case 'CURR_EXCHANGE_FX':
        return 'currency-control/convertation';
      default:
        return 'operations/payment/counteragent';
    }
  }

  changeDocument() {
    const url = this.getPaymentType();
    this.modalService.hide();
    if (
      this.operation.knpCode === '342' &&
      this.operation.type === 'PAY_ORDER_V2'
    ) {
      this.router.navigate([
        'operations/transfer/accounts' + `/${this.operation.id}`,
      ]);
    } else {
      this.router.navigate([url + `/${this.operation.id}`]);
    }
  }

  redirectToSuccesPage(route: string, isSigned: boolean, data: any) {
    const options = {
      ...data,
      isSigned,
    };
    this.router.navigate([route, options]);
  }

  onRedirect(operationType: string) {
    switch (operationType) {
      case 'DEPOSIT_OPEN':
        const opData = {
          productType: 'deposit',
          amount: this.operation.amount,
          isSigned: true,
          currency: this.helperService.formatCurrency(
            getIn(this.operation, 'currency')
          ),
        };
        this.redirectToSuccesPage(
          'products/create/deposit/confirm',
          true,
          opData
        );
        break;
      default:
        break;
    }
  }

  confirmPayment() {
    const closeModal = () => this.modalRef.hide();
    const initialState: any = {
      operationId: this.operation.id,
      closeModal,
      router: this.router,
    };
    this.modalService.hide(1);

    if (
      getIn(this.loginService.userInfoObject$.value, 'user', 'loggedInBy') ===
      'signature'
    ) {
      const type = this.operation.type;
      const is2FAOperation = opeartions2FA.includes(type);
      initialState.is2FA = is2FAOperation;
      // const route = this.returnRedirectRoute(this.operation.type);
      initialState.successCb = () => {
        console.info(this.operation);
        // console.info(this.operation);
        console.info('confirmPayment');
        this.onRedirect(type);
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

  savePdfReport(type: string) {
    this.subscriptions.push(
      this.accountHistoryService
        .savePaymentReport(this.operation.id, this.operation.type)
        .subscribe({
          next: (data: any) => {
            this.translate.get(`operations.type.${type}`).subscribe({
              next: (translation: string) => {
                let fileName = translation;
                if (this.operation.documentNumber) {
                  fileName = `${translation} ${this.operation.documentNumber}`;
                }
                if (type === 'PAY_ORDER_V2') {
                  fileName = `${this.operation.documentNumber}_${this.operation.nameRecipient}_${this.operation.amount}_${this.operation.sentDate}`;
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

  downloadDeposit(reportType: string) {
    let fileName = '';
    switch (reportType) {
      case 'request':
        fileName = `${this.depositRequestApplication} ${
          this.operation.documentNumber || ''
        }`;
        break;
      case 'conformation':
        fileName = `${this.depositRequestConfirmation} ${
          this.operation.documentNumber || ''
        }`;
        break;
      default:
        fileName = this.operation.documentNumber || '';
        break;
    }
    this.accountHistoryService
      .getDepositInfoPdf(reportType, this.operation.id)
      .subscribe({
        next: (data: any) => {
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
  }

  // Метод получения деталей операций для отправки на подпись
  // После получения вызывается метод отправки на подпись
  getInfoById(type: any, id: string, status: string, signType: string) {
    if (status === 'DRAFT') {
      this.subscriptions.push(
        this.accountHistoryService.getPaymentBySavedId(type, id).subscribe(
          (data: any) => {
            this.operationDetails = data;
            if (signType === 'directSign') {
              this.directlySignDraft();
            } else {
              this.sendToSign();
            }
            this.changeDetector.detectChanges();
          },
          err => {
            errorMessage(err, this.toastr);
          }
        )
      );
    } else {
      this.subscriptions.push(
        this.accountHistoryService.getPaymentById(type, id).subscribe(
          (data: any) => {
            this.operationDetails = data;
            this.sendToSign();
            this.changeDetector.detectChanges();
          },
          err => {
            errorMessage(err, this.toastr);
          }
        )
      );
    }
  }

  preSendToSign(signType: string = 'default') {
    if (
      this.operation.type === 'PAY_ORDER_V2' ||
      this.operation.type === 'PAY_BUDGET' ||
      this.operation.type === 'PAY_MEDICAL_INSURANCE' ||
      this.operation.type === 'PAY_SOCIAL_V2' ||
      this.operation.type === 'PAY_SALARY_V2' ||
      this.operation.type === 'PAY_PENSION_V2'
    ) {
      this.getInfoById(
        this.operation.type,
        this.operation.id,
        this.status,
        signType
      );
    }
  }

  onClick() {
    localStorage.setItem('operation-info', JSON.stringify(this.operation));
  }

  directlySignDraft() {
    const type = this.operation.type;
    console.info(this.operation);
    const successCb = (data: any) => {
      this.operationType = returnOperationType(type);
      this.confirmSign(data.body);
    };
    const errCb = (error: any) => {
      if (error.status === 400) {
        this.translate.get('error.empty_fields_present').subscribe({
          next: (translation: string) => {
            errorMessage({ message: translation }, this.toastr);
          },
        });
      } else {
        errorMessage(error, this.toastr);
      }
    };
    if (type === 'PAY_ORDER_V2') {
      this.documentService.sendPayOrder(this.operationDetails).subscribe({
        next: successCb,
        error: errCb,
      });
    } else if (type === 'PAY_BUDGET') {
      this.documentService.sendPayBudget(this.operationDetails).subscribe({
        next: successCb,
        error: errCb,
      });
    } else if (type === 'PAY_MEDICAL_INSURANCE') {
      this.subscriptions.push(
        this.documentService.sendOSMSPrefill(this.operationDetails).subscribe({
          next: successCb,
          error: errCb,
        })
      );
    } else if (type === 'PAY_SOCIAL_V2') {
      this.subscriptions.push(
        this.documentService
          .sendSocailPrefill(this.operationDetails)
          .subscribe({
            next: successCb,
            error: errCb,
          })
      );
    } else if (type === 'PAY_SALARY_V2') {
      this.subscriptions.push(
        this.documentService
          .sendSalaryPrefill(this.operationDetails)
          .subscribe({
            next: successCb,
            error: errCb,
          })
      );
    } else if (type === 'PAY_PENSION_V2') {
      this.subscriptions.push(
        this.documentService
          .sendPensionPrefill(this.operationDetails)
          .subscribe({
            next: successCb,
            error: errCb,
          })
      );
    }
  }

  confirmSign(id: number) {
    this.modalService.hide(1);
    const initialState: any = { operationId: id, isDirectlySign: true };

    //this.modalService.hide(1);
    if (
      getIn(this.loginService.userInfoObject$.value, 'user', 'loggedInBy') ===
      'signature'
    ) {
      const type = this.operation.type;
      const is2FAOperation = opeartions2FA.includes(type);
      const closeModal = () => this.modalRef.hide();
      initialState.closeModal = closeModal;
      initialState.is2FA = is2FAOperation;
      initialState.successCb = () => {
        this.sendToSignConfirm(this.operationType, true);
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

  onOpenChange(event: any) {
    if (event) {
      this.isOpen.emit(event);
    }
  }

  isHide() {
    return (
      this.type === 'product-statements' &&
      (this.status === 'IN_PROGRESS' ||
        this.status === 'FULFILLED' ||
        (this.operation.signatureStatus === 'SUFFICIENT' &&
          this.operation.status === 'NEWDOC')) &&
      this.operation.type !== 'DEPOSIT_OPEN'
    );
  }
}
