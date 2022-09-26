import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'ob-table-custom-icon',
  template: `
    <img
      src="assets/icons/ic_download.svg"
      (click)="onClick($event)"
      style="outline: none; cursor: pointer" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableCustomIconComponent implements ICellRendererAngularComp {
  params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params?: any): boolean {
    return true;
  }

  onClick($event: any) {
    if (this.params.onClick instanceof Function) {
      // put anything into params u want pass into parents component
      const params = {
        event: $event,
        rowData: this.params.node.data,
        // ...something
      };
      this.params.onClick(params);
    }
  }
}
