import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
} from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';

@Component({
  selector: 'ob-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractComponent implements OnInit {
  public selectedValue: string = 'name030120.178527';
  public onClose: Subject<string> = new Subject();
  public users = [
    { name: 'name030120.178527', docNum: '№1644175' },
    { name: 'name030120.178521', docNum: '№1644176' },
    { name: 'name030120.178522', docNum: '№1644177' },
    { name: 'name030120.178523', docNum: '№1644178' },
    { name: 'name030120.178525', docNum: '№1644179' },
  ];
  constructor(public bsModalRef: BsModalRef) {}

  public ngOnInit(): void {
    this.onClose = new Subject();
  }
  onChange() {
    this.onClose.next(this.selectedValue);
    this.bsModalRef.hide();
  }
}
