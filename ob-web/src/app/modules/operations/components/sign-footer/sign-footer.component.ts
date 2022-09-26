import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CONFIRM } from '@app/core/constants/pathnames';
import { errorMessage, getIn } from '@app/core/helpers';
import { DocumentService } from '@app/core/services/document.service';
import { LoginService } from '@app/core/services/login.service';
import { OperationsService } from '@app/core/services/operations.service';
import { IPaymentOperation } from '@app/data/models/common-types';
import { SmsModalComponent } from '@app/shared';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ob-sign-footer',
  templateUrl: './sign-footer.component.html',
  styleUrls: ['./sign-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignFooterComponent {
  public phoneNumber: string;
  public modalRef?: BsModalRef;
  @Input() isSaveEnabled: boolean = false;
  @Input() operationType: string = '';
  @Input() loading: boolean = false;
  @Output() save = new EventEmitter<boolean>();
  @Input() hasRightToSign: boolean = false;
  @Output() sendToSign = new EventEmitter<boolean>();
  @Output() signLater = new EventEmitter<boolean>();
  @Output() directlySign = new EventEmitter<boolean>();

  constructor(
    public operationsService: OperationsService,
    public route: ActivatedRoute
  ) {}

  toSendToSign() {
    this.sendToSign.emit(true);
  }

  // toSignLater() {
  //   this.signLater.emit(true);
  // }

  toDirectlySign() {
    console.info('23');
    this.directlySign.emit(true);
  }

  toSave() {
    this.save.emit(true);
  }
}
