import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { AccountHistoryService } from '@app/core/services/account-history.service';
import { HelperService } from '@app/core/services/helper.service';
import { LoginService } from '@app/core/services/login.service';
import { OperationsService } from '@app/core/services/operations.service';
import { Router } from '@angular/router';

import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { SmsModalComponent } from '@app/shared/components/sms-modal/sms-modal.component';
import {
  errorMessage,
  getError,
  getIn,
  getNounByNumbers,
  PRODUCT_TYPES,
  successMessage,
} from '@app/core/helpers';
import { Subscription } from 'rxjs';
import { SocketService } from '@app/core/services/socket.service';
import { TokenKeyModalComponent } from '@app/modules/ecp/token-key-modal/token-key-modal.component';
import { opeartions2FA } from '@app/core/constants';
// import { ConfirmModalComponent } from "@app/shared";

@Component({
  selector: 'ob-home-operations',
  templateUrl: './home-operations.component.html',
  styleUrls: ['./home-operations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeOperationsComponent implements OnInit, OnDestroy {
  modalRef?: BsModalRef;
  public selectedDocuments: any;
  public phoneNumber: string;
  public code: string = '';
  public codeCompleted: boolean = false;
  public amountList: any = {};
  public loading: boolean = false;
  public subscription: Subscription;
  public wsConnectionSubcr: Subscription;
  public productsList: any = [];
  public docsList: any = [];
  public emptySelectedDocuments: boolean = false;

  constructor(
    public dischargeHistoryService: AccountHistoryService,
    private changeDetector: ChangeDetectorRef,
    private modalService: BsModalService,
    public loginService: LoginService,
    public operationsService: OperationsService,
    public toastr: ToastrService,
    public helperService: HelperService,
    private router: Router,
    private socketService: SocketService
  ) {
    // this.deleteDocuments = this.deleteDocuments.bind(this); // Удалено удаление операции со списка в таблице все документы на подпись
  }

  ngOnInit() {
    this.dischargeHistoryService.currentSelectedDocuments.subscribe({
      next: (data: any) => {
        const productsList: any = [];
        const docsList: any = [];
        this.selectedDocuments = data;
        const amountList: any = {};
        this.emptySelectedDocuments = false;

        data?.map((document: any) => {
          if (document.amount && document.amount !== 0) {
            if (!document.currency || document.currency === 'null') {
              document.currency = 'KZT';
            }

            if (!amountList[document.currency]) {
              amountList[document.currency] = [document.amount];
            } else {
              amountList[document.currency] = [
                +amountList[document.currency] + +document.amount,
              ];
            }
          }

          if (PRODUCT_TYPES.includes(document.type)) {
            //документ является заявкой
            productsList.push(document);
          } else {
            //документ - операция
            docsList.push(document);
          }
        });

        this.docsList = [...docsList];
        this.productsList = [...productsList];
        this.amountList = amountList;
        this.changeDetector.detectChanges();
      },
    });

    // this.dischargeHistoryService.docsAmount$.subscribe({
    //   next: value => {
    //     console.info(value)
    //     this.amountList = JSON.parse(value)
    //     this.changeDetector.detectChanges()
    //   }
    // })

    this.loginService.userInfoObject$.subscribe({
      next: v => {
        this.phoneNumber = getIn(v, 'user', 'phone');
        this.changeDetector.detectChanges();
      },
    });
  }

  getTotalSum() {
    return Object.keys(this.amountList);
  }

  //   deleteDocuments() {
  //     const documentIds: any = [];
  //     let notAllowedStatus = false;
  //     this.selectedDocuments?.map((document: any) => {
  //       documentIds.push(document.id);
  //     });
  //     notAllowedStatus = this.selectedDocuments.includes(
  //       (document: any) =>
  //         document.status !== "NEWDOC" && document.status !== "REJECTION"
  //     );
  //     if (notAllowedStatus) {
  //       let initialState = {
  //         text: "Невозможно удалить: документ в обработке и исполненные",
  //       };
  //       this.modalRef = this.modalService.show(ConfirmModalComponent, {
  //         initialState,
  //       });
  //     } else {
  //       let initialState = {
  //         text: `Вы действительно хотите удалить документ`,
  //         btnConfirm: "Удалить",
  //         btnCancel: "Отменить"
  //       };
  //       this.modalRef = this.modalService.show(ConfirmModalComponent, {
  //         initialState,
  //       });
  //       this.modalRef.content.onClose.subscribe((result: boolean) => {
  //         if (result) {
  //           this.deletesSelectedDocuments(documentIds);
  //         }
  //       });
  //     }

  //     this.dischargeHistoryService.page = 0;
  //   }

  //   deletesSelectedDocuments(documentIds: []) {
  //     this.dischargeHistoryService
  //       .deleteDocuments(documentIds.join(","))
  //       .subscribe(
  //         (data) => {
  //           this.dischargeHistoryService.changeDocumentsStatus(true);
  //           this.selectedDocuments = [];
  //           this.amountList = {};
  //           successMessage("", this.toastr);
  //           this.changeDetector.detectChanges();
  //         },
  //         (err) => {
  //           errorMessage(err, this.toastr);
  //         },
  //         () => console.info("call table reaload action")
  //       );
  //   }

  signingDocuments() {
    if (!this.loading) {
      const documentIds: any = [];

      this.selectedDocuments?.map((document: any) => {
        documentIds.push(document.id);
      });
      this.loading = true;
      this.subscription = this.dischargeHistoryService
        .signDocuments('1111', documentIds.join(','), this.phoneNumber)
        .subscribe(
          () => {
            this.dischargeHistoryService.docsLength$.next(
              this.selectedDocuments.length
            );
            this.dischargeHistoryService.docsAmount$.next(
              JSON.stringify(this.amountList)
            );

            this.modalRef?.hide();
            this.router.navigate(['home/operations/success']);
            this.dischargeHistoryService.changeDocumentStatus(true);
            this.changeDetector.detectChanges();
          },
          err => {
            errorMessage(err, this.toastr);
          },
          () => (this.loading = false)
        );
    }
  }

  openModal() {
    const hasSelectedItems = this.selectedDocuments.length > 0; // TODO REFACTOR IT/ ADD 2FA CHECK
    if (hasSelectedItems) {
      const documentIds: any = [];
      this.selectedDocuments?.map((document: any) =>
        documentIds.push(document.id)
      );
      const closeModal = () => {
        this.modalService.hide(1);
        this.socketService.close();
      };

      const is2FA = this.selectedDocuments.find((doc: any) =>
        opeartions2FA.includes(doc.type)
      );
      const initialState: any = {
        operationId: documentIds.join(','),
        closeModal,
        is2FA,
      };

      if (
        getIn(this.loginService.userInfoObject$.value, 'user', 'loggedInBy') ===
        'signature'
      ) {
        this.modalRef = this.modalService.show(TokenKeyModalComponent, {
          class: 'modal-dialog-centered',
          initialState,
          id: 1,
        });
        this.dischargeHistoryService.docsLength$.next(this.docsList.length);
        this.dischargeHistoryService.productsLength$.next(
          this.productsList.length
        );
        this.dischargeHistoryService.docsAmount$.next(
          JSON.stringify(this.amountList)
        );
        this.socketService.connect(() => {
          console.info('ws callback');
        });
        // }
      } else {
        // const documentIds: any = [];
        // this.selectedDocuments?.map((document: any) => documentIds.push(document.id));
        const closeModal = () => this.modalService.hide();
        this.dischargeHistoryService.docsLength$.next(this.docsList.length);
        this.dischargeHistoryService.productsLength$.next(
          this.productsList.length
        );
        this.dischargeHistoryService.docsAmount$.next(
          JSON.stringify(this.amountList)
        );
        const initialState: any = {
          operationId: documentIds.join(','),
          closeModal,
          router: this.router,
        };
        this.modalRef = this.modalService.show(SmsModalComponent, {
          class: 'modal-dialog-centered',
          initialState,
          id: 1,
        });
      }
    } else {
      this.emptySelectedDocuments = true;
    }
  }

  ngOnDestroy(): void {
    this.modalService.hide(1);
    this.dischargeHistoryService.removeSelected();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  // для получения окончаний 1 заяв-ка 2 заяв-ки 9 заяв-ок
  getNouns(num: number, type: string) {
    if (type === 'products') {
      return getNounByNumbers(num, [
        'default.request1',
        'default.request2',
        'default.request3',
      ]);
    } else {
      return getNounByNumbers(num, [
        'default.operation1',
        'default.operation2',
        'default.operation3',
      ]);
    }
  }
}
