import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { GUARANTEES_EXISTING, GUARANTEES_NEW } from '@core/constants/pathnames';
import { AccountHistoryService } from '@core/services/account-history.service';
import {
  IDocumentList,
  IOperationType,
} from '@data/models/account-history-types';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { month_ago_Obj } from '@core/helpers';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

@Component({
  selector: 'ob-operations',
  templateUrl: './guarantees-main.component.html',
  styleUrls: [
    'guarantees-main.component.scss',
    '../../../account-history/account-history.component.scss',
    '../../../../shared/components/table/table.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuaranteesMainComponent implements OnInit, OnDestroy {
  private destroy$: Subject<any> = new Subject();
  operations = [
    {
      title: this.translate.instant('guarantee.newGuarantee'),
      router: GUARANTEES_NEW,
      img: 'transfer_1.svg',
    },
  ];
  headingList: IOperationType[] = [
    { name: this.translate.instant('default.all'), code: '' },
    {
      name: this.translate.instant('status.in-progress'),
      code: 'inProcessing',
    },
    { name: this.translate.instant('status.failure'), code: 'rejected' },
    { name: this.translate.instant('guarantee.drafts'), code: 'drafts' },
  ];
  guaranteesList: RecursivePartial<IDocumentList>;
  searchControl = new FormControl();
  searchString: string = '';
  periodError: boolean = false;
  maxDate: Date = new Date();
  minDate: any = undefined;
  startDate: Date = month_ago_Obj.toDate();
  endDate: Date = new Date();
  statusFilter: string = '';

  constructor(
    private accountHistorySvc: AccountHistoryService,
    private changeDetector: ChangeDetectorRef,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(600))
      .subscribe(value => {
        this.searchString = value;
        this.getDocumentList();
      });

    this.getDocumentList();
  }

  getDocumentList() {
    let body: any = {
      baseFields: {
        orderASC: false,
        orderBy: 'DATE',
        dateRangeStart: this.getFormattedDate(this.startDate),
        dateRangeEnd: this.getFormattedDate(this.endDate),
      },
      documentTypeList: ['GUARANTEE'],
      documentType: 'GUARANTEE',
    };

    if (this.statusFilter) {
      body.statuses = [this.statusFilter];
    }

    if (this.searchString) {
      body.nameRecipient = this.searchString;
    }

    this.accountHistorySvc
      .getDocumentsList(body, 0, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe((documentList: IDocumentList) => {
        this.guaranteesList = documentList;

        //FIXME: мок для тестирования
        if (
          (!documentList || !documentList.content.length) &&
          (this.statusFilter == '' || this.statusFilter == 'inProcessing')
        ) {
          this.guaranteesList = {
            content: [
              {
                id: 1656526314607,
                docNum: '0449a2bc-8ed6-11ec-b909-0242ac120002',
                sentDate: '04 октября 2021',
                statusDetails: this.translate.instant('status.in-progress'),
              },
              {
                id: 1656526314607,
                docNum: '0449a2bc-8ed6-11ec-b909-0242ac120002',
                sentDate: '04 октября 2021',
                statusDetails: this.translate.instant('status.in-progress'),
              },
            ],
          };
        }

        this.changeDetector.detectChanges();
      });
  }

  setStatusFilter(value: any) {
    this.statusFilter = value;
    this.getDocumentList();
  }

  goToGuarantee(docNum: string) {
    this.router.navigate([GUARANTEES_EXISTING + '/' + docNum]);
  }

  getFormattedDate(date?: any): string {
    const formatDate = new Date(date).toISOString().split('T');
    return formatDate[0];
  }

  ngOnDestroy() {
    this.destroy$.next(null);
  }
}
