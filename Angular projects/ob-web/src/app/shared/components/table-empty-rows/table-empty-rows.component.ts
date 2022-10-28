import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ob-table-empty-rows',
  templateUrl: './table-empty-rows.component.html',
  styleUrls: ['./table-empty-rows.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableEmptyRowsComponent {
  constructor() {}
}
