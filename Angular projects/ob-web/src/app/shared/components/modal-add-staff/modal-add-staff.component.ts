import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { OperationsService } from '@core/services/operations.service';
import { FormatAmountPipe } from '@shared/pipes/format-amount.pipe';
import { ModalStaffListComponent } from '@app/shared';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { IEmployee } from '@app/data/models/common-types';
import moment from 'moment';
import { dateFormat, requestDateFormat } from '@app/core/constants';
import {
  errorMessage,
  getError,
  getIn,
  successMessage,
} from '@app/core/helpers';
import { TranslateService } from '@ngx-translate/core';
import { CustomvalidationService } from '@app/core/services/customvalidation.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DictionaryService } from '@app/core/services/dictionary.service';
import { IBank } from '@app/data/models/dictionary-types';

@Component({
  selector: 'ob-modal-add-staff',
  templateUrl: './modal-add-staff.component.html',
  styleUrls: ['./modal-add-staff.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalAddStaffComponent
  extends SubscriptionAccumulator
  implements OnInit, OnDestroy
{
  id: number;
  //birthDay: string | Date
  emp: any;
  form: FormGroup;
  isClick: boolean = false;
  initialState: any;
  isUpdate: boolean = false;
  modalId: any;
  modalRef?: BsModalRef;
  onEdit: Subject<IEmployee> = new Subject();
  onAddEmployee: Subject<IEmployee>;
  formSubmitFlag: boolean = false;
  public isGettingPerson: boolean = false;
  public userInfoSubscr: Subscription;
  public requiredNames: string;
  public allowedNameFormat: string;
  public subscriptions: Subscription[] = [];
  public bankInfoloading: boolean = false;
  public successMsg: string = '';
  public successfullyAdded: string = '';

  @Input() el: any;
  @Input() isEdit: boolean = false;
  @Input() paymentType: string;
  @Input() isSettings: boolean = false;
  @Input() cheifEditable: boolean = false;
  @Output() updateEmployees = new EventEmitter<boolean>();
  @Output() sendEmployee = new EventEmitter<IEmployee>();

  public employeeBankName$ = new BehaviorSubject<any>(null);
  public observalbeEmployeeBankName$ = this.employeeBankName$.asObservable();

  public employeeBankLogo$ = new BehaviorSubject<any>(null);
  public observalbeEmployeeBankLogo$ = this.employeeBankLogo$.asObservable();

  constructor(
    public modalOptions: ModalOptions,
    private fb: FormBuilder,
    public operationsService: OperationsService,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private changeDetector: ChangeDetectorRef,
    private translate: TranslateService,
    private customValidator: CustomvalidationService,
    private dictionaryService: DictionaryService
  ) {
    super();
  }

  ngOnInit(): void {
    this.onAddEmployee = new Subject();
    if (this.modalOptions?.id === 6) {
      this.modalId = this.modalOptions?.id;
      this.initialState = this.modalOptions?.initialState;
      this.isEdit = this.initialState.isUpdate;
      this.emp = this.initialState.emp;
    }

    this.initializeForm();
    this.formValueChanges();
    this.getUserInfoByIin();
    this.getTranslations();
    this.onUserEdit();
  }

  cancel() {
    this.modalService.hide(this.modalId);
  }

  formValueChanges() {
    if (this.paymentType === 'salary') {
      this.form
        .get('account')
        .valueChanges.pipe(debounceTime(800), distinctUntilChanged())
        .subscribe(account => {
          if (account && account.length > 19) {
            this.subscriptions.push(
              this.dictionaryService.getBankName(account).subscribe(
                (item: IBank) => {
                  this.employeeBankName$.next(item.bankName);
                  this.employeeBankLogo$.next(item.bic);
                  this.bankInfoloading = false;
                },
                error => {
                  if (
                    getIn(error, 'error', 'systemMessage') &&
                    getIn(error, 'error', 'systemMessage').includes(
                      'recipientAccNotCorrect'
                    )
                  ) {
                    this.form.controls['account'].setErrors({
                      incorrectBankAccount: true,
                    });
                    this.employeeBankName$.next(null);
                    this.employeeBankLogo$.next(null);
                  }
                  errorMessage(error, this.toastr);
                  this.changeDetector.detectChanges();
                }
              )
            );
            this.changeDetector.detectChanges();
          }
        });
    }
  }
  initializeForm() {
    let formGroup = {
      lastName: ['', this.customValidator.employeeFioValidator],
      firstName: ['', this.customValidator.employeeFioValidator],
      middleName: ['', this.customValidator.employeeFioValidator],
      birthDay: ['', Validators.required],
      iin: [
        '',
        [
          Validators.required,
          Validators.minLength(12),
          Validators.pattern(/^[0-9]+(?!.)/),
        ],
      ],
      account: [
        '',
        [
          Validators.required,
          Validators.minLength(20),
          Validators.pattern(/^[A-Z0-9]+(?!.)/),
        ],
      ],
      amount: ['', Validators.required],
    };

    if (this.paymentType !== 'salary') {
      delete formGroup.account;
    }
    if (this.isSettings === true) {
      delete formGroup.amount;
    }

    this.form = this.fb.group(formGroup);
  }

  onUserEdit() {
    if (this.isEdit || this.isUpdate) {
      if (this.emp) {
        this.el = this.emp;
      }
      this.id = this.el.id || this.el.employeeId;
      this.form.controls['lastName'].setValue(this.el.lastName);
      this.form.controls['firstName'].setValue(this.el.firstName);
      this.form.controls['middleName'].setValue(this.el.middleName);
      this.form.controls['iin'].setValue(this.el.iin);
      if (this.isSettings === false) {
        this.form.controls['amount'].setValue(this.el.amount);
      }

      if (this.paymentType === 'salary') {
        this.form.controls['account'].setValue(this.el.account);
      }

      /* Изменяет формат даты полученный с сервера */
      if (
        this.el.birthDay === null ||
        this.form.controls['birthDay'] === null
      ) {
        this.form.controls['birthDay'].setValue('');
      } else {
        const birthDate = getIn(this.el, 'birthDay' || 'birthday');
        const birthDay = moment(birthDate, requestDateFormat).format(
          dateFormat
        );
        this.form.controls['birthDay'].setValue(birthDay);
      }

      Object.values(this.form.controls).forEach(field => {
        field.markAsTouched();
      });
    }
  }

  get formControl() {
    return this.form.controls;
  }

  getTranslations() {
    this.translate
      .get([
        'error.firstName-lastName',
        'error.allowedNameFormat',
        'status.success',
        'toast-messages.success.employee-added',
      ])
      .subscribe(translations => {
        this.requiredNames = translations['error.firstName-lastName'];
        this.allowedNameFormat = translations['error.allowedNameFormat'];
        this.successMsg = translations['status.success'];
        this.successfullyAdded =
          translations['toast-messages.success.employee-added'];
      });
  }
  getUserInfoByIin(): void {
    this.isGettingPerson = true;
    this.addSubscriber(
      this.form.get('iin').valueChanges.subscribe({
        next: iin => {
          this.isGettingPerson = false;
          if (iin?.length === 12 && !this.isEdit) {
            this.userInfoSubscr = this.operationsService
              .getUserInfoByInn(iin)
              .subscribe({
                next: data => {
                  if (data.birthDate) {
                    const birthDay = moment(
                      data.birthDate,
                      requestDateFormat
                    ).format(dateFormat);
                    this.form.controls['birthDay'].setValue(birthDay);
                    this.formControl.birthDay.markAsTouched();
                  }
                  if (data.lastName) {
                    this.form.controls['lastName'].setValue(data.lastName);
                    //	this.formControl.lastName.markAsTouched();
                  }
                  if (data.firstName) {
                    this.form.controls['firstName'].setValue(data.firstName);
                    //	this.formControl.firstName.markAsTouched();
                  }
                  if (data.middleName) {
                    this.form.controls['middleName'].setValue(data.middleName);
                    //	this.formControl.middleName.markAsTouched();
                  }
                },
                error: error => {
                  if (
                    getIn(error, 'error', 'systemMessage') &&
                    getIn(error, 'error', 'systemMessage').includes(
                      'invalid.iin'
                    )
                  ) {
                    this.form.controls['iin'].setErrors({ incorrectIIN: true });
                  }
                  errorMessage(error, this.toastr);
                  // this.isGettingPerson = false
                  // this.changeDetector.detectChanges()
                },
              });
          }
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  save() {
    this.isClick = true;
    this.formSubmitFlag = true;
    const dto = this.form.getRawValue();
    //this.el -> данные сотрудника из list
    if (this.paymentType !== 'salary') {
      dto.account = '';
      if (this.el && this.el.account) {
        //при редактировании сотрудника
        dto.account = this.el.account;
      }
    }

    if (dto.birthDay) {
      if (moment.isDate(dto.birthDay)) {
        dto.birthDay = moment(dto.birthDay).format(requestDateFormat);
      } else {
        dto.birthDay = moment(dto.birthDay, dateFormat).format(
          requestDateFormat
        );
      }
    } else {
      dto.birthDay = '';
    }
    if (this.isEdit || this.isUpdate) {
      dto.id = this.id;
      this.addSubscriber(
        this.operationsService.editStaff(dto).subscribe(
          () => {
            successMessage(this.successMsg, this.toastr);
            this.sendUpdatedEmployee(dto);
          },
          err => errorMessage(err, this.toastr)
        )
      );
      setTimeout(() => {
        this.notifyUpdateEmployees();
        this.cancel();
      }, 700);
    } else {
      if (this.checkRequiredFieldValidity()) {
        this.addSubscriber(
          this.operationsService.addNewStaff(dto).subscribe(
            (data: any) => {
              successMessage(this.successfullyAdded, this.toastr);
              this.addEmployee(dto, data);
              this.cancel();
            },
            error => {
              errorMessage(error, this.toastr);
            }
          )
        );
      }
    }
  }

  notifyUpdateEmployees() {
    this.updateEmployees.emit(true);
  }

  sendUpdatedEmployee(newEmployee: IEmployee) {
    // обновления с ручкой на таблице
    this.onEdit.next(newEmployee);
  }

  addEmployee(newEmployee: IEmployee, id: number) {
    newEmployee.id = id;
    this.onAddEmployee.next(newEmployee);
  }

  isFieldValid(field: string) {
    // валидация полей
    const formField = this.form.get(field);
    return (
      (!formField.valid && formField.touched && !formField.pristine) ||
      (!formField.valid && formField.dirty && !formField.pristine)
    );
  }

  displayFieldClass(field: string) {
    return { 'is-invalid': this.isFieldValid(field) };
  }

  onDateChange() {
    if (this.form.controls['birthDay'].errors?.bsDate?.invalid) {
      this.form.controls['birthDay'].setValue('');
    }
  }

  FieldsValidation() {
    this.form.updateValueAndValidity();
    if (this.checkRequiredFieldValidity()) {
      const { firstName, lastName, middleName } = this.formControl;
      const firstNameValue = firstName.value
        ? firstName.value.trim()
        : firstName.value;
      const lastNameValue = lastName.value
        ? lastName.value.trim()
        : lastName.value;
      const middleNameValue = middleName.value
        ? middleName.value.trim()
        : middleName.value;
      if (firstNameValue || lastNameValue) {
        if (
          firstNameValue === '-' ||
          lastNameValue === '-' ||
          middleNameValue === '-'
        ) {
          errorMessage({ message: this.allowedNameFormat }, this.toastr);
        } else {
          this.save();
        }
      } else {
        errorMessage({ message: this.requiredNames }, this.toastr);
      }
    } else {
      //форма невалидна
      const allFields = Object.keys(this.form.controls);

      allFields.forEach(f => {
        if (!this.form.get(f).value && this.form.get(f).status === 'INVALID') {
          this.form.get(f).markAsTouched();
          this.form.get(f).markAsDirty();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.modalService.hide(this.modalId);
    if (this.userInfoSubscr) {
      this.userInfoSubscr.unsubscribe();
    }
  }

  changeAccount(value: any) {
    this.form.get('account').setValue(value);
  }

  checkRequiredFieldValidity() {
    if (this.isSettings === true) {
      if (
        this.formControl.iin.valid &&
        this.formControl.account.valid &&
        this.formControl.birthDay.valid
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      if (this.paymentType === 'salary') {
        if (
          this.formControl.iin.valid &&
          this.formControl.account.valid &&
          this.formControl.birthDay.valid &&
          this.formControl.amount.valid
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        if (
          this.formControl.iin.valid &&
          this.formControl.birthDay.valid &&
          this.formControl.amount.valid
        ) {
          return true;
        } else {
          return false;
        }
      }
    }
  }
}
