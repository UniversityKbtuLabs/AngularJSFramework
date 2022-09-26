import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  HostListener,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { HelperService } from '@app/core/services/helper.service';
import { IEmployee } from '@data/models/common-types';
import { ConfirmModalComponent, ModalAddStaffComponent } from '@app/shared';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { errorMessage, successMessage } from '@core/helpers';
import { takeUntil } from 'rxjs/operators';
import { OperationsService } from '@core/services/operations.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

@Component({
  selector: 'ob-stg-employee-table',
  templateUrl: './stg-employee-table.component.html',
  styleUrls: ['./stg-employee-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StgEmployeeTableComponent implements OnInit, OnChanges {
  @Input() public employeeList: IEmployee[] = [];
  @Output() idToDelete = new EventEmitter();
  @Output() idToEdit = new EventEmitter();
  public employeeSort: number = 0;
  public isEmployeeSort: boolean = false;
  public accauntSort: number = 0;
  public isAccauntSort: boolean = false;
  public statusSort: number = 0;
  public isStatusSort: boolean = false;
  public periodSort: number = 0;
  public isPeriodSort: boolean = false;
  public engAlphabet: string[] = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
  ];
  public showDropdown: boolean[] = [];
  modalRef?: BsModalRef;
  @ViewChild('dropdown') dropdown: ElementRef;
  public deleteMsg: string = '';
  public deleteWarning: string = '';
  public showSmallTable: boolean = false;

  constructor(
    public helperService: HelperService,
    private modalService: BsModalService,
    public operationsService: OperationsService,
    private toastr: ToastrService,
    private changeDetector: ChangeDetectorRef,
    private translate: TranslateService,
    public breakpointObserver: BreakpointObserver
  ) {
    this.getTranslations();
  }
  getTranslations() {
    this.translate
      .get([
        'toast-messages.success.deleted',
        'toast-messages.warning.employee-delete',
      ])
      .subscribe(translations => {
        this.deleteMsg = translations['toast-messages.success.deleted'];
        this.deleteWarning =
          translations['toast-messages.warning.employee-delete'];
      });
  }

  ngOnInit() {
    this.breakpointObserver
      .observe(['(max-width:1000px)'])
      .subscribe((state: BreakpointState) => {
        this.showSmallTable = state.matches;
        this.changeDetector.detectChanges();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (let i: number = 0; i < this.employeeList.length; i++) {
      this.showDropdown.push(false);
    }
  }

  sorting(type: string) {
    switch (type) {
      case 'employee': {
        this.isAccauntSort = false;
        this.isEmployeeSort = true;
        this.isPeriodSort = false;
        this.isStatusSort = false;
        this.getEmployeeSortedList();
        break;
      }
      case 'account': {
        this.isAccauntSort = true;
        this.isEmployeeSort = false;
        this.isPeriodSort = false;
        this.isStatusSort = false;
        this.getAccauntSortedList();
        break;
      }
      case 'status': {
        this.isAccauntSort = false;
        this.isEmployeeSort = false;
        this.isPeriodSort = false;
        this.isStatusSort = true;
        this.getStatusSortedList();
        break;
      }
      case 'period': {
        this.isAccauntSort = false;
        this.isEmployeeSort = false;
        this.isPeriodSort = true;
        this.isStatusSort = false;
        this.getPeriodSortedList();
        break;
      }
      default: {
        break;
      }
    }
  }

  getEmployeeSortedList() {
    if (this.employeeSort % 2 === 0) {
      this.employeeSort = this.employeeSort + 1;
      this.employeeList.sort(this.byFieldAsc('firstName', this.engAlphabet));
    } else {
      this.employeeSort = this.employeeSort + 1;
      this.employeeList.sort(this.byFieldDesc('firstName', this.engAlphabet));
    }
  }

  byFieldAsc(field: string, engAlphabet: string[]) {
    return function (a: any, b: any) {
      if (a[field] === b[field]) {
        return 0;
      } else if (a[field] === null) {
        return 1;
      } else if (b[field] === null) {
        return -1;
      } else if (a[field].trim() > b[field].trim()) {
        return 1;
      } else {
        return -1;
      }
    };
  }

  byFieldDesc(field: string, engAlphabet: string[]) {
    return function (a: any, b: any) {
      if (a[field] === b[field]) {
        return 0;
      } else if (a[field] === null) {
        return 1;
      } else if (b[field] === null) {
        return -1;
      } else if (a[field] < b[field]) {
        return 1;
      } else {
        return -1;
      }
    };
  }

  getPeriodSortedList() {
    if (this.periodSort % 2 === 0) {
      this.periodSort = this.periodSort + 1;
      this.employeeList.sort(this.byFieldAsc('birthDay', this.engAlphabet));
    } else {
      this.periodSort = this.periodSort + 1;
      this.employeeList.sort(this.byFieldDesc('birthDay', this.engAlphabet));
    }
  }

  getAccauntSortedList() {
    if (this.accauntSort % 2 === 0) {
      this.accauntSort = this.accauntSort + 1;
      this.employeeList.sort(this.byFieldAsc('account', this.engAlphabet));
    } else {
      this.accauntSort = this.accauntSort + 1;
      this.employeeList.sort(this.byFieldDesc('account', this.engAlphabet));
    }
  }

  getStatusSortedList() {
    let sortedList: IEmployee[] = [];
    if (this.statusSort % 2 === 0) {
      for (let i: number = 0; i < this.employeeList.length; i++) {
        if (this.employeeList[i].account !== null) {
          sortedList.push(this.employeeList[i]);
        }
      }
      for (let i: number = 0; i < this.employeeList.length; i++) {
        if (this.employeeList[i].account === null) {
          sortedList.push(this.employeeList[i]);
        }
      }
    } else {
      for (let i: number = 0; i < this.employeeList.length; i++) {
        if (this.employeeList[i].account === null) {
          sortedList.push(this.employeeList[i]);
        }
      }
      for (let i: number = 0; i < this.employeeList.length; i++) {
        if (this.employeeList[i].account !== null) {
          sortedList.push(this.employeeList[i]);
        }
      }
    }
    this.employeeList = sortedList;
    this.statusSort = this.statusSort + 1;
  }

  showItemDropdown(i: number) {
    for (let index: number = 0; index < this.showDropdown.length; index++) {
      if (index === i) {
        this.showDropdown[index] = !this.showDropdown[index];
      } else {
        this.showDropdown[index] = false;
      }
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onGlobalClick(event: any): void {
    if (
      (this.dropdown &&
        this.dropdown.nativeElement &&
        this.dropdown.nativeElement.innerHTML &&
        !this.dropdown.nativeElement.innerHTML.includes(
          event.target.innerHTML
        )) ||
      event.target.innerHTML === ''
    ) {
      for (let i: number = 0; i < this.showDropdown.length; i++) {
        this.showDropdown[i] = false;
      }
    }
  }

  deleteEmployee(i: number) {
    setTimeout(() => {
      this.showDropdown[i] = false;
    }, 0);
    this.openConfirmModal();
    this.modalRef.content.onStatus.subscribe((result: boolean) => {
      if (result === true) {
        let id: number[] = [];
        id.push(this.employeeList[i].id);
        this.deleteByIdStaff(id);
      }
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

  deleteByIdStaff(ids: number[]): void {
    this.operationsService.deleteByIdStaffList(ids).subscribe(() => {
      successMessage(this.deleteMsg, this.toastr);
      this.changeEmployeesState(ids);
    });
  }

  changeEmployeesState(ids: number[]) {
    this.idToDelete.emit(ids);
  }

  editEmployee(i: number) {
    setTimeout(() => {
      this.showDropdown[i] = false;
    }, 0);
    let initialState = {
      paymentType: 'salary',
      isSettings: true,
      el: this.employeeList[i],
      isEdit: true,
      cheifEditable: false,
    };
    this.modalRef = this.modalService.show(ModalAddStaffComponent, {
      class: 'modal-lg employee-modal modal-dialog-centered',
      id: 2,
      ignoreBackdropClick: false,
      initialState,
    });
    this.modalRef.content.onEdit.subscribe((result: IEmployee) => {
      for (let i: number = 0; i < this.employeeList.length; i++) {
        if (this.employeeList[i].id === result.id) {
          this.employeeList[i] = result;
          break;
        }
      }
      this.idToEdit.emit(result);
      this.changeDetector.detectChanges();
    });
  }
}
