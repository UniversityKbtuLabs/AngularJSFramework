import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { returnTableColumns } from '@app/core/constants';
import { HelperService } from '@app/core/services/helper.service';
import {
  ITableColumns,
  ITableRows,
} from '@app/data/models/account-history-types';
import { Observable } from 'rxjs';

@Component({
  selector: 'ob-contact-list-table',
  templateUrl: './contact-list-table.component.html',
  styleUrls: [
    './contact-list-table.component.scss',
    '../../../../shared/components/table/table.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactListTableComponent implements OnInit {
  @Input() rowData: any = [];
  @Input() getDocumentsList: any;
  @Input() type: string = '';
  @Input() accountType: string = '';
  @Input() isResetFilter$: Observable<boolean>;
  tableColumns: ITableColumns[] | [] = [];
  public colSpan: number = 3;
  constructor(public helperService: HelperService) {}

  ngOnInit(): void {
    this.tableColumns = returnTableColumns(this.type);
  }
}
