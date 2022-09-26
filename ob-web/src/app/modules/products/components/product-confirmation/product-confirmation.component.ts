import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { errorMessage, getIn } from '@app/core/helpers';
import { AccountsService } from '@app/core/services/accounts.service';
import { LoginService } from '@app/core/services/login.service';
import { OperationsService } from '@app/core/services/operations.service';
import { SocketService } from '@app/core/services/socket.service';
import { TokenKeyModalComponent } from '@app/modules/ecp/token-key-modal/token-key-modal.component';
import { SmsModalComponent } from '@app/shared';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ob-product-confirmation',
  templateUrl: './product-confirmation.component.html',
  styleUrls: ['./product-confirmation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductConfirmationComponent implements OnInit, OnDestroy {
  public data: any;
  public productType: string;
  modalRef?: BsModalRef;
  public loading: boolean = false;
  public rightsToSign: boolean = false;
  public employeeName = '';
  public isSendLoading: boolean = false;
  constructor(
    private accountsService: AccountsService,
    private toastr: ToastrService,
    private changeDetector: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private operationsService: OperationsService,
    private socketService: SocketService,
    private loginService: LoginService
  ) {
    const temp = JSON.parse(localStorage.getItem('product-template'));
    this.data = temp;
    this.employeeName = temp?.other?.employeeName;
  }

  isCardTypeOpen: boolean = true;
  isReceiverOpen: boolean = true;
  isGettingTypeOpen: boolean = true;

  ngOnInit(): void {
    this.hasRightsToSign();
    this.productType = this.route.snapshot.params['productType'];
  }

  ngOnDestroy(): void {
    localStorage.removeItem('product-template');
  }

  //отправка на подпись
  sendToSign() {
    if (this.productType === 'business-card') {
      this.isSendLoading = true;
      this.changeDetector.detectChanges();
      let body = JSON.parse(JSON.stringify(this.data));
      delete body['other'];
      this.accountsService.sendCreateBusinessCard(body).subscribe({
        next: data => {
          if (data.status === 200) {
            this.confirmCreateRequest(false);
          }
          this.isSendLoading = false;
          this.changeDetector.detectChanges();
        },
        error: error => {
          this.isSendLoading = false;
          this.changeDetector.detectChanges();
          errorMessage(error, this.toastr);
        },
      });
    }
  }

  //прямое подписание
  toDirectlySign() {
    if (this.productType === 'business-card') {
      this.isSendLoading = true;
      this.changeDetector.detectChanges();
      let body = JSON.parse(JSON.stringify(this.data));
      delete body['other'];
      this.accountsService.sendCreateBusinessCard(body).subscribe({
        next: data => {
          if (data.status === 200) {
            this.confirmSign(data.body.sentDocId);
          }
          this.isSendLoading = false;
          this.changeDetector.detectChanges();
        },
        error: error => {
          this.isSendLoading = false;
          this.changeDetector.detectChanges();
          errorMessage(error, this.toastr);
        },
      });
    }
  }

  hasRightsToSign(): void {
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

  confirmSign(id: number): void {
    const initialState: any = { operationId: id, isDirectlySign: true };

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
      const initialState: any = {
        operationId: id,
        closeModal,
        successCb: () => {
          console.info('first');
          this.confirmCreateRequest(true);
        },
        is2FA: false,
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
          this.confirmCreateRequest(true);
        }
      });
    }
  }

  confirmCreateRequest(signed: boolean) {
    if (this.productType === 'business-card') {
      this.router.navigate([
        'products/create/business-card/confirm',
        {
          productType: 'business-card',
          cardType:
            this.data?.aimOfOpen === 'hospitalityExpensesIE' ? 'IP' : 'UL',
          phone: this.getFormattedPhone(this.data?.phoneNum),
          isSigned: signed,
        },
      ]);
    }
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

  onEdit() {
    this.router.navigate([`products/create/${this.productType}`], {
      queryParams: { template: 'edit' },
    });
    this.accountsService.productTemplate$.next(this.data);
  }
}
