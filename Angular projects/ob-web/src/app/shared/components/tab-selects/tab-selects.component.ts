import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  EventEmitter,
  Output,
  ChangeDetectorRef,
} from '@angular/core';

@Component({
  selector: 'ob-tab-selects',
  templateUrl: './tab-selects.component.html',
  styleUrls: ['./tab-selects.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabSelectsComponent implements OnInit {
  @Input() list: any;
  @Input() loading: boolean;
  @Output() obSelectedDate = new EventEmitter();
  @Output() docType = new EventEmitter();
  @Input() selected: string = '';

  constructor() {}

  ngOnInit(): void {
    this.selected = this.list[0]?.code;
    this.obSelectedDate.emit(this.selected);
  }

  onClick(value: string) {
    this.selected = value;
    this.obSelectedDate.emit(value);
    this.docType.emit(value);
  }
}
