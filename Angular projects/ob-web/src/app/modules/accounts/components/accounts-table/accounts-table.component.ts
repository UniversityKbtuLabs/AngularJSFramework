import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { MainService } from '@core/services/main.service';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { AccountsService } from '@core/services/accounts.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ob-accounts-table',
  templateUrl: './accounts-table.component.html',
  styleUrls: ['./accounts-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsTableComponent
  extends SubscriptionAccumulator
  implements OnInit
{
  public columnDefs: any[] = [];
  public rowData: any[] = [];
  public fromDate: string = this.formatDate(new Date());
  public toDate: string = this.formatDate(new Date());
  frameworkComponents: any;
  type: string = '';

  selectedAcc: string;

  constructor(
    public mainService: MainService,
    public accountsService: AccountsService,
    private changeDetector: ChangeDetectorRef,
    private translate: TranslateService
  ) {
    super();
    this.selectedAcc = '';
  }

  ngOnInit(): void {
    this.columnDefs = [
      {
        field: 'data',
        headerName: this.translate.instant('default.date'),
        sortable: true,
        checkboxSelection: true,
        width: this.getColumnWidth(20),
        headerCheckboxSelection: true,
      },
      {
        field: 'recipient',
        headerName: this.translate.instant('default.Контрагент'),
        width: this.getColumnWidth(35),
      },
      {
        field: 'status',
        headerName: this.translate.instant('default.status'),
        width: this.getColumnWidth(20),
      },
      {
        field: 'sum',
        headerName: this.translate.instant('default.amount'),
        sortable: true,
        width: this.getColumnWidth(15),
      },
      {
        field: 'download',
        headerName: '',
        cellRenderer: 'customIcon',
        cellRendererParams: {
          onClick: this.downloadOperationDetails.bind(this),
        },
        width: this.getColumnWidth(5),
      },
    ];
  }

  getColumnWidth(width: number) {
    let item = document.getElementById('table');

    if (item) {
      return (width / 100) * item.offsetWidth;
    }

    return width;
  }

  downloadOperationDetails(event: any) {}

  formatDate(date?: any): string {
    const formatDate = new Date(date).toISOString().split('T');
    const formatTime = formatDate[1].split('.')[0];

    return `${formatDate[0]} ${formatTime}`;
  }

  setFromDate(date: Date) {
    this.fromDate = this.formatDate(date);
  }

  setToDate(date: Date) {
    this.toDate = this.formatDate(date);
  }

  openSlider(type: string) {
    this.mainService.openSlideModal(type);
  }
}
