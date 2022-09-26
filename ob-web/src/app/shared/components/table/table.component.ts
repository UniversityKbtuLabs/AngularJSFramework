import {
  Component,
  Input,
  ChangeDetectorRef,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { take } from 'rxjs/operators';
import { HelperService } from '@core/services/helper.service';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { AccountHistoryService } from '@app/core/services/account-history.service';
import { TableModalComponent } from '@app/modules/account-history/components/table-modal/table-modal.component';
import {
  ITableColumns,
  ITableRows,
} from '@app/data/models/account-history-types';
import {
  operationTableColumns,
  returnTableColumns,
  statementTableColumns,
} from '@app/core/constants';
import { getIn, thousandsSeparator } from '@app/core/helpers';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
@Component({
  selector: 'ob-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent
  extends SubscriptionAccumulator
  implements OnInit, OnDestroy
{
  @Input() rowData: ITableRows[] | [] = [];
  @Input() getDocumentsList: any;
  @Input() type: string = '';
  @Input() accountType: string = '';
  @Input() isResetFilter$: Observable<boolean>;
  @Output() sortByDate = new EventEmitter<boolean>();
  @Output() sortBySum = new EventEmitter<boolean>();

  modalRef?: BsModalRef;
  tableColumns: ITableColumns[] | [] = [];
  mainCheck: boolean = false;
  sortAsc: boolean = false;
  tableColumnKeys: string[];
  public listType: string;
  public todayString: string;
  public colSpan: number = 3;
  public signersInfo: any = {};
  public signersInfoSubscription: Subscription;
  public showActionsList: any[] = new Array(10);

  constructor(
    public accountHistoryService: AccountHistoryService,
    public changeDetector: ChangeDetectorRef,
    public helperService: HelperService,
    private modalService: BsModalService,
    private router: Router,
    private translate: TranslateService
  ) {
    super();
  }

  ngOnInit(): void {
    this.showActionsList.fill(false);
    this.tableColumns = returnTableColumns(this.type);
    this.colSpan = this.type === 'documents-signing' ? 4 : 3;
    this.subscriptionList.push(
      this.isResetFilter$.subscribe(data => {
        this.mainCheck = data;
        this.changeAllStatus();
        this.changeDetector.detectChanges();
      })
    );
    this.signersInfoSubscription =
      this.accountHistoryService.signersInfo$.subscribe({
        next: v => {
          this.signersInfo = v;
          this.changeDetector.detectChanges();
        },
      });

    this.accountHistoryService.getSignersInfo();

    this.accountHistoryService.selectedDocuments.subscribe({
      next: (v: any) => {
        if (v.length === 0 && this.rowData && this.rowData.length) {
          this.rowData.forEach(r => (r.checked = false));
        }
        this.changeDetector.detectChanges();
      },
    });

    this.translate.get(['default.today']).subscribe({
      next: translations => {
        this.todayString = translations['default.today'];
        this.changeDetector.detectChanges();
      },
    });

    this.addSubscriber(
      this.accountHistoryService.isModalOpen.subscribe((value: boolean) => {
        if (value) {
          this.modalService.hide();
          this.accountHistoryService.changeModalStatus(false);
        }
      })
    );
  }

  getValue(data: any, args: string[]) {
    return getIn(data, ...args);
  }

  formatAmount(amount: any) {
    if (amount) {
      return thousandsSeparator(amount);
    } else {
      return '0';
    }
  }

  changeAllStatus(): void {
    if (this.rowData.length > 0) {
      this.rowData.map((row: ITableRows) => {
        row.checked = this.mainCheck;
      });
    }

    this.addDocument();

    this.changeDetector.detectChanges();
  }

  isAllSelected(): void {
    this.mainCheck = this.rowData.every(
      (row: ITableRows) => row.checked == true
    );
    this.addDocument();
    this.changeDetector.detectChanges();
  }

  sorting(type: string): void {
    if (type === 'operation') {
      this.sortByDate.emit(true);
    } else if (type === 'amount') {
      this.sortBySum.emit(true);
    }
  }

  getCurrency(currency: string) {
    return this.helperService.formatCurrency(currency);
  }

  // sorting(value: string): void {
  //   if (value === "date" || value === "amount") {
  //     this.rowData = this.rowData.sort((a: ITableRows, b: ITableRows) => {
  //       if (value === "date") {
  //         const date = a.date?.split("."),
  //           date2 = b.date?.split(".");

  //         const formattedDate = new Date(`${date[2]}.${date[1]}.${date[0]}`).getTime(),
  //           formattedDate2 = new Date(`${date2[2]}.${date2[1]}.${date2[0]}`).getTime();

  //         if (this.sortAsc) {
  //           return formattedDate2 - formattedDate;
  //         } else {
  //           return formattedDate - formattedDate2;
  //         }
  //       } else {
  //         if (this.sortAsc) {
  //           return +a.amount - +b.amount;
  //         } else {
  //           return +b.amount - +a.amount;
  //         }
  //       }
  //     });

  //     this.sortAsc = !this.sortAsc;

  //     this.changeDetector.detectChanges();
  //   }
  // }

  addDocument(): void {
    const documents = this.rowData.filter((row: ITableRows) => row.checked);

    this.accountHistoryService.addDocument(documents);
  }

  onScrollDown() {
    this.accountHistoryService.lastPageStatus.subscribe(value => {
      if (!value) {
        this.getDocumentsList();
      }
    });
  }

  getPaymentType(type: string): string {
    switch (type) {
      case 'PAY_ORDER_V2':
        return 'operations/payment/counteragent';
      case 'PAY_SOCIAL_V2':
        return 'operations/payment/social';
      case 'PAY_SALARY_V2':
        return 'operations/payment/salary';
      case 'PAY_PENSION_V2':
        return 'operations/payment/retirement';
      case 'PAY_MEDICAL_INSURANCE':
        return 'operations/payment/retirement';
      case 'PAY_BUDGET':
        return 'operations/payment/budget';
      case 'PAY_ORDER_CARDS':
        return 'operations/transfer/accounts';
      case 'PAY_P2P':
        return 'operations/transfer/card';
      case 'PAY_TO_CARD':
        return 'operations/transfer/accounts';
      default:
        return 'operations/payment/counteragent';
    }
  }

  toggleModal(operation: ITableRows) {
    localStorage.setItem('operation-info', JSON.stringify(operation));
    this.accountHistoryService.openedDocument$.next(operation);
    if (
      operation.type === 'PAY_SOCIAL_V2' ||
      operation.type === 'PAY_SOCIAL' ||
      operation.type === 'PAY_SALARY_V2' ||
      operation.type === 'PAY_SALARY' ||
      operation.type === 'PAY_PENSION_V2' ||
      operation.type === 'PAY_PENSION' ||
      operation.type === 'PAY_ORDER_V2' ||
      operation.type === 'PAY_ORDER' ||
      operation.type === 'PAY_BUDGET_V2' ||
      operation.type === 'PAY_BUDGET' ||
      operation.type === 'PAY_TO_CARD' ||
      operation.type === 'PAY_ORDER_CARDS' ||
      operation.type === 'PAY_MEDICAL_INSURANCE' ||
      operation.type === 'PAY_P2P' ||
      operation.type === 'DEPOSIT_OPEN' ||
      operation.type === 'CURR_EXCHANGE_FX' ||
      operation.type === 'CORP_CARD_ISSUE' ||
      operation.type === 'ACCOUNT_CREATE' ||
      operation.type === 'ACCOUNT_STATEMENT'
    ) {
      this.modalRef = this.modalService.show(TableModalComponent, {
        class: 'modal-lg modal-dialog-centered',
        id: 1,
      });
    }
  }

  ngOnDestroy(): void {
    this.modalService.hide(1);
    if (this.signersInfoSubscription) {
      this.signersInfoSubscription.unsubscribe();
    }
  }

  changeAllStatusColumn() {
    this.mainCheck = !this.mainCheck;
    this.changeAllStatus();
  }

  isAllSelectedColumn(item: ITableRows) {
    item.checked = !item.checked;
    this.isAllSelected();
  }

  getSigners(operation: ITableRows) {
    let needSign: any = [];
    let signed: any = [];

    if (operation?.needSign) {
      needSign = operation?.needSign?.split(',');
    }

    if (operation?.signed) {
      signed = operation?.signed?.split(',');
    }

    if (needSign.length > 0 || signed.length > 0) {
      return { needSignLength: needSign.length, signedLength: signed.length };
    } else {
      return null;
    }
  }

  getOperationDetailsName(item: ITableRows) {
    switch (item.type) {
      case 'PAY_BUDGET':
        return item.bankRecipientName;
      default:
        return item.nameRecipient;
    }
  }

  onOpen(id: any) {
    this.showActionsList.fill(false);
    this.showActionsList[id] = true;
  }
}
