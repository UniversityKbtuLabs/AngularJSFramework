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
import { requestDateFormat } from '@app/core/constants';
import {
  compareCurrency,
  docNum,
  errorMessage,
  getIn,
} from '@app/core/helpers';
import { SubscriptionAccumulator } from '@app/core/helpers/SubscriptionAccumulator';
import { AccountsService } from '@app/core/services/accounts.service';
import { DocumentService } from '@app/core/services/document.service';
import { LoginService } from '@app/core/services/login.service';
import { OperationsService } from '@app/core/services/operations.service';
import { SocketService } from '@app/core/services/socket.service';
import { ICreateAccount } from '@app/data/models/account-types';
import { TokenKeyModalComponent } from '@app/modules/ecp/token-key-modal/token-key-modal.component';
import { SmsModalComponent } from '@app/shared';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ob-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAccountComponent
  extends SubscriptionAccumulator
  implements OnInit, OnDestroy
{
  prefill: ICreateAccount = null;
  createAccountForm: FormGroup;
  public subcriptions: Subscription[] = [];
  public currencyList: any = [];
  public branchList: any = [];
  public currencyLoading: boolean = false;
  public branchLoading: boolean = false;
  public isSearchableBranch: boolean = false;
  public emptyFieldsError: string = '';
  public chiefSigner: string;
  public chiefAccountant: string;
  public rightsToSign: boolean = false;
  public loading: boolean = false;
  public modalRef?: BsModalRef;
  public docNum2: any;
  isEditDocNum: boolean = false;

  // Секция информаций
  accountInfo1: boolean = false;
  accountInfo2: boolean = false;
  accountInfo3: boolean = false;

  constructor(
    private fb: FormBuilder,
    private accountsService: AccountsService,
    private toastr: ToastrService,
    private changeDetector: ChangeDetectorRef,
    private translate: TranslateService,
    private documentService: DocumentService,
    private operationsService: OperationsService,
    private modalService: BsModalService,
    private router: Router,
    private route: ActivatedRoute,
    private loginService: LoginService,
    private socketService: SocketService
  ) {
    super();
  }

  ngOnInit(): void {
    this.createAccountForm = this.fb.group({
      docNum: ['', this.docNumValidator],
      branch: [null, Validators.required],
      currency: [null, Validators.required],
    });

    this.addSubscriber(
      this.documentService.firstChiefSigner$.subscribe({
        next: firstChiefSigner => {
          this.chiefSigner = firstChiefSigner.name;
          this.changeDetector.detectChanges();
        },
      })
    );

    this.addSubscriber(
      this.documentService.accountantSigner$.subscribe({
        next: chiefAccountant => {
          this.chiefAccountant = chiefAccountant.name;
          this.changeDetector.detectChanges();
        },
      })
    );
    this.docNum2 = docNum();

    this.getPrefill();
    this.getCurrencies();
    this.getBranches();
    this.getTranslations();
    this.hasRightsToSign();
  }

  ngOnDestroy(): void {
    this.subcriptions.forEach(s => s.unsubscribe());
    this.createAccountForm.reset();
  }

  getPrefill(): void {
    let nDocNum = docNum();
    let nDocDate = moment().format(requestDateFormat);
    this.subcriptions.push(
      this.accountsService.getCreateAccountPrefill().subscribe({
        next: (data: ICreateAccount) => {
          this.prefill = data;
          if (!data.docDate) {
            this.prefill.docDate = nDocDate;
          }
          this.createAccountForm.patchValue({ docNum: nDocNum });
          this.changeDetector.detectChanges();
        },
        error: (error: any) => {
          errorMessage(error, this.toastr);
          this.prefill = { docDate: nDocDate, docNum: nDocNum };
          this.createAccountForm.patchValue({ docNum: nDocNum });
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  getBranches(): void {
    this.branchLoading = true;
    this.subcriptions.push(
      this.accountsService.getCreateAccountDivisions().subscribe({
        next: (data: any) => {
          this.branchLoading = false;
          this.branchList = data;
          if (this.branchList.length === 1) {
            //Если один филиал то заполняет поле
            this.createAccountForm.patchValue({
              branch: this.branchList[0],
            });
          }
          this.changeDetector.detectChanges();
        },
        error: (error: any) => {
          this.branchLoading = false;
          errorMessage(error, this.toastr);
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  getCurrencies(): void {
    this.currencyLoading = true;
    this.subcriptions.push(
      this.accountsService.getCreateAccountCurrencies().subscribe({
        next: (data: any) => {
          this.currencyList = data;
          this.currencyList = this.currencyList.sort((a: any, b: any) =>
            compareCurrency(a, b)
          );
          this.currencyLoading = false;
          if (this.route.snapshot.queryParamMap.get('currency')) {
            this.createAccountForm.patchValue({
              currency: this.route.snapshot.queryParamMap.get('currency'),
            });
          }
          this.changeDetector.detectChanges();
        },
        error: (error: any) => {
          this.currencyLoading = false;
          errorMessage(error, this.toastr);
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  docNumValidator = (control: FormControl) => {
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

  onDocNumKeyUp(event: any) {
    if (event.keyCode === 13) {
      this.isEditDocNum = false;
    }
  }

  editDocNum() {
    this.isEditDocNum = !this.isEditDocNum;
    if (this.isEditDocNum === true) {
      setTimeout(() => {
        const elm = document.getElementById('docNum');
        elm.focus();
      }, 0);
    }
  }

  docNumChange(value: any) {
    this.createAccountForm.controls.docNum.setValue(value);
  }

  onOpenCloseBranch(): void {
    this.isSearchableBranch = !this.isSearchableBranch;
  }

  isFieldInvalid(field: string) {
    const formField = this.createAccountForm.get(field);
    return (
      (!formField.valid && formField.touched && !formField.pristine) ||
      (!formField.valid && formField.dirty && !formField.pristine)
    );
  }

  displayFieldClass(field: string) {
    return { 'is-invalid': this.isFieldInvalid(field) };
  }

  getTranslations() {
    this.subcriptions.push(
      this.translate
        .get(['error.empty_fields_present'])
        .subscribe(translations => {
          this.emptyFieldsError = translations['error.empty_fields_present'];
        })
    );
  }

  fieldsValidation(): void {
    const form = this.createAccountForm;
    if (form.valid) {
      this.sendCreateAccount();
    } else {
      const allFields = Object.keys(form.controls);
      let emptyField: string;
      allFields.forEach(f => {
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

  getTemplate(): ICreateAccount {
    let formControl = this.createAccountForm.controls;
    let newTemplate: ICreateAccount = {
      docDate: this.prefill?.docDate || '',
      docNum: formControl.docNum.value || '',
      clientName: this.prefill?.clientName || '',
      clientNameInternational: this.prefill?.clientNameInternational || '',
      bin: this.prefill?.bin || '',
      residencyCode: this.prefill?.residencyCode || '',
      currency: formControl.currency.value || '',
      eqBaseNum: this.prefill?.eqBaseNum || '',
      secoCode: this.prefill?.secoCode || '',
      branch: formControl.branch.value?.eqShortName || '',
      branchCode: formControl.branch.value?.eqCode || '',
      chief: this.chiefSigner || '',
      chiefAccountant: this.chiefAccountant || '',
      isSpecAcc: this.prefill?.isSpecAcc,
      source: 'WEB',
    };
    return newTemplate;
  }

  sendCreateAccount() {
    let body = this.getTemplate();
    this.subcriptions.push(
      this.accountsService.sendCreateAccount(body).subscribe({
        next: (data: any) => {
          if (data.status === 200) {
            if (this.rightsToSign) {
              this.toDirectlySign(data.body); //прямое подписание
            } else {
              this.confirmCreateAccount(false); //отправка на подпись
            }
          }
        },
        error: (error: any) => {
          errorMessage(error, this.toastr);
        },
      })
    );
  }

  hasRightsToSign(): void {
    this.loading = true;
    this.subcriptions.push(
      this.operationsService.checkRightsToSign().subscribe({
        next: (data: boolean) => {
          this.loading = false;
          if (data) {
            this.rightsToSign = data;
          }
          this.changeDetector.detectChanges();
        },
        error: (error: any) => {
          errorMessage(error, this.toastr);
          this.loading = false;
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  toDirectlySign(id: number): void {
    const initialState: any = { operationId: id, isDirectlySign: true };

    if (
      getIn(this.loginService.userInfoObject$.value, 'user', 'loggedInBy') ===
      'signature'
    ) {
      this.socketService.connect(() => {
        console.info('ws callback');
      });
      const closeModal = () => {
        this.modalService.hide(1);
        this.socketService.close();
      };
      const initialState: any = {
        operationId: id,
        closeModal,
        successCb: () => {
          console.info('first');
          this.confirmCreateAccount(true);
        },
        is2FA: false,
      };
      this.modalRef = this.modalService.show(TokenKeyModalComponent, {
        class: 'modal-dialog-centered',
        initialState,
        id: 1,
      });
    } else {
      this.modalRef = this.modalService.show(SmsModalComponent, {
        class: 'modal_upper',
        initialState,
        id: 1,
      });
      this.modalRef.content.statusDirectlySign.subscribe((status: boolean) => {
        if (status) {
          this.confirmCreateAccount(true);
        }
      });
    }
  }

  confirmCreateAccount(signed: boolean) {
    this.router.navigate([
      'products/create/account/confirm',
      {
        productType: 'account',
        currency: this.createAccountForm.controls.currency.value,
        isSigned: signed,
      },
    ]);
  }
}
