import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'ob-dropdown-list',
  templateUrl: './dropdown-list.component.html',
  styleUrls: ['./dropdown-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownListComponent {
  @Input() filteredData: any = [];
  @Input() searchTitle: string = '';
  @Input() flag: boolean = false;
  @Output() selectedId = new EventEmitter<any>();

  constructor() {}

  selectedItem(index: number) {
    this.selectedId.emit(index);
    this.filteredData = [];
  }
}
