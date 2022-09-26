import { HttpHeaders } from '@angular/common/http';
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  dateFormat,
  opeartions2FA,
  operationPeriod,
  periodFormat,
  requestDateFormat,
} from '@app/core/constants';
import { CONFIRM } from '@app/core/constants/pathnames';
import { errorMessage, getIn, thousandsSeparator } from '@app/core/helpers';
import { SubscriptionAccumulator } from '@app/core/helpers/SubscriptionAccumulator';
import { DocumentService } from '@app/core/services/document.service';
import { HelperService } from '@app/core/services/helper.service';
import { LoginService } from '@app/core/services/login.service';
import { OperationsService } from '@app/core/services/operations.service';
import { SocketService } from '@app/core/services/socket.service';
import { IP2PRequest } from '@app/data/models/p2p-types';
import { TokenKeyModalComponent } from '@app/modules/ecp/token-key-modal/token-key-modal.component';
import { SmsModalComponent } from '@app/shared';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ob-payment-confirmation',
  templateUrl: './payment-confirmation.component.html',
  styleUrls: [
    './payment-confirmation.component.scss',
    '../counteragent-payment/counteragent-payment.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentConfirmationComponent
  extends SubscriptionAccumulator
  implements OnInit, OnDestroy
{
  public type: string = 'counteragent';
  public template: any;
  public operationType: string;
  public id: string;
  public loading: boolean;
  public phoneNumber: string;
  public modalRef?: BsModalRef;
  public isSave: boolean;
  public code: string = '';
  public codeCompleted: boolean = false;
  public loginErrorValue: string = '';
  public rightsToSign: boolean = false;
  public c2c: string;
  public c2a: string;
  public a2c: string;
  public budgetPayment: string;
  public socialPayment: string;
  public conteragentPayment: string;
  public salaryPayment: string;
  public osmsPayment: string;
  public pensionPayment: string;
  public cardTransfer: string;
  public subscriptions: Subscription[] = [];
  public savedDocId: number;
  public isSendLoading: boolean = false;
  public isSaveLoading: boolean = false;
  public employerList: any = [];
  public showEmployeeTable: boolean = false;

  // Для конвертации
  public convertationRefreshTime: number = 0;
  public convertationRefreshInterval: any;
  public individualRateLoading: boolean = false;
  public individualRateInterval: any;
  public individualRateTime: number = 0;
  public handShakeInterval: any;
  public refreshCount: number = 0;
  //currency-transfer
  public isSenderOpen: boolean = true;
  public isRecipientOpen: boolean = true;
  public isBankRecipientOpen: boolean = true;
  public isDetailsOpen: boolean = true;
  public isInopartnerOpen: boolean = true;
  public isBudgetDetailsOpen: boolean = true;
  public fileUploadTryAgainMessage: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private documentService: DocumentService,
    private toastr: ToastrService,
    public operationsService: OperationsService,
    private modalService: BsModalService,
    private loginService: LoginService,
    private changeDetector: ChangeDetectorRef,
    public helperService: HelperService,
    public translate: TranslateService,
    private socketService: SocketService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loginService.userInfoObject$.subscribe({
      next: v => {
        this.phoneNumber = getIn(v, 'user', 'phone');
        this.changeDetector.detectChanges();
      },
    });
    if (this.type === 'convertation') {
      this.operationsService.convertationRefreshTime$.subscribe(value => {
        this.convertationRefreshTime = value;
        this.convertationRefreshInterval = setInterval(() => {
          if (this.convertationRefreshTime > 0) {
            this.convertationRefreshTime--;
            this.changeDetector.detectChanges();
          } else {
            clearInterval(this.convertationRefreshInterval);
            this.convertationRefreshTime = 179;
            this.requestIndividualRate();
            this.changeDetector.detectChanges();
          }
        }, 1000);
      });
    }

    this.hasRightsToSign();
    this.getTranslations();
    this.addSubscriber(
      this.documentService.currentTemplate$.subscribe({
        next: data => {
          if (data !== null) {
            data = data;
          } else {
            data = JSON.parse(localStorage.getItem('template'));
          }
          this.operationType = data.operationType;
          this.id = data.id;
          this.template = data.template;
          this.employerList =
            data.template?.pensionList ||
            data.template?.salaryList ||
            data.template?.socialList;
          if (data.lastVisitedPage) {
            this.operationsService.staffListLastPage$.next(
              data.lastVisitedPage
            );
          }
          if (
            this.operationType === 'card' ||
            this.operationType === 'accounts' ||
            this.operationType === 'currency-transfer' ||
            this.operationType === 'contract-creation'
          ) {
            this.isSave = true;
          }
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  ngOnDestroy(): void {
    localStorage.removeItem('template');
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  getTranslations() {
    this.translate
      .get([
        'operations.type.PAY_TO_ACCOUNT',
        'operations.type.PAY_TO_CARD',
        'operations.type.PAY_BETWEEN_ACCOUNTS',
        'operations.type.PAY_ORDER_CARDS',
        'operations.default.paymentToCounterparty',
        'operations.default.paymentToBudget',
        'operations.type.PAY_PENSION_V2',
        'operations.type.PAY_SALARY_V2',
        'operations.type.PAY_SOCIAL_V2',
        'operations.type.PAY_MEDICAL_INSURANCE',
        'operations.type.PAY_P2P',
        'error.fileUploadTryAgain',
      ])
      .subscribe(translations => {
        // this.c2c = translations["operations.type.PAY_TO_ACCOUNT"];
        // this.a2c = translations["operations.type.PAY_TO_CARD"];
        this.c2c = translations['operations.type.PAY_BETWEEN_ACCOUNTS'];
        this.c2a = translations['operations.type.PAY_ORDER_CARDS'];
        this.a2c = translations['operations.type.PAY_BETWEEN_ACCOUNTS'];
        this.conteragentPayment =
          translations['operations.default.paymentToCounterparty'];
        this.budgetPayment = translations['operations.default.paymentToBudget'];
        this.pensionPayment = translations['operations.type.PAY_PENSION_V2'];
        this.salaryPayment = translations['operations.type.PAY_SALARY_V2'];
        this.socialPayment = translations['operations.type.PAY_SOCIAL_V2'];
        this.osmsPayment =
          translations['operations.type.PAY_MEDICAL_INSURANCE'];
        this.cardTransfer = translations['operations.type.PAY_P2P'];
        this.fileUploadTryAgainMessage =
          translations['error.fileUploadTryAgain'];
      });
  }

  getFormattedAmount(amount: number | string) {
    return thousandsSeparator(Number(amount)) + ' ₸';
  }

  getFormattedAmountWithCurrency(amount: number | string, currency: string) {
    return (
      thousandsSeparator(Number(amount)) +
      ' ' +
      this.helperService.formatCurrency(currency)
    );
  }

  checkNumber(amount: string) {
    return Number(amount) ? true : false;
  }
  formatDate(date: string) {
    if (date) {
      return moment(date, requestDateFormat).format(dateFormat);
    } else {
      return date;
    }
  }

  changePeriodFormat(date: string) {
    return moment(date, operationPeriod).format(periodFormat);
  }

  getTransferType(type: string) {
    switch (type) {
      case 'PAY_ORDER_V2':
        return this.c2c;
      case 'PAY_ORDER_CARDS':
        return this.c2a;
      case 'PAY_TO_CARD':
        return this.a2c;
      default:
        return '';
    }
  }

  employeeTableShow() {
    this.showEmployeeTable = !this.showEmployeeTable;
  }

  getOpertationType(operationType: string) {
    switch (operationType) {
      case 'BUDGET':
        return this.budgetPayment;
      case 'SOCIAL':
        return this.socialPayment;
      case 'PENSION':
        return this.pensionPayment;
      case 'SALARY':
        return this.salaryPayment;
      case 'REGULAR':
        return this.conteragentPayment;
      default:
        return '';
    }
  }
  hasRightsToSign() {
    this.loading = true;
    this.operationsService.checkRightsToSign().subscribe({
      next: (data: boolean) => {
        this.loading = false;
        if (data) {
          this.rightsToSign = data;
        }
        this.changeDetector.detectChanges();
      },
      error: (error: any) => {
        errorMessage(error, this.toastr);
        this.loading = false;
        this.changeDetector.detectChanges();
      },
    });
  }

  toSave() {
    // сохранить
    this.isSaveLoading = true;
    this.changeDetector.detectChanges();
    const successCb = () => {
      this.isSaveLoading = false;
      this.changeDetector.detectChanges();
      this.router.navigate(['operations'], {
        state: { scrollTo: 'operation-table', tab: 'DRAFT' },
      });
    };
    const errCb = (error: any) => {
      this.isSaveLoading = false;
      this.changeDetector.detectChanges();
      errorMessage(error, this.toastr);
    };
    if (this.operationType === 'counteragent') {
      delete this.template.source;
      delete this.template.taxCommitteeParent;
      this.subscriptions.push(
        this.documentService.savePayOrder(this.template).subscribe({
          next: (data: any) => {
            successCb();
          },
          error: (error: any) => errCb(error),
        })
      );
    } else if (this.operationType === 'budget') {
      delete this.template.source;
      this.subscriptions.push(
        this.documentService.savePayBudget(this.template).subscribe({
          next: (data: any) => {
            successCb();
          },
          error: (error: any) => errCb(error),
        })
      );
    } else if (this.operationType === 'osms') {
      delete this.template.source;
      this.addSubscriber(
        this.documentService.saveOSMSPrefill(this.template).subscribe({
          next: (data: any) => {
            successCb();
          },
          error: (error: any) => errCb(error),
        })
      );
    } else if (this.operationType === 'social') {
      delete this.template.source;
      this.addSubscriber(
        this.documentService.saveSocailPrefill(this.template).subscribe({
          next: (data: any) => {
            successCb();
          },
          error: (error: any) => errCb(error),
        })
      );
    } else if (this.operationType === 'salary') {
      delete this.template.source;
      this.addSubscriber(
        this.documentService.saveSalaryPrefill(this.template).subscribe({
          next: (data: any) => {
            successCb();
          },
          error: (error: any) => errCb(error),
        })
      );
    } else if (this.operationType === 'retirement') {
      delete this.template.source;
      this.addSubscriber(
        this.documentService.savePensionPrefill(this.template).subscribe({
          next: (data: any) => {
            successCb();
          },
          error: (error: any) => errCb(error),
        })
      );
    }
  }

  sendToSign(): void {
    // Отправить на подпись
    this.isSendLoading = true;
    this.changeDetector.detectChanges();
    if (this.operationType === 'counteragent') {
      this.subscriptions.push(
        this.documentService.sendPayOrder(this.template).subscribe({
          next: (data: any) => {
            if (data.status === 200) {
              this.confirmPayment('counteragent', false);
            }
            this.isSendLoading = false;
            this.changeDetector.detectChanges();
          },
          error: (error: any) => {
            errorMessage(error, this.toastr);
            this.isSendLoading = false;
            this.changeDetector.detectChanges();
          },
        })
      );
    } else if (this.operationType === 'budget') {
      this.subscriptions.push(
        this.documentService.sendPayBudget(this.template).subscribe({
          next: () => {
            this.confirmPayment('budget', false);
            this.isSendLoading = false;
            this.changeDetector.detectChanges();
          },
          error: (error: any) => {
            errorMessage(error, this.toastr);
            this.isSendLoading = false;
            this.changeDetector.detectChanges();
          },
        })
      );
    } else if (this.operationType === 'osms') {
      this.addSubscriber(
        this.documentService.sendOSMSPrefill(this.template).subscribe(
          (data: any) => {
            if (data.status === 200) {
              this.confirmPayment('osms', false);
            }
            this.isSendLoading = false;
            this.changeDetector.detectChanges();
          },
          error => {
            errorMessage(error, this.toastr);
            this.isSendLoading = false;
            this.changeDetector.detectChanges();
          }
        )
      );
    } else if (this.operationType === 'social') {
      delete this.template.source;
      this.addSubscriber(
        this.documentService.sendSocailPrefill(this.template).subscribe(
          (data: any) => {
            if (data.status === 200) {
              this.confirmPayment('social', false);
            }
            this.isSendLoading = false;
            this.changeDetector.detectChanges();
          },
          error => {
            errorMessage(error, this.toastr);
            this.isSendLoading = false;
            this.changeDetector.detectChanges();
          }
        )
      );
    } else if (this.operationType === 'salary') {
      this.addSubscriber(
        this.documentService.sendSalaryPrefill(this.template).subscribe(
          (data: any) => {
            if (data.status === 200) {
              this.confirmPayment('salary', false);
            }
            this.isSendLoading = false;
            this.changeDetector.detectChanges();
          },
          error => {
            errorMessage(error, this.toastr);
            this.isSendLoading = false;
            this.changeDetector.detectChanges();
          }
        )
      );
    } else if (this.operationType === 'retirement') {
      this.addSubscriber(
        this.documentService.sendPensionPrefill(this.template).subscribe(
          (data: any) => {
            if (data.status === 200) {
              this.confirmPayment('retirement', false);
            }
            this.isSendLoading = false;
            this.changeDetector.detectChanges();
          },
          error => {
            errorMessage(error, this.toastr);
            this.isSendLoading = false;
            this.changeDetector.detectChanges();
          }
        )
      );
    } else if (this.operationType === 'convertation') {
      let requestBody = this.getConvertationFXrequestBody();
      this.addSubscriber(
        this.operationsService
          .approveHandshake(this.template.prefill.handshakeId)
          .subscribe({
            next: (data: any) => {
              this.addSubscriber(
                this.documentService.sendConvertationFx(requestBody).subscribe({
                  next: (value: any) => {
                    this.confirmPayment('convertation', false);
                    this.isSendLoading = false;
                    this.changeDetector.detectChanges();
                  },
                  error: (error: any) => {
                    errorMessage(error, this.toastr);
                    this.isSendLoading = false;
                    this.changeDetector.detectChanges();
                  },
                })
              );
            },
            error: (error: any) => {
              errorMessage(error, this.toastr);
              this.isSendLoading = false;
              this.changeDetector.detectChanges();
            },
          })
      );
    } else if (this.operationType === 'card') {
      console.info('asd');
      //
    } else if (this.operationType === 'accounts') {
      const successCb = (data: any) => {
        if (data.status === 200) {
          this.confirmTransfer(false);
        }
        this.isSendLoading = false;
        this.changeDetector.detectChanges();
      };

      const errCb = (error: any) => {
        errorMessage(error, this.toastr);
        this.isSendLoading = false;
        this.changeDetector.detectChanges();
      };

      const finalCb = () => {
        this.changeDetector.detectChanges();
      };
      this.subscriptions.push(
        this.documentService.sendTransferPayment(this.template).subscribe({
          next: (data: any) => successCb(data),
          error: (err: any) => errCb(err),
        })
      );
    } else if (this.operationType === 'currency-transfer') {
      let formData = new FormData();
      let body = Object.assign({}, this.template);
      delete body.fileNames;
      delete body.codeVoDescription;
      delete body.paymentReasonIndicatorDescription;
      delete body.hbOpTypeCodeDescription;
      delete body.budgetInfoDescription;
      delete body.transferPurposeDescription;
      formData.append(
        'dto',
        new Blob([JSON.stringify(body)], {
          type: 'application/json',
        })
      );
      if (this.template.fileNames.length > 0) {
        this.subscriptions.push(
          this.documentService.currencyTransferFiles$.subscribe((data: any) => {
            if (data?.length > 0) {
              for (let i = 0; i <= data.length - 1; i++) {
                formData.append('file', data[i], data[i].name); // Записываем файлы в тело запроса
              }
              this.documentService.sendCurrencyTransfer(formData).subscribe({
                next: (data: any) => {
                  if (data.status === 200) {
                    this.confirmPayment('currency-transfer', false);
                  }
                  this.isSendLoading = false;
                  this.changeDetector.detectChanges();
                },
                error: (error: any) => {
                  errorMessage(error, this.toastr);
                  this.isSendLoading = false;
                  this.changeDetector.detectChanges();
                },
              });
            } else {
              errorMessage(
                { message: this.fileUploadTryAgainMessage },
                this.toastr
              );
              this.isSendLoading = false;
              this.changeDetector.detectChanges();
            }
          })
        );
      } else {
        formData.append('file', null);
        this.documentService.sendCurrencyTransfer(formData).subscribe({
          next: (data: any) => {
            if (data.status === 200) {
              this.confirmPayment('currency-transfer', false);
            }
            this.isSendLoading = false;
            this.changeDetector.detectChanges();
          },
          error: (error: any) => {
            errorMessage(error, this.toastr);
            this.isSendLoading = false;
            this.changeDetector.detectChanges();
          },
        });
      }
    } else if (this.operationType === 'contract-creation') {
      let headers = new HttpHeaders();
      headers.append('Content-Type', 'multipart/form-data');
      headers.append('Accept', 'application/json');
      let formData = new FormData();
      let body = Object.assign({}, this.template);
      delete body.branchName;
      delete body.fileNames;
      formData.append(
        'dto',
        new Blob([JSON.stringify(body)], {
          type: 'application/json',
        })
      );
      if (this.template.fileNames.length > 0) {
        this.documentService.documentFiles$.subscribe((data: any) => {
          if (data?.length > 0) {
            for (let i = 0; i <= data.length - 1; i++) {
              formData.append('file', data[i], data[i].name); // Записываем файлы в тело запроса
            }
            this.documentService
              .sendCurrencyContract(formData, headers)
              .subscribe({
                next: (data: any) => {
                  if (data.status === 200) {
                    this.confirmPayment('contract-creation', false);
                  }
                  this.isSendLoading = false;
                  this.changeDetector.detectChanges();
                },
                error: (error: any) => {
                  errorMessage(error, this.toastr);
                  this.isSendLoading = false;
                  this.changeDetector.detectChanges();
                },
              });
          } else {
            errorMessage(
              { message: this.fileUploadTryAgainMessage },
              this.toastr
            );
            this.isSendLoading = false;
            this.changeDetector.detectChanges();
          }
        });
      } else {
        formData.append('file', null);
        this.documentService.sendCurrencyContract(formData, headers).subscribe({
          next: (data: any) => {
            if (data.status === 200) {
              this.confirmPayment('contract-creation', false);
            }
            this.isSendLoading = false;
            this.changeDetector.detectChanges();
          },
          error: (error: any) => {
            errorMessage(error, this.toastr);
            this.isSendLoading = false;
            this.changeDetector.detectChanges();
          },
        });
      }
    }
  }

  toDirectlySign(): void {
    if (!this.savedDocId) {
      this.isSendLoading = true;
      this.changeDetector.detectChanges();
      // Подписать
      if (this.operationType === 'counteragent') {
        this.subscriptions.push(
          this.documentService.sendPayOrder(this.template).subscribe({
            next: (data: any) => {
              if (data.status === 200) {
                this.confirmSign(data.body);
              }
              this.isSendLoading = false;
              this.changeDetector.detectChanges();
            },
            error: (error: any) => {
              errorMessage(error, this.toastr);
              this.isSendLoading = false;
              this.changeDetector.detectChanges();
            },
          })
        );
      } else if (this.operationType === 'budget') {
        this.subscriptions.push(
          this.documentService.sendPayBudget(this.template).subscribe({
            next: (data: any) => {
              if (data.status === 200) {
                this.confirmSign(data.body);
              }
              this.isSendLoading = false;
              this.changeDetector.detectChanges();
            },
            error: (error: any) => {
              errorMessage(error, this.toastr);
              this.isSendLoading = false;
              this.changeDetector.detectChanges();
            },
          })
        );
      } else if (this.operationType === 'osms') {
        this.addSubscriber(
          this.documentService.sendOSMSPrefill(this.template).subscribe(
            (data: any) => {
              if (data.status === 200) {
                this.confirmSign(data.body);
              }
              this.isSendLoading = false;
              this.changeDetector.detectChanges();
            },
            error => {
              errorMessage(error, this.toastr);
              this.isSendLoading = false;
              this.changeDetector.detectChanges();
            }
          )
        );
      } else if (this.operationType === 'social') {
        delete this.template.source;
        this.addSubscriber(
          this.documentService.sendSocailPrefill(this.template).subscribe(
            (data: any) => {
              if (data.status === 200) {
                this.confirmSign(data.body);
              }
              this.isSendLoading = false;
              this.changeDetector.detectChanges();
            },
            error => {
              errorMessage(error, this.toastr);
              this.isSendLoading = false;
              this.changeDetector.detectChanges();
            }
          )
        );
      } else if (this.operationType === 'salary') {
        this.addSubscriber(
          this.documentService.sendSalaryPrefill(this.template).subscribe(
            (data: any) => {
              if (data.status === 200) {
                this.confirmSign(data.body);
              }
              this.isSendLoading = false;
              this.changeDetector.detectChanges();
            },
            error => {
              errorMessage(error, this.toastr);
              this.isSendLoading = false;
              this.changeDetector.detectChanges();
            }
          )
        );
      } else if (this.operationType === 'retirement') {
        this.addSubscriber(
          this.documentService.sendPensionPrefill(this.template).subscribe(
            (data: any) => {
              if (data.status === 200) {
                this.confirmSign(data.body);
              }
              this.isSendLoading = false;
              this.changeDetector.detectChanges();
            },
            error => {
              errorMessage(error, this.toastr);
              this.isSendLoading = false;
              this.changeDetector.detectChanges();
            }
          )
        );
      } else if (this.operationType === 'card') {
        this.openP2pSmsModal();
        this.isSendLoading = false;
        this.changeDetector.detectChanges();
      } else if (this.operationType === 'accounts') {
        const successCb = (data: any) => {
          if (data.status === 200) {
            this.confirmSign(data.body);
          }
          this.isSendLoading = false;
          this.changeDetector.detectChanges();
        };

        const errCb = (error: any) => {
          errorMessage(error, this.toastr);
          this.isSendLoading = false;
          this.changeDetector.detectChanges();
        };

        const finalCb = () => {
          this.changeDetector.detectChanges();
        };
        this.subscriptions.push(
          this.documentService.sendTransferPayment(this.template).subscribe({
            next: (data: any) => successCb(data),
            error: (err: any) => errCb(err),
          })
        );
      } else if (this.operationType === 'convertation') {
        let requestBody = this.getConvertationFXrequestBody();
        this.addSubscriber(
          this.operationsService
            .approveHandshake(this.template.prefill.handshakeId)
            .subscribe({
              next: (data: any) => {
                this.addSubscriber(
                  this.documentService
                    .sendConvertationFx(requestBody)
                    .subscribe({
                      next: (value: any) => {
                        this.confirmPayment('convertation', false);
                        this.isSendLoading = false;
                        this.changeDetector.detectChanges();
                      },
                      error: (error: any) => {
                        errorMessage(error, this.toastr);
                        this.isSendLoading = false;
                        this.changeDetector.detectChanges();
                      },
                    })
                );
              },
              error: (error: any) => {
                errorMessage(error, this.toastr);
                this.isSendLoading = false;
                this.changeDetector.detectChanges();
              },
            })
        );
      } else if (this.operationType === 'currency-transfer') {
        let formData = new FormData();
        let body = Object.assign({}, this.template);
        delete body.fileNames;
        delete body.codeVoDescription;
        delete body.paymentReasonIndicatorDescription;
        delete body.hbOpTypeCodeDescription;
        delete body.budgetInfoDescription;
        delete body.transferPurposeDescription;
        formData.append(
          'dto',
          new Blob([JSON.stringify(body)], {
            type: 'application/json',
          })
        );
        if (this.template.fileNames.length > 0) {
          this.subscriptions.push(
            this.documentService.currencyTransferFiles$.subscribe(
              (data: any) => {
                if (data?.length > 0) {
                  for (let i = 0; i <= data.length - 1; i++) {
                    formData.append('file', data[i], data[i].name); // Записываем файлы в тело запроса
                  }
                  this.documentService
                    .sendCurrencyTransfer(formData)
                    .subscribe({
                      next: (data: any) => {
                        if (data.status === 200) {
                          this.confirmSign(data.body);
                        }
                        this.isSendLoading = false;
                        this.changeDetector.detectChanges();
                      },
                      error: (error: any) => {
                        errorMessage(error, this.toastr);
                        this.isSendLoading = false;
                        this.changeDetector.detectChanges();
                      },
                    });
                } else {
                  errorMessage(
                    { message: this.fileUploadTryAgainMessage },
                    this.toastr
                  );
                  this.isSendLoading = false;
                  this.changeDetector.detectChanges();
                }
              }
            )
          );
        } else {
          formData.append('file', null);
          this.documentService.sendCurrencyTransfer(formData).subscribe({
            next: (data: any) => {
              if (data.status === 200) {
                this.confirmSign(data.body);
              }
              this.isSendLoading = false;
              this.changeDetector.detectChanges();
            },
            error: (error: any) => {
              errorMessage(error, this.toastr);
              this.isSendLoading = false;
              this.changeDetector.detectChanges();
            },
          });
        }
      } else if (this.operationType === 'contract-creation') {
        let headers = new HttpHeaders();
        headers.append('Content-Type', 'multipart/form-data');
        headers.append('Accept', 'application/json');
        let formData = new FormData();
        let body = Object.assign({}, this.template);
        delete body.branchName;
        delete body.fileNames;
        formData.append(
          'dto',
          new Blob([JSON.stringify(body)], {
            type: 'application/json',
          })
        );
        if (this.template.fileNames.length > 0) {
          this.documentService.documentFiles$.subscribe((data: any) => {
            if (data?.length > 0) {
              for (let i = 0; i <= data.length - 1; i++) {
                formData.append('file', data[i], data[i].name); // Записываем файлы в тело запроса
              }
              this.documentService
                .sendCurrencyContract(formData, headers)
                .subscribe({
                  next: (data: any) => {
                    if (data.status === 200) {
                      this.confirmSign(data.body);
                    }
                    this.isSendLoading = false;
                    this.changeDetector.detectChanges();
                  },
                  error: (error: any) => {
                    errorMessage(error, this.toastr);
                    this.isSendLoading = false;
                    this.changeDetector.detectChanges();
                  },
                });
            } else {
              errorMessage(
                { message: this.fileUploadTryAgainMessage },
                this.toastr
              );
              this.isSendLoading = false;
              this.changeDetector.detectChanges();
            }
          });
        } else {
          formData.append('file', null);
          this.documentService
            .sendCurrencyContract(formData, headers)
            .subscribe({
              next: (data: any) => {
                if (data.status === 200) {
                  this.confirmSign(data.body);
                }
                this.isSendLoading = false;
                this.changeDetector.detectChanges();
              },
              error: (error: any) => {
                errorMessage(error, this.toastr);
                this.isSendLoading = false;
                this.changeDetector.detectChanges();
              },
            });
        }
      }
    } else {
      this.confirmSign(this.savedDocId);
    }
  }

  confirmPayment(type: string, signed: boolean) {
    if (type === 'contract-creation') {
      this.router.navigate([
        'currency-control/confirmation',
        { isSigned: signed },
      ]);
    } else {
      this.router.navigate([
        CONFIRM.replace(':type', 'payment'),
        {
          sum: this.template?.amount || this.template?.amountDebit,
          currency:
            this.template?.accountDebitCurrency ||
            this.template?.currencySender,
          type: type,
          receiver:
            this.template?.bankNameRecipient ||
            this.template?.nameRecipient ||
            this.template?.accountCredit,
          isSigned: signed,
        },
      ]);
    }
  }

  confirmTransfer(signed: boolean) {
    this.router.navigate([
      CONFIRM.replace(':type', 'transfer'),
      {
        sum: this.template?.amount,
        receiver: this.template?.nameRecipient,
        operationType: 'transfer',
        isSigned: signed,
      },
    ]);
  }

  confirmSign(id: number) {
    if (id && !this.savedDocId) {
      this.savedDocId = id;
    }
    const initialState: any = { operationId: id, isDirectlySign: true };
    let operationInfo = localStorage.getItem('operation-info');
    let operationTemplate = localStorage.getItem('template');
    let is2FAOperation = false;
    let parsedOperationInfo;
    let field: string = '';
    if (operationInfo) {
      parsedOperationInfo = JSON.parse(operationInfo);
      field = 'type';
    }
    if (operationTemplate) {
      parsedOperationInfo = JSON.parse(operationTemplate);
      field = 'operationType';
    }
    is2FAOperation = opeartions2FA.includes(parsedOperationInfo[field]);
    if (
      getIn(this.loginService.userInfoObject$.value, 'user', 'loggedInBy') ===
      'signature'
    ) {
      this.socketService.connect(() => {
        console.info('ws callback');
      });
      const closeModal = () => {
        this.modalService.hide(1);
        this.socketService.close();
      };
      let successCb;
      if (this.operationType === 'card' || this.operationType === 'accounts') {
        successCb = () => this.confirmTransfer(true);
      } else {
        successCb = () => this.confirmPayment(this.operationType, true);
      }
      const initialState: any = {
        operationId: id,
        closeModal,
        successCb,
        is2FA: is2FAOperation,
      };
      this.modalRef = this.modalService.show(TokenKeyModalComponent, {
        class: 'modal-dialog-centered',
        initialState,
        id: 1,
      });
    } else {
      this.modalRef = this.modalService.show(SmsModalComponent, {
        class: 'modal_upper',
        initialState,
        id: 1,
      });
      this.modalRef.content.statusDirectlySign.subscribe((status: boolean) => {
        if (status) {
          if (
            this.operationType === 'card' ||
            this.operationType === 'accounts'
          ) {
            this.confirmTransfer(true);
          } else {
            this.confirmPayment(this.operationType, true);
          }
        }
      });
    }
  }

  onEdit() {
    if (this.operationType === 'card' || this.operationType === 'accounts') {
      this.router.navigate([`operations/transfer/${this.operationType}`], {
        queryParams: { template: 'edit' },
      });
      this.documentService.dataTemplate$.next(this.template);
    } else if (this.operationType === 'convertation') {
      clearInterval(this.convertationRefreshInterval);
      this.operationsService.convertationRefreshTime$.next(
        this.convertationRefreshTime
      );
      this.router.navigate(['currency-control/convertation'], {
        queryParams: { template: 'edit' },
      });
      this.documentService.dataTemplate$.next(this.template);
    } else if (this.operationType === 'currency-transfer') {
      this.router.navigate(['currency-control/currency-transfer'], {
        queryParams: { template: 'edit' },
      });
      this.documentService.dataTemplate$.next(this.template);
    } else if (this.operationType === 'contract-creation') {
      this.router.navigate(['currency-control/contract-creation'], {
        queryParams: { template: 'edit' },
      });
      this.documentService.dataTemplate$.next(this.template);
    } else {
      this.router.navigate([`operations/payment/${this.operationType}`], {
        queryParams: { template: 'edit' },
      });
      this.documentService.dataTemplate$.next(this.template);
    }
    this.savedDocId = null;
  }

  openP2pSmsModal() {
    let data: IP2PRequest = {
      amount: this.template.amount,
      cardTo: this.template.cardTo,
      cardIdFrom: this.template.cardIdFrom,
      cardToName: this.template.cardToName,
    };
    // TODO настроить тело запроса так же и для сохраненных карт

    const initialState: any = {
      isDirectlySign: true,
      operationType: this.operationType,
      p2pData: data,
    };
    this.modalRef = this.modalService.show(SmsModalComponent, {
      class: 'modal-dialog-centered',
      initialState,
      id: 1,
    });

    this.modalRef.content.statusDirectlySign.subscribe((status: boolean) => {
      if (status) {
        this.confirmTransfer(false);
      }
    });
  }

  getConvertationFXrequestBody() {
    let requestBody = this.template.prefill;
    requestBody.accountDebit = this.template.accountDebit;
    requestBody.accountCredit = this.template.accountCredit;
    requestBody.amountDebit = this.template.amountDebit;
    requestBody.amountCredit = this.template.amountCredit;
    requestBody.currencyDebit = this.template.accountDebitCurrency;
    requestBody.currencyCredit = this.template.accountCreditCurrency;
    requestBody.docDate = this.template.docDate;
    requestBody.docNum = this.template.docNum;
    requestBody.purpose = this.template.purpose.description;
    requestBody.purposeCode = this.template.purpose.code;
    requestBody.amount = this.template.prefill.amountKzt;
    return requestBody;
  }

  deleteHandShake() {
    this.operationsService
      .deleteHandShake(this.template.prefill.handshakeId)
      .subscribe({
        next: () => {},
        error: () => {},
      });
  }

  getTime(time: number) {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    return minutes + ':' + (seconds < 10 ? '0' + seconds : seconds) + ' c';
  }

  getCurrrencyTransferType(): string {
    if (
      this.template?.isFw_Sortcode &&
      this.template?.currencySender === 'USD'
    ) {
      return 'Fedwire Routing Number';
    } else if (
      this.template?.isFw_Sortcode &&
      this.template?.currencySender === 'GBP'
    ) {
      return 'Sort Code';
    } else {
      return 'SWIFT';
    }
  }

  requestIndividualRate() {
    this.individualRateLoading = true;

    this.calculateIndividualRateTime();
    this.addSubscriber(
      this.operationsService.checkOperday().subscribe({
        next: (value: any) => {
          if (value.dayIsOpen === true || value.fx247 === true) {
            setTimeout(() => {
              this.validateFX();
            }, 5000);
          }
        },
        error: (err: any) => {
          errorMessage(err, this.toastr);
          this.individualRateLoading = false;
        },
      })
    );
  }

  calculateIndividualRateTime() {
    this.individualRateInterval = setInterval(() => {
      if (this.individualRateTime > 0 && this.individualRateLoading === true) {
        this.individualRateTime--;
        this.changeDetector.detectChanges();
      } else {
        clearInterval(this.individualRateInterval);
        this.individualRateTime = 179;
      }
    }, 1000);
  }

  validateFX() {
    let bodyValidate = this.returnRequestBody('validate');
    this.operationsService.validateFX(bodyValidate).subscribe({
      next: validateVal => {
        this.createHandShake();
      },
      error: validateErr => {
        errorMessage(validateErr, this.toastr);
        this.individualRateLoading = false;
      },
    });
  }

  createHandShake() {
    let bodyHandshake = this.returnRequestBody('handshake');
    this.operationsService.createHandShake(bodyHandshake).subscribe({
      next: value => {
        this.template.handShakeValue = value;
        this.pollHandShanke(0, 5);
      },
      error: error => {
        errorMessage(error, this.toastr);
        this.individualRateLoading = false;
      },
    });
  }

  pollHandShanke(intervalCount: number, handShakeIntervalTime: number) {
    if (intervalCount !== 36) {
      this.handShakeInterval = setInterval(() => {
        if (handShakeIntervalTime > 0) {
          handShakeIntervalTime--;
        } else {
          handShakeIntervalTime = 5;
          intervalCount = intervalCount + 1;
          clearInterval(this.handShakeInterval);
          this.operationsService
            .pollHandShake(this.template.handShakeValue.id)
            .subscribe({
              next: value => {
                this.template.handShakeValue = value;
                if (
                  this.template.handShakeValue &&
                  this.template.handShakeValue.status === 'OFFERED' &&
                  this.template.handShakeValue.offeredRate !== null
                ) {
                  this.individualRateLoading = false;
                  this.template.prefill.rate =
                    this.template.handShakeValue.offeredRate;
                  this.template.prefill.handshakeId =
                    this.template.handShakeValue.id;
                  this.template.prefill.operation =
                    this.template.handShakeValue.operation;
                  this.refreshCount = this.refreshCount + 1;
                  this.refreshIndividualRate();
                  this.setCreditAmount();
                  this.changeDetector.detectChanges();
                } else {
                  this.pollHandShanke(intervalCount, handShakeIntervalTime);
                }
              },
              error: error => {
                errorMessage(error, this.toastr);
                this.individualRateLoading = false;
                this.changeDetector.detectChanges();
              },
            });
        }
      }, 1000);
    } else {
      this.deleteHandshake();
    }
  }

  deleteHandshake() {
    if (this.template.handShakeValue && this.template.handShakeValue.id) {
      this.individualRateLoading = false;
      this.operationsService
        .deleteHandShake(this.template.handShakeValue.id)
        .subscribe({
          next: () => {
            errorMessage('Прошло 3 минуты', this.toastr);
            this.template.handShakeValue = null;
          },
          error: () => {
            errorMessage('Handshake не удален', this.toastr);
          },
        });
    }
  }

  private refreshIndividualRate() {
    this.convertationRefreshInterval = setInterval(() => {
      if (
        this.convertationRefreshTime > 0 &&
        this.individualRateLoading === false
      ) {
        this.convertationRefreshTime--;
        this.changeDetector.detectChanges();
      } else {
        clearInterval(this.convertationRefreshInterval);
        this.convertationRefreshTime = 179;
        this.requestIndividualRate();
        this.changeDetector.detectChanges();
      }
    }, 1000);
  }

  setCreditAmount() {
    let sellAmount: number = Number(
      Number(this.template.amountDebit).toFixed(
        this.getNumberOfPrecisionForSum(
          this.template.mainCurrency,
          this.template.counterCurrency
        )
      )
    );
    let buyAmount: number = 0;

    if (this.template.accountDebitCurrency === this.template.mainCurrency) {
      buyAmount = sellAmount * this.template.prefill.rate;
    } else {
      buyAmount =
        sellAmount /
        this.template.prefill.rate.toFixed(
          this.getNumberOfPrecisionForSum(
            this.template.mainCurrency,
            this.template.counterCurrency
          )
        );
    }

    this.template.amountCredit = buyAmount.toFixed(
      this.getNumberOfPrecisionForSum(
        this.template.mainCurrency,
        this.template.counterCurrency
      )
    );

    this.checkLimit();
  }

  getNumberOfPrecisionForSum(
    mainCurrency: String,
    counterCurrency: String
  ): number {
    if (
      mainCurrency == 'XAU' ||
      mainCurrency == 'XAG' ||
      counterCurrency == 'XAU' ||
      counterCurrency == 'XAG'
    ) {
      return 3;
    } else {
      return 2;
    }
  }

  private checkLimit() {
    let body: any = this.returnRequestBody('validate');
    this.addSubscriber(
      this.operationsService.getCurrencyContractParams(body).subscribe({
        next: (val: any) => {
          if (val) {
            this.template.prefill.amountKzt = val.amountKZT;
            this.template.prefill.amountUsd = val.amountUSD;
            this.template.prefill.sellBuyCur = val.contractRequired;
          }
        },
        error: (err: any) => {
          errorMessage(err, this.toastr);
        },
      })
    );
  }

  private returnRequestBody(type: string) {
    let requestBody: any = {};
    if (type === 'validate') {
      requestBody = {
        docNum: this.template.docNum,
        docDate: this.template.docDate,
        accountDebit: this.template.accountDebit,
        accountCredit: this.template.accountCredit,
        amountDebit: this.template.amountDebit,
        amountCredit: this.template.amountCredit,
        currencyCredit: this.template.accountCreditCurrency,
        currencyDebit: this.template.accountDebitCurrency,
        amount: this.template.amountDebit,
        binSender: this.template.prefill.binSender,
        chief: this.template.prefill.chief,
        chiefAccountant: 'Не предусмотрен',
        nameSender: this.template.prefill.nameSender,
        clientCurrency: this.template.prefill?.clientCurrency,
        handshakeId: this.template.prefill?.handshakeId,
        operation: this.template.prefill?.operation,
        rate: this.template.prefill?.rate,
        residencySender: this.template.prefill?.residencySender,
        secoSender: this.template.prefill?.secoSender,
        purposeCode: this.template.purpose.code,
        purpose: this.template.purpose.description,
        amountKzt: this.template.prefill?.amountKzt,
        amountUsd: this.template.prefill?.amountUsd,
      };
    } else if (type === 'handshake') {
      requestBody = {
        amount: this.template.prefill?.amountUsd,
        amountUSD: this.template.prefill?.amountUsd,
        clientCurrency: this.template.prefill?.clientCurrency,
        creditAmount: this.template.amountCredit,
        creditCurrency: this.template.accountCreditCurrency,
        debitAmount: this.template.amountDebit,
        debitCurrency: this.template.accountDebitCurrency,
        pairName: this.template.pairName,
      };
    }
    return requestBody;
  }

  getFormattedPhone(phoneNumber: string) {
    if (phoneNumber) {
      const operator = phoneNumber.slice(0, 3);
      const phBit1 = phoneNumber.slice(3, 6);
      const phBit2 = phoneNumber.slice(6, 8);
      const phBit3 = phoneNumber.slice(8, 10);
      return `+7(${operator}) ${phBit1} ${phBit2} ${phBit3}`;
    } else {
      return '';
    }
  }
}
