import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'ob-small-table',
  templateUrl: './small-table.component.html',
  styleUrls: ['./small-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmallTableComponent {
  @Input() list: any;

  constructor() {}
}
