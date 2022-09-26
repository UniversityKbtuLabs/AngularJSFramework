/* eslint-disable max-len */
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  dateFormat,
  operationPeriod,
  requestDateFormat,
} from '@app/core/constants';
import { DictionaryService } from '@app/core/services/dictionary.service';
import { LoginService } from '@app/core/services/login.service';
import { OperationsService } from '@app/core/services/operations.service';
import { ModalAddStaffComponent, ModalStaffListComponent } from '@app/shared';

import { IEmployee } from '@data/models/common-types';
import moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'ob-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent implements OnChanges, OnDestroy, OnInit {
  modalRef?: BsModalRef;
  updatedEmployees: IEmployee[] = [];
  userForm: FormGroup;
  cheifBin: string = '';
  cheifEditable: boolean = false;
  public userInfoSubscr: Subscription;
  @Input() usersList: IEmployee[] = [];
  @Input() paymentType: string = '';
  @Output() updatedUserList = new EventEmitter<any>();
  @Input() collectivePeriod$: Observable<Date>;
  collectivePeriod: Date = null;

  //pagination
  public currentPage = 1;
  public isFirst: boolean = false;
  public isLast: boolean = false;
  public lastPage: number;
  public currentPageEmployees: IEmployee[] = [];
  public paginationSizeValue = 10;
  public paginationSizeList: number[] = [10, 20, 50, 100];

  constructor(
    private fb: FormBuilder,
    private modalService: BsModalService,
    public operationsService: OperationsService,
    private loginService: LoginService,
    public changeDetector: ChangeDetectorRef
  ) {
    this.getCheifInfo();
  }
  ngOnInit(): void {
    if (this.paymentType !== 'salary') {
      this.collectivePeriod$.subscribe(data => {
        if (data) {
          let formArr = this.userForm.get('employees') as FormArray;
          this.collectivePeriod = data;
          this.usersList.forEach(
            emp => (emp.period = this.formatPeriodIntoDate(data))
          );
          this.changeDetector.detectChanges();
          for (let empForm of formArr.controls) {
            empForm.patchValue({
              period: data,
            });
          }
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.usersList) {
      this.usersList.forEach(emp => {
        emp.period = this.formatPeriodIntoDate(emp.period);
      });
      this.currentPage = 1;
      this.currentPageEmployees = this.usersList.slice(
        (this.currentPage - 1) * this.paginationSizeValue,
        this.currentPage * this.paginationSizeValue
      );
      this.initPayments();
    }
    this.lastPage = Math.ceil(this.usersList.length / this.paginationSizeValue);
  }

  getCheifInfo(): void {
    // TODO: (Review) Тут создается подписка на "getUserInfo" и потом не удаляется
    this.userInfoSubscr = this.loginService.getUserInfo().subscribe(value => {
      this.cheifBin = value.currentContract.bin;
    });
  }

  openModal2(isUpdate: boolean = false, ind?: number) {
    let emp = this.usersList[ind];
    if (emp.iin === this.cheifBin) {
      this.cheifEditable = true;
    } else if (emp.iin !== this.cheifBin) {
      this.cheifEditable = false;
    }
    const initialState = {
      isUpdate,
      emp,
      paymentType: this.paymentType,
      cheifEditable: this.cheifEditable,
    };

    this.modalRef = this.modalService.show(ModalAddStaffComponent, {
      class: 'modal-lg modal-dialog-centered',
      id: 6,
      initialState,
    });
    this.modalRef.content.onEdit.subscribe((result: IEmployee) => {
      if (result) {
        result.checked = true;
        this.usersList = this.usersList.map((user: IEmployee) => {
          if (user.iin === result.iin) {
            return result;
          }
          return user;
        });
        (
          (this.userForm.controls.employees as FormArray).controls[
            ind
          ] as FormGroup
        ).patchValue(result); // изменят значение сотрудника в списке после редактирования
        this.sendEmployees();
      }
    });
  }

  initPayments() {
    if (this.paymentType === 'osms') {
      this.initializeOsmsForm();
    } else if (this.paymentType === 'retirement') {
      this.initializePensionForm();
    } else if (this.paymentType === 'salary') {
      this.initializeSalaryForm();
    } else if (this.paymentType === 'social') {
      this.initializeSocialForm();
    }
  }
  initializeOsmsForm() {
    this.userForm = this.fb.group({
      employees: this.fb.array([]),
    });
    this.userForm.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(_ => {
        this.sendEmployees();
      });
    for (let i = 0; i < this.currentPageEmployees.length; i++) {
      const form = this.fb.group({
        firstName: [this.currentPageEmployees[i].firstName || ''],
        lastName: [this.currentPageEmployees[i].lastName || ''],
        middleName: [this.currentPageEmployees[i].middleName || ''],
        firstNameReg: [''],
        lastNameReg: [''],
        middleNameReg: [''],
        birthDay: [this.currentPageEmployees[i].birthDay || ''],
        iin: [this.currentPageEmployees[i].iin || ''],
        amount: [this.currentPageEmployees[i].amount || ''],
        sic: [''],
        period: [
          this.formatPeriodIntoDate(this.currentPageEmployees[i].period) ||
            this.collectivePeriod ||
            new Date(),
        ],
        payType: [''],
        id: [this.currentPageEmployees[i].id || ''],
        bankName: [this.currentPageEmployees[i].bankName || ''],
      });
      this.employeesFormArray.push(form);
    }
    this.sendEmployees();
  }

  initializePensionForm() {
    this.userForm = this.fb.group({
      employees: this.fb.array([]),
    });
    this.userForm.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(_ => {
        this.sendEmployees();
      });
    for (let i = 0; i < this.currentPageEmployees?.length; i++) {
      const form = this.fb.group({
        firstName: [this.currentPageEmployees[i].firstName || ''],
        lastName: [this.currentPageEmployees[i].lastName || ''],
        middleName: [this.currentPageEmployees[i].middleName || ''],
        firstNameReg: [''],
        lastNameReg: [''],
        middleNameReg: [''],
        birthDay: [this.currentPageEmployees[i].birthDay || ''],
        iin: [this.currentPageEmployees[i].iin || ''],
        amount: [this.currentPageEmployees[i].amount || ''],
        sic: [''],
        period: [
          this.formatPeriodIntoDate(this.currentPageEmployees[i].period) ||
            this.collectivePeriod ||
            new Date(),
        ],
        payType: [''],
        id: [this.currentPageEmployees[i].id || ''],
        bankName: [this.currentPageEmployees[i].bankName || ''],
      });
      this.employeesFormArray.push(form);
    }
    this.sendEmployees();
  }

  initializeSalaryForm() {
    this.userForm = this.fb.group({
      employees: this.fb.array([]),
    });
    this.userForm.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(_ => {
        this.sendEmployees();
      });
    for (let i = 0; i < this.currentPageEmployees?.length; i++) {
      const form = this.fb.group({
        firstName: [this.currentPageEmployees[i].firstName || ''],
        lastName: [this.currentPageEmployees[i].lastName || ''],
        middleName: [this.currentPageEmployees[i].middleName || ''],
        iin: [this.currentPageEmployees[i].iin || ''],
        birthDay: [this.currentPageEmployees[i].birthDay || ''],
        account: [
          this.currentPageEmployees[i].account || '',
          Validators.compose([
            Validators.required,
            Validators.minLength(20),
            Validators.pattern(/^[A-Z0-9]+(?!.)/),
          ]),
        ],
        amount: [this.currentPageEmployees[i].amount || ''],
        id: [this.currentPageEmployees[i].id || ''],
        bankName: [this.currentPageEmployees[i].bankName || ''],
      });
      this.employeesFormArray.push(form);
    }
    this.sendEmployees();
  }

  initializeSocialForm() {
    this.userForm = this.fb.group({
      employees: this.fb.array([]),
    });
    this.userForm.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(_ => {
        this.sendEmployees();
      });
    for (let i = 0; i < this.currentPageEmployees.length; i++) {
      const form = this.fb.group({
        firstName: [this.currentPageEmployees[i].firstName || ''],
        lastName: [this.currentPageEmployees[i].lastName || ''],
        middleName: [this.currentPageEmployees[i].middleName || ''],
        birthDay: [this.currentPageEmployees[i].birthDay || ''],
        iin: this.currentPageEmployees[i].iin
          ? this.currentPageEmployees[i].iin
          : '',
        amount: [this.currentPageEmployees[i].amount || ''],
        period: [
          this.formatPeriodIntoDate(this.currentPageEmployees[i].period) ||
            this.collectivePeriod ||
            new Date(),
        ],
        payType: [''],
        id: [this.currentPageEmployees[i].id || ''],
        bankName: [this.currentPageEmployees[i].bankName || ''],
      });
      this.employeesFormArray.push(form);
    }
    this.sendEmployees();
  }

  sendEmployees() {
    this.updateUsersList();
    this.updatedUserList.emit(this.usersList);
  }
  get employeesFormArray(): FormArray {
    return this.userForm.controls['employees'] as FormArray;
  }

  isFieldValid(field: string, id: number) {
    // валидация полей
    return (
      !this.employeesFormArray.controls[id].get(field).valid &&
      this.employeesFormArray.controls[id].get(field).touched
    );
  }

  displayFieldClass(field: string, id: number) {
    return { 'is-invalid': this.isFieldValid(field, id) };
  }

  deleteStaffByIndex(index: number) {
    this.usersList.splice(index, 1);
    this.employeesFormArray.removeAt(index % this.paginationSizeValue);
    this.currentPageEmployees = this.usersList.slice(
      (this.currentPage - 1) * this.paginationSizeValue,
      this.currentPage * this.paginationSizeValue
    );
    if (this.currentPageEmployees.length === 0 && this.currentPage !== 1) {
      this.currentPage = this.currentPage - 1;
      this.currentPageEmployees = this.usersList.slice(
        (this.currentPage - 1) * this.paginationSizeValue,
        this.currentPage * this.paginationSizeValue
      );
    }
    this.initPayments();
    this.sendEmployees();
  }

  formatBirthDate(birthDay: string | Date): string {
    if (typeof birthDay === 'string') {
      return moment(birthDay, requestDateFormat).format(dateFormat);
    }

    let birthDayTemp = birthDay.toString().split('-');
    return `${birthDayTemp[2]}.${birthDayTemp[1]}.${birthDayTemp[0]}`;
  }

  ngOnDestroy(): void {
    this.operationsService.staffListLastPage$.next(this.currentPage);
    this.modalService.hide(2);
    if (this.userInfoSubscr) {
      this.userInfoSubscr.unsubscribe();
    }
    this.collectivePeriod = null;
  }

  changeAccount(value: any, i: number) {
    this.employeesFormArray.at(i).get('account').setValue(value);
  }

  changePage(page: any) {
    this.currentPage = page.page;
    this.currentPageEmployees = this.usersList.slice(
      (page.page - 1) * this.paginationSizeValue,
      page.page * this.paginationSizeValue
    );
    this.initPayments();
  }

  changePaginationSize() {
    this.currentPage = 1;
    this.currentPageEmployees = this.usersList.slice(
      (this.currentPage - 1) * this.paginationSizeValue,
      this.currentPage * this.paginationSizeValue
    );
    this.initPayments();
  }

  updateUsersList() {
    this.usersList = this.usersList.map(
      emp1 =>
        this.userForm.controls['employees'].value.find(
          (emp2: any) => emp2.iin === emp1.iin
        ) || emp1
    );
    this.usersList = [
      ...new Map(this.usersList.map(item => [item['iin'], item])).values(),
    ];
    this.changeDetector.detectChanges();
  }

  formatPeriodIntoDate(period: string | Date) {
    if (period) {
      return period instanceof Date
        ? period
        : moment(period, operationPeriod).toDate();
    } else {
      return period;
    }
  }
}
