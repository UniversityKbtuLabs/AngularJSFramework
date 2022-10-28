import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ListTypes } from '@data/models/common-types';
import { AccountsService } from '@core/services/accounts.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'ob-operations-filter',
  templateUrl: './operations-filter.component.html',
  styleUrls: ['./operations-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsFilterComponent {
  public filterDateList: ListTypes[] = [];
  public operationTypes: ListTypes[] = [];
  public operationList: ListTypes[] = [];
  public contragentList: ListTypes[] = [];

  public selectedDate: string = this.filterDateList[0].code;
  public selectedOperationType: string = this.operationTypes[0].code;
  public selectedOperation: string = this.operationList[0].code;
  public selectedContragent: string = this.contragentList[0].code;
  public contragentValue: string = '';
  public fromDate: string = this.formatDate(new Date());
  public toDate: string = this.formatDate(new Date());
  public today: string = '';
  public week: string = '';
  public month: string = '';
  public year: string = '';
  public allOp: string = '';
  public inbox: string = '';
  public outgoing: string = '';
  public payments: string = '';
  public transfer: string = '';
  public idn: string = '';
  public name: string = '';
  public docNum: string = '';

  constructor(
    public accountsService: AccountsService,
    private translate: TranslateService
  ) {
    this.changeSelectedContragent = this.changeSelectedContragent.bind(this);
    this.getTranslations();
    this.filterDateList = [
      { code: 'today', label: this.today },
      { code: 'week', label: this.week },
      { code: 'month', label: this.month },
      { code: 'year', label: this.year },
    ];
    this.operationTypes = [
      { code: 'all', label: this.allOp },
      { code: 'incomin', label: this.inbox },
      { code: 'outgoing', label: this.outgoing },
    ];
    this.operationList = [
      { code: 'all', label: this.allOp },
      { code: 'payments', label: this.payments },
      { code: 'transfers', label: this.transfer },
    ];
    this.contragentList = [
      { code: 'counterAgentIDN', label: this.idn },
      { code: 'counterAgentName', label: this.name },
      { code: 'documentNumber', label: '№' + this.docNum },
    ];
  }

  formatDate(date?: any): string {
    const formatDate = new Date(date).toISOString().split('T');
    const formatTime = formatDate?.[1].split('.')[0];

    return `${formatDate[0]} ${formatTime}`;
  }

  setFromDate(date: Date) {
    this.fromDate = this.formatDate(date);
  }

  setToDate(date: Date) {
    this.toDate = this.formatDate(date);
  }

  changeSelectedDate(value: string) {
    this.selectedDate = value;
  }

  changeOperationType(value: string) {
    this.selectedOperationType = value;
  }

  changeSelectedOperation(value: string) {
    this.selectedOperation = value;
  }

  changeSelectedContragent(value: string) {
    this.selectedContragent = value;
  }

  getTranslations() {
    this.translate
      .get([
        'default.today',
        'general.time.month',
        'general.time.week',
        'general.time.year',
        'default.all',
        'general.operations.inbox',
        'general.operations.outgoing',
        'general.time.payments',
        'general.time.transfers',
        'default.idn-bin',
        'defaut.name',
        'default.documenta',
      ])
      .subscribe(translations => {
        this.today = translations['default.today'];
        this.month = translations['general.time.month'];
        this.week = translations['general.time.week'];
        this.year = translations['general.time.year'];
        this.allOp = translations['default.all'];
        this.inbox = translations['general.operations.inbox'];
        this.outgoing = translations['general.operations.outgoing'];
        this.payments = translations['general.time.payments'];
        this.transfer = translations['general.time.transfers'];
        this.idn = translations['default.idn-bin'];
        this.name = translations['default.name'];
        this.docNum = translations['default.documenta'];
      });
  }
}
