import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { ICurrentContract, IUser } from '@data/models/auth-types';
import { LoginService } from '@core/services/login.service';
import { take } from 'rxjs/operators';
import { OperationsService } from '@core/services/operations.service';
import { DictionaryService } from '@core/services/dictionary.service';
import { IEmployee, StaffDictionaries } from '@data/models/common-types';
import { IBank } from '@data/models/dictionary-types';
import { ModalAddStaffComponent } from '@app/shared';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'ob-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeesComponent implements OnInit {
  public btnList: any[] = [];
  public employees: IEmployee[] = [];
  public currentPageEmployees: IEmployee[] = [];
  public bankList: IBank[] = [];
  public user: IUser;
  public currentContract: ICurrentContract;
  public phoneAuthorized: boolean = true;
  public accauntType: string = 'all';
  public searchWord: string = '';
  public totalElements: number;
  public currentPage: number = 0;
  public maxSize = 5;
  public lastPage: number;

  modalRef?: BsModalRef;

  constructor(
    private loginService: LoginService,
    private operationsService: OperationsService,
    private dictionaryService: DictionaryService,
    private changeDetector: ChangeDetectorRef,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.getUserInfo();
    this.getData();
  }

  getUserInfo() {
    this.loginService.userInfoObject$
      .pipe(take(2)) // TODO FIX
      .subscribe({
        next: v => {
          if (v.user) {
            this.user = v.user;
            this.currentContract = v.currentContract;
            this.changeDetector.detectChanges();
          }
        },
      });
  }

  getData() {
    this.operationsService
      .getStaffListPage(this.currentPage, 10)
      .subscribe(data => {
        this.totalElements = data.totalElements;
        this.lastPage = data.totalPages;
        this.currentPageEmployees = data.content;
        this.currentPage = data.currentPage;
        this.changeDetector.detectChanges();
      });

    this.operationsService.staffList.subscribe((data: IEmployee[]) => {
      this.employees = data;
    });
  }

  getEmployeeList(page: number) {
    this.operationsService.getStaffListPage(page, 10).subscribe(data => {
      this.totalElements = data.totalElements;
      this.lastPage = data.totalPages;
      this.currentPageEmployees = data.content;
      this.currentPage = data.currentPage + 1;
      this.changeDetector.detectChanges();
    });
  }

  openDropdawn() {}

  changePage(page: any) {
    if (page.page !== this.currentPage) {
      this.getEmployeeList(page.page - 1);
    }
  }

  // emptySearch() {
  //     this.searchWord = ""
  //     this.findEmployee(0);
  // }

  addEmployee() {
    let initialState = { paymentType: 'salary', isSettings: true };
    this.modalRef = this.modalService.show(ModalAddStaffComponent, {
      class: 'modal-lg employee-modal modal-dialog-centered',
      id: 2,
      ignoreBackdropClick: false,
      initialState,
    });
    this.modalRef.content.onAddEmployee.subscribe((result: IEmployee) => {
      this.getEmployeeList(this.currentPage - 1);
      this.employees = this.employees.concat(result);
      this.operationsService.staffList.next(this.employees);
    });
  }

  changeEmployeesState(value: any, action: string) {
    if (action === 'delete') {
      let changedEmployees: IEmployee[] = this.employees.filter(
        item => item.id !== value[0]
      );
      this.operationsService.staffList.next(changedEmployees);
      this.getEmployeeList(this.currentPage - 1);
    } else if (action === 'edit') {
      let index: number = this.employees.findIndex(item => item.id == value.id);
      this.employees[index] = value;
      this.operationsService.staffList.next(this.employees);
      this.getEmployeeList(this.currentPage - 1);
    }
  }
}
