import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '@app/core/services/login.service';
import { DictionaryService } from '@app/core/services/dictionary.service';
import { docNum, errorMessage, getIn } from '@app/core/helpers';
import { ICreateBusinessCard } from '@app/data/models/account-types';
import { OperationsService } from '@app/core/services/operations.service';
import { mobileOperators } from '@app/core/constants';
import { Subscription } from 'rxjs';
import { AccountsService } from '@app/core/services/accounts.service';

@Component({
  selector: 'ob-create-business-card',
  templateUrl: './create-business-card.component.html',
  styleUrls: ['./create-business-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateBusinessCardComponent implements OnInit, OnDestroy {
  businessCardForm: FormGroup;
  contractType = '';
  useriin = '';
  userPhone = '';
  userName = '';
  cityList: string[] = [];
  deliveryCityList: string[] = [];
  addressList: string[] = [];
  isCityLoading: boolean = false;
  isDeliveyCityLoading: boolean = false;
  isAddressLoading: boolean = false;
  employeeName: string = null;
  incorrectIin: boolean = false;
  subscriptions: Subscription[] = [];
  emptyFieldsError: string = '';
  iinCheckingLoading: boolean = false;
  editTemplate: any;
  isSearchableDepartmentAddress: boolean = false;
  /*
    cardType: тип карты
    'visa'; 'mastercard'
  */
  cardType: string = 'mastercard';
  /*
    deliveryType: тип доставки
    'department' -> в отделение
    'delivery' -> доставка по адрессу
  */
  deliveryType: string = 'department';
  /*
    personType: кому открывается карта
    'individual' -> для себя
    'employee' -> для сотрудника
  */
  personType: string = 'individual';

  isEditDocNum: boolean = false;
  docNum: string;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private changeDetector: ChangeDetectorRef,
    private router: Router,
    private loginService: LoginService,
    private dictionaryService: DictionaryService,
    private operationsService: OperationsService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private accountsService: AccountsService
  ) {}

  ngOnInit(): void {
    this.docNum = docNum();

    window.scrollTo(0, 0);
    this.accountsService.currentProductTemplate$.subscribe(data => {
      if (this.route.snapshot.queryParamMap.get('template')) {
        if (data) {
          this.editTemplate = data;
        }
      }
    });
    this.businessCardForm = this.fb.group({
      docNum: [this.docNum, this.docNumValidator],
      codeWord: [null, Validators.required],
      departmentCity: [null, Validators.required],
      departmentAddress: [null, Validators.required],
      deliveryCity: [null, Validators.required],
      deliveryApartment: [null, this.addressSymbolValidator],
      deliveryBuilding: [
        null,
        [Validators.required, this.addressSymbolValidator],
      ],
      deliveryStreet: [
        null,
        [Validators.required, this.addressSymbolValidator],
      ],
      employeeIin: [null, [Validators.required, Validators.minLength(12)]],
      employeePhoneNumber: [
        null,
        [Validators.required, this.phoneNumberValidator],
      ],
      balanceAccounting: ['total', Validators.required],
    });
    this.getUserInfo();
    this.getDepartmentCities();
    this.getDeliveryCities();
    this.getTranslations();
    if (this.editTemplate) {
      this.onEditForm(this.editTemplate);
    }
    this.formControl.employeeIin.valueChanges.subscribe(data => {
      if (data.length === 12) {
        this.employeeName = '';
        this.getEmployeeByIIN(data);
      } else {
        this.employeeName = '';
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  get formControl() {
    return this.businessCardForm.controls;
  }

  getUserInfo() {
    this.subscriptions.push(
      this.loginService.userInfoObject$.subscribe({
        next: v => {
          if (v.currentContract) {
            this.contractType = v.currentContract.type;
            if (this.contractType === 'IP') {
              this.useriin = v.currentContract.bin;
              this.userPhone = v.user.phone;
            } else {
              this.personType = 'employee';
            }
            this.changeDetector.detectChanges();
          }
        },
      })
    );
  }

  getDepartmentCities(): void {
    this.isCityLoading = true;
    this.changeDetector.detectChanges();
    this.subscriptions.push(
      this.dictionaryService.getDepartmentCities().subscribe({
        next: data => {
          this.cityList = data.departmentCities;
          this.isCityLoading = false;
          this.changeDetector.detectChanges();
        },
        error: error => {
          errorMessage(error, this.toastr);
          this.isCityLoading = false;
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  onCityChange(city: string) {
    if (city) {
      this.getDepartmentAddressByCity(city);
    }
  }

  getDepartmentAddressByCity(city: string): void {
    this.isAddressLoading = true;
    this.changeDetector.detectChanges();
    this.subscriptions.push(
      this.dictionaryService.getDepartmentAddressByCity(city).subscribe({
        next: data => {
          this.addressList = data.body.departmentAddresses;
          this.isAddressLoading = false;
          this.changeDetector.detectChanges();
        },
        error: error => {
          errorMessage(error, this.toastr);
          this.isAddressLoading = false;
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  onPersonTypeClick(type: string) {
    if (type === 'individual') {
      if (this.formControl.employeeIin.errors?.required) {
        this.formControl.employeeIin.markAsPristine();
      }
      if (this.formControl.employeePhoneNumber.errors?.required) {
        this.formControl.employeePhoneNumber.markAsPristine();
      }
    }
    this.personType = type;
    this.changeDetector.detectChanges;
  }

  onCardTypeClick(type: string) {
    this.cardType = type;
    this.changeDetector.detectChanges();
  }

  onDeliveryTypeClick(type: string) {
    if (type == 'delivery') {
      if (this.formControl.departmentCity.errors?.required) {
        this.formControl.departmentCity.markAsPristine();
      }
      if (this.formControl.departmentAddress.errors?.required) {
        this.formControl.departmentAddress.markAsPristine();
      }
    }
    if (type == 'department') {
      if (this.formControl.deliveryCity.errors?.required) {
        this.formControl.deliveryCity.markAsPristine();
      }
      if (this.formControl.deliveryStreet.errors?.required) {
        this.formControl.deliveryStreet.markAsPristine();
      }
      if (this.formControl.deliveryBuilding.errors?.required) {
        this.formControl.deliveryBuilding.markAsPristine();
      }
      if (this.formControl.deliveryApartment.errors?.required) {
        this.formControl.deliveryApartment.markAsPristine();
      }
    }

    this.deliveryType = type;
    this.changeDetector.detectChanges;
  }

  getDeliveryCities(): void {
    this.isDeliveyCityLoading = true;
    this.changeDetector.detectChanges();
    this.subscriptions.push(
      this.dictionaryService.getDeliveryCities().subscribe({
        next: data => {
          this.deliveryCityList = data.deliveryCities;
          this.isDeliveyCityLoading = false;
          this.changeDetector.detectChanges();
        },
        error: error => {
          errorMessage(error, this.toastr);
          this.isDeliveyCityLoading = false;
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  getTranslations() {
    this.subscriptions.push(
      this.translate
        .get(['error.empty_fields_present'])
        .subscribe(translations => {
          this.emptyFieldsError = translations['error.empty_fields_present'];
        })
    );
  }

  fieldsValidation(): void {
    const form = this.businessCardForm;
    let fieldsList: any[] = [];
    if (this.personType === 'employee') {
      fieldsList.push('employeeIin');
      fieldsList.push('employeePhoneNumber');
    }
    fieldsList.push('docNum');
    fieldsList.push('codeWord');
    if (this.deliveryType === 'department') {
      fieldsList.push('departmentCity');
      fieldsList.push('departmentAddress');
    } else {
      fieldsList.push('deliveryCity');
      fieldsList.push('deliveryApartment');
      fieldsList.push('deliveryBuilding');
      fieldsList.push('deliveryStreet');
    }
    let valid = true;
    if (fieldsList.find(field => this.formControl[field].valid === false)) {
      valid = false;
    }
    if (valid && !this.iinCheckingLoading) {
      this.sendToConfirm();
    } else {
      let emptyField: string;
      fieldsList.forEach(f => {
        if (!form.get(f).value && form.get(f).status === 'INVALID') {
          if (!emptyField) {
            emptyField = f;
          }
          form.get(f).markAsTouched();
          form.get(f).markAsDirty();
        }
      });
      if (emptyField) {
        document.getElementById(emptyField).focus();
        errorMessage({ message: this.emptyFieldsError }, this.toastr);
      }
    }
  }

  getTemplate(): ICreateBusinessCard {
    let aimOfOpen;
    let iin;
    let phoneNum;
    if (this.contractType === 'UL') {
      aimOfOpen = 'hospitalityExpensesLE';
    } else {
      aimOfOpen = 'hospitalityExpensesIE';
    }
    if (this.personType === 'individual') {
      iin = this.useriin;
      phoneNum = this.userPhone;
    } else {
      iin = this.formControl.employeeIin.value;
      phoneNum = this.formControl.employeePhoneNumber.value;
    }

    let body: ICreateBusinessCard = {
      docNum: this.docNum,
      aimOfOpen: aimOfOpen,
      balanceAccounting: this.formControl.balanceAccounting.value,
      cardGettingType: this.deliveryType,
      cardType: this.cardType,
      codeWord: this.formControl.codeWord.value,
      iin: iin,
      phoneNum: phoneNum,
      other: {
        employeeName:
          this.personType === 'employee' ? this.employeeName : undefined,
        personType: this.personType,
        contractType: this.contractType,
      },
    };
    if (this.deliveryType === 'department') {
      body.departmentAddress = {
        branchAddress: this.formControl.departmentAddress.value,
        city: this.formControl.departmentCity.value,
      };
    } else {
      body.deliveryAddress = {
        apartment: this.formControl.deliveryApartment.value, // необязательное поле
        building: this.formControl.deliveryBuilding.value,
        city: this.formControl.deliveryCity.value,
        street: this.formControl.deliveryStreet.value,
      };
    }
    return body;
  }

  addressSymbolValidator = (control: FormControl) => {
    if (control.value && control.value.length) {
      const symbolRegxp: RegExp = /[\\*<>|$&`~#+?=^%@!]/;
      const invalid = symbolRegxp.test(control.value);
      return invalid ? { invalidSymbol: true } : null;
    } else {
      return null;
    }
  };

  phoneNumberValidator = (control: FormControl) => {
    if (control.value && control.value.length > 3) {
      const operator = control.value.substring(0, 3);
      const isOperatorValid = mobileOperators.includes(operator);
      return !isOperatorValid ? { invalidOperator: true } : null;
    } else {
      return null;
    }
  };

  isFieldInvalid(field: string) {
    // Валидация полей
    const formField = this.businessCardForm.get(field);
    return (
      (!formField.valid && formField.touched && !formField.pristine) ||
      (!formField.valid && formField.dirty && !formField.pristine)
    );
  }

  displayFieldClass(field: string) {
    // css класс
    return { 'is-invalid': this.isFieldInvalid(field) };
  }

  getEmployeeByIIN(iin: number) {
    this.iinCheckingLoading = true;
    this.changeDetector.detectChanges();
    this.subscriptions.push(
      this.operationsService.getUserInfoByInn(iin).subscribe({
        next: data => {
          if (this.personType === 'employee') {
            this.employeeName = `${data.lastName} ${data.firstName} ${data.middleName}`;
          }
          this.iinCheckingLoading = false;
          this.changeDetector.detectChanges();
        },
        error: error => {
          this.employeeName = '';
          this.formControl['employeeIin'].setErrors({ incorrectIIN: true });
          errorMessage(error, this.toastr);
          this.iinCheckingLoading = false;
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  sendToConfirm() {
    localStorage.setItem(
      'product-template',
      JSON.stringify(this.getTemplate())
    );
    localStorage.setItem('deliveryType', this.deliveryType);
    this.router.navigateByUrl('products/create/business-card/sign-confirm');
  }

  onEditForm(data: any) {
    this.businessCardForm.patchValue({
      codeWord: data?.codeWord,
      balanceAccounting: data?.balanceAccounting,
    });
    this.cardType = data?.cardType || 'mastercard';
    if (data?.departmentAddress) {
      this.deliveryType = 'department';
      this.businessCardForm.patchValue({
        departmentCity: data?.departmentAddress.city,
        departmentAddress: data?.departmentAddress.branchAddress,
      });
      this.getDepartmentAddressByCity(data?.departmentAddress.city);
    }
    if (data?.deliveryAddress) {
      this.deliveryType = 'delivery';
      this.businessCardForm.patchValue({
        deliveryCity: data?.deliveryAddress.city,
        deliveryApartment: data?.deliveryAddress.apartment,
        deliveryBuilding: data?.deliveryAddress.building,
        deliveryStreet: data?.deliveryAddress.street,
      });
    }
    if (data?.other?.personType === 'employee') {
      this.personType = 'employee';
      this.employeeName = data?.other?.employeeName;
      this.businessCardForm.patchValue({
        employeeIin: data?.iin,
        employeePhoneNumber: data?.phoneNum,
      });
    }
    this.changeDetector.detectChanges();
  }

  editDocNum() {
    this.isEditDocNum = !this.isEditDocNum;
    if (this.isEditDocNum === true) {
      setTimeout(() => {
        const elm = document.getElementById('docNum');
        if (elm) {
          elm.focus();
        }
      }, 0);
    }
  }

  docNumChange(value: any) {
    this.formControl.docNum.setValue(value);
  }

  onDocNumKeyUp(event: any) {
    // Проверка на нажатие клавиши Enter на поле номер документа
    if (event.keyCode === 13) {
      this.isEditDocNum = false;
    }
  }

  docNumValidator = (control: FormControl) => {
    // Валидатор поля Номера документа
    // Валидатор поля Номера документа
    if (control.value) {
      if (control.value.length > 9) {
        return { maxLengthExceeded: true };
      } else {
        if (!/^[a-zA-Z0-9]+$/.test(control.value)) {
          return { pattern: true };
        } else {
          return null;
        }
      }
    } else {
      return { required: true };
    }
  };

  onDepartmentCityChange() {
    this.businessCardForm.patchValue({
      departmentAddress: null,
    });
    this.businessCardForm.markAsPristine();
    this.changeDetector.detectChanges();
  }
}
