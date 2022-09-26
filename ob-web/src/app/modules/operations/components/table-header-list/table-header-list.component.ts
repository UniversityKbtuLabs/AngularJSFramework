import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'ob-table-header-list',
  templateUrl: './table-header-list.component.html',
  styleUrls: ['./table-header-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableHeaderListComponent {
  @Input() public headings: any = [];
  @Output() selectedItem = new EventEmitter<number>();
  public activeEl: number = 0;
  constructor() {
    this.activeEl = 0;
  }

  onClick(index: number) {
    this.activeEl = index;
    this.selectedItem.emit(index);
  }
}
