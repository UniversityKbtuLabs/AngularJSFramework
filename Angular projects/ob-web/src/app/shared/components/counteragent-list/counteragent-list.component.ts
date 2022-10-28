import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';

@Component({
  selector: 'ob-counteragent-list',
  templateUrl: './counteragent-list.component.html',
  styleUrls: ['./counteragent-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounteragentListComponent {
  @Input() counteragent: any = [];
  @Input() searchTitle: any = [];
  @Input() flag: boolean = false;
  @Output() selectedAccount = new EventEmitter<string>();
  constructor(private changeDetector: ChangeDetectorRef) {}

  selectedItem(index: string) {
    this.selectedAccount.emit(index);
    this.counteragent = [];
  }
}
