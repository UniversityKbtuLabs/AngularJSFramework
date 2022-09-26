import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
} from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';

@Component({
  selector: 'ob-welcome-modal',
  templateUrl: './welcome-modal.component.html',
  styleUrls: ['./welcome-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeModalComponent implements OnInit {
  @Input() title: string = '';
  @Input() info: string = '';
  @Input() endFlag: boolean = false;

  @Input() isContact: boolean = false;
  modalId: any;
  initialState: any;

  public onClose: Subject<boolean> = new Subject();
  constructor(
    public bsModalRef: BsModalRef,
    public modalService: BsModalService,
    public modalOptions: ModalOptions
  ) {
    this.onClose = new Subject();
  }

  ngOnInit(): void {
    if (this.modalOptions?.id === 1) {
      this.modalId = this.modalOptions?.id;
      this.initialState = this.modalOptions?.initialState;
    }
  }

  continue() {
    this.onClose.next(true);
    this.bsModalRef.hide();
  }

  cancel() {
    this.modalService.hide(this.modalId);
  }
}
