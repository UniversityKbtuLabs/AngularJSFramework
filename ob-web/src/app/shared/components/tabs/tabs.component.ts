import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CLASS_NAME } from 'ngx-bootstrap/modal/modal-options.class';

@Component({
  selector: 'ob-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent implements OnInit, OnChanges {
  @Input() tabs: any;
  @Input() className: any;
  @Input() selectedTab: any;
  @Output() obSelected = new EventEmitter();

  public selected: string;

  constructor() {}

  ngOnInit(): void {
    if (history.state?.tab) {
      this.selected = history.state?.tab;
      this.obSelected.emit(this.selected);
    } else if (this.selectedTab) {
      this.selected = this.selectedTab;
    } else {
      this.selected = this.tabs[0].code;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedTab) {
      this.selected = this.selectedTab;
    }
  }

  onClick(value: string): void {
    this.selected = value;
    this.obSelected.emit(value);
  }
}
