import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  Input,
} from '@angular/core';
import { OperationsService } from '@app/core/services/operations.service';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';

@Component({
  selector: 'ob-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModalComponent implements OnDestroy {
  modalId: any;
  onStatus: Subject<boolean> = new Subject();
  @Input() text: string;
  @Input() btnConfirm: string = '';
  @Input() btnCancel: string = '';
  onClose: Subject<boolean> = new Subject();
  isConfirm: boolean = false;

  constructor(
    private operationsService: OperationsService,
    private modalOptions: ModalOptions,
    private modalService: BsModalService
  ) {
    //this.text = this.modalOptions.initialState.text
    this.modalId = this.modalOptions.id;
  }

  confirm() {
    //this.operationsService.isConfirm.next(true)
    this.isConfirm = true;
    this.onStatus.next(true);
    this.operationsService.isConfirm.next(true);
    this.onClose.next(true);
    this.cancel();
  }

  cancel() {
    this.modalService.hide(this.modalId);
    if (!this.isConfirm || this.modalId == 3) {
      //if id==3 means it is staff deleting
      this.operationsService.changeTableModalVisible(true);
    }
    this.onClose.next(false);
  }

  ngOnDestroy(): void {
    if (!this.isConfirm || this.modalId == 3) {
      this.operationsService.changeTableModalVisible(true);
    }
    //this.operationsService.isConfirm.next()
    //this.operationsService.isConfirm.complete()
    this.onStatus.next(false);
  }
}
