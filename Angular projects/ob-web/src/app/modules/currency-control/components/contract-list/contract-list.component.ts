import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  TemplateRef,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { dateFormat, returnRequestBody } from '@app/core/constants';
import {
  checkIsAnotherDay,
  errorMessage,
  getStatusList,
  month_ago_Obj,
  requestsFormatter,
} from '@app/core/helpers';
import { SubscriptionAccumulator } from '@app/core/helpers/SubscriptionAccumulator';
import { AccountHistoryService } from '@app/core/services/account-history.service';
import { AccountsService } from '@app/core/services/accounts.service';
import { ConstantTranslationsService } from '@app/core/services/constant-translations.service';
import { OperationsService } from '@app/core/services/operations.service';
import {
  IDocumentInfo,
  IOperationDate,
  ITableColumns,
  ITableRows,
} from '@app/data/models/account-history-types';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { BsModalService } from 'ngx-bootstrap/modal';
import { PagerComponent } from 'ngx-bootstrap/pagination';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subject } from 'rxjs';
@Component({
  selector: 'ob-contract-list',
  templateUrl: './contract-list.component.html',
  styleUrls: [
    './contract-list.component.scss',
    '../../../account-history/account-history.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractListComponent
  extends SubscriptionAccumulator
  implements OnInit
{
  public startDate: Date;
  public endDate: Date;
  public dateTabs: IOperationDate[];
  public period: IOperationDate;

  /* 4. Переменная фильтра строка поиска */
  public searchString = new FormControl();
  public documentNumber = new FormControl();
  public amountFrom = new FormControl();
  public amountTo = new FormControl();

  public tableColumns: ITableColumns[] = [];
  public rows: any = [];
  public maxSize = 7;
  public totalElements: number;
  public currentPage = 0;
  public isFirst: boolean = false;
  public isLast: boolean = false;

  public periodError: boolean = false;
  public periodErrorMessage = '';
  public serverError: string = '';
  public resetFilterSubject: Subject<boolean> = new Subject<boolean>();
  /* Объект фильтра */
  public filter$ = new BehaviorSubject<any>({});
  public observableFilter$ = this.filter$.asObservable();

  public modalTemplate: TemplateRef<any>;
  public params: string = '';
  public nodata: boolean = false;
  public showAllFilters: boolean = false;

  public loading: boolean = false;
  public isLoadingBalances: boolean = false;
  public isLoadingSignersInfo: boolean = false;
  // Ошибки
  public error: string = '';

  maxDate: Date = new Date();
  minDate: any = undefined;
  constructor(
    public dischargeHistoryService: AccountHistoryService,
    public changeDetector: ChangeDetectorRef,
    public activatedRoute: ActivatedRoute,
    public accountsService: AccountsService,
    private modalService: BsModalService,
    private translate: TranslateService,
    private toastr: ToastrService,
    public operationsService: OperationsService
  ) {
    super();
    this.nodata = false;
    this.searchString = new FormControl('', []);
    this.documentNumber = new FormControl('', []);
    this.amountFrom = new FormControl('', []);
    this.amountTo = new FormControl('', []);
    // this.fetchStatements = this.fetchStatements.bind(this)
    this.resetFilter = this.resetFilter.bind(this);
  }

  ngOnInit(): void {
    // this.filter$.next({
    //     startDate: this.period.startDate,
    //     endDate: this.period.endDate,
    //     searchString: this.searchString.value,
    //     documentNumber: this.documentNumber.value,
    //     amountFrom: this.amountFrom.value,
    //     amountTo: this.amountTo.value,
    //     page: this.currentPage,
    // })

    // this.addSubscriber(
    //     this.observableFilter$.subscribe({
    //         next: v => {
    //             this.getDocumentsList()
    //         }
    //     })
    // )
    this.getCurrencyContractList();
  }

  getDocumentsList(page: number = 0): void {
    this.addSubscriber(this.getOperationsList(page));
  }
  /* Функция ручного выбора дат начала и конца */
  changeDate(event: any, period: string) {
    if (period === 'startDate') {
      if (event?.toString() === 'Invalid Date' || !event) {
        this.startDate = null; //очищает поле если не валидная дата
        return;
      } else {
        if (event > new Date()) {
          this.startDate = new Date(); //макс дата сегодня (пользователь может писать даты из будущего)
        } else {
          this.startDate = event;
        }
        if (this.calcDays() < 0) {
          this.periodError = true;
          errorMessage({ message: this.periodErrorMessage }, this.toastr);
        } else {
          this.periodError = false;
          this.periodChange(this.startDate, period);
        }
      }
    } else {
      if (event?.toString() === 'Invalid Date' || !event) {
        this.endDate = null;
        return;
      } else {
        if (event > new Date()) {
          this.endDate = new Date();
        } else {
          this.endDate = event;
        }
        if (this.calcDays() < 0) {
          this.periodError = true;
          errorMessage({ message: this.periodErrorMessage }, this.toastr);
        } else {
          this.periodError = false;
          this.periodChange(this.endDate, period);
        }
      }
    }
    this.changeDetector.detectChanges();
  }

  periodChange(oldDate?: any, value?: string) {
    const date = moment(oldDate).format(dateFormat);
    if (value === 'startDate') {
      const endDate = moment(this.endDate).format(dateFormat);
      this.filter$.next({
        ...this.filter$.value,
        startDate: date,
        endDate: endDate,
      });
    } else {
      const startDate = moment(this.startDate).format(dateFormat);
      this.filter$.next({
        ...this.filter$.value,
        endDate: date,
        startDate: startDate,
      });
    }
  }

  calcDays() {
    const diff = moment(this.endDate).diff(this.startDate, 'days');
    const sd = moment(this.startDate).format(dateFormat);
    const ed = moment(this.endDate).format(dateFormat);
    if (diff === 0 && sd !== ed) {
      return 1;
    } else {
      return diff;
    }
  }

  resetFilter(): void {
    // TODO REFACTOR TOO MANY REQUESTS
    this.periodError = false;

    if (this.amountFrom.value) {
      this.amountFrom.patchValue('');
    }

    if (this.amountTo.value) {
      this.amountTo.patchValue('');
    }

    if (this.searchString.value) {
      this.searchString.patchValue('');
    }

    if (this.documentNumber.value) {
      this.documentNumber.patchValue('');
    }

    this.currentPage = 0;
    this.startDate = month_ago_Obj.toDate();
    this.endDate = new Date();
    this.filter$.next({
      ...this.filter$.value,
      amountFrom: '',
      amountTo: '',
      searchString: '',
      documentNumber: '',
      startDate: moment(month_ago_Obj.toDate()).format(dateFormat),
      endDate: moment(new Date()).format(dateFormat),
    });
    this.changeDetector.detectChanges();
  }

  changePage(page: any): void {
    if (page.page !== this.currentPage) {
      this.dischargeHistoryService.docsAmount$.next('{"KZT":[0]}');
      this.dischargeHistoryService.docsLength$.next(0);
      this.dischargeHistoryService.selectedDocuments.next([]);
      // TODO: Subscription не добавлен для последующего удаления в хуке "ngOnDestroy"
      this.getOperationsList(page.page - 1);
    }
    /* Задает фокус на поле поиска после пагинации */
    const searchStringElm = document.getElementById('searchString');
    if (searchStringElm) {
      setTimeout(() => {
        document.getElementById('searchString').blur();
      }, 0);
      document.getElementById('searchString').focus();
    }
  }

  getOperationsList(page: number): any {
    //   const { operationType, currentStatus, startDate, endDate, searchString, typeList, documentNumber, amountFrom, amountTo } = this.filter$.value
    //   const documentTypeList = ['contract-list'];
    //   const statuses = getStatusList(currentStatus, typeList)
    //   let signatureStatus: string
    //   if (currentStatus === 'FULFILLED') {
    //       signatureStatus = 'SUFFICIENT'
    //   }
    //   const other = { listType: typeList, searchString, statuses, signatureStatus, documentNumber, amountFrom, amountTo }
    //   let body = returnRequestBody(startDate, endDate, documentTypeList, other, '', typeList);
    //   this.loading = true;

    // this.getCurrencyContractList(page, body);

    this.rows = [];
    for (let i = 0; i < 10; i++) {
      if (this.tableColumns[10 * page + i]) {
        this.rows.push(this.tableColumns[10 * page + i]);
      }
    }
    return null;
  }

  // getCurrencyContractList(page: number = 0, body: any) {
  //   this.dischargeHistoryService.getCurrencyContractList(body, page, 10).subscribe({
  //       next: (data: any) => {
  //           if (data.result && data.result.length) {
  //               this.nodata = false;
  //               this.dischargeHistoryService.page += 1;
  //               this.totalElements = data.totalElements;
  //               this.isFirst = data.isFirst;
  //               this.isLast = data.isLast;

  //               const rowsList = data.result.map((item: IDocumentInfo, index: number) => {
  //                   const dateInfo = checkIsAnotherDay(item, index, data.result)
  //                   const nItem = requestsFormatter(item) as any;
  //                   nItem.isToday = dateInfo.isToday
  //                   nItem.isAnotherDate = dateInfo.isAnotherDate
  //                   return nItem;
  //               });
  //               this.dischargeHistoryService.changeLastPageStatus(data.isLast);
  //               this.rows = this.getChangedRowList(rowsList)
  //               this.dischargeHistoryService.changeDocumentStatus(false);
  //               this.currentPage = data.currentPage + 1;
  //           } else {
  //               this.rows = [];
  //               this.nodata = true;
  //           }
  //           this.loading = false;
  //           this.changeDetector.detectChanges();
  //       },
  //       error: err => {
  //           this.error = 'Ошибка на сервере'
  //           this.loading = false;
  //           this.changeDetector.detectChanges();
  //       }
  //   })
  // }
  getCurrencyContractList() {
    this.loading = true;
    this.dischargeHistoryService
      .getCurrencyContractList(this.searchString.value)
      .subscribe({
        next: (data: any) => {
          this.loading = false;
          if (data.result && data.result.length > 0) {
            this.rows = data.result;
            this.tableColumns = data.result;
            this.totalElements = data.result.length;
            this.getOperationsList(0);
            this.nodata = false;
          } else {
            this.nodata = true;
          }
          this.changeDetector.detectChanges();
        },
        error: err => {
          this.loading = false;
          errorMessage(err, this.toastr);
          this.changeDetector.detectChanges();
        },
      });
  }
  getChangedRowList(rowsList: any[]): ITableRows[] {
    throw new Error('Method not implemented.');
  }
}
