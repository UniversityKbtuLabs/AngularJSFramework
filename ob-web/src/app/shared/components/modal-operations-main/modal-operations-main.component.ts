import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'ob-modal-operations-main',
  templateUrl: './modal-operations-main.component.html',
  styleUrls: ['./modal-operations-main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalOperationsMainComponent {
  @Input() mainOperations: any;
  @Input() allOperations: any;

  public dragIndex: number;
  public dragType: string;
  public dragEnterIndex: number;
  public dragEnterType: string;

  isDragover: boolean = false;
  isTargetDrag: boolean = false;

  constructor(
    public changeDetector: ChangeDetectorRef,
    public modalOptions: ModalOptions,
    public bsModalRef: BsModalRef,
    private modalService: BsModalService
  ) {}

  cancel() {
    this.modalService.hide(1);
  }

  allowDrop(ev: any) {
    ev.preventDefault();
  }

  drag(ev: any, ind: number, type: string) {
    this.dragIndex = ind;
    this.dragType = type;
    ev.dataTransfer.setData('text', type);
    ev.dataTransfer.setData('ind', ind);
    this.isDragover = true;

    if (ev.cancel) {
      this.isDragover = false;
    }
  }

  drop(ev: any, ind: number, type: string) {
    this.isDragover = false;

    let dragType: string = ev.dataTransfer.getData('text');
    let dragInd: number = ev.dataTransfer.getData('ind');

    if (dragType === 'main') {
      let temp = this.mainOperations[dragInd];
      if (type === 'all') {
        this.mainOperations[dragInd] = this.allOperations[ind];
        this.allOperations[ind] = temp;
        this.changeDetector.detectChanges();
      } else {
        this.mainOperations[dragInd] = this.mainOperations[ind];
        this.mainOperations[ind] = temp;
      }
      this.changeDetector.detectChanges();
    } else {
      let temp = this.allOperations[dragInd];
      if (type === 'all') {
        this.allOperations[dragInd] = this.allOperations[ind];
        this.allOperations[ind] = temp;
      } else {
        this.allOperations[dragInd] = this.mainOperations[ind];
        this.mainOperations[ind] = temp;
      }
      this.changeDetector.detectChanges();
    }
  }

  dragEnter(ind: number, type: string) {
    this.dragEnterIndex = ind;
    this.dragEnterType = type;
    this.isTargetDrag = true;
  }

  dragEnd() {
    this.isDragover = false;
    this.isTargetDrag = false;
  }

  trackByFn() {}

  save() {
    //TODO: Имплементировать сохранение изменений пользователя
  }
}
