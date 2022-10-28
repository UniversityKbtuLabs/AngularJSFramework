import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  TemplateRef,
  Input,
} from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'ob-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  @Input() public modalRef: BsModalRef | any;

  constructor(private modalService: BsModalService) {}
}
