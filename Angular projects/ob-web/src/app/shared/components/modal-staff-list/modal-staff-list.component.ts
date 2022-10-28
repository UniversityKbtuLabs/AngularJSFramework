import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
  Input,
  ViewChild,
  AfterViewChecked,
  Output,
  EventEmitter,
} from '@angular/core';

import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

import { OperationsService } from '@core/services/operations.service';
import { IEmployee } from '@data/models/common-types';
import { FormatAmountPipe } from '@shared/pipes/format-amount.pipe';
import { SubscriptionAccumulator } from '@app/core/helpers/SubscriptionAccumulator';
import { ConfirmModalComponent, PushComponent } from '@app/shared';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
import { dateFormat, requestDateFormat } from '@app/core/constants';
import { LoginService } from '@app/core/services/login.service';
import {
  errorMessage,
  successMessage,
  thousandsSeparator,
} from '@core/helpers';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ob-modal-staff-list',
  templateUrl: './modal-staff-list.component.html',
  styleUrls: ['./modal-staff-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FormatAmountPipe],
})
export class ModalStaffListComponent
  extends SubscriptionAccumulator
  implements OnInit, OnDestroy, AfterViewChecked
{
  birthDay: string | Date;
  emp: any;
  employees: IEmployee[] = [];
  employeeDataToEdit: IEmployee;
  isEdit: boolean = false;
  isEmployeeEdit: boolean = false;
  cheifEditable: boolean = false;
  isEmployeeAdd: boolean = false;
  isEmployeeDisplay: boolean = true;
  isLoading: boolean = true;
  initialState: any;
  isUpdate: boolean = false;
  mainCheck: boolean = false;
  modalRef?: BsModalRef;
  modalId: any;
  cheif: string;
  selectedEmployees: IEmployee[] = [];
  cheifBin: string = '';
  _unsubscribe$ = new Subject();
  @Input() employeeList: IEmployee[] = [];
  @Input() paymentType: string;
  onClose: Subject<IEmployee[]> = new Subject();
  @ViewChild('staffModal') staffModalEl: any;
  @Output() changeWidth = new EventEmitter<boolean>();
  public userInfoSubscr: Subscription;
  public staffListSubscr: Subscription;
  public staffListSubscr2: Subscription;
  public deleteStaffSubscr: Subscription;
  public staffListPaginationSubscr: Subscription;
  public deleteMsg: string = '';
  public deleteWarning: string = '';
  public chiefDeleteWarning: string = '';
  public deleteEmpList: IEmployee[] = [];

  public currentPageEmployees: IEmployee[] = [];
  public maxSize = 10;
  public totalElements: number = 0;
  public currentPage = 0;
  public isFirst: boolean = false;
  public isLast: boolean = false;
  public allListLoading: boolean = false;

  constructor(
    private toastr: ToastrService,
    public modalOptions: ModalOptions,
    public changeDetector: ChangeDetectorRef,
    private modalService: BsModalService,
    public operationsService: OperationsService,
    private loginService: LoginService,
    private translate: TranslateService
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.employeeList.length > 0) {
      this.operationsService.currenStaffListLastPage$.subscribe(data => {
        if (data) {
          this.currentPage = data;
        }
      });
    }
    this.operationsService.changeTableModalVisible(true);
    this.modalId = this.modalOptions?.id;
    this._getStaffListPage(this.currentPage);
    this._autoRefresh();
    this.getCheifInfo();
    this.getTranslations();
    if (this.modalOptions?.id === 6) {
      this.modalId = this.modalOptions?.id;
      this.initialState = this.modalOptions?.initialState;
      this.isUpdate = this.initialState.isUpdate;
      this.emp = this.initialState.emp;
      this.isEmployeeEdit = true;
      this.employeeDataToEdit = this.emp;
      this.displayCurrentContent(true, false, false);
    }
  }

  getTranslations() {
    this.translate
      .get([
        'toast-messages.success.deleted',
        'toast-messages.warning.employee-delete',
        'toast-messages.warning.chief-delete',
      ])
      .subscribe(translations => {
        this.deleteMsg = translations['toast-messages.success.deleted'];
        this.deleteWarning =
          translations['toast-messages.warning.employee-delete'];
        this.chiefDeleteWarning =
          translations['toast-messages.warning.chief-delete'];
      });
  }

  ngAfterViewChecked(): void {
    this.operationsService.isTableModalVisible$.subscribe((value: boolean) => {
      if (!value) {
        this.staffModalEl.nativeElement.className = 'displayNone';
      } else {
        this.staffModalEl.nativeElement.className = 'displayBlock';
      }
    });
  }

  getCheifInfo(): void {
    this.userInfoSubscr = this.loginService.getUserInfo().subscribe({
      next: value => {
        this.cheifBin = value.currentContract.bin;
      },
    });
  }

  private _autoRefresh(): void {
    this.operationsService.refresh$
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(() => {
        if (
          this.isLast &&
          this.currentPage > 0 &&
          this.totalElements > 0 &&
          this.deleteEmpList.length > 0
        ) {
          this.currentPage =
            Math.ceil((this.totalElements - this.deleteEmpList.length) / 10) -
            1; //пагинация при удалении
          this.deleteEmpList = [];
        }
        this._getStaffListPage(this.currentPage);
      });
  }

  // Метод получения списка с пагинацией
  private _getStaffListPage(page: number): void {
    this.isLoading = true;
    this.changeDetector.detectChanges();

    this.staffListPaginationSubscr = this.operationsService
      .getStaffListPage(page, 10)
      .pipe(distinctUntilChanged())
      .subscribe({
        next: data => {
          data.content.forEach(i => {
            if (i.account) {
              i.account = i.account.replaceAll(/\s/g, '');
            }
            if (i.iin) {
              i.iin = i.iin.replaceAll(/\s/g, '');
            }
          });
          this.currentPageEmployees = data.content;
          this.totalElements = data.totalElements;
          this.isFirst = data.isFirst;
          this.isLast = data.isLast;

          this.changeDetector.markForCheck();
          this.markSelectedEmployees();

          if (this.currentPageEmployees.length >= 0) {
            this.isLoading = false;
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          errorMessage(err, this.toastr);
          this.changeDetector.detectChanges();
        },
        complete: () => {
          this.isLoading = false;
          this.changeDetector.detectChanges();
        },
      });
  }

  markSelectedEmployees() {
    this.currentPageEmployees = this.markSelected(
      this.currentPageEmployees,
      this.employeeList
    );
    this.selectedEmployees = this.employeeList.filter(emp =>
      this.currentPageEmployees.find(curEmp => emp.id === curEmp.id)
    );
    this.mainCheck = this.currentPageEmployees.every(
      (row: IEmployee) => row.checked == true
    );
  }

  cancel() {
    //this.select();
    this.modalService.hide(this.modalId);
  }

  editAddEmployees(isEdit: boolean = false, el?: IEmployee) {
    this.changeWidth.emit(true); //Для смены размера модального окна
    if (isEdit) {
      this.employeeDataToEdit = el;
      this.displayCurrentContent(true, false, false);
      if (el.iin === this.cheifBin) {
        this.cheifEditable = true;
      }
    } else {
      this.displayCurrentContent(false, true, false);
    }
  }

  displayCurrentContent(
    isEdit: boolean = false,
    isAdd: boolean = false,
    isList: boolean = false
  ) {
    this.isEmployeeEdit = isEdit;
    this.isEmployeeAdd = isAdd;
    this.isEmployeeDisplay = isList;
  }

  select() {
    let tempEmployeeList: IEmployee[] = [];
    tempEmployeeList = this.employeeList.filter(
      emp => !this.currentPageEmployees.find(curEmp => emp.id === curEmp.id)
    );
    this.selectedEmployees = [...tempEmployeeList, ...this.selectedEmployees];
    this.selectedEmployees = [
      ...new Map(
        this.selectedEmployees.map(item => [item['iin'], item])
      ).values(),
    ];

    this.onClose.next(this.selectedEmployees);
    return this.selectedEmployees;
  }

  addEmployee(): void {
    this.select();
    this.operationsService.staffListLastPage$.next(this.currentPage);
  }

  addEmployeeToDelete(): void {
    this.selectedEmployees = [...new Set(this.selectedEmployees)];
    this.onClose.next([]);
  }

  changeAllStatus(): void {
    this.currentPageEmployees.forEach(item => (item.checked = this.mainCheck));
    this.changeDetector.detectChanges();
    if (this.totalElements > 0 && this.mainCheck) {
      this.selectedEmployees = this.currentPageEmployees;
    } else {
      this.selectedEmployees = [];
    }
  }

  // при нажатии на checkbox для выбора сотрудника
  onSelect(selectedEmp: IEmployee): void {
    let ind = this.selectedEmployees.findIndex(
      emp => emp.id === selectedEmp.id
    );
    if (ind) {
      if (selectedEmp.checked) {
        this.selectedEmployees.push(selectedEmp); //добавляет в список выбранных
      } else {
        this.selectedEmployees.splice(ind, 1); //удаляет из списка выбранных
      }
    } else {
      this.selectedEmployees.splice(ind, 1); //удаляет из списка выбранных
    }
    this.mainCheck = this.currentPageEmployees.every(
      (row: IEmployee) => row.checked == true
    );
  }

  isSelected(): boolean {
    return this.selectedEmployees.length > 0;
  }

  deleteByIdStaff(ids: number[]): void {
    this.deleteStaffSubscr = this.operationsService
      .deleteByIdStaffList(ids)
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe(() => {
        this.operationsService.refresh$.next();
        if (!this.cheif) {
          successMessage(this.deleteMsg, this.toastr);
        }
        // if (this.getSelectedEmployeeIds().length === 1 && !this.cheif) {
        //   this.notify("Успешно удалено", "success");
        // } else if (this.getSelectedEmployeeIds().length > 1 && this.cheif) {
        //   this.notify("Успешно удалено", "success");
        // } else if (this.getSelectedEmployeeIds().length > 1 && !this.cheif) {
        //   this.notify("Успешно удалено", "success");
        // }

        //Проверка чтобы не передавать в список уже удаленных сотрудников
        this.deleteEmpList.forEach(emp1 => {
          let index = this.employeeList.findIndex(
            emp2 => emp2.iin === emp1.iin
          );
          if (index !== -1) {
            this.employeeList.splice(index, 1);
          }
        });
        this.onClose.next(this.employeeList);
      });
  }

  openConfirmModal() {
    const initialState: object = {
      text: this.deleteWarning,
    };

    this.modalRef = this.modalService.show(ConfirmModalComponent, {
      class: 'modal-md modal-dialog-centered',
      id: 3,
      //ignoreBackdropClick: true,
      initialState,
    });
  }

  checkEmployeeStatus() {
    let cheif = this.selectedEmployees.find(item => item.iin === this.cheifBin);
    let index = this.selectedEmployees.findIndex(
      item => item.iin === this.cheifBin
    );
    if (index !== -1) {
      this.cheif = cheif?.firstName !== null ? cheif?.firstName + ' ' : '';
      this.cheif += cheif?.lastName !== null ? cheif?.lastName + ' ' : '';
      this.cheif += cheif?.middleName !== null ? cheif?.middleName : '';
    } else {
      this.cheif = '';
    }
  }

  getSelectedEmployeeIds() {
    this.deleteEmpList = this.selectedEmployees;
    return this.selectedEmployees.map(item => item.id);
  }

  deleteEmployee() {
    if (this.isSelected()) {
      this.addEmployeeToDelete();
      this.checkEmployeeStatus();
      if (this.cheif) {
        errorMessage(`${this.chiefDeleteWarning}   ${this.cheif}`, this.toastr);
      } else {
        this.openConfirmModal();
        this.operationsService.changeTableModalVisible(false);
        this.addSubscriber(
          this.modalRef.content.onStatus.subscribe((result: boolean) => {
            if (result) {
              let ids = this.getSelectedEmployeeIds();
              this.deleteByIdStaff(ids);
            }
          })
        );
      }
    }
  }

  selectEmployee() {
    if (this.isSelected()) {
      this.addEmployee();
      this.modalService.hide(this.modalId);
    }
  }

  updateEmployees(flag: boolean): void {
    if (flag) {
      this.displayCurrentContent(false, false, true);
      this.staffListSubscr2 = this.operationsService
        .getStaffListPage(this.currentPage, 10)
        .subscribe(data => {
          this.currentPageEmployees = data.content;
          this.changeDetector.markForCheck();
          this.markSelectedEmployees();
          if (this.currentPageEmployees.length >= 0) {
            if (this.isSelected()) {
              this.select();
            }
          }
        });
    }
  }

  formatBirthDate(birthDay: string | Date): string {
    if (typeof birthDay === 'string') {
      return moment(birthDay, requestDateFormat).format(dateFormat);
    }

    let birthDayTemp = birthDay.toString().split('-');
    return `${birthDayTemp[2]}.${birthDayTemp[1]}.${birthDayTemp[0]}`;
  }

  getFormattedAmount(amount: any) {
    if (amount) {
      return thousandsSeparator(amount);
    } else {
      return '0';
    }
  }

  ngOnDestroy(): void {
    this.modalService.hide(2);
    this.modalService.hide(this.modalId);
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
    if (this.userInfoSubscr) {
      this.userInfoSubscr.unsubscribe();
    }
    if (this.staffListSubscr) {
      this.staffListSubscr.unsubscribe();
    }
    if (this.staffListSubscr2) {
      this.staffListSubscr2.unsubscribe();
    }
    if (this.deleteStaffSubscr) {
      this.deleteStaffSubscr.unsubscribe();
    }
    if (this.staffListPaginationSubscr) {
      this.staffListPaginationSubscr.unsubscribe();
    }
  }

  changePage(page: any) {
    this.currentPage = page.page;
    this.mainCheck = false;
    this.isFirst = this.currentPage === 1;
    this.isLast = Math.ceil(this.totalElements / 10) === this.currentPage;
    this.changeDetector.detectChanges();
    this._getStaffListPage(page.page - 1);
  }
  // метод сравнивает два массива и передает выбранных сотрудников из одного в другой
  markSelected = (data: IEmployee[], selectedEmployees: IEmployee[]) =>
    data.map(obj => {
      let s = selectedEmployees.find(emp => emp.iin === obj.iin);
      return { ...obj, ...(s ? { checked: true } : {}) };
    });
}
