import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'ob-operations-table',
  templateUrl: './operations-table.component.html',
  styleUrls: ['./operations-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsTableComponent {
  @Input() data: any;

  constructor() {}
}
